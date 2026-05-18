---
name: testing-energy-monitoring
description: Test the PostgreSQL + TimescaleDB energy monitoring pipeline end-to-end. Use when verifying data ingestion, stats calculation, or query changes.
---

# Testing the Energy Monitoring Pipeline

This is a shell-only testing workflow (no browser/GUI needed). All tests run against a local PostgreSQL 14 + TimescaleDB 2 instance.

## Prerequisites

- PostgreSQL 14 running locally (`sudo pg_isready` to check, `sudo pg_ctlcluster 14 main start` if not)
- TimescaleDB 2 extension installed
- Database `energy_monitoring` with user `energy_user` / password from `ENERGY_DB_PASSWORD` secret (default: `energy_pass`)
- Python dependencies: `sqlalchemy psycopg2-binary pandas numpy pyarrow`
- Real Buayan data files (`.gzip` parquet) in `./data/` directory

## Devin Secrets Needed

- `ENERGY_DB_PASSWORD` — PostgreSQL password for `energy_user` (default local dev value: `energy_pass`)

## Testing Steps

### 1. Verify PostgreSQL is running
```bash
sudo pg_isready
```

### 2. Fresh DB setup test
```bash
# Drop all tables and recreate from scratch
sudo -u postgres psql -d energy_monitoring -c "
DROP MATERIALIZED VIEW IF EXISTS readings_hourly CASCADE;
DROP MATERIALIZED VIEW IF EXISTS readings_daily CASCADE;
DROP TABLE IF EXISTS raw_readings CASCADE;
DROP TABLE IF EXISTS mu3pep_month_stats CASCADE;
DROP TABLE IF EXISTS muspep_month_stats CASCADE;
DROP TABLE IF EXISTS muspsep_month_stats CASCADE;
DROP TABLE IF EXISTS mu3psep_month_stats CASCADE;
DROP TABLE IF EXISTS sites CASCADE;"

# Run setup + demo
python -m energy_monitoring
```
**Verify:** Output shows "All tables created", hypertable created, continuous aggregates created, compression policy added, synthetic data ingested.

### 3. Real data ingestion test
```bash
# Truncate data but keep schema
sudo -u postgres psql -d energy_monitoring -c "TRUNCATE raw_readings, mu3pep_month_stats, sites CASCADE;"

# Ingest real data
python -m energy_monitoring.real_data_ingest --data-dir ./data
```
**Verify:**
- `raw_readings` has 98,056 rows (may vary if data files change)
- `mu3pep_month_stats` has 4 rows (one per month)
- `sites` has 1 row (Buayan)
- No errors during ingestion

### 4. Stats accuracy cross-check
Load a parquet file directly with pandas and manually compute stats, then compare to what's in `mu3pep_month_stats`. Example for Nov 2025:
```python
import pandas as pd
df = pd.read_parquet('data/Buayan - 2025-11.gzip')
gen_total = df[['GenPa','GenPb','GenPc']].sum(axis=1)
total_gen_kwh = gen_total.sum() / 60.0 / 1000.0
# Compare to DB total_energy_gen_total
```
**Verify:** Values match within 1% tolerance.

### 5. Column handling test
Query `raw_readings` for months with different column sets:
- Nov-Jan data (6 columns): `frequency`, `voltage_ph1/2/3`, `battery_voltage` should all be NULL
- Feb data (32 columns): `frequency` should have non-null values (~50.95 Hz mean), voltage and battery should be populated

### 6. Continuous aggregates test
```sql
SELECT COUNT(*) FROM readings_hourly;
SELECT COUNT(*) FROM readings_daily;
```
**Verify:** Both have > 0 rows. Spot-check a daily value against raw data SUM.

### 7. Query functions test
Run each query function from `queries.py` with the correct `site_id` (check with `SELECT id FROM sites WHERE name='Buayan'`):
- `query_daily_energy_from_hypertable()` — should return daily rows
- `query_month_stats_with_trends()` — should return 4 rows with pct_change
- `query_downtime_periods()` — should find gap periods
- `query_hourly_profile()` — should return 24 hourly rows

### 8. Idempotency test
Re-run `python -m energy_monitoring.real_data_ingest --data-dir ./data` and verify row counts don't change.

## Important Notes

- **Site ID auto-increment**: After TRUNCATE + re-insert, the site_id may not be 1. Always query `SELECT id FROM sites WHERE name='Buayan'` to get the actual ID before running queries.
- **Continuous aggregates need manual refresh** after bulk data loads. The `real_data_ingest.py` script handles this, but if you insert data manually, run: `CALL refresh_continuous_aggregate('readings_hourly', '2025-01-01', '2027-01-01');`
- **Continuous aggregate creation requires autocommit mode** — the code uses `_exec_autocommit()` for this. Standard SQLAlchemy transactions will fail.
- **Real data characteristics**: Nov starts mid-month (7th), Dec has ~11-day gap, Feb is partial (1st-17th). These are real data limitations.
- **No CI configured** on this repo. All testing is local.
