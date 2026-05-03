"""Generic stats-calculation utilities.

Design principle: functions accept arrays of floats (or a pandas Series)
and return dicts of {mean, min, max, std}.  This keeps them reusable
regardless of which stat or measurement type we are computing.
When we add a new parameter later, we just pass its values through
the same utility functions — no code changes needed.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class StatResult:
    """Holds mean / min / max / std for a single metric."""
    mean: float | None
    min: float | None
    max: float | None
    std: float | None


def calc_stats(values: Sequence[float] | np.ndarray | pd.Series) -> StatResult:
    """Compute mean, min, max, std for an array of floats.

    Returns a StatResult with all None if the input is empty or all-NaN.
    """
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


def calc_stats_dict(values: Sequence[float] | np.ndarray | pd.Series) -> dict[str, float | None]:
    """Same as calc_stats but returns a plain dict (easier for DB assignment)."""
    r = calc_stats(values)
    return {"mean": r.mean, "min": r.min, "max": r.max, "std": r.std}


def calc_daily_energy(
    power_series: pd.Series,
    sample_interval_minutes: float = 1.0,
) -> pd.Series:
    """Convert a power time-series (W) to daily energy (kWh).

    Groups by calendar day, sums power readings, converts to kWh
    using the sample interval.
    """
    hours_per_sample = sample_interval_minutes / 60.0
    daily = power_series.groupby(power_series.index.date).sum() * hours_per_sample / 1000.0
    return daily


def calc_daily_energy_data_days(
    power_series: pd.Series,
    sample_interval_minutes: float = 1.0,
    min_records_per_day: int = 1,
) -> pd.Series:
    """Daily energy only for days that have at least *min_records_per_day* readings."""
    hours_per_sample = sample_interval_minutes / 60.0
    grouped = power_series.groupby(power_series.index.date)
    counts = grouped.count()
    sums = grouped.sum()
    valid = counts >= min_records_per_day
    daily = (sums[valid] * hours_per_sample) / 1000.0
    return daily


def calc_power_stats(power_series: pd.Series) -> StatResult:
    """Mean / min / max / std of instantaneous power readings (W -> kW)."""
    kw = power_series / 1000.0
    return calc_stats(kw)


def calc_total_energy(
    power_series: pd.Series,
    sample_interval_minutes: float = 1.0,
) -> float:
    """Total energy over the full period in kWh."""
    hours_per_sample = sample_interval_minutes / 60.0
    arr = power_series.dropna()
    return float(arr.sum() * hours_per_sample / 1000.0)


def calc_plant_factor(
    generation_kwh: float,
    capacity_kw: float,
    hours: float,
) -> float | None:
    """Plant factor (%) = actual generation / (capacity * hours) * 100."""
    if capacity_kw <= 0 or hours <= 0:
        return None
    return (generation_kwh / (capacity_kw * hours)) * 100.0


def estimate_downtime_hours(
    power_series: pd.Series,
    threshold_w: float = 0.0,
    sample_interval_minutes: float = 1.0,
) -> float:
    """Estimate downtime by counting samples where power <= threshold."""
    below = (power_series <= threshold_w).sum()
    return float(below * sample_interval_minutes / 60.0)


def count_records(series: pd.Series) -> int:
    """Count non-NaN records."""
    return int(series.dropna().shape[0])


def expected_records(
    days: int,
    samples_per_day: int = 1440,
) -> int:
    """Expected record count for a period (default: 1-min samples)."""
    return days * samples_per_day
