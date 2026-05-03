"""Stats calculation and trend analysis utilities."""

from energy_monitoring.stats.calculations import (
    calc_stats,
    calc_daily_energy,
    calc_daily_energy_data_days,
    calc_power_stats,
)
from energy_monitoring.stats.trends import (
    trend_vs_baseline,
    trend_vs_last_month,
    trend_vs_predicted,
    trend_vs_average,
    compute_all_trends,
)

__all__ = [
    "calc_stats",
    "calc_daily_energy",
    "calc_daily_energy_data_days",
    "calc_power_stats",
    "trend_vs_baseline",
    "trend_vs_last_month",
    "trend_vs_predicted",
    "trend_vs_average",
    "compute_all_trends",
]
