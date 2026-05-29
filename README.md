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

### Windows Setup

```powershell
# 1. Download and install PostgreSQL 14+ from https://www.postgresql.org/download/windows/
#    Use the interactive installer — it includes pgAdmin 4

# 2. Download and install TimescaleDB from https://docs.timescale.com/install/latest/self-hosted/installation-windows/
#    Run the installer and select the PostgreSQL version you installed

# 3. Open pgAdmin 4 (installed with PostgreSQL) or use the SQL Shell (psql)

# 4. Create the database and user (run in psql or pgAdmin query tool):
#    CREATE USER energy_user WITH PASSWORD 'energy_pass';
#    CREATE DATABASE energy_monitoring OWNER energy_user;
#    \c energy_monitoring
#    CREATE EXTENSION IF NOT EXISTS timescaledb;

# 5. Install Python dependencies (in Command Prompt or PowerShell)
pip install -r requirements.txt

# 6. Set the database URL (PowerShell)
$env:DATABASE_URL = "postgresql://energy_user:energy_pass@localhost:5432/energy_monitoring"

# 7. Run the ingestion
python -m energy_monitoring.real_data_ingest --data-dir .\data
```

**Note for Windows users:**
- PostgreSQL installer adds `psql` to your PATH automatically
- pgAdmin 4 comes bundled — use it for graphical database browsing
- If you get a `psycopg2` install error, use `pip install psycopg2-binary`
- For WeasyPrint (PDF reports), you may need to install GTK3: download from https://github.com/nickvdp/msys2-gtk3-binary/releases

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

## Web Dashboard

A built-in FastAPI web dashboard for interactive data exploration:

```bash
# Install dependencies (if not already)
pip install -r requirements.txt

# Start the dashboard
uvicorn dashboard.app:app --reload --port 8000
```

Then open http://localhost:8000 in your browser. Features:
- Site and month selector
- KPI cards (total generation, consumption, records, data availability)
- Interactive daily energy bar chart (Chart.js)
- 24-hour generation/consumption profile
- Month statistics table

### API Endpoints

The dashboard also exposes a REST API:
- `GET /api/sites` — list all sites
- `GET /api/sites/{id}/months` — available months for a site
- `GET /api/sites/{id}/daily?year=2026&month=1` — daily energy data
- `GET /api/sites/{id}/hourly?year=2026&month=1` — 24-hour profile
- `GET /api/sites/{id}/stats?year=2026&month=1` — month statistics

## Grafana Integration

For production monitoring dashboards, connect Grafana to the PostgreSQL database:

1. Install Grafana (`brew install grafana` on macOS, or download from https://grafana.com)
2. Add PostgreSQL as a data source (Host: localhost:5432, DB: energy_monitoring)
3. Toggle **TimescaleDB** ON in the data source settings
4. Import the pre-built dashboard from `grafana/energy_monitoring_dashboard.json`

See `grafana/README.md` for detailed setup steps and sample queries.

## SQL GUI Tools

For graphical database browsing (instead of command-line SQL):

- **pgAdmin 4** — `brew install --cask pgadmin4` (macOS) / bundled with PostgreSQL installer (Windows)
- **DBeaver** — `brew install --cask dbeaver-community` (macOS) / download from https://dbeaver.io (Windows)

Connect with: Host=localhost, Port=5432, Database=energy_monitoring, User=energy_user

## Project Structure

```
climatemodel/
├── energy_monitoring/
│   ├── __init__.py
│   ├── __main__.py          # Entry point for demo
│   ├── models.py            # SQLAlchemy ORM models (sites, month_stats, raw_readings)
│   ├── db.py                # Database connection, table creation, TimescaleDB setup
│   ├── ingest.py            # Data ingestion (parquet → database)
│   ├── real_data_ingest.py  # Real Buayan data ingestion script
│   ├── stats.py             # Stats calculation engine (mean/min/max/std, trends)
│   ├── queries.py           # Sample SQL queries (monthly summary, daily energy, etc.)
│   ├── report_generator.py  # Jinja2 + WeasyPrint PDF report generation
│   ├── cross_check.py       # Stats validation against existing PDF reports
│   └── setup_demo.py        # Synthetic data demo setup
├── dashboard/
│   └── app.py               # FastAPI web dashboard + REST API
├── grafana/
│   ├── README.md             # Grafana setup guide
│   └── energy_monitoring_dashboard.json  # Pre-built Grafana dashboard
├── requirements.txt
└── README.md
```
