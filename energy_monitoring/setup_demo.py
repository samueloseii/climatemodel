#!/usr/bin/env python3
"""
Main setup and demo script for the Energy Monitoring System.

Usage:
    python -m energy_monitoring.setup_demo

This will:
1. Initialize the database (tables + hypertable + continuous aggregates)
2. Create a sample Buayan site (3-phase hydro)
3. Generate and ingest synthetic data for Nov and Dec 2025
4. Run sample queries to demonstrate TimescaleDB capabilities
5. Print a summary of results
"""

from energy_monitoring.db import init_db, get_session, get_engine
from energy_monitoring.ingest import ensure_site, generate_sample_data
from energy_monitoring.models import (
    EntryType,
    MeasurementType,
    Mu3pepMonthStats,
    Site,
)
from energy_monitoring.queries import (
    query_daily_energy_from_hypertable,
    query_downtime_periods,
    query_hourly_profile,
    query_month_stats_with_trends,
    query_site_monthly_summary,
)
from energy_monitoring.stats import compute_all_trends


def main():
    print("=" * 60)
    print("Energy Monitoring System — PostgreSQL + TimescaleDB Setup")
    print("=" * 60)

    # 1. Initialize database
    print("\n--- Step 1: Database Initialization ---")
    engine = init_db()
    session = get_session(engine)

    # 2. Create Buayan site
    print("\n--- Step 2: Create Sample Site ---")
    buayan = ensure_site(
        session,
        name="Buayan",
        measurement_type=MeasurementType.MU3PEP,
        location="Buayan, Philippines",
        timezone="Asia/Manila",
        capacity_kw=8.0,
    )

    # 3. Generate and ingest data for two months
    print("\n--- Step 3: Generate & Ingest Sample Data ---")
    print("Generating November 2025 data...")
    df_nov, stats_nov = generate_sample_data(
        session, buayan, year=2025, month=11, days=30
    )
    print("\nGenerating December 2025 data...")
    df_dec, stats_dec = generate_sample_data(
        session, buayan, year=2025, month=12, days=31
    )

    # 4. Run sample queries
    print("\n--- Step 4: Sample Queries ---")

    # Monthly summary
    print("\n[Query 1] Monthly Summary (Nov 2025):")
    summary = query_site_monthly_summary(engine, buayan.id, 2025, 11)
    if summary:
        print(f"  Site: {summary['site_name']}")
        print(f"  Total readings: {summary['total_readings']:,}")
        print(f"  Avg consumption: {summary['avg_con_kw']:.2f} kW")
        print(f"  Avg generation: {summary['avg_gen_kw']:.2f} kW")
        print(f"  Total consumption: {summary['total_con_kwh']:.1f} kWh")
        print(f"  Total generation: {summary['total_gen_kwh']:.1f} kWh")
        print(f"  Avg frequency: {summary['avg_frequency']:.2f} Hz")

    # Daily energy
    print("\n[Query 2] Daily Energy (first 5 days of Nov 2025):")
    daily = query_daily_energy_from_hypertable(engine, buayan.id, 2025, 11)
    for row in daily[:5]:
        print(f"  {row['day']}: Gen={row['gen_energy_kwh']:.1f} kWh, "
              f"Con={row['con_energy_kwh']:.1f} kWh, "
              f"Samples={row['sample_count']}")

    # Month stats with trends
    print("\n[Query 3] Month Stats with Trends:")
    trends = query_month_stats_with_trends(engine, buayan.id)
    for row in trends:
        pct_str = f"{row['gen_pct_change']:+.1f}%" if row['gen_pct_change'] else "N/A"
        print(f"  {row['year']}-{row['month']:02d}: "
              f"Gen mean={row['daily_energy_gen_total_mean']:.1f} kWh/day, "
              f"Con mean={row['daily_energy_con_total_mean']:.1f} kWh/day, "
              f"Gen change: {pct_str}")

    # Trend analysis (Python-side)
    print("\n[Query 4] Trend Analysis (Python — vs baseline, vs last month):")
    if len(trends) >= 2:
        nov_gen = trends[0]["daily_energy_gen_total_mean"]
        dec_gen = trends[1]["daily_energy_gen_total_mean"]
        all_trends = compute_all_trends(
            current_value=dec_gen,
            baseline_value=nov_gen,
            last_month_value=nov_gen,
            all_values=[nov_gen, dec_gen],
        )
        for name, t in all_trends.items():
            if t.percent_change is not None:
                print(f"  {name}: {t.absolute_change:+.1f} kWh/day "
                      f"({t.percent_change:+.1f}%)")

    # Downtime detection
    print("\n[Query 5] Downtime Periods (Nov 2025, >10 min gaps):")
    downtimes = query_downtime_periods(engine, buayan.id, 2025, 11)
    for i, dt in enumerate(downtimes[:5]):
        print(f"  {i+1}. {dt['downtime_start']} — {dt['hours_down']:.1f} hours")
    if len(downtimes) > 5:
        print(f"  ... and {len(downtimes) - 5} more periods")

    # 5. Database stats
    print("\n--- Step 5: Database Summary ---")
    with engine.connect() as conn:
        from sqlalchemy import text as t
        row_count = conn.execute(t("SELECT COUNT(*) FROM raw_readings")).scalar()
        print(f"  raw_readings: {row_count:,} rows")

        site_count = conn.execute(t("SELECT COUNT(*) FROM sites")).scalar()
        print(f"  sites: {site_count}")

        stats_count = conn.execute(t("SELECT COUNT(*) FROM mu3pep_month_stats")).scalar()
        print(f"  mu3pep_month_stats: {stats_count}")

        # Hypertable info
        ht = conn.execute(t(
            "SELECT hypertable_name, num_chunks "
            "FROM timescaledb_information.hypertables "
            "WHERE hypertable_name = 'raw_readings'"
        )).first()
        if ht:
            print(f"  Hypertable chunks: {ht[1]}")

        # Compression info
        comp = conn.execute(t(
            "SELECT pg_size_pretty(before_compression_total_bytes) AS before, "
            "       pg_size_pretty(after_compression_total_bytes) AS after "
            "FROM hypertable_compression_stats('raw_readings')"
        )).first()
        if comp and comp[1]:
            print(f"  Compression: {comp[0]} -> {comp[1]}")

    print("\n" + "=" * 60)
    print("Setup complete! Database is ready at:")
    print("  postgresql://energy_user:energy_pass@localhost:5432/energy_monitoring")
    print("\nGUI tools for inspection:")
    print("  - pgAdmin 4: http://localhost:5050")
    print("  - Or install DBeaver for a desktop SQL client")
    print("=" * 60)

    session.close()


if __name__ == "__main__":
    main()
