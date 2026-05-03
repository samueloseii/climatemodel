"""Process raw data into month stats and store in the database.

This module ties together the loader, stats calculations, and ORM models.
It currently handles 3-phase hydro (mu3pep) data — the format of the
Buayan sample files.  Additional measurement types can follow the same
pattern.
"""

from __future__ import annotations

import json
from calendar import monthrange
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from energy_monitoring.data.loader import load_parquet, infer_sample_interval_minutes
from energy_monitoring.models.entry_type import EntryType
from energy_monitoring.models.mu3pep import Mu3pepMonthStats
from energy_monitoring.models.site import Site, MeasurementType
from energy_monitoring.stats.calculations import (
    calc_stats_dict,
    calc_daily_energy,
    calc_daily_energy_data_days,
    calc_power_stats,
    calc_total_energy,
    estimate_downtime_hours,
    count_records,
    expected_records,
)


def _sum_phases(df: pd.DataFrame, cols: list[str]) -> pd.Series:
    """Sum multiple phase columns into a total series."""
    return df[cols].sum(axis=1)


def process_3phase_hydro_month(
    df: pd.DataFrame,
    year: int,
    month: int,
    sample_interval: float = 1.0,
) -> dict[str, Any]:
    """Compute all month stats for a 3-phase hydro site from raw data.

    Parameters
    ----------
    df : DataFrame with columns ConPa, ConPb, ConPc, GenPa, GenPb, GenPc
         and a DatetimeIndex.
    year, month : the target month.
    sample_interval : minutes between samples.

    Returns a flat dict ready to be used as Mu3pepMonthStats(**result).
    """
    # Filter to the target month
    mask = (df.index.year == year) & (df.index.month == month)
    mdf = df.loc[mask]

    if mdf.empty:
        return {"year": year, "month": month}

    days_in_month = monthrange(year, month)[1]
    result: dict[str, Any] = {"year": year, "month": month}

    # Record counts
    result["total_records"] = len(mdf)
    result["expected_records"] = expected_records(days_in_month, int(1440 / sample_interval))

    # --- Consumption per phase ---
    con_cols = {"ph1": "ConPa", "ph2": "ConPb", "ph3": "ConPc"}
    mdf = mdf.copy()
    mdf["ConTotal"] = _sum_phases(mdf, list(con_cols.values()))

    for phase_key, col in {**con_cols, "total": "ConTotal"}.items():
        # Daily energy
        daily_e = calc_daily_energy(mdf[col], sample_interval)
        daily_e_data = calc_daily_energy_data_days(mdf[col], sample_interval)
        s = calc_stats_dict(daily_e)
        for stat_name, val in s.items():
            result[f"daily_energy_con_{phase_key}_{stat_name}"] = val

        s_data = calc_stats_dict(daily_e_data)
        for stat_name, val in s_data.items():
            result[f"daily_energy_con_data_{phase_key}_{stat_name}"] = val

        # Power
        ps = calc_power_stats(mdf[col])
        result[f"power_con_{phase_key}_mean"] = ps.mean
        result[f"power_con_{phase_key}_min"] = ps.min
        result[f"power_con_{phase_key}_max"] = ps.max
        result[f"power_con_{phase_key}_std"] = ps.std

        # Total energy
        result[f"total_energy_con_{phase_key}"] = calc_total_energy(mdf[col], sample_interval)

    # --- Generation per phase ---
    gen_cols = {"ph1": "GenPa", "ph2": "GenPb", "ph3": "GenPc"}
    mdf["GenTotal"] = _sum_phases(mdf, list(gen_cols.values()))

    for phase_key, col in {**gen_cols, "total": "GenTotal"}.items():
        daily_e = calc_daily_energy(mdf[col], sample_interval)
        daily_e_data = calc_daily_energy_data_days(mdf[col], sample_interval)
        s = calc_stats_dict(daily_e)
        for stat_name, val in s.items():
            result[f"daily_energy_gen_{phase_key}_{stat_name}"] = val

        s_data = calc_stats_dict(daily_e_data)
        for stat_name, val in s_data.items():
            result[f"daily_energy_gen_data_{phase_key}_{stat_name}"] = val

        ps = calc_power_stats(mdf[col])
        result[f"power_gen_{phase_key}_mean"] = ps.mean
        result[f"power_gen_{phase_key}_min"] = ps.min
        result[f"power_gen_{phase_key}_max"] = ps.max
        result[f"power_gen_{phase_key}_std"] = ps.std

        result[f"total_energy_gen_{phase_key}"] = calc_total_energy(mdf[col], sample_interval)

    # Frequency (not available in current data - placeholder)
    result["frequency_mean"] = None
    result["frequency_min"] = None
    result["frequency_max"] = None
    result["frequency_std"] = None

    # Plant factor (needs capacity info, placeholder)
    result["plant_factor_mean"] = None
    result["plant_factor_min"] = None
    result["plant_factor_max"] = None
    result["plant_factor_std"] = None
    result["total_plant_factor"] = None

    # Downtime estimates
    result["estimated_system_downtime_hours"] = estimate_downtime_hours(
        mdf["GenTotal"], threshold_w=100.0, sample_interval_minutes=sample_interval
    )
    result["confirmed_system_downtime_hours"] = None
    result["estimated_consumer_downtime_hours"] = estimate_downtime_hours(
        mdf["ConTotal"], threshold_w=100.0, sample_interval_minutes=sample_interval
    )
    result["confirmed_consumer_downtime_hours"] = None

    return result


def process_and_store_3phase_hydro(
    session: Session,
    site: Site,
    data_files: list[str | Path],
    entry_type: EntryType = EntryType.ACTUAL,
    config_path: str | Path | None = None,
) -> list[Mu3pepMonthStats]:
    """Load data files, compute month stats, and store in the database.

    Returns the list of created Mu3pepMonthStats entries.
    """
    # Load config if provided
    config: dict[str, Any] = {}
    if config_path:
        with open(config_path) as f:
            config = json.load(f)

    # Load and concatenate all data files
    frames = [load_parquet(f) for f in data_files]
    df = pd.concat(frames).sort_index()

    # Determine sample interval
    sample_interval = infer_sample_interval_minutes(df)

    # Process each month present in the data
    created: list[Mu3pepMonthStats] = []
    months = df.index.to_period("M").unique()

    for period in months:
        stats = process_3phase_hydro_month(
            df, period.year, period.month, sample_interval
        )
        stats["site_id"] = site.id
        stats["entry_type"] = entry_type

        entry = Mu3pepMonthStats(**stats)
        session.add(entry)
        created.append(entry)

    session.commit()
    return created
