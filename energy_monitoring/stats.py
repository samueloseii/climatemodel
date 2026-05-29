"""
Stats calculation engine for the Energy Monitoring System.

Reusable functions for computing mean/min/max/std, daily energy,
power stats, downtime estimation, plant factor, and trend analysis.
"""

import calendar
from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class StatResult:
    """Holds mean/min/max/std for a single metric."""

    mean: float | None
    min: float | None
    max: float | None
    std: float | None


@dataclass(frozen=True)
class TrendResult:
    """Holds trend comparison results."""

    absolute_change: float | None
    percent_change: float | None
    reference_value: float | None
    current_value: float | None


# ============================================================
# CORE STATS
# ============================================================
def calc_stats(values) -> StatResult:
    """Compute mean, min, max, std for any array of floats. Handles NaN and empty input."""
    arr = np.asarray(values, dtype=float)
    arr = arr[~np.isnan(arr)]
    if len(arr) == 0:
        return StatResult(mean=None, min=None, max=None, std=None)
    return StatResult(
        mean=float(np.mean(arr)),
        min=float(np.min(arr)),
        max=float(np.max(arr)),
        std=float(np.std(arr, ddof=1)) if len(arr) > 1 else 0.0,
    )


def calc_daily_energy(
    power_series: pd.Series, sample_interval_minutes: float = 1.0
) -> pd.Series:
    """Convert power time-series (W) to daily energy (kWh)."""
    hours_per_sample = sample_interval_minutes / 60.0
    return power_series.groupby(power_series.index.date).sum() * hours_per_sample / 1000.0


def calc_total_energy(
    power_series: pd.Series, sample_interval_minutes: float = 1.0
) -> float:
    """Total energy over the full period in kWh."""
    hours_per_sample = sample_interval_minutes / 60.0
    return float(power_series.dropna().sum() * hours_per_sample / 1000.0)


def calc_power_stats(power_series: pd.Series) -> StatResult:
    """Mean/min/max/std of instantaneous power (W -> kW)."""
    return calc_stats(power_series / 1000.0)


def estimate_downtime_hours(
    power_series: pd.Series,
    threshold_w: float = 0.0,
    sample_interval_minutes: float = 1.0,
) -> float:
    """Estimate downtime by counting samples where power <= threshold."""
    return float(
        (power_series <= threshold_w).sum() * sample_interval_minutes / 60.0
    )


def calc_plant_factor(
    generation_kwh: float, capacity_kw: float, hours: float
) -> float | None:
    """Plant factor (%) = actual generation / (capacity * hours) * 100."""
    if capacity_kw <= 0 or hours <= 0:
        return None
    return (generation_kwh / (capacity_kw * hours)) * 100.0


# ============================================================
# TREND ANALYSIS
# ============================================================
def _trend(current: float | None, reference: float | None) -> TrendResult:
    """Core trend calculation with division-by-zero protection."""
    if current is None or reference is None:
        return TrendResult(None, None, reference, current)
    abs_change = current - reference
    pct_change = (abs_change / reference * 100.0) if reference != 0 else None
    return TrendResult(abs_change, pct_change, reference, current)


def trend_vs_baseline(current_value, baseline_value) -> TrendResult:
    return _trend(current_value, baseline_value)


def trend_vs_last_month(current_value, last_month_value) -> TrendResult:
    return _trend(current_value, last_month_value)


def trend_vs_predicted(current_value, predicted_value) -> TrendResult:
    return _trend(current_value, predicted_value)


def trend_vs_average(current_value, all_values) -> TrendResult:
    clean = [v for v in all_values if v is not None]
    if not clean:
        return _trend(current_value, None)
    return _trend(current_value, sum(clean) / len(clean))


def compute_all_trends(
    current_value,
    baseline_value=None,
    last_month_value=None,
    predicted_value=None,
    all_values=None,
) -> dict[str, TrendResult]:
    return {
        "vs_baseline": trend_vs_baseline(current_value, baseline_value),
        "vs_last_month": trend_vs_last_month(current_value, last_month_value),
        "vs_predicted": trend_vs_predicted(current_value, predicted_value),
        "vs_average": trend_vs_average(current_value, all_values or []),
    }


# ============================================================
# 3-PHASE HYDRO PROCESSING
# ============================================================
def process_3phase_month(df: pd.DataFrame, year: int, month: int) -> dict:
    """
    Process a month of 3-phase hydro data (mu3pep) into stats dict.

    Expects columns: ConPa, ConPb, ConPc, GenPa, GenPb, GenPc
    Returns dict ready for Mu3pepMonthStats(**stats).
    """
    sample_interval = 1.0
    con_cols = ["ConPa", "ConPb", "ConPc"]
    gen_cols = ["GenPa", "GenPb", "GenPc"]
    days_in_month = calendar.monthrange(year, month)[1]

    # Per-phase daily energy
    con_daily = {}
    gen_daily = {}
    for ph, (cc, gc) in enumerate(zip(con_cols, gen_cols), 1):
        con_daily[ph] = calc_daily_energy(df[cc], sample_interval)
        gen_daily[ph] = calc_daily_energy(df[gc], sample_interval)

    # Totals
    con_total_power = df[con_cols].sum(axis=1)
    gen_total_power = df[gen_cols].sum(axis=1)
    con_daily_total = calc_daily_energy(con_total_power, sample_interval)
    gen_daily_total = calc_daily_energy(gen_total_power, sample_interval)

    stats = {
        "year": year,
        "month": month,
        "total_records": len(df),
        "expected_records": days_in_month * 1440,
    }

    # Per-phase consumption stats
    for ph in [1, 2, 3]:
        s = calc_stats(con_daily[ph])
        stats[f"daily_energy_con_ph{ph}_mean"] = s.mean
        stats[f"daily_energy_con_ph{ph}_min"] = s.min
        stats[f"daily_energy_con_ph{ph}_max"] = s.max
        stats[f"daily_energy_con_ph{ph}_std"] = s.std

    # Total consumption stats
    s = calc_stats(con_daily_total)
    stats["daily_energy_con_total_mean"] = s.mean
    stats["daily_energy_con_total_min"] = s.min
    stats["daily_energy_con_total_max"] = s.max
    stats["daily_energy_con_total_std"] = s.std

    # Per-phase generation stats
    for ph in [1, 2, 3]:
        s = calc_stats(gen_daily[ph])
        stats[f"daily_energy_gen_ph{ph}_mean"] = s.mean
        stats[f"daily_energy_gen_ph{ph}_min"] = s.min
        stats[f"daily_energy_gen_ph{ph}_max"] = s.max
        stats[f"daily_energy_gen_ph{ph}_std"] = s.std

    # Total generation stats
    s = calc_stats(gen_daily_total)
    stats["daily_energy_gen_total_mean"] = s.mean
    stats["daily_energy_gen_total_min"] = s.min
    stats["daily_energy_gen_total_max"] = s.max
    stats["daily_energy_gen_total_std"] = s.std

    # Power stats (mean per phase)
    for ph, cc in enumerate(con_cols, 1):
        ps = calc_power_stats(df[cc])
        stats[f"power_con_ph{ph}_mean"] = ps.mean
    stats["power_con_total_mean"] = calc_power_stats(con_total_power).mean

    for ph, gc in enumerate(gen_cols, 1):
        ps = calc_power_stats(df[gc])
        stats[f"power_gen_ph{ph}_mean"] = ps.mean
    stats["power_gen_total_mean"] = calc_power_stats(gen_total_power).mean

    # Total energy
    for ph, cc in enumerate(con_cols, 1):
        stats[f"total_energy_con_ph{ph}"] = calc_total_energy(df[cc], sample_interval)
    stats["total_energy_con_total"] = calc_total_energy(con_total_power, sample_interval)

    for ph, gc in enumerate(gen_cols, 1):
        stats[f"total_energy_gen_ph{ph}"] = calc_total_energy(df[gc], sample_interval)
    stats["total_energy_gen_total"] = calc_total_energy(gen_total_power, sample_interval)

    # Frequency (column may be "Freq" or "frequency" depending on data version)
    freq_col = None
    if "Freq" in df.columns:
        freq_col = "Freq"
    elif "frequency" in df.columns:
        freq_col = "frequency"
    if freq_col is not None:
        fs = calc_stats(df[freq_col])
        stats["frequency_mean"] = fs.mean
        stats["frequency_min"] = fs.min
        stats["frequency_max"] = fs.max
        stats["frequency_std"] = fs.std

    # Downtime
    stats["estimated_system_downtime_hours"] = estimate_downtime_hours(
        gen_total_power, threshold_w=0.0, sample_interval_minutes=sample_interval
    )
    stats["estimated_consumer_downtime_hours"] = estimate_downtime_hours(
        con_total_power, threshold_w=0.0, sample_interval_minutes=sample_interval
    )

    return stats
