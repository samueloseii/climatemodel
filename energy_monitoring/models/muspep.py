"""Single-phase hydro month stats (muspep)."""

from sqlalchemy.orm import Mapped, relationship

from energy_monitoring.models.base import Base
from energy_monitoring.models.mixins import (
    MonthStatsBaseMixin,
    SinglePhaseEnergyMixin,
    GenerationMixin,
)


class MuspepMonthStats(
    MonthStatsBaseMixin,
    SinglePhaseEnergyMixin,
    GenerationMixin,
    Base,
):
    __tablename__ = "muspep_month_stats"

    site = relationship("Site", back_populates="muspep_stats")

    def __repr__(self) -> str:
        return (
            f"<MuspepMonthStats(site_id={self.site_id}, "
            f"{self.year}-{self.month:02d}, {self.entry_type.value})>"
        )
