"""End-to-end demo: load Buayan data, compute stats, store in DB, generate report.

Usage:
    python -m energy_monitoring.data.demo <data_file1> <data_file2> [--config config.json]

Example:
    python -m energy_monitoring.data.demo \
        "Buayan - 2025-11.gzip" "Buayan - 2025-12.gzip" \
        --config buayan_processing_config.json
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from energy_monitoring.models.base import init_db, SessionLocal
from energy_monitoring.models.site import Site, MeasurementType
from energy_monitoring.models.entry_type import EntryType
from energy_monitoring.models.mu3pep import Mu3pepMonthStats
from energy_monitoring.data.processor import process_and_store_3phase_hydro
from energy_monitoring.stats.reports import generate_month_report, format_trend_summary


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Process Buayan data demo")
    parser.add_argument("data_files", nargs="+", help="Parquet data files")
    parser.add_argument("--config", help="Processing config JSON", default=None)
    parser.add_argument("--site-name", default="Buayan", help="Site name")
    args = parser.parse_args(argv)

    # Initialise DB
    init_db()
    session = SessionLocal()

    try:
        # Create or get site
        site = session.query(Site).filter_by(name=args.site_name).first()
        if site is None:
            site = Site(
                name=args.site_name,
                measurement_type=MeasurementType.MU3PEP,
                location="Philippines",
                timezone="Asia/Manila",
            )
            session.add(site)
            session.commit()
            print(f"Created site: {site}")
        else:
            print(f"Using existing site: {site}")

        # Process data files
        data_files = [Path(f) for f in args.data_files]
        print(f"\nProcessing {len(data_files)} data file(s)...")

        entries = process_and_store_3phase_hydro(
            session=session,
            site=site,
            data_files=data_files,
            entry_type=EntryType.ACTUAL,
            config_path=args.config,
        )
        print(f"Created {len(entries)} month-stat entries:")
        for e in entries:
            print(f"  {e}")

        # Generate reports for each month
        print("\n" + "=" * 70)
        print("MONTHLY REPORTS")
        print("=" * 70)

        for entry in entries:
            print(f"\n--- {entry.year}-{entry.month:02d} ---")
            report = generate_month_report(
                session, Mu3pepMonthStats, site.id, entry.year, entry.month
            )

            if "error" in report:
                print(f"  Error: {report['error']}")
                continue

            meta = report["metadata"]
            current = report["current"]
            print(f"  Records: {meta['total_records']} / {meta['expected_records']} expected")

            # Print key stats
            key_fields = [
                ("total_energy_con_total", "Total Consumption (kWh)"),
                ("total_energy_gen_total", "Total Generation (kWh)"),
                ("power_con_total_mean", "Avg Power Consumption (kW)"),
                ("power_gen_total_mean", "Avg Power Generation (kW)"),
                ("estimated_system_downtime_hours", "Est. System Downtime (hrs)"),
                ("estimated_consumer_downtime_hours", "Est. Consumer Downtime (hrs)"),
            ]
            for field, label in key_fields:
                val = current.get(field)
                if val is not None:
                    print(f"  {label}: {val:.2f}")

            # Print trends
            if report["trends"]:
                print("\n  Trends:")
                summary = format_trend_summary(report["trends"])
                if summary:
                    print(summary)
                else:
                    print("  (No reference data available for trends yet)")

    finally:
        session.close()


if __name__ == "__main__":
    main()
