"""Database engine and session configuration."""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///energy_monitoring.db")

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """Drop all tables (use with caution)."""
    Base.metadata.drop_all(bind=engine)
