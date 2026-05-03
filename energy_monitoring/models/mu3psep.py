"""Three-phase solar month stats (mu3psep)."""

from sqlalchemy.orm import Mapped, relationship

from energy_monitoring.models.base import Base
from energy_monitoring.models.mixins import (
    MonthStatsBaseMixin,
    ThreePhaseEnergyMixin,
    BatteryStorageMixin,
)


class Mu3psepMonthStats(
    MonthStatsBaseMixin,
    ThreePhaseEnergyMixin,
    BatteryStorageMixin,
    Base,
):
    __tablename__ = "mu3psep_month_stats"

    site = relationship("Site", back_populates="mu3psep_stats")

    def __repr__(self) -> str:
        return (
            f"<Mu3psepMonthStats(site_id={self.site_id}, "
            f"{self.year}-{self.month:02d}, {self.entry_type.value})>"
        )
