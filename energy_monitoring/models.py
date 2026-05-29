"""
Database models for the Energy Monitoring System.

PostgreSQL + TimescaleDB schema with:
- sites table (site metadata + measurement type)
- 4 measurement-type-specific month_stats tables (muspep, mu3pep, muspsep, mu3psep)
- raw_readings hypertable (TimescaleDB time-series for raw 1-minute data)
- Continuous aggregates for hourly/daily rollups
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# ============================================================
# BASE
# ============================================================
class Base(DeclarativeBase):
    pass


# ============================================================
# ENUMS
# ============================================================
class MeasurementType(enum.Enum):
    MUSPEP = "muspep"      # single-phase hydro
    MU3PEP = "mu3pep"      # three-phase hydro
    MUSPSEP = "muspsep"     # single-phase solar
    MU3PSEP = "mu3psep"     # three-phase solar


class EntryType(enum.Enum):
    ACTUAL = "actual"
    BASELINE = "baseline"
    PREDICTED = "predicted"


# ============================================================
# SITES TABLE
# ============================================================
class Site(Base):
    __tablename__ = "sites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    measurement_type: Mapped[MeasurementType] = mapped_column(
        Enum(MeasurementType), nullable=False
    )
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    capacity_kw: Mapped[float | None] = mapped_column(Float, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=text("NOW()")
    )

    muspep_stats = relationship(
        "MuspepMonthStats", back_populates="site", cascade="all, delete-orphan"
    )
    mu3pep_stats = relationship(
        "Mu3pepMonthStats", back_populates="site", cascade="all, delete-orphan"
    )
    muspsep_stats = relationship(
        "MuspsepMonthStats", back_populates="site", cascade="all, delete-orphan"
    )
    mu3psep_stats = relationship(
        "Mu3psepMonthStats", back_populates="site", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Site(id={self.id}, name={self.name!r}, type={self.measurement_type.value})>"


# ============================================================
# MIXINS — shared column definitions
# ============================================================
class MonthStatsBaseMixin:
    """Columns common to every month-stats table."""

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    site_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sites.id"), nullable=False
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    entry_type: Mapped[EntryType] = mapped_column(
        Enum(EntryType), nullable=False, default=EntryType.ACTUAL
    )
    notes: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    total_records: Mapped[int | None] = mapped_column(Integer, nullable=True)
    expected_records: Mapped[int | None] = mapped_column(Integer, nullable=True)
    estimated_system_downtime_hours: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    confirmed_system_downtime_hours: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    estimated_consumer_downtime_hours: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    confirmed_consumer_downtime_hours: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )


class SinglePhaseEnergyMixin:
    """Energy/power columns for single-phase sites."""

    daily_energy_con_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_with_data_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_with_data_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_with_data_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_with_data_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    power_con_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_con: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_std: Mapped[float | None] = mapped_column(Float, nullable=True)


class GenerationMixin:
    """Generation columns for hydro sites."""

    daily_energy_gen_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_with_data_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_with_data_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_with_data_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_with_data_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    power_gen_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_gen: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_plant_factor: Mapped[float | None] = mapped_column(Float, nullable=True)


class ThreePhaseEnergyMixin:
    """Per-phase energy/power columns for 3-phase sites."""

    # Phase 1
    daily_energy_con_ph1_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_ph1_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_ph1_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_ph1_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    # Phase 2
    daily_energy_con_ph2_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_ph2_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_ph2_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_ph2_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    # Phase 3
    daily_energy_con_ph3_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_ph3_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_ph3_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_ph3_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    # Total consumption
    daily_energy_con_total_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_total_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_total_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_con_total_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    # Power per phase
    power_con_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_total_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Total energy per phase
    total_energy_con_ph1: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_con_ph2: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_con_ph3: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_con_total: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Frequency
    frequency_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Voltage per phase
    voltage_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)


class ThreePhaseGenerationMixin:
    """Per-phase generation columns for 3-phase hydro."""

    # Phase 1
    daily_energy_gen_ph1_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_ph1_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_ph1_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_ph1_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    # Phase 2
    daily_energy_gen_ph2_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_ph2_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_ph2_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_ph2_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    # Phase 3
    daily_energy_gen_ph3_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_ph3_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_ph3_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_ph3_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    # Total generation
    daily_energy_gen_total_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_total_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_total_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_energy_gen_total_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    # Power per phase
    power_gen_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_total_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Total energy per phase
    total_energy_gen_ph1: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_gen_ph2: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_gen_ph3: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_gen_total: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_plant_factor: Mapped[float | None] = mapped_column(Float, nullable=True)


class BatteryStorageMixin:
    """Battery storage columns for solar sites."""

    battery_voltage_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_voltage_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_voltage_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_voltage_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_soc_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_soc_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_soc_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_soc_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_current_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_current_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_current_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_current_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_full_recharge_days: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    estimated_full_charge_time: Mapped[str | None] = mapped_column(
        String(5), nullable=True
    )
    daily_con_from_storage_mean: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_con_from_storage_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_con_from_storage_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    daily_con_from_storage_std: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )


# ============================================================
# ORM MODELS — one month_stats table per measurement type
# ============================================================
class MuspepMonthStats(MonthStatsBaseMixin, SinglePhaseEnergyMixin, GenerationMixin, Base):
    """Single-phase hydro month stats."""

    __tablename__ = "muspep_month_stats"
    site = relationship("Site", back_populates="muspep_stats")


class Mu3pepMonthStats(
    MonthStatsBaseMixin, ThreePhaseEnergyMixin, ThreePhaseGenerationMixin, Base
):
    """Three-phase hydro month stats."""

    __tablename__ = "mu3pep_month_stats"
    site = relationship("Site", back_populates="mu3pep_stats")


class MuspsepMonthStats(
    MonthStatsBaseMixin, SinglePhaseEnergyMixin, BatteryStorageMixin, Base
):
    """Single-phase solar month stats."""

    __tablename__ = "muspsep_month_stats"
    site = relationship("Site", back_populates="muspsep_stats")


class Mu3psepMonthStats(
    MonthStatsBaseMixin, ThreePhaseEnergyMixin, BatteryStorageMixin, Base
):
    """Three-phase solar month stats."""

    __tablename__ = "mu3psep_month_stats"
    site = relationship("Site", back_populates="mu3psep_stats")


# ============================================================
# RAW READINGS TABLE (TimescaleDB hypertable)
# ============================================================
class RawReading(Base):
    """
    Raw 1-minute power readings. Converted to a TimescaleDB hypertable
    after table creation for automatic time-based partitioning and compression.

    Columns cover all measurement types — unused columns are NULL for a given site type.
    """

    __tablename__ = "raw_readings"

    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    site_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sites.id"), primary_key=True
    )
    # Single-phase / total
    con_total: Mapped[float | None] = mapped_column(Float, nullable=True)
    gen_total: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Per-phase (3-phase sites)
    con_ph1: Mapped[float | None] = mapped_column(Float, nullable=True)
    con_ph2: Mapped[float | None] = mapped_column(Float, nullable=True)
    con_ph3: Mapped[float | None] = mapped_column(Float, nullable=True)
    gen_ph1: Mapped[float | None] = mapped_column(Float, nullable=True)
    gen_ph2: Mapped[float | None] = mapped_column(Float, nullable=True)
    gen_ph3: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Electrical
    frequency: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph1: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph2: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph3: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Battery (solar sites)
    battery_voltage: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_soc: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_current: Mapped[float | None] = mapped_column(Float, nullable=True)

    site = relationship("Site")
