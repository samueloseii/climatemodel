"""Three-phase hydro month stats (mu3pep)."""

from sqlalchemy.orm import Mapped, relationship

from energy_monitoring.models.base import Base
from energy_monitoring.models.mixins import (
    MonthStatsBaseMixin,
    ThreePhaseEnergyMixin,
    ThreePhaseGenerationMixin,
)


class Mu3pepMonthStats(
    MonthStatsBaseMixin,
    ThreePhaseEnergyMixin,
    ThreePhaseGenerationMixin,
    Base,
):
    __tablename__ = "mu3pep_month_stats"

    site = relationship("Site", back_populates="mu3pep_stats")

    def __repr__(self) -> str:
        return (
            f"<Mu3pepMonthStats(site_id={self.site_id}, "
            f"{self.year}-{self.month:02d}, {self.entry_type.value})>"
        )
