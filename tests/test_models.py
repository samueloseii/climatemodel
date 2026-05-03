"""Tests for SQLAlchemy models — schema creation and basic CRUD."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from energy_monitoring.models.base import Base
from energy_monitoring.models.site import Site, MeasurementType
from energy_monitoring.models.entry_type import EntryType
from energy_monitoring.models.muspep import MuspepMonthStats
from energy_monitoring.models.mu3pep import Mu3pepMonthStats
from energy_monitoring.models.muspsep import MuspsepMonthStats
from energy_monitoring.models.mu3psep import Mu3psepMonthStats


@pytest.fixture
def session():
    """In-memory SQLite session for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


class TestSiteModel:
    def test_create_site(self, session):
        site = Site(name="Test Hydro", measurement_type=MeasurementType.MUSPEP)
        session.add(site)
        session.commit()
        assert site.id is not None
        assert site.measurement_type == MeasurementType.MUSPEP

    def test_all_measurement_types(self, session):
        for mt in MeasurementType:
            site = Site(name=f"Site-{mt.value}", measurement_type=mt)
            session.add(site)
        session.commit()
        assert session.query(Site).count() == 4

    def test_site_repr(self, session):
        site = Site(name="Buayan", measurement_type=MeasurementType.MU3PEP)
        session.add(site)
        session.commit()
        assert "Buayan" in repr(site)
        assert "mu3pep" in repr(site)


class TestMuspepMonthStats:
    def test_create_entry(self, session):
        site = Site(name="SP Hydro", measurement_type=MeasurementType.MUSPEP)
        session.add(site)
        session.commit()

        stats = MuspepMonthStats(
            site_id=site.id,
            year=2025,
            month=11,
            entry_type=EntryType.ACTUAL,
            daily_energy_con_mean=45.5,
            daily_energy_gen_mean=120.3,
            total_energy_con=1365.0,
            total_energy_gen=3609.0,
        )
        session.add(stats)
        session.commit()

        assert stats.id is not None
        assert stats.daily_energy_con_mean == 45.5
        assert stats.total_energy_gen == 3609.0

    def test_entry_types(self, session):
        site = Site(name="SP Hydro", measurement_type=MeasurementType.MUSPEP)
        session.add(site)
        session.commit()

        for et in EntryType:
            entry = MuspepMonthStats(
                site_id=site.id, year=2025, month=11, entry_type=et
            )
            session.add(entry)
        session.commit()
        assert session.query(MuspepMonthStats).count() == 3

    def test_relationship(self, session):
        site = Site(name="SP Hydro", measurement_type=MeasurementType.MUSPEP)
        session.add(site)
        session.commit()

        stats = MuspepMonthStats(
            site_id=site.id, year=2025, month=11, entry_type=EntryType.ACTUAL
        )
        session.add(stats)
        session.commit()

        assert stats.site.name == "SP Hydro"
        assert len(site.muspep_stats) == 1


class TestMu3pepMonthStats:
    def test_create_with_phase_data(self, session):
        site = Site(name="Buayan", measurement_type=MeasurementType.MU3PEP)
        session.add(site)
        session.commit()

        stats = Mu3pepMonthStats(
            site_id=site.id,
            year=2025,
            month=11,
            entry_type=EntryType.ACTUAL,
            daily_energy_con_ph1_mean=10.1,
            daily_energy_con_ph2_mean=20.2,
            daily_energy_con_ph3_mean=15.3,
            daily_energy_con_total_mean=45.6,
            daily_energy_gen_ph1_mean=30.0,
            daily_energy_gen_total_mean=90.0,
            total_records=25000,
            expected_records=43200,
        )
        session.add(stats)
        session.commit()

        assert stats.daily_energy_con_ph1_mean == 10.1
        assert stats.daily_energy_gen_total_mean == 90.0
        assert stats.total_records == 25000

    def test_baseline_and_predicted(self, session):
        site = Site(name="Buayan", measurement_type=MeasurementType.MU3PEP)
        session.add(site)
        session.commit()

        baseline = Mu3pepMonthStats(
            site_id=site.id,
            year=2025,
            month=1,
            entry_type=EntryType.BASELINE,
            daily_energy_con_total_mean=50.0,
        )
        predicted = Mu3pepMonthStats(
            site_id=site.id,
            year=2025,
            month=12,
            entry_type=EntryType.PREDICTED,
            daily_energy_con_total_mean=55.0,
        )
        session.add_all([baseline, predicted])
        session.commit()

        assert baseline.entry_type == EntryType.BASELINE
        assert predicted.entry_type == EntryType.PREDICTED


class TestMuspsepMonthStats:
    def test_battery_fields(self, session):
        site = Site(name="Solar SP", measurement_type=MeasurementType.MUSPSEP)
        session.add(site)
        session.commit()

        stats = MuspsepMonthStats(
            site_id=site.id,
            year=2025,
            month=11,
            entry_type=EntryType.ACTUAL,
            battery_voltage_mean=48.2,
            battery_soc_mean=75.0,
            battery_current_mean=12.5,
            estimated_full_recharge_days=25.0,
            estimated_full_charge_time="14:30",
            daily_con_from_storage_mean=8.5,
        )
        session.add(stats)
        session.commit()

        assert stats.battery_voltage_mean == 48.2
        assert stats.estimated_full_charge_time == "14:30"
        assert stats.daily_con_from_storage_mean == 8.5


class TestMu3psepMonthStats:
    def test_3phase_solar_with_battery(self, session):
        site = Site(name="Solar 3P", measurement_type=MeasurementType.MU3PSEP)
        session.add(site)
        session.commit()

        stats = Mu3psepMonthStats(
            site_id=site.id,
            year=2025,
            month=11,
            entry_type=EntryType.ACTUAL,
            daily_energy_con_ph1_mean=10.0,
            battery_voltage_mean=51.3,
            battery_soc_mean=80.0,
        )
        session.add(stats)
        session.commit()

        assert stats.daily_energy_con_ph1_mean == 10.0
        assert stats.battery_voltage_mean == 51.3

    def test_cascade_delete(self, session):
        site = Site(name="Solar 3P", measurement_type=MeasurementType.MU3PSEP)
        session.add(site)
        session.commit()

        stats = Mu3psepMonthStats(
            site_id=site.id, year=2025, month=11, entry_type=EntryType.ACTUAL
        )
        session.add(stats)
        session.commit()

        session.delete(site)
        session.commit()
        assert session.query(Mu3psepMonthStats).count() == 0
