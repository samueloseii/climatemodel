"""
Report generation using Jinja2 + WeasyPrint.

Replaces the Pug/Node.js/py_to_pdf.py pipeline with a single Python module.
Generates PDF reports from database stats with charts and tables.

Usage:
    python -m energy_monitoring.report_generator --site Buayan --year 2026 --month 1
"""

import argparse
import io
import calendar
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np
from jinja2 import Template
from weasyprint import HTML

from energy_monitoring.db import get_engine, get_session
from energy_monitoring.models import Mu3pepMonthStats, MuspepMonthStats, Site
from energy_monitoring.queries import (
    query_daily_energy_from_hypertable,
    query_hourly_profile,
    query_site_monthly_summary,
)

CO2_FACTOR = 0.7611  # kgCO2 per kWh (diesel genset offset)

REPORT_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@page {
    size: A4 landscape;
    margin: 1.5cm;
}
body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10pt;
    color: #333;
    margin: 0;
    padding: 0;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #2d6a4f;
    padding-bottom: 10px;
    margin-bottom: 15px;
}
.header h1 {
    color: #2d6a4f;
    font-size: 18pt;
    margin: 0;
}
.header-meta {
    text-align: right;
    font-size: 9pt;
    color: #666;
}
.kpi-row {
    display: flex;
    justify-content: space-around;
    margin-bottom: 15px;
}
.kpi-box {
    text-align: center;
    padding: 8px 15px;
    background: #f0f7f4;
    border-radius: 6px;
    border: 1px solid #d4e8dc;
    min-width: 140px;
}
.kpi-box .value {
    font-size: 18pt;
    font-weight: bold;
    color: #2d6a4f;
}
.kpi-box .label {
    font-size: 8pt;
    color: #666;
    margin-top: 2px;
}
.section-title {
    font-size: 12pt;
    color: #2d6a4f;
    border-bottom: 1px solid #d4e8dc;
    padding-bottom: 3px;
    margin-top: 15px;
    margin-bottom: 8px;
}
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    margin-bottom: 10px;
}
th {
    background: #2d6a4f;
    color: white;
    padding: 5px 8px;
    text-align: left;
    font-weight: normal;
}
td {
    padding: 4px 8px;
    border-bottom: 1px solid #e8e8e8;
}
tr:nth-child(even) {
    background: #f8f8f8;
}
.charts-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
}
.chart-container {
    flex: 1;
    text-align: center;
}
.chart-container img {
    max-width: 100%;
    height: auto;
}
.chart-title {
    font-size: 9pt;
    font-weight: bold;
    color: #2d6a4f;
    margin-bottom: 3px;
}
.footer {
    margin-top: 10px;
    padding-top: 5px;
    border-top: 1px solid #ddd;
    font-size: 7pt;
    color: #999;
}
.footnote {
    font-size: 7pt;
    color: #888;
    margin-top: 5px;
}
</style>
</head>
<body>

<div class="header">
    <h1>{{ site_name }} — Monthly Energy Report</h1>
    <div class="header-meta">
        <strong>{{ plant_type }}</strong><br>
        {{ report_date }}<br>
        {{ location }}
    </div>
</div>

<div class="kpi-row">
    <div class="kpi-box">
        <div class="value">{{ "%.1f"|format(total_gen_kwh) }} kWh</div>
        <div class="label">Total Energy Generated</div>
    </div>
    <div class="kpi-box">
        <div class="value">{{ "%.1f"|format(total_con_kwh) }} kWh</div>
        <div class="label">Total Energy Consumed [1]</div>
    </div>
    <div class="kpi-box">
        <div class="value">{{ "%.1f"|format(co2_avoided) }} kgCO₂</div>
        <div class="label">Emissions Avoided [2]</div>
    </div>
    <div class="kpi-box">
        <div class="value">{{ "%.1f"|format(data_availability) }}%</div>
        <div class="label">Data Availability</div>
    </div>
</div>

<div class="charts-row">
    <div class="chart-container">
        <div class="chart-title">Daily Energy Use</div>
        <img src="data:image/png;base64,{{ daily_energy_chart }}">
    </div>
    <div class="chart-container">
        <div class="chart-title">24-Hour Generation & Consumption Profile</div>
        <img src="data:image/png;base64,{{ hourly_profile_chart }}">
    </div>
</div>

<h2 class="section-title">Month Stats Summary</h2>
<table>
    <tr>
        <th>Metric</th>
        <th>Generation</th>
        <th>Consumption</th>
    </tr>
    <tr>
        <td>Total Records</td>
        <td colspan="2">{{ total_records }} / {{ expected_records }} expected</td>
    </tr>
    <tr>
        <td>Total Energy (kWh)</td>
        <td>{{ "%.1f"|format(total_gen_kwh) }}</td>
        <td>{{ "%.1f"|format(total_con_kwh) }}</td>
    </tr>
    <tr>
        <td>Mean Daily Energy (kWh/day)</td>
        <td>{{ "%.2f"|format(mean_daily_gen) }}</td>
        <td>{{ "%.2f"|format(mean_daily_con) }}</td>
    </tr>
    <tr>
        <td>Max Daily Energy (kWh/day)</td>
        <td>{{ "%.2f"|format(max_daily_gen) }}</td>
        <td>{{ "%.2f"|format(max_daily_con) }}</td>
    </tr>
    <tr>
        <td>Min Daily Energy (kWh/day)</td>
        <td>{{ "%.2f"|format(min_daily_gen) }}</td>
        <td>{{ "%.2f"|format(min_daily_con) }}</td>
    </tr>
    <tr>
        <td>Mean Power (kW)</td>
        <td>{{ "%.3f"|format(mean_gen_kw) }}</td>
        <td>{{ "%.3f"|format(mean_con_kw) }}</td>
    </tr>
    <tr>
        <td>Max Power (kW)</td>
        <td>{{ "%.3f"|format(max_gen_kw) }}</td>
        <td>{{ "%.3f"|format(max_con_kw) }}</td>
    </tr>
    {% if frequency_mean %}
    <tr>
        <td>Frequency (Hz)</td>
        <td colspan="2">Mean: {{ "%.2f"|format(frequency_mean) }} | Min: {{ "%.2f"|format(frequency_min) }} | Max: {{ "%.2f"|format(frequency_max) }}</td>
    </tr>
    {% endif %}
    <tr>
        <td>Est. Consumer Downtime</td>
        <td colspan="2">{{ "%.1f"|format(consumer_downtime_hrs) }} hours</td>
    </tr>
    {% if plant_factor %}
    <tr>
        <td>Plant Factor</td>
        <td>{{ "%.1f"|format(plant_factor) }}%</td>
        <td>—</td>
    </tr>
    {% endif %}
</table>

{% if phase_data %}
<h2 class="section-title">Per-Phase Breakdown</h2>
<table>
    <tr>
        <th>Phase</th>
        <th>Avg Daily Gen (kWh)</th>
        <th>Avg Daily Con (kWh)</th>
        <th>Avg Gen Power (kW)</th>
        <th>Avg Con Power (kW)</th>
    </tr>
    {% for phase in phase_data %}
    <tr>
        <td>{{ phase.name }}</td>
        <td>{{ "%.1f"|format(phase.daily_gen) }}</td>
        <td>{{ "%.1f"|format(phase.daily_con) }}</td>
        <td>{{ "%.2f"|format(phase.power_gen) }}</td>
        <td>{{ "%.2f"|format(phase.power_con) }}</td>
    </tr>
    {% endfor %}
</table>
{% endif %}

<div class="footnote">
    [1] Downtime cannot be confirmed so consumed energy is likely to be higher than this value.<br>
    [2] Emissions avoided based on offsetting against diesel genset usage with a factor of {{ co2_factor }} kgCO₂/kWh.
</div>

<div class="footer">
    Generated by Energy Monitoring System — PostgreSQL + TimescaleDB | {{ generation_timestamp }}
</div>

</body>
</html>
"""


def generate_daily_energy_chart(daily_data: list[dict]) -> str:
    """Generate daily energy bar chart, return as base64 PNG."""
    import base64

    if not daily_data:
        return ""

    days = [str(d["day"])[:10] for d in daily_data]
    gen_kwh = [float(d["gen_energy_kwh"] or 0) for d in daily_data]
    con_kwh = [float(d["con_energy_kwh"] or 0) for d in daily_data]

    fig, ax = plt.subplots(figsize=(5.5, 2.5))
    x = np.arange(len(days))
    width = 0.35

    bars_gen = ax.bar(x - width / 2, gen_kwh, width, label="Generation",
                      color="#52b788", alpha=0.8)
    bars_con = ax.bar(x + width / 2, con_kwh, width, label="Consumption",
                      color="#e07a5f", alpha=0.8)

    ax.set_ylabel("Energy (kWh)", fontsize=8)
    ax.set_xticks(x[::max(1, len(x) // 8)])
    ax.set_xticklabels([days[i] for i in range(0, len(days), max(1, len(days) // 8))],
                       rotation=45, ha="right", fontsize=7)
    ax.legend(fontsize=7, loc="upper right")
    ax.tick_params(axis="y", labelsize=7)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def generate_hourly_profile_chart(hourly_data: list[dict]) -> str:
    """Generate 24-hour overlay chart, return as base64 PNG."""
    import base64

    if not hourly_data:
        return ""

    hours = [int(h["hour_of_day"]) for h in hourly_data]
    gen_kw = [float(h["avg_gen_kw"] or 0) for h in hourly_data]
    con_kw = [float(h["avg_con_kw"] or 0) for h in hourly_data]

    fig, ax = plt.subplots(figsize=(5.5, 2.5))
    ax.fill_between(hours, gen_kw, alpha=0.3, color="#52b788")
    ax.plot(hours, gen_kw, color="#2d6a4f", linewidth=1.5, label="Generation")
    ax.fill_between(hours, con_kw, alpha=0.3, color="#e07a5f")
    ax.plot(hours, con_kw, color="#c1121f", linewidth=1.5, label="Consumption")

    ax.set_xlabel("Hour of Day", fontsize=8)
    ax.set_ylabel("Power (kW)", fontsize=8)
    ax.set_xlim(0, 23)
    ax.set_xticks(range(0, 24, 3))
    ax.legend(fontsize=7, loc="upper right")
    ax.tick_params(labelsize=7)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def generate_report(site_name: str, year: int, month: int,
                    output_path: str | None = None) -> str:
    """Generate a PDF report for a site and month. Returns the output path."""
    from datetime import datetime

    engine = get_engine()
    session = get_session(engine)

    # Get site
    site = session.query(Site).filter_by(name=site_name).first()
    if not site:
        raise ValueError(f"Site '{site_name}' not found")

    # Get month stats
    stats = session.query(Mu3pepMonthStats).filter_by(
        site_id=site.id, year=year, month=month
    ).first()

    if not stats:
        # Try muspep
        stats = session.query(MuspepMonthStats).filter_by(
            site_id=site.id, year=year, month=month
        ).first()

    if not stats:
        raise ValueError(f"No stats found for {site_name} {year}-{month:02d}")

    # Get query data for charts
    daily_data = query_daily_energy_from_hypertable(engine, site.id, year, month)
    hourly_data = query_hourly_profile(engine, site.id, year, month)
    summary = query_site_monthly_summary(engine, site.id, year, month)

    # Calculate derived values
    days_in_month = calendar.monthrange(year, month)[1]
    expected_records = days_in_month * 24 * 60  # 1-minute intervals
    data_availability = (stats.total_records / expected_records * 100) if stats.total_records else 0

    total_gen = getattr(stats, "total_energy_gen_total", None) or getattr(stats, "total_energy_gen", 0) or 0
    total_con = getattr(stats, "total_energy_con_total", None) or getattr(stats, "total_energy_con", 0) or 0
    co2_avoided = total_gen * CO2_FACTOR

    # Plant type string
    type_map = {
        "MU3PEP": "Hydro (3-Phase)",
        "MUSPEP": "Hydro (Single-Phase)",
        "MU3PSEP": "Solar (3-Phase)",
        "MUSPSEP": "Solar (Single-Phase)",
    }
    plant_type = type_map.get(site.measurement_type.value.upper(), site.measurement_type.value)

    # Phase data (for 3-phase sites)
    phase_data = []
    if hasattr(stats, "daily_energy_gen_ph1_mean") and stats.daily_energy_gen_ph1_mean is not None:
        for i, label in enumerate(["Phase A", "Phase B", "Phase C"], 1):
            phase_data.append({
                "name": label,
                "daily_gen": getattr(stats, f"daily_energy_gen_ph{i}_mean", 0) or 0,
                "daily_con": getattr(stats, f"daily_energy_con_ph{i}_mean", 0) or 0,
                "power_gen": getattr(stats, f"power_gen_ph{i}_mean", 0) or 0,
                "power_con": getattr(stats, f"power_con_ph{i}_mean", 0) or 0,
            })

    # Generate charts
    daily_chart = generate_daily_energy_chart(daily_data)
    hourly_chart = generate_hourly_profile_chart(hourly_data)

    # Render template
    template = Template(REPORT_TEMPLATE)
    html_content = template.render(
        site_name=site.name,
        plant_type=plant_type,
        report_date=f"{year} {calendar.month_name[month]}",
        location=site.location or "—",
        total_gen_kwh=total_gen,
        total_con_kwh=total_con,
        co2_avoided=co2_avoided,
        co2_factor=CO2_FACTOR,
        data_availability=data_availability,
        total_records=stats.total_records or 0,
        expected_records=expected_records,
        mean_daily_gen=getattr(stats, "daily_energy_gen_total_mean", None) or getattr(stats, "daily_energy_gen_mean", 0) or 0,
        max_daily_gen=getattr(stats, "daily_energy_gen_total_max", None) or getattr(stats, "daily_energy_gen_max", 0) or 0,
        min_daily_gen=getattr(stats, "daily_energy_gen_total_min", None) or getattr(stats, "daily_energy_gen_min", 0) or 0,
        mean_daily_con=getattr(stats, "daily_energy_con_total_mean", None) or getattr(stats, "daily_energy_con_mean", 0) or 0,
        max_daily_con=getattr(stats, "daily_energy_con_total_max", None) or getattr(stats, "daily_energy_con_max", 0) or 0,
        min_daily_con=getattr(stats, "daily_energy_con_total_min", None) or getattr(stats, "daily_energy_con_min", 0) or 0,
        mean_gen_kw=float(summary["avg_gen_kw"]) if summary and summary["avg_gen_kw"] else 0,
        max_gen_kw=float(summary["max_gen_kw"]) if summary and summary["max_gen_kw"] else 0,
        mean_con_kw=float(summary["avg_con_kw"]) if summary and summary["avg_con_kw"] else 0,
        max_con_kw=float(summary["max_con_kw"]) if summary and summary["max_con_kw"] else 0,
        frequency_mean=getattr(stats, "frequency_mean", None),
        frequency_min=getattr(stats, "frequency_min", None),
        frequency_max=getattr(stats, "frequency_max", None),
        consumer_downtime_hrs=stats.estimated_consumer_downtime_hours or 0,
        plant_factor=getattr(stats, "total_plant_factor", None),
        phase_data=phase_data,
        daily_energy_chart=daily_chart,
        hourly_profile_chart=hourly_chart,
        generation_timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"),
    )

    # Generate PDF
    if output_path is None:
        output_path = f"{site.name}_{year}-{month:02d}_Report.pdf"

    HTML(string=html_content).write_pdf(output_path)
    print(f"Report generated: {output_path}")
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Generate energy monitoring PDF report")
    parser.add_argument("--site", required=True, help="Site name")
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--month", type=int, required=True)
    parser.add_argument("--output", help="Output PDF path")
    args = parser.parse_args()

    generate_report(args.site, args.year, args.month, args.output)


if __name__ == "__main__":
    main()
