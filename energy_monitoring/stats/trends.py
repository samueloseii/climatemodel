"""Trend-calculation utilities.

All trend functions accept plain floats and return a dict with:
  - absolute_change: new - reference
  - percent_change:  ((new - ref) / ref) * 100  (None when ref == 0)

These are intentionally decoupled from the ORM models so they can be
called on any numeric stat column.  To compute trends for an entire
month-stat row, pass each float field through these functions.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from sqlalchemy.orm import Session

from energy_monitoring.models.entry_type import EntryType


@dataclass(frozen=True)
class TrendResult:
    """Change between two values."""
    absolute_change: float | None
    percent_change: float | None
    reference_value: float | None
    current_value: float | None


def _trend(current: float | None, reference: float | None) -> TrendResult:
    if current is None or reference is None:
        return TrendResult(
            absolute_change=None,
            percent_change=None,
            reference_value=reference,
            current_value=current,
        )
    abs_change = current - reference
    pct_change = (abs_change / reference * 100.0) if reference != 0 else None
    return TrendResult(
        absolute_change=abs_change,
        percent_change=pct_change,
        reference_value=reference,
        current_value=current,
    )


def trend_vs_baseline(
    current_value: float | None,
    baseline_value: float | None,
) -> TrendResult:
    """Trend vs the most recently added baseline entry."""
    return _trend(current_value, baseline_value)


def trend_vs_last_month(
    current_value: float | None,
    last_month_value: float | None,
) -> TrendResult:
    """Trend vs the previous month's actual entry."""
    return _trend(current_value, last_month_value)


def trend_vs_predicted(
    current_value: float | None,
    predicted_value: float | None,
) -> TrendResult:
    """Trend vs a predicted entry for the same month."""
    return _trend(current_value, predicted_value)


def trend_vs_average(
    current_value: float | None,
    all_values: Sequence[float | None],
) -> TrendResult:
    """Trend vs the average of all available months."""
    clean = [v for v in all_values if v is not None]
    if not clean:
        return _trend(current_value, None)
    avg = sum(clean) / len(clean)
    return _trend(current_value, avg)


def compute_all_trends(
    current_value: float | None,
    baseline_value: float | None = None,
    last_month_value: float | None = None,
    predicted_value: float | None = None,
    all_values: Sequence[float | None] | None = None,
) -> dict[str, TrendResult]:
    """Compute all four trend types for a single stat value."""
    results: dict[str, TrendResult] = {}
    results["vs_baseline"] = trend_vs_baseline(current_value, baseline_value)
    results["vs_last_month"] = trend_vs_last_month(current_value, last_month_value)
    results["vs_predicted"] = trend_vs_predicted(current_value, predicted_value)
    results["vs_average"] = trend_vs_average(current_value, all_values or [])
    return results


def compute_trends_for_fields(
    current_stats: dict[str, float | None],
    baseline_stats: dict[str, float | None] | None = None,
    last_month_stats: dict[str, float | None] | None = None,
    predicted_stats: dict[str, float | None] | None = None,
    all_months_stats: list[dict[str, float | None]] | None = None,
) -> dict[str, dict[str, TrendResult]]:
    """Compute trends for every field in a stats dict.

    This is the main entry point: pass dicts of {field_name: value}
    for the current month and reference months.  Returns a nested dict
    keyed by field name, each containing the four trend types.
    """
    baseline_stats = baseline_stats or {}
    last_month_stats = last_month_stats or {}
    predicted_stats = predicted_stats or {}
    all_months_stats = all_months_stats or []

    results: dict[str, dict[str, TrendResult]] = {}
    for field, current_val in current_stats.items():
        all_vals = [m.get(field) for m in all_months_stats]
        results[field] = compute_all_trends(
            current_value=current_val,
            baseline_value=baseline_stats.get(field),
            last_month_value=last_month_stats.get(field),
            predicted_value=predicted_stats.get(field),
            all_values=all_vals,
        )
    return results
