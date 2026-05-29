#!/usr/bin/env python3
"""
Ingest real Buayan parquet/gzip data files into PostgreSQL + TimescaleDB.

Usage:
    python -m energy_monitoring.real_data_ingest --data-dir /path/to/data/files

This will:
1. Initialize the database (tables + hypertable + continuous aggregates)
2. Create the Buayan site (3-phase hydro, 8 kW capacity)
3. Ingest all Buayan gzip files found in the data directory
4. Compute and store monthly stats for each month
5. Run sample queries and print a summary report
"""

import argparse
import re
from pathlib import Path

from energy_monitoring.db import init_db, get_session, get_engine, _exec_autocommit
from energy_monitoring.ingest import (
    ensure_site,
    ingest_and_process_3phase,
    load_parquet_file,
)
from energy_monitoring.models import MeasurementType
from energy_monitoring.queries import (
    query_daily_energy_from_hypertable,
    query_downtime_periods,
    query_hourly_profile,
    query_month_stats_with_trends,
    query_site_monthly_summary,
    query_cross_site_comparison,
)
from energy_monitoring.stats import compute_all_trends

from sqlalchemy import text as t


def find_buayan_files(data_dir: str) -> list[tuple[str, int, int]]:
    """
    Scan a directory for Buayan gzip files and extract year/month.
    Returns list of (filepath, year, month) sorted by date.

    Expected filenames like: "Buayan - 2025-11.gzip" or "Buayan+-+2025-11.gzip"
    """
    files = []
    data_path = Path(data_dir)

    for f in data_path.glob("**/*Buayan*"):
        if f.suffix not in (".gzip", ".gz", ".parquet"):
            continue
        if ".cpgz" in f.name:
            continue

        # Extract year-month from filename
        match = re.search(r"(\d{4})-(\d{2})", f.name)
        if match:
            year = int(match.group(1))
            month = int(match.group(2))
            files.append((str(f), year, month))

    # Deduplicate by (year, month) — keep first file found
    seen = set()
    unique_files = []
    for filepath, year, month in sorted(files, key=lambda x: (x[1], x[2])):
        key = (year, month)
        if key not in seen:
            seen.add(key)
            unique_files.append((filepath, year, month))

    return unique_files


def print_monthly_report(engine, site_id, year, month):
    """Print a detailed monthly report for a site."""
    summary = query_site_monthly_summary(engine, site_id, year, month)
    if not summary:
        print(f"  No data for {year}-{month:02d}")
        return

    print(f"\n{'='*60}")
    print(f"  MONTHLY REPORT: {summary['site_name']} — {year}-{month:02d}")
    print(f"{'='*60}")
    print(f"  Location: {summary['location']}")
    print(f"  Type: {summary['measurement_type']}")
    print(f"  Total readings: {summary['total_readings']:,}")
    print(f"  Avg consumption: {summary['avg_con_kw']:.2f} kW")
    print(f"  Max consumption: {summary['max_con_kw']:.2f} kW")
    print(f"  Avg generation:  {summary['avg_gen_kw']:.2f} kW")
    print(f"  Max generation:  {summary['max_gen_kw']:.2f} kW")
    print(f"  Total consumption: {summary['total_con_kwh']:.1f} kWh")
    print(f"  Total generation:  {summary['total_gen_kwh']:.1f} kWh")
    if summary['avg_frequency']:
        print(f"  Avg frequency: {summary['avg_frequency']:.2f} Hz")

    # Daily breakdown
    daily = query_daily_energy_from_hypertable(engine, site_id, year, month)
    if daily:
        print(f"\n  Daily Energy Breakdown ({len(daily)} days with data):")
        print(f"  {'Date':<12} {'Gen (kWh)':>10} {'Con (kWh)':>10} {'Samples':>8}")
        print(f"  {'-'*42}")
        for row in daily:
            print(f"  {str(row['day']):<12} {row['gen_energy_kwh']:>10.1f} "
                  f"{row['con_energy_kwh']:>10.1f} {row['sample_count']:>8}")


def main():
    parser = argparse.ArgumentParser(description="Ingest real Buayan data")
    parser.add_argument("--data-dir", required=True,
                        help="Directory containing Buayan gzip files")
    parser.add_argument("--capacity-kw", type=float, default=8.0,
                        help="Site capacity in kW (default: 8.0)")
    parser.add_argument("--skip-raw", action="store_true",
                        help="Skip raw data ingestion (only compute stats)")
    args = parser.parse_args()

    print("=" * 60)
    print("Energy Monitoring — Real Data Ingestion")
    print("=" * 60)

    # 1. Initialize database
    print("\n--- Step 1: Database Initialization ---")
    engine = init_db()
    session = get_session(engine)

    # 2. Create Buayan site
    print("\n--- Step 2: Create/Find Buayan Site ---")
    buayan = ensure_site(
        session,
        name="Buayan",
        measurement_type=MeasurementType.MU3PEP,
        location="Buayan, Sarangani",
        timezone="Asia/Manila",
        capacity_kw=args.capacity_kw,
    )

    # 3. Find and ingest data files
    print(f"\n--- Step 3: Scanning {args.data_dir} for data files ---")
    files = find_buayan_files(args.data_dir)
    if not files:
        print(f"ERROR: No Buayan gzip files found in {args.data_dir}")
        return

    print(f"Found {len(files)} month(s) of data:")
    for filepath, year, month in files:
        print(f"  {year}-{month:02d}: {Path(filepath).name}")

    print("\n--- Step 4: Ingesting Data ---")
    all_stats = {}
    for filepath, year, month in files:
        print(f"\nProcessing {year}-{month:02d}...")
        stats = ingest_and_process_3phase(
            session, buayan, filepath, year, month,
            ingest_raw=not args.skip_raw,
        )
        all_stats[(year, month)] = stats
        print(f"  Total gen: {stats.get('total_energy_gen_total', 0):.1f} kWh")
        print(f"  Total con: {stats.get('total_energy_con_total', 0):.1f} kWh")
        print(f"  Records: {stats.get('total_records', 0):,}")

    # 4. Refresh continuous aggregates (must run outside transaction)
    print("\n--- Step 5: Refreshing Continuous Aggregates ---")
    _exec_autocommit(
        engine,
        "CALL refresh_continuous_aggregate('readings_hourly', "
        "'2025-01-01'::timestamptz, '2027-01-01'::timestamptz)"
    )
    print("  Refreshed readings_hourly")
    _exec_autocommit(
        engine,
        "CALL refresh_continuous_aggregate('readings_daily', "
        "'2025-01-01'::timestamptz, '2027-01-01'::timestamptz)"
    )
    print("  Refreshed readings_daily")

    # 5. Print reports
    print("\n--- Step 6: Monthly Reports ---")
    for filepath, year, month in files:
        print_monthly_report(engine, buayan.id, year, month)

    # 6. Trends
    print(f"\n{'='*60}")
    print("  MONTH-OVER-MONTH TRENDS")
    print(f"{'='*60}")
    trends = query_month_stats_with_trends(engine, buayan.id)
    for row in trends:
        gen_pct = f"{row['gen_pct_change']:+.1f}%" if row['gen_pct_change'] else "N/A"
        con_pct = f"{row['con_pct_change']:+.1f}%" if row['con_pct_change'] else "N/A"
        print(f"  {row['year']}-{row['month']:02d}: "
              f"Gen={row['daily_energy_gen_total_mean']:.1f} kWh/day ({gen_pct}), "
              f"Con={row['daily_energy_con_total_mean']:.1f} kWh/day ({con_pct})")

    # 7. Database summary
    print(f"\n{'='*60}")
    print("  DATABASE SUMMARY")
    print(f"{'='*60}")
    with engine.connect() as conn:
        row_count = conn.execute(t("SELECT COUNT(*) FROM raw_readings")).scalar()
        print(f"  raw_readings: {row_count:,} rows")

        site_count = conn.execute(t("SELECT COUNT(*) FROM sites")).scalar()
        print(f"  sites: {site_count}")

        stats_count = conn.execute(t("SELECT COUNT(*) FROM mu3pep_month_stats")).scalar()
        print(f"  mu3pep_month_stats: {stats_count}")

        ht = conn.execute(t(
            "SELECT hypertable_name, num_chunks "
            "FROM timescaledb_information.hypertables "
            "WHERE hypertable_name = 'raw_readings'"
        )).first()
        if ht:
            print(f"  Hypertable chunks: {ht[1]}")

    print(f"\n{'='*60}")
    print("  Ingestion complete!")
    print(f"{'='*60}")

    session.close()


if __name__ == "__main__":
    main()
