"""Shared column mixins for month-stats tables."""

from sqlalchemy import Integer, Float, String, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from energy_monitoring.models.entry_type import EntryType


class MonthStatsBaseMixin:
    """Columns common to every month-stats table."""

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    site_id: Mapped[int] = mapped_column(Integer, ForeignKey("sites.id"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    entry_type: Mapped[EntryType] = mapped_column(
        Enum(EntryType), nullable=False, default=EntryType.ACTUAL
    )
    notes: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    # Record counts
    total_records: Mapped[int | None] = mapped_column(Integer, nullable=True)
    expected_records: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Downtime
    estimated_system_downtime_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    confirmed_system_downtime_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_consumer_downtime_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    confirmed_consumer_downtime_hours: Mapped[float | None] = mapped_column(Float, nullable=True)


class SinglePhaseEnergyMixin:
    """Energy / power columns for a single-phase site."""

    # Daily energy consumption (kWh)
    daily_energy_con_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Daily energy consumption on days with data (kWh)
    daily_energy_con_data_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Power consumption (kW)
    power_con_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Total energy consumption (kWh)
    total_energy_con: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Frequency
    frequency_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Voltage
    voltage_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_std: Mapped[float | None] = mapped_column(Float, nullable=True)


class GenerationMixin:
    """Generation columns (hydro sites only)."""

    # Daily energy generation (kWh)
    daily_energy_gen_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Daily energy generation on days with data (kWh)
    daily_energy_gen_data_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Power generation (kW)
    power_gen_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Daily plant factor (%)
    plant_factor_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Total energy generation (kWh)
    total_energy_gen: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Total plant factor (%)
    total_plant_factor: Mapped[float | None] = mapped_column(Float, nullable=True)


class ThreePhaseEnergyMixin:
    """Per-phase energy / power / voltage columns for 3-phase sites."""

    # --- Consumption per phase ---
    daily_energy_con_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_ph1_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_ph1_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_ph1_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_con_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_ph2_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_ph2_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_ph2_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_con_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_ph3_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_ph3_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_ph3_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_con_total_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_total_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_total_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_total_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Consumption on days with data
    daily_energy_con_data_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_ph1_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_ph1_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_ph1_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_con_data_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_ph2_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_ph2_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_ph2_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_con_data_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_ph3_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_ph3_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_ph3_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_con_data_total_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_total_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_total_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_con_data_total_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # --- Power consumption per phase ---
    power_con_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph1_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph1_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph1_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    power_con_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph2_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph2_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph2_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    power_con_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph3_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph3_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_ph3_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    power_con_total_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_total_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_total_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_con_total_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # --- Voltage per phase ---
    voltage_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph1_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph1_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph1_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    voltage_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph2_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph2_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph2_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    voltage_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph3_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph3_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    voltage_ph3_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Total energy consumption
    total_energy_con_ph1: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_con_ph2: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_con_ph3: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_con_total: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Frequency (shared across phases)
    frequency_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    frequency_std: Mapped[float | None] = mapped_column(Float, nullable=True)


class ThreePhaseGenerationMixin:
    """Per-phase generation columns for 3-phase hydro sites."""

    daily_energy_gen_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_ph1_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_ph1_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_ph1_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_gen_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_ph2_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_ph2_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_ph2_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_gen_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_ph3_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_ph3_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_ph3_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_gen_total_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_total_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_total_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_total_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Generation on days with data
    daily_energy_gen_data_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_ph1_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_ph1_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_ph1_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_gen_data_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_ph2_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_ph2_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_ph2_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_gen_data_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_ph3_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_ph3_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_ph3_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    daily_energy_gen_data_total_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_total_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_total_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_energy_gen_data_total_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Power generation per phase
    power_gen_ph1_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph1_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph1_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph1_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    power_gen_ph2_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph2_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph2_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph2_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    power_gen_ph3_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph3_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph3_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_ph3_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    power_gen_total_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_total_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_total_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    power_gen_total_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Plant factor
    plant_factor_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    plant_factor_std: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Totals
    total_energy_gen_ph1: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_gen_ph2: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_gen_ph3: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_energy_gen_total: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_plant_factor: Mapped[float | None] = mapped_column(Float, nullable=True)


class BatteryStorageMixin:
    """Battery / storage columns for solar sites."""

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

    estimated_full_recharge_days: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_full_charge_time: Mapped[str | None] = mapped_column(String(8), nullable=True)  # HH:MM

    daily_con_from_storage_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_con_from_storage_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_con_from_storage_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    daily_con_from_storage_std: Mapped[float | None] = mapped_column(Float, nullable=True)
