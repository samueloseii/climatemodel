"""Single-phase solar month stats (muspsep)."""

from sqlalchemy.orm import Mapped, relationship

from energy_monitoring.models.base import Base
from energy_monitoring.models.mixins import (
    MonthStatsBaseMixin,
    SinglePhaseEnergyMixin,
    BatteryStorageMixin,
)


class MuspsepMonthStats(
    MonthStatsBaseMixin,
    SinglePhaseEnergyMixin,
    BatteryStorageMixin,
    Base,
):
    __tablename__ = "muspsep_month_stats"

    site = relationship("Site", back_populates="muspsep_stats")

    def __repr__(self) -> str:
        return (
            f"<MuspsepMonthStats(site_id={self.site_id}, "
            f"{self.year}-{self.month:02d}, {self.entry_type.value})>"
        )
