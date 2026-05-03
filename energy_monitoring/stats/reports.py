"""Monthly report generation with trend analysis.

Pulls month-stat entries from the database and computes trends
against baseline, last month, predicted, and average.
"""

from __future__ import annotations

from typing import Any, Type

from sqlalchemy import and_
from sqlalchemy.orm import Session

from energy_monitoring.models.entry_type import EntryType
from energy_monitoring.stats.trends import compute_trends_for_fields, TrendResult


# Fields to exclude from trend calculations
_SKIP_FIELDS = {"id", "site_id", "year", "month", "entry_type", "notes"}


def _entry_to_dict(entry: Any) -> dict[str, float | None]:
    """Convert an ORM month-stats entry to a dict of numeric fields."""
    result: dict[str, float | None] = {}
    for col in entry.__table__.columns:
        if col.name in _SKIP_FIELDS:
            continue
        val = getattr(entry, col.name)
        if isinstance(val, (int, float)):
            result[col.name] = float(val)
        else:
            result[col.name] = None
    return result


def get_month_entry(
    session: Session,
    model_class: type,
    site_id: int,
    year: int,
    month: int,
    entry_type: EntryType = EntryType.ACTUAL,
) -> Any | None:
    """Fetch a single month-stat entry."""
    return (
        session.query(model_class)
        .filter(
            and_(
                model_class.site_id == site_id,
                model_class.year == year,
                model_class.month == month,
                model_class.entry_type == entry_type,
            )
        )
        .first()
    )


def get_latest_baseline(
    session: Session,
    model_class: type,
    site_id: int,
) -> Any | None:
    """Fetch the most recently added baseline entry for a site."""
    return (
        session.query(model_class)
        .filter(
            and_(
                model_class.site_id == site_id,
                model_class.entry_type == EntryType.BASELINE,
            )
        )
        .order_by(model_class.year.desc(), model_class.month.desc())
        .first()
    )


def get_all_actuals(
    session: Session,
    model_class: type,
    site_id: int,
) -> list[Any]:
    """Fetch all actual entries for a site, ordered by date."""
    return (
        session.query(model_class)
        .filter(
            and_(
                model_class.site_id == site_id,
                model_class.entry_type == EntryType.ACTUAL,
            )
        )
        .order_by(model_class.year, model_class.month)
        .all()
    )


def _prev_month(year: int, month: int) -> tuple[int, int]:
    if month == 1:
        return year - 1, 12
    return year, month - 1


def generate_month_report(
    session: Session,
    model_class: type,
    site_id: int,
    year: int,
    month: int,
) -> dict[str, Any]:
    """Generate a monthly report with all trend comparisons.

    Returns a dict containing:
    - 'current': the current month's stats dict
    - 'trends': nested dict of {field: {trend_type: TrendResult}}
    - 'metadata': year, month, entry counts, etc.
    """
    current_entry = get_month_entry(session, model_class, site_id, year, month)
    if current_entry is None:
        return {"error": f"No data found for site {site_id}, {year}-{month:02d}"}

    current_stats = _entry_to_dict(current_entry)

    # Baseline
    baseline_entry = get_latest_baseline(session, model_class, site_id)
    baseline_stats = _entry_to_dict(baseline_entry) if baseline_entry else None

    # Last month
    prev_y, prev_m = _prev_month(year, month)
    last_month_entry = get_month_entry(session, model_class, site_id, prev_y, prev_m)
    last_month_stats = _entry_to_dict(last_month_entry) if last_month_entry else None

    # Predicted
    predicted_entry = get_month_entry(
        session, model_class, site_id, year, month, EntryType.PREDICTED
    )
    predicted_stats = _entry_to_dict(predicted_entry) if predicted_entry else None

    # All actuals for average
    all_actuals = get_all_actuals(session, model_class, site_id)
    all_months_stats = [_entry_to_dict(e) for e in all_actuals]

    # Compute trends
    trends = compute_trends_for_fields(
        current_stats=current_stats,
        baseline_stats=baseline_stats,
        last_month_stats=last_month_stats,
        predicted_stats=predicted_stats,
        all_months_stats=all_months_stats,
    )

    return {
        "metadata": {
            "site_id": site_id,
            "year": year,
            "month": month,
            "total_records": current_entry.total_records,
            "expected_records": current_entry.expected_records,
        },
        "current": current_stats,
        "trends": trends,
    }


def format_trend_summary(trends: dict[str, dict[str, TrendResult]]) -> str:
    """Format trends into a readable text summary."""
    lines: list[str] = []
    for field, trend_types in trends.items():
        field_label = field.replace("_", " ").title()
        parts: list[str] = []
        for trend_name, result in trend_types.items():
            if result.percent_change is not None:
                direction = "+" if result.percent_change >= 0 else ""
                parts.append(f"{trend_name}: {direction}{result.percent_change:.1f}%")
        if parts:
            lines.append(f"  {field_label}: {' | '.join(parts)}")
    return "\n".join(lines)
