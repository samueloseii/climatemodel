"""
Data ingestion for the Energy Monitoring System.

Loads parquet/gzip data files into PostgreSQL + TimescaleDB:
- Raw readings into the raw_readings hypertable
- Computed month stats into the appropriate month_stats table

Supports Buayan (mu3pep / 3-phase hydro) data format.
"""

import calendar
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session

from energy_monitoring.db import get_engine, get_session
from energy_monitoring.models import (
    EntryType,
    MeasurementType,
    Mu3pepMonthStats,
    Site,
)
from energy_monitoring.stats import process_3phase_month


def load_parquet_file(filepath: str) -> pd.DataFrame:
    """Load a parquet/gzip data file into a DataFrame."""
    df = pd.read_parquet(filepath)
    if not isinstance(df.index, pd.DatetimeIndex):
        if "time" in df.columns:
            df = df.set_index("time")
        elif "timestamp" in df.columns:
            df = df.set_index("timestamp")
    return df


def ensure_site(session: Session, name: str, measurement_type: MeasurementType,
                location: str | None = None, timezone: str | None = None,
                capacity_kw: float | None = None) -> Site:
    """Get or create a site record."""
    site = session.query(Site).filter_by(name=name).first()
    if site is None:
        site = Site(
            name=name,
            measurement_type=measurement_type,
            location=location,
            timezone=timezone,
            capacity_kw=capacity_kw,
        )
        session.add(site)
        session.commit()
        print(f"Created site: {site}")
    else:
        print(f"Found existing site: {site}")
    return site


def ingest_raw_readings_3phase(session: Session, site: Site, df: pd.DataFrame,
                                batch_size: int = 5000):
    """
    Bulk-insert raw 1-minute readings for a 3-phase site.

    Maps DataFrame columns to raw_readings table columns:
      ConPa -> con_ph1, ConPb -> con_ph2, ConPc -> con_ph3
      GenPa -> gen_ph1, GenPb -> gen_ph2, GenPc -> gen_ph3
      PTotal_Con -> con_total, PTotal_Gen -> gen_total
    """
    engine = session.get_bind()
    col_map = {
        "ConPa": "con_ph1",
        "ConPb": "con_ph2",
        "ConPc": "con_ph3",
        "GenPa": "gen_ph1",
        "GenPb": "gen_ph2",
        "GenPc": "gen_ph3",
        "Freq": "frequency",
    }

    records = []
    for ts, row in df.iterrows():
        record = {"time": ts.to_pydatetime() if hasattr(ts, 'to_pydatetime') else ts, "site_id": site.id}

        for src_col, dst_col in col_map.items():
            if src_col in df.columns:
                val = row[src_col]
                record[dst_col] = float(val) if pd.notna(val) else None

        # Compute totals if not already present
        con_cols = ["ConPa", "ConPb", "ConPc"]
        gen_cols = ["GenPa", "GenPb", "GenPc"]

        if "PTotal_Con" in df.columns:
            record["con_total"] = float(row["PTotal_Con"]) if pd.notna(row["PTotal_Con"]) else None
        elif all(c in df.columns for c in con_cols):
            vals = [float(row[c]) for c in con_cols if pd.notna(row[c])]
            record["con_total"] = float(sum(vals)) if vals else None

        if "PTotal_Gen" in df.columns:
            record["gen_total"] = float(row["PTotal_Gen"]) if pd.notna(row["PTotal_Gen"]) else None
        elif all(c in df.columns for c in gen_cols):
            vals = [float(row[c]) for c in gen_cols if pd.notna(row[c])]
            record["gen_total"] = float(sum(vals)) if vals else None

        records.append(record)

        if len(records) >= batch_size:
            _insert_batch(engine, records)
            records = []

    if records:
        _insert_batch(engine, records)

    print(f"Ingested {len(df):,} raw readings for site '{site.name}'")


def _insert_batch(engine, records: list[dict]):
    """Insert a batch of records using raw SQL for performance."""
    if not records:
        return

    columns = sorted(records[0].keys())
    col_str = ", ".join(columns)
    val_placeholders = ", ".join(f":{c}" for c in columns)

    stmt = text(
        f"INSERT INTO raw_readings ({col_str}) VALUES ({val_placeholders}) "
        f"ON CONFLICT (time, site_id) DO NOTHING"
    )

    with engine.connect() as conn:
        conn.execute(stmt, records)
        conn.commit()


def ingest_and_process_3phase(
    session: Session,
    site: Site,
    filepath: str,
    year: int,
    month: int,
    ingest_raw: bool = True,
):
    """
    Full pipeline for a 3-phase hydro month:
    1. Load parquet file
    2. Ingest raw readings into hypertable
    3. Compute month stats
    4. Store in mu3pep_month_stats
    """
    df = load_parquet_file(filepath)
    print(f"Loaded {filepath}: {len(df):,} records, "
          f"{df.index.min()} to {df.index.max()}")

    if ingest_raw:
        ingest_raw_readings_3phase(session, site, df)

    # Compute stats
    stats = process_3phase_month(df, year, month)
    stats["site_id"] = site.id
    stats["entry_type"] = EntryType.ACTUAL

    # Check for existing entry
    existing = (
        session.query(Mu3pepMonthStats)
        .filter_by(site_id=site.id, year=year, month=month, entry_type=EntryType.ACTUAL)
        .first()
    )
    if existing:
        for k, v in stats.items():
            if k not in ("site_id", "entry_type"):
                setattr(existing, k, v)
        session.commit()
        print(f"Updated existing stats for {year}-{month:02d}")
    else:
        month_stats = Mu3pepMonthStats(**stats)
        session.add(month_stats)
        session.commit()
        print(f"Stored new stats for {year}-{month:02d}")

    return stats


def generate_sample_data(session: Session, site: Site,
                          year: int = 2025, month: int = 11,
                          days: int = 30):
    """
    Generate synthetic 3-phase hydro data for testing when real
    parquet files are not available. Creates realistic patterns:
    - Generation peaks during daytime (hydro turbine)
    - Consumption peaks in morning and evening
    - Random noise and occasional gaps
    """
    np.random.seed(42)
    start = pd.Timestamp(f"{year}-{month:02d}-01", tz="Asia/Manila")
    actual_days = min(days, calendar.monthrange(year, month)[1])
    periods = actual_days * 1440  # 1-minute resolution
    idx = pd.date_range(start, periods=periods, freq="1min")

    hours = idx.hour + idx.minute / 60.0

    # Generation: hydro turbine runs ~18h/day, peaks 6am-10pm
    gen_base = np.where((hours >= 5) & (hours <= 22), 2000, 100)
    gen_peak = np.where((hours >= 8) & (hours <= 18), 500, 0)

    # Consumption: morning and evening peaks
    con_morning = np.where((hours >= 6) & (hours <= 9), 800, 0)
    con_evening = np.where((hours >= 17) & (hours <= 22), 1200, 0)
    con_base = 300

    data = {
        "GenPa": gen_base + gen_peak + np.random.normal(0, 100, periods),
        "GenPb": gen_base + gen_peak + np.random.normal(0, 100, periods),
        "GenPc": gen_base + gen_peak + np.random.normal(0, 100, periods),
        "ConPa": con_base + con_morning + con_evening + np.random.normal(0, 50, periods),
        "ConPb": con_base + con_morning + np.random.normal(0, 50, periods) * 0.8,
        "ConPc": con_base + con_evening * 0.7 + np.random.normal(0, 50, periods),
        "Freq": 60.0 + np.random.normal(0, 0.1, periods),
    }

    df = pd.DataFrame(data, index=idx)
    df = df.clip(lower=0)  # no negative power

    # Simulate some data gaps (3% of records)
    gap_mask = np.random.random(periods) < 0.03
    df.loc[gap_mask] = np.nan

    print(f"Generated {len(df):,} synthetic records for {site.name} "
          f"({year}-{month:02d})")

    # Ingest raw data
    ingest_raw_readings_3phase(session, site, df)

    # Compute and store stats
    stats = process_3phase_month(df.dropna(), year, month)
    stats["site_id"] = site.id
    stats["entry_type"] = EntryType.ACTUAL

    month_stats = Mu3pepMonthStats(**stats)
    session.add(month_stats)
    session.commit()

    print(f"Stored month stats for {year}-{month:02d}")
    return df, stats
