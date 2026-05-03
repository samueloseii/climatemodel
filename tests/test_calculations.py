"""Tests for stats calculation utilities."""

import numpy as np
import pandas as pd
import pytest

from energy_monitoring.stats.calculations import (
    calc_stats,
    calc_stats_dict,
    calc_daily_energy,
    calc_daily_energy_data_days,
    calc_power_stats,
    calc_total_energy,
    estimate_downtime_hours,
    count_records,
    expected_records,
    calc_plant_factor,
    StatResult,
)


class TestCalcStats:
    def test_basic(self):
        result = calc_stats([10.0, 20.0, 30.0])
        assert result.mean == 20.0
        assert result.min == 10.0
        assert result.max == 30.0
        assert result.std is not None

    def test_single_value(self):
        result = calc_stats([42.0])
        assert result.mean == 42.0
        assert result.min == 42.0
        assert result.max == 42.0
        assert result.std == 0.0

    def test_empty(self):
        result = calc_stats([])
        assert result.mean is None
        assert result.min is None

    def test_with_nan(self):
        result = calc_stats([1.0, float("nan"), 3.0])
        assert result.mean == 2.0
        assert result.min == 1.0
        assert result.max == 3.0

    def test_all_nan(self):
        result = calc_stats([float("nan"), float("nan")])
        assert result.mean is None

    def test_numpy_array(self):
        arr = np.array([5.0, 10.0, 15.0])
        result = calc_stats(arr)
        assert result.mean == 10.0

    def test_pandas_series(self):
        s = pd.Series([100.0, 200.0, 300.0])
        result = calc_stats(s)
        assert result.mean == 200.0

    def test_dict_output(self):
        d = calc_stats_dict([10.0, 20.0])
        assert "mean" in d
        assert "min" in d
        assert "max" in d
        assert "std" in d
        assert d["mean"] == 15.0


class TestDailyEnergy:
    @pytest.fixture
    def power_series(self):
        """1-min samples over 2 days, 1000W constant."""
        idx = pd.date_range("2025-11-01", periods=2880, freq="1min")
        return pd.Series(1000.0, index=idx)

    def test_daily_energy_constant(self, power_series):
        daily = calc_daily_energy(power_series, sample_interval_minutes=1.0)
        # 1000W * 1440min * (1h/60min) / 1000 = 24 kWh per day
        assert len(daily) == 2
        assert abs(daily.iloc[0] - 24.0) < 0.01

    def test_daily_energy_data_days(self, power_series):
        daily = calc_daily_energy_data_days(
            power_series, sample_interval_minutes=1.0, min_records_per_day=100
        )
        assert len(daily) == 2

    def test_daily_energy_data_days_filters(self):
        # Only 10 records on day 1
        idx1 = pd.date_range("2025-11-01", periods=10, freq="1min")
        idx2 = pd.date_range("2025-11-02", periods=1440, freq="1min")
        idx = idx1.append(idx2)
        series = pd.Series(1000.0, index=idx)
        daily = calc_daily_energy_data_days(series, min_records_per_day=100)
        assert len(daily) == 1  # Only day 2 qualifies


class TestPowerStats:
    def test_conversion_to_kw(self):
        series = pd.Series([1000.0, 2000.0, 3000.0])
        result = calc_power_stats(series)
        assert result.mean == 2.0  # kW
        assert result.min == 1.0
        assert result.max == 3.0


class TestTotalEnergy:
    def test_total_energy(self):
        idx = pd.date_range("2025-11-01", periods=60, freq="1min")
        series = pd.Series(6000.0, index=idx)  # 6000W
        total = calc_total_energy(series, sample_interval_minutes=1.0)
        # 6000W * 60min * (1h/60min) / 1000 = 6 kWh
        assert abs(total - 6.0) < 0.01


class TestDowntime:
    def test_estimate_downtime(self):
        idx = pd.date_range("2025-11-01", periods=120, freq="1min")
        # 60 minutes of zero power, 60 minutes of 1000W
        values = [0.0] * 60 + [1000.0] * 60
        series = pd.Series(values, index=idx)
        hours = estimate_downtime_hours(series, threshold_w=0.0)
        assert hours == 1.0  # 60 minutes = 1 hour


class TestPlantFactor:
    def test_normal(self):
        pf = calc_plant_factor(240.0, 10.0, 24.0)
        assert pf == 100.0  # 240 / (10 * 24) * 100

    def test_zero_capacity(self):
        assert calc_plant_factor(100.0, 0.0, 24.0) is None

    def test_zero_hours(self):
        assert calc_plant_factor(100.0, 10.0, 0.0) is None


class TestRecordCounts:
    def test_count_records(self):
        s = pd.Series([1.0, float("nan"), 3.0])
        assert count_records(s) == 2

    def test_expected_records(self):
        assert expected_records(30) == 30 * 1440
        assert expected_records(30, 720) == 30 * 720
