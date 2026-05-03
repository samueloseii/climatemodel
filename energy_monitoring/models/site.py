"""Site model – represents a monitored micro-grid installation."""

import enum
from datetime import datetime

from sqlalchemy import Integer, String, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from energy_monitoring.models.base import Base


class MeasurementType(enum.Enum):
    MUSPEP = "muspep"      # single-phase hydro
    MU3PEP = "mu3pep"      # three-phase hydro
    MUSPSEP = "muspsep"    # single-phase solar
    MU3PSEP = "mu3psep"    # three-phase solar


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    measurement_type: Mapped[MeasurementType] = mapped_column(
        Enum(MeasurementType), nullable=False
    )
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Relationships to per-type month stats
    muspep_stats = relationship("MuspepMonthStats", back_populates="site", cascade="all, delete-orphan")
    mu3pep_stats = relationship("Mu3pepMonthStats", back_populates="site", cascade="all, delete-orphan")
    muspsep_stats = relationship("MuspsepMonthStats", back_populates="site", cascade="all, delete-orphan")
    mu3psep_stats = relationship("Mu3psepMonthStats", back_populates="site", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Site(id={self.id}, name={self.name!r}, type={self.measurement_type.value})>"
