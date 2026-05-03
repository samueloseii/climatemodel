"""Integration tests for the data processor using synthetic data."""

import numpy as np
import pandas as pd
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from energy_monitoring.models.base import Base
from energy_monitoring.models.site import Site, MeasurementType
from energy_monitoring.models.entry_type import EntryType
from energy_monitoring.models.mu3pep import Mu3pepMonthStats
from energy_monitoring.data.processor import process_3phase_hydro_month
from energy_monitoring.stats.reports import generate_month_report


@pytest.fixture
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


@pytest.fixture
def sample_3phase_data():
    """Synthetic 3-phase hydro data for November 2025."""
    idx = pd.date_range("2025-11-01", "2025-11-30 23:59:00", freq="1min")
    rng = np.random.default_rng(42)
    n = len(idx)
    df = pd.DataFrame(
        {
            "ConPa": rng.normal(600, 100, n).clip(0),
            "ConPb": rng.normal(1200, 200, n).clip(0),
            "ConPc": rng.normal(800, 150, n).clip(0),
            "GenPa": rng.normal(1400, 200, n).clip(0),
            "GenPb": rng.normal(2100, 250, n).clip(0),
            "GenPc": rng.normal(1900, 300, n).clip(0),
        },
        index=idx,
    )
    return df


class TestProcess3PhaseHydroMonth:
    def test_basic_processing(self, sample_3phase_data):
        stats = process_3phase_hydro_month(sample_3phase_data, 2025, 11)
        assert stats["year"] == 2025
        assert stats["month"] == 11
        assert stats["total_records"] > 0
        assert stats["expected_records"] == 30 * 1440

    def test_consumption_stats_populated(self, sample_3phase_data):
        stats = process_3phase_hydro_month(sample_3phase_data, 2025, 11)
        assert stats["daily_energy_con_ph1_mean"] is not None
        assert stats["daily_energy_con_total_mean"] is not None
        assert stats["power_con_ph1_mean"] is not None
        assert stats["total_energy_con_total"] > 0

    def test_generation_stats_populated(self, sample_3phase_data):
        stats = process_3phase_hydro_month(sample_3phase_data, 2025, 11)
        assert stats["daily_energy_gen_ph1_mean"] is not None
        assert stats["daily_energy_gen_total_mean"] is not None
        assert stats["total_energy_gen_total"] > 0

    def test_total_generation_gt_consumption(self, sample_3phase_data):
        stats = process_3phase_hydro_month(sample_3phase_data, 2025, 11)
        assert stats["total_energy_gen_total"] > stats["total_energy_con_total"]

    def test_empty_month(self, sample_3phase_data):
        # No data in December
        stats = process_3phase_hydro_month(sample_3phase_data, 2025, 12)
        assert stats == {"year": 2025, "month": 12}


class TestReportGeneration:
    def test_report_with_two_months(self, session):
        site = Site(name="Test3P", measurement_type=MeasurementType.MU3PEP)
        session.add(site)
        session.commit()

        # November entry
        nov = Mu3pepMonthStats(
            site_id=site.id,
            year=2025,
            month=11,
            entry_type=EntryType.ACTUAL,
            daily_energy_con_total_mean=45.0,
            total_energy_con_total=1350.0,
            total_records=25000,
            expected_records=43200,
        )
        # December entry
        dec = Mu3pepMonthStats(
            site_id=site.id,
            year=2025,
            month=12,
            entry_type=EntryType.ACTUAL,
            daily_energy_con_total_mean=50.0,
            total_energy_con_total=1550.0,
            total_records=20000,
            expected_records=44640,
        )
        session.add_all([nov, dec])
        session.commit()

        report = generate_month_report(
            session, Mu3pepMonthStats, site.id, 2025, 12
        )
        assert "error" not in report
        assert report["metadata"]["year"] == 2025
        assert report["metadata"]["month"] == 12

        # Should have trend vs last month
        trends = report["trends"]
        if "total_energy_con_total" in trends:
            vs_last = trends["total_energy_con_total"]["vs_last_month"]
            assert vs_last.absolute_change is not None
            assert vs_last.absolute_change > 0  # 1550 > 1350

    def test_report_with_baseline(self, session):
        site = Site(name="Test3P", measurement_type=MeasurementType.MU3PEP)
        session.add(site)
        session.commit()

        # Baseline
        baseline = Mu3pepMonthStats(
            site_id=site.id,
            year=2025,
            month=1,
            entry_type=EntryType.BASELINE,
            total_energy_con_total=1400.0,
        )
        # Current
        actual = Mu3pepMonthStats(
            site_id=site.id,
            year=2025,
            month=11,
            entry_type=EntryType.ACTUAL,
            total_energy_con_total=1500.0,
        )
        session.add_all([baseline, actual])
        session.commit()

        report = generate_month_report(
            session, Mu3pepMonthStats, site.id, 2025, 11
        )
        trends = report["trends"]
        if "total_energy_con_total" in trends:
            vs_bl = trends["total_energy_con_total"]["vs_baseline"]
            assert vs_bl.absolute_change == 100.0

    def test_report_no_data(self, session):
        report = generate_month_report(
            session, Mu3pepMonthStats, 999, 2025, 11
        )
        assert "error" in report
