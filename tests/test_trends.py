"""Tests for trend calculation utilities."""

import pytest

from energy_monitoring.stats.trends import (
    TrendResult,
    trend_vs_baseline,
    trend_vs_last_month,
    trend_vs_predicted,
    trend_vs_average,
    compute_all_trends,
    compute_trends_for_fields,
)


class TestTrendFunctions:
    def test_vs_baseline_increase(self):
        result = trend_vs_baseline(110.0, 100.0)
        assert result.absolute_change == 10.0
        assert result.percent_change == 10.0

    def test_vs_baseline_decrease(self):
        result = trend_vs_baseline(90.0, 100.0)
        assert result.absolute_change == -10.0
        assert result.percent_change == -10.0

    def test_vs_baseline_none(self):
        result = trend_vs_baseline(100.0, None)
        assert result.absolute_change is None
        assert result.percent_change is None

    def test_vs_baseline_zero_reference(self):
        result = trend_vs_baseline(50.0, 0.0)
        assert result.absolute_change == 50.0
        assert result.percent_change is None

    def test_vs_last_month(self):
        result = trend_vs_last_month(120.0, 100.0)
        assert result.absolute_change == 20.0
        assert result.percent_change == 20.0

    def test_vs_predicted(self):
        result = trend_vs_predicted(95.0, 100.0)
        assert result.absolute_change == -5.0
        assert result.percent_change == -5.0

    def test_vs_average(self):
        result = trend_vs_average(120.0, [100.0, 110.0, 130.0])
        # average = 113.33, change = 6.67
        assert result.absolute_change is not None
        assert abs(result.absolute_change - 6.667) < 0.01

    def test_vs_average_empty(self):
        result = trend_vs_average(100.0, [])
        assert result.absolute_change is None

    def test_vs_average_with_nones(self):
        result = trend_vs_average(120.0, [100.0, None, 140.0])
        # average of [100, 140] = 120, so change = 0
        assert result.absolute_change == 0.0
        assert result.percent_change == 0.0


class TestComputeAllTrends:
    def test_all_trends(self):
        results = compute_all_trends(
            current_value=110.0,
            baseline_value=100.0,
            last_month_value=105.0,
            predicted_value=108.0,
            all_values=[100.0, 105.0, 110.0],
        )
        assert "vs_baseline" in results
        assert "vs_last_month" in results
        assert "vs_predicted" in results
        assert "vs_average" in results
        assert results["vs_baseline"].percent_change == 10.0

    def test_all_trends_no_references(self):
        results = compute_all_trends(current_value=100.0)
        assert results["vs_baseline"].absolute_change is None
        assert results["vs_last_month"].absolute_change is None


class TestComputeTrendsForFields:
    def test_multi_field_trends(self):
        current = {"energy": 110.0, "power": 5.5}
        baseline = {"energy": 100.0, "power": 5.0}
        last_month = {"energy": 105.0, "power": 5.2}
        all_months = [
            {"energy": 100.0, "power": 5.0},
            {"energy": 105.0, "power": 5.2},
        ]

        result = compute_trends_for_fields(
            current_stats=current,
            baseline_stats=baseline,
            last_month_stats=last_month,
            all_months_stats=all_months,
        )

        assert "energy" in result
        assert "power" in result
        assert result["energy"]["vs_baseline"].percent_change == 10.0
        assert result["power"]["vs_baseline"].percent_change == 10.0

    def test_missing_fields_in_reference(self):
        current = {"energy": 110.0, "new_field": 42.0}
        baseline = {"energy": 100.0}

        result = compute_trends_for_fields(
            current_stats=current,
            baseline_stats=baseline,
        )
        assert result["new_field"]["vs_baseline"].absolute_change is None
