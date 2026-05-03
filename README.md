# climatemodel

## Energy Monitoring System

SQLAlchemy-based database and stats engine for micro-grid energy monitoring sites.

### Site Types & Measurement Names

| Measurement Type | Site Type             | DB Table               |
|------------------|-----------------------|------------------------|
| `muspep`         | Single Phase Hydro    | `muspep_month_stats`   |
| `mu3pep`         | Three Phase Hydro     | `mu3pep_month_stats`   |
| `muspsep`        | Single Phase Solar    | `muspsep_month_stats`  |
| `mu3psep`        | Three Phase Solar     | `mu3psep_month_stats`  |

### Entry Types

Each month-stat entry has an `entry_type` field:
- **actual** -- real measured data for a month
- **baseline** -- nominal/reference value (for trend comparisons)
- **predicted** -- forecasted value for a given month

### Trend Analysis

Reports automatically calculate four trend comparisons:
- **vs baseline** -- compared to the most recent baseline entry
- **vs last month** -- compared to the previous month's actual
- **vs predicted** -- compared to a predicted entry for the same month
- **vs average** -- compared to the average of all available months

### Setup

```bash
pip install -r requirements.txt
```

### Running Tests

```bash
python -m pytest tests/ -v
```

### Processing Data (Demo)

```bash
python -m energy_monitoring.data.demo \
  "Buayan - 2025-11.gzip" "Buayan - 2025-12.gzip" \
  --config buayan_processing_config.json
```

### Project Structure

```
energy_monitoring/
  models/          # SQLAlchemy ORM models
    base.py        # Engine, session, Base class
    site.py        # Site model with measurement_type
    entry_type.py  # EntryType enum (actual/baseline/predicted)
    mixins.py      # Shared column mixins for month-stats tables
    muspep.py      # Single-phase hydro month stats
    mu3pep.py      # Three-phase hydro month stats
    muspsep.py     # Single-phase solar month stats
    mu3psep.py     # Three-phase solar month stats
  stats/           # Calculation & trend utilities
    calculations.py  # Generic min/max/mean/std, energy, power, downtime
    trends.py        # Trend calculations (vs baseline/last/predicted/avg)
    reports.py       # Monthly report generation with trends
  data/            # Data loading & processing
    loader.py      # Parquet file loader
    processor.py   # Raw data -> month stats pipeline
    demo.py        # End-to-end demo script
tests/             # pytest test suite
```
