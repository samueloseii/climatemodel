# Energy Monitoring System — PostgreSQL + TimescaleDB

A Python-based energy monitoring data pipeline that ingests raw power readings from micro-hydro and solar sites into PostgreSQL with the TimescaleDB extension, computes monthly statistics, and generates PDF reports.

## Overview

This system replaces the previous multi-database setup (InfluxDB + SQL Server + JSON config) with a single PostgreSQL + TimescaleDB database. All time-series data, site metadata, and computed statistics live in one place, queryable with standard SQL.

## Architecture

```
SD Card / Data Export
        ↓
  Parquet/Gzip Files (1-minute power readings)
        ↓
  Python Ingestion Script
        ↓
  PostgreSQL + TimescaleDB
  ├── raw_readings (hypertable — auto-partitioned by time)
  ├── sites (site metadata + measurement type)
  ├── muspep_month_stats (single-phase hydro)
  ├── mu3pep_month_stats (3-phase hydro)
  ├── muspsep_month_stats (single-phase solar)
  ├── mu3psep_month_stats (3-phase solar)
  ├── readings_hourly (continuous aggregate — auto-updated)
  └── readings_daily (continuous aggregate — auto-updated)
        ↓
  Queries / Reports / Grafana
```

## Prerequisites

- Python 3.10+
- PostgreSQL 14+
- TimescaleDB 2+ extension

### macOS Setup

```bash
# Install PostgreSQL + TimescaleDB
brew install postgresql@14
brew install timescaledb

# Run the TimescaleDB setup (adds the extension to PostgreSQL config)
timescaledb-tune --quiet --yes

# Start PostgreSQL
brew services start postgresql@14

# Create the database and user
psql postgres -c "CREATE USER energy_user WITH PASSWORD 'energy_pass';"
psql postgres -c "CREATE DATABASE energy_monitoring OWNER energy_user;"
psql energy_monitoring -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

### Linux (Ubuntu) Setup

```bash
# Add TimescaleDB repository
sudo add-apt-repository ppa:timescale/timescaledb-ppa
sudo apt update
sudo apt install postgresql-14 timescaledb-2-postgresql-14

# Configure
sudo timescaledb-tune --quiet --yes
sudo systemctl restart postgresql

# Create database
sudo -u postgres psql -c "CREATE USER energy_user WITH PASSWORD 'energy_pass';"
sudo -u postgres psql -c "CREATE DATABASE energy_monitoring OWNER energy_user;"
sudo -u postgres psql -d energy_monitoring -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd climatemodel

# Install Python dependencies
pip install -r requirements.txt
```

## Usage

### 1. Ingest Data

Place your Buayan gzip/parquet files in a `data/` directory, then run:

```bash
python -m energy_monitoring.real_data_ingest --data-dir ./data
```

This single command:
- Creates all database tables (if they don't exist)
- Creates the site record (Buayan, 3-phase hydro, 8 kW)
- Reads all gzip files and loads raw 1-minute readings
- Computes monthly stats (mean/min/max/std for energy, power, frequency, voltage, etc.)
- Refreshes continuous aggregates (hourly and daily rollups)
- Prints a summary report

### 2. Generate PDF Reports

```bash
python -m energy_monitoring.report_generator --site Buayan --year 2026 --month 1
```

Generates a professional PDF with:
- KPI summary (total generation, consumption, CO₂ avoided, data availability)
- Daily energy bar chart
- 24-hour generation/consumption profile
- Stats table (power, energy, frequency, downtime)
- Per-phase breakdown (for 3-phase sites)

### 3. Cross-Check Stats

```bash
python -m energy_monitoring.cross_check
```

Compares database stats against the values from the existing PDF reports to verify calculation accuracy.

### 4. Run Demo with Synthetic Data

```bash
python -m energy_monitoring
```

Sets up the database with synthetic sample data for testing.

## Database Schema

### Sites Table
Stores site metadata: name, measurement type, location, capacity, timezone.

### Month Stats Tables (one per measurement type)
Each stores monthly statistics with mean/min/max/std for:
- Daily energy consumption and generation (kWh)
- Power consumption and generation (kW)
- Plant factor (%)
- Frequency (Hz) and voltage (V)
- System and consumer downtime (hours)
- Entry type: `actual`, `baseline`, or `predicted` (for trend comparison)

### Raw Readings (TimescaleDB Hypertable)
1-minute power readings with per-phase and total values. Automatically partitioned by time for fast time-range queries.

### Continuous Aggregates
- `readings_hourly` — automatic hourly averages, min, max
- `readings_daily` — automatic daily averages, min, max

These update automatically when new data is added.

## SQL GUI Tools

For graphical database browsing (instead of command-line SQL):

- **pgAdmin 4** — `brew install --cask pgadmin4` (macOS)
- **DBeaver** — `brew install --cask dbeaver-community` (macOS)

Connect with: Host=localhost, Port=5432, Database=energy_monitoring, User=energy_user

## Project Structure

```
energy_monitoring/
├── __init__.py
├── __main__.py          # Entry point for demo
├── models.py            # SQLAlchemy ORM models (sites, month_stats, raw_readings)
├── db.py                # Database connection, table creation, TimescaleDB setup
├── ingest.py            # Data ingestion (parquet → database)
├── real_data_ingest.py  # Real Buayan data ingestion script
├── stats.py             # Stats calculation engine (mean/min/max/std, trends)
├── queries.py           # Sample SQL queries (monthly summary, daily energy, etc.)
├── report_generator.py  # Jinja2 + WeasyPrint PDF report generation
├── cross_check.py       # Stats validation against existing PDF reports
└── setup_demo.py        # Synthetic data demo setup
```
