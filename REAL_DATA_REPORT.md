# Buayan Energy Monitoring — Real Data Analysis Report

## Site Information
- **Site:** Buayan (3-phase hydro, mu3pep)
- **Location:** Buayan, Sarangani, Philippines
- **Capacity:** 8.0 kW
- **Timezone:** Asia/Manila (UTC+8)
- **Data Period:** November 2025 — February 2026

---

## Summary Table

| Metric | Nov 2025 | Dec 2025 | Jan 2026 | Feb 2026* |
|--------|----------|----------|----------|-----------|
| Raw readings | 25,166 | 20,841 | 29,592 | 22,457 |
| Data availability | 58.3% | 46.7% | 66.3% | 55.7% |
| Total generation (kWh) | 2,290 | 2,058 | 2,914 | 1,761 |
| Total consumption (kWh) | 1,275 | 1,011 | 1,310 | 745 |
| Avg daily gen (kWh/day) | 95.4 | 98.0 | 94.0 | 103.6 |
| Avg daily con (kWh/day) | 53.1 | 48.1 | 42.2 | 43.8 |
| Avg gen power (kW) | 5.46 | 5.92 | 5.91 | 4.70 |
| Avg con power (kW) | 3.04 | 2.91 | 2.66 | 1.99 |
| Max gen power (kW) | 6.72 | 6.68 | 6.93 | 6.80 |
| Max con power (kW) | 5.59 | 5.36 | 5.08 | 5.55 |
| Est. consumer downtime (hrs) | 6.5 | 7.8 | 19.5 | 88.9 |

*Feb 2026 is partial data (1st–17th only)*

---

## Per-Phase Breakdown

### Average Daily Generation (kWh/day)

| Phase | Nov 2025 | Dec 2025 | Jan 2026 | Feb 2026 |
|-------|----------|----------|----------|----------|
| Phase A | 24.3 | 25.7 | 25.7 | 30.8 |
| Phase B | 36.4 | 37.4 | 35.7 | 37.4 |
| Phase C | 34.8 | 34.8 | 32.7 | 35.4 |
| **Total** | **95.4** | **98.0** | **94.0** | **103.6** |

### Average Daily Consumption (kWh/day)

| Phase | Nov 2025 | Dec 2025 | Jan 2026 | Feb 2026 |
|-------|----------|----------|----------|----------|
| Phase A | 10.7 | 9.5 | 8.6 | 11.1 |
| Phase B | 22.3 | 20.4 | 18.1 | 16.9 |
| Phase C | 20.1 | 18.2 | 15.6 | 15.9 |
| **Total** | **53.1** | **48.1** | **42.2** | **43.8** |

### Average Power by Phase (kW)

| | Gen A | Gen B | Gen C | Con A | Con B | Con C |
|---|-------|-------|-------|-------|-------|-------|
| Nov 2025 | 1.39 | 2.08 | 1.99 | 0.61 | 1.28 | 1.15 |
| Dec 2025 | 1.56 | 2.26 | 2.11 | 0.58 | 1.24 | 1.10 |
| Jan 2026 | 1.62 | 2.24 | 2.05 | 0.54 | 1.14 | 0.98 |
| Feb 2026 | 1.81 | 2.20 | 2.08 | 0.65 | 0.99 | 0.94 |

---

## Month-over-Month Trends

| Month | Avg Gen (kWh/day) | Change | Avg Con (kWh/day) | Change |
|-------|-------------------|--------|-------------------|--------|
| Nov 2025 | 95.4 | — | 53.1 | — |
| Dec 2025 | 98.0 | +2.7% | 48.1 | -9.4% |
| Jan 2026 | 94.0 | -4.1% | 42.2 | -12.2% |
| Feb 2026 | 103.6 | +10.2% | 43.8 | +3.8% |

---

## Frequency (Feb 2026 only — earlier months lack frequency data)

| Metric | Value |
|--------|-------|
| Mean | 50.95 Hz |
| Min | 47.54 Hz |
| Max | 52.40 Hz |

---

## Data Quality Notes

1. **Nov 2025 starts mid-month** (7th Nov) — only 24 days of data, not full 30
2. **Dec 2025 has a large gap** — max gap of ~11 days (16,082 minutes), only 21 days with data
3. **Jan 2026** — best coverage at 66.3%, all 31 days have data but with some gaps
4. **Feb 2026** — partial month (1st–17th), but includes richer data: voltage, frequency, battery
5. **Data intervals** — 1-minute readings (60-second intervals) as expected
6. **No frequency/voltage in Nov-Jan** — only power data (ConPa/b/c, GenPa/b/c)
7. **Consumer downtime increasing** — 6.5h (Nov) → 88.9h (Feb), worth investigating

---

## Database Summary

| Table | Rows |
|-------|------|
| raw_readings (hypertable) | 98,056 |
| sites | 1 |
| mu3pep_month_stats | 4 |
| readings_hourly (continuous aggregate) | populated |
| readings_daily (continuous aggregate) | populated |

---

## How This Was Generated

All data was ingested and analyzed using the `energy_monitoring` Python package with PostgreSQL 14 + TimescaleDB 2. The workflow:

```bash
# Reset database and ingest all 4 months
python -m energy_monitoring.real_data_ingest --data-dir ./data
```

This runs: DB init → site creation → parquet ingestion → stats computation → continuous aggregate refresh → queries.
