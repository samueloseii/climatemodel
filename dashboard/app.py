"""
Energy Monitoring Dashboard — FastAPI web application.

Provides a REST API and interactive web dashboard for viewing
energy monitoring data stored in PostgreSQL + TimescaleDB.

Run locally:
    uvicorn dashboard.app:app --reload --port 8000

Then open http://localhost:8000 in your browser.
"""

import calendar
import os
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://energy_user:energy_pass@localhost:5432/energy_monitoring",
)

app = FastAPI(title="Energy Monitoring Dashboard")
engine = create_engine(DATABASE_URL)


# ─── API Endpoints ─────────────────────────────────────────────

@app.get("/api/sites")
def get_sites():
    """List all monitored sites."""
    with engine.connect() as conn:
        rows = conn.execute(text(
            "SELECT id, name, measurement_type, location, capacity_kw FROM sites ORDER BY name"
        )).mappings().all()
    return [dict(r) for r in rows]


@app.get("/api/sites/{site_id}/months")
def get_months(site_id: int):
    """List available months for a site (from mu3pep_month_stats)."""
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT year, month, total_records,
                   ROUND(total_energy_gen_total::numeric, 1) as total_gen_kwh,
                   ROUND(total_energy_con_total::numeric, 1) as total_con_kwh
            FROM mu3pep_month_stats
            WHERE site_id = :sid
            ORDER BY year, month
        """), {"sid": site_id}).mappings().all()
    return [dict(r) for r in rows]


@app.get("/api/sites/{site_id}/daily")
def get_daily(site_id: int, year: int, month: int):
    """Daily energy breakdown for a given month."""
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT
                time_bucket('1 day', time)::date AS day,
                ROUND((SUM(gen_total) / 1000.0 / 60.0)::numeric, 2) AS gen_kwh,
                ROUND((SUM(con_total) / 1000.0 / 60.0)::numeric, 2) AS con_kwh,
                COUNT(*) AS samples
            FROM raw_readings
            WHERE site_id = :sid
              AND EXTRACT(YEAR FROM time) = :y
              AND EXTRACT(MONTH FROM time) = :m
            GROUP BY day ORDER BY day
        """), {"sid": site_id, "y": year, "m": month}).mappings().all()
    return [dict(r) for r in rows]


@app.get("/api/sites/{site_id}/hourly")
def get_hourly(site_id: int, year: int, month: int):
    """24-hour average profile for a given month."""
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT
                EXTRACT(HOUR FROM bucket)::int AS hour,
                ROUND((AVG(avg_gen_total) / 1000.0)::numeric, 3) AS avg_gen_kw,
                ROUND((AVG(avg_con_total) / 1000.0)::numeric, 3) AS avg_con_kw
            FROM readings_hourly
            WHERE site_id = :sid
              AND EXTRACT(YEAR FROM bucket) = :y
              AND EXTRACT(MONTH FROM bucket) = :m
            GROUP BY hour ORDER BY hour
        """), {"sid": site_id, "y": year, "m": month}).mappings().all()
    return [dict(r) for r in rows]


@app.get("/api/sites/{site_id}/stats")
def get_stats(site_id: int, year: int, month: int):
    """Month stats for a given site and month."""
    with engine.connect() as conn:
        row = conn.execute(text("""
            SELECT *
            FROM mu3pep_month_stats
            WHERE site_id = :sid AND year = :y AND month = :m
        """), {"sid": site_id, "y": year, "m": month}).mappings().first()
    if not row:
        return JSONResponse({"error": "No stats found"}, status_code=404)
    result = {}
    for k, v in dict(row).items():
        if isinstance(v, float):
            result[k] = round(v, 4)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        else:
            result[k] = v
    return result


# ─── Dashboard HTML ────────────────────────────────────────────

DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Energy Monitoring Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; color: #333; }
        .header { background: #1a4d2e; color: white; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
        .header h1 { font-size: 20px; font-weight: 600; }
        .header select { padding: 6px 12px; border-radius: 4px; border: none; font-size: 14px; }
        .container { max-width: 1200px; margin: 20px auto; padding: 0 16px; }
        .kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .kpi { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .kpi .value { font-size: 28px; font-weight: 700; color: #1a4d2e; }
        .kpi .label { font-size: 12px; color: #888; margin-top: 4px; }
        .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .chart-card { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .chart-card h3 { font-size: 14px; color: #555; margin-bottom: 12px; }
        .stats-table { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stats-table h3 { font-size: 14px; color: #555; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #1a4d2e; color: white; padding: 8px 12px; text-align: left; font-weight: 500; }
        td { padding: 6px 12px; border-bottom: 1px solid #eee; }
        tr:hover { background: #f0f7f4; }
        .loading { text-align: center; padding: 40px; color: #888; }
        @media (max-width: 768px) { .charts { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Energy Monitoring Dashboard</h1>
        <div>
            <select id="siteSelect" onchange="loadMonths()"></select>
            <select id="monthSelect" onchange="loadData()"></select>
        </div>
    </div>
    <div class="container">
        <div class="kpi-row">
            <div class="kpi"><div class="value" id="kpiGen">—</div><div class="label">Total Generation (kWh)</div></div>
            <div class="kpi"><div class="value" id="kpiCon">—</div><div class="label">Total Consumption (kWh)</div></div>
            <div class="kpi"><div class="value" id="kpiRecords">—</div><div class="label">Total Records</div></div>
            <div class="kpi"><div class="value" id="kpiAvail">—</div><div class="label">Data Availability</div></div>
        </div>
        <div class="charts">
            <div class="chart-card">
                <h3>Daily Energy (kWh)</h3>
                <canvas id="dailyChart"></canvas>
            </div>
            <div class="chart-card">
                <h3>24-Hour Profile (kW)</h3>
                <canvas id="hourlyChart"></canvas>
            </div>
        </div>
        <div class="stats-table">
            <h3>Month Statistics</h3>
            <table id="statsTable"><tbody></tbody></table>
        </div>
    </div>
    <script>
        let dailyChart, hourlyChart;
        const green = '#2d6a4f', red = '#e07a5f', lightGreen = 'rgba(45,106,79,0.2)', lightRed = 'rgba(224,122,95,0.2)';

        async function init() {
            const sites = await (await fetch('/api/sites')).json();
            const sel = document.getElementById('siteSelect');
            sites.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.text = s.name + ' (' + s.measurement_type + ')'; sel.add(o); });
            if (sites.length) loadMonths();
        }

        async function loadMonths() {
            const sid = document.getElementById('siteSelect').value;
            const months = await (await fetch('/api/sites/' + sid + '/months')).json();
            const sel = document.getElementById('monthSelect');
            sel.innerHTML = '';
            months.forEach(m => { const o = document.createElement('option'); o.value = m.year + '-' + m.month; o.text = m.year + '-' + String(m.month).padStart(2,'0'); sel.add(o); });
            if (months.length) loadData();
        }

        async function loadData() {
            const sid = document.getElementById('siteSelect').value;
            const [year, month] = document.getElementById('monthSelect').value.split('-').map(Number);

            // KPIs
            const stats = await (await fetch('/api/sites/' + sid + '/stats?year=' + year + '&month=' + month)).json();
            if (!stats.error) {
                document.getElementById('kpiGen').textContent = (stats.total_energy_gen_total || 0).toFixed(1);
                document.getElementById('kpiCon').textContent = (stats.total_energy_con_total || 0).toFixed(1);
                document.getElementById('kpiRecords').textContent = (stats.total_records || 0).toLocaleString();
                const daysInMonth = new Date(year, month, 0).getDate();
                const expected = daysInMonth * 24 * 60;
                document.getElementById('kpiAvail').textContent = ((stats.total_records / expected) * 100).toFixed(1) + '%';

                // Stats table
                const tbody = document.querySelector('#statsTable tbody');
                tbody.innerHTML = '';
                const rows = [
                    ['Mean Daily Gen (kWh)', stats.daily_energy_gen_total_mean],
                    ['Mean Daily Con (kWh)', stats.daily_energy_con_total_mean],
                    ['Max Daily Gen (kWh)', stats.daily_energy_gen_total_max],
                    ['Max Daily Con (kWh)', stats.daily_energy_con_total_max],
                    ['Min Daily Gen (kWh)', stats.daily_energy_gen_total_min],
                    ['Min Daily Con (kWh)', stats.daily_energy_con_total_min],
                    ['Est. Consumer Downtime (hrs)', stats.estimated_consumer_downtime_hours],
                ];
                rows.forEach(([label, val]) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = '<td>' + label + '</td><td>' + (val != null ? Number(val).toFixed(2) : '—') + '</td>';
                    tbody.appendChild(tr);
                });
            }

            // Daily chart
            const daily = await (await fetch('/api/sites/' + sid + '/daily?year=' + year + '&month=' + month)).json();
            if (dailyChart) dailyChart.destroy();
            dailyChart = new Chart(document.getElementById('dailyChart'), {
                type: 'bar',
                data: {
                    labels: daily.map(d => d.day),
                    datasets: [
                        { label: 'Generation', data: daily.map(d => d.gen_kwh), backgroundColor: lightGreen, borderColor: green, borderWidth: 1 },
                        { label: 'Consumption', data: daily.map(d => d.con_kwh), backgroundColor: lightRed, borderColor: red, borderWidth: 1 }
                    ]
                },
                options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'kWh' } } } }
            });

            // Hourly chart
            const hourly = await (await fetch('/api/sites/' + sid + '/hourly?year=' + year + '&month=' + month)).json();
            if (hourlyChart) hourlyChart.destroy();
            hourlyChart = new Chart(document.getElementById('hourlyChart'), {
                type: 'line',
                data: {
                    labels: hourly.map(h => h.hour + ':00'),
                    datasets: [
                        { label: 'Generation', data: hourly.map(h => h.avg_gen_kw), borderColor: green, backgroundColor: lightGreen, fill: true, tension: 0.3 },
                        { label: 'Consumption', data: hourly.map(h => h.avg_con_kw), borderColor: red, backgroundColor: lightRed, fill: true, tension: 0.3 }
                    ]
                },
                options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'kW' } } } }
            });
        }

        init();
    </script>
</body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
def dashboard():
    return DASHBOARD_HTML
