# Grafana Setup for Energy Monitoring

## Quick Start

### 1. Install Grafana

**macOS:**
```bash
brew install grafana
brew services start grafana
```

**Windows:**
Download from https://grafana.com/grafana/download?platform=windows

**Linux:**
```bash
sudo apt install -y adduser libfontconfig1 musl
wget https://dl.grafana.com/oss/release/grafana_10.4.1_amd64.deb
sudo dpkg -i grafana_10.4.1_amd64.deb
sudo systemctl start grafana-server
```

### 2. Open Grafana

Go to http://localhost:3000 (default login: admin / admin)

### 3. Add PostgreSQL Data Source

1. Go to **Connections → Data Sources → Add data source**
2. Select **PostgreSQL**
3. Configure:
   - **Host:** `localhost:5432`
   - **Database:** `energy_monitoring`
   - **User:** `energy_user`
   - **Password:** `energy_pass`
   - **TLS/SSL Mode:** disable
   - **TimescaleDB:** toggle ON
4. Click **Save & Test**

### 4. Import the Dashboard

1. Go to **Dashboards → Import**
2. Upload `energy_monitoring_dashboard.json` from this directory
3. Select the PostgreSQL data source you just created

## Sample Queries for Custom Panels

### Daily Energy (Bar Chart)
```sql
SELECT
  time_bucket('1 day', time) AS time,
  SUM(gen_total) / 1000.0 / 60.0 AS "Generation (kWh)",
  SUM(con_total) / 1000.0 / 60.0 AS "Consumption (kWh)"
FROM raw_readings
WHERE site_id = 2
  AND $__timeFilter(time)
GROUP BY 1
ORDER BY 1
```

### 24-Hour Profile (Time Series)
```sql
SELECT
  bucket AS time,
  avg_gen_total / 1000.0 AS "Avg Generation (kW)",
  avg_con_total / 1000.0 AS "Avg Consumption (kW)"
FROM readings_hourly
WHERE site_id = 2
  AND $__timeFilter(bucket)
ORDER BY bucket
```

### Monthly Stats (Table)
```sql
SELECT
  year || '-' || LPAD(month::text, 2, '0') AS "Month",
  ROUND(total_energy_gen_total::numeric, 1) AS "Total Gen (kWh)",
  ROUND(total_energy_con_total::numeric, 1) AS "Total Con (kWh)",
  ROUND(daily_energy_gen_total_mean::numeric, 1) AS "Avg Daily Gen",
  ROUND(daily_energy_con_total_mean::numeric, 1) AS "Avg Daily Con",
  total_records AS "Records"
FROM mu3pep_month_stats
WHERE site_id = 2
ORDER BY year, month
```
