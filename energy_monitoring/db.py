"""
Database connection and setup for PostgreSQL + TimescaleDB.

Creates all tables, converts raw_readings to a hypertable,
and sets up continuous aggregates for hourly/daily rollups.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from energy_monitoring.models import Base

DATABASE_URL = "postgresql://energy_user:energy_pass@localhost:5432/energy_monitoring"


def get_engine(url: str = DATABASE_URL):
    return create_engine(url, echo=False)


def get_session(engine=None) -> Session:
    if engine is None:
        engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def create_tables(engine=None):
    """Create all ORM tables."""
    if engine is None:
        engine = get_engine()
    Base.metadata.create_all(engine)
    print("All tables created.")


def _exec_autocommit(engine, sql: str):
    """Execute a statement in autocommit mode (required for continuous aggregates)."""
    import psycopg2
    url = engine.url
    conn = psycopg2.connect(
        dbname=url.database,
        user=url.username,
        password=url.password,
        host=url.host,
        port=url.port or 5432,
    )
    conn.autocommit = True
    try:
        cursor = conn.cursor()
        cursor.execute(sql)
        cursor.close()
    finally:
        conn.close()


def setup_timescaledb(engine=None):
    """
    Convert raw_readings to a TimescaleDB hypertable and
    create continuous aggregates for hourly and daily rollups.
    """
    if engine is None:
        engine = get_engine()

    with engine.connect() as conn:
        # Ensure TimescaleDB extension
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb;"))
        conn.commit()

        # Convert raw_readings to hypertable (idempotent check)
        result = conn.execute(
            text(
                "SELECT EXISTS ("
                "  SELECT 1 FROM timescaledb_information.hypertables "
                "  WHERE hypertable_name = 'raw_readings'"
                ")"
            )
        )
        is_hypertable = result.scalar()

        if not is_hypertable:
            conn.execute(
                text(
                    "SELECT create_hypertable('raw_readings', 'time', "
                    "migrate_data => true, if_not_exists => true)"
                )
            )
            conn.commit()
            print("raw_readings converted to hypertable.")
        else:
            print("raw_readings is already a hypertable.")

    # Continuous aggregates must run outside a transaction block
    _exec_autocommit(
        engine,
        """
        CREATE MATERIALIZED VIEW IF NOT EXISTS readings_hourly
        WITH (timescaledb.continuous) AS
        SELECT
            time_bucket('1 hour', time) AS bucket,
            site_id,
            AVG(con_total) AS avg_con_total,
            MAX(con_total) AS max_con_total,
            MIN(con_total) AS min_con_total,
            AVG(gen_total) AS avg_gen_total,
            MAX(gen_total) AS max_gen_total,
            MIN(gen_total) AS min_gen_total,
            AVG(con_ph1) AS avg_con_ph1,
            AVG(con_ph2) AS avg_con_ph2,
            AVG(con_ph3) AS avg_con_ph3,
            AVG(gen_ph1) AS avg_gen_ph1,
            AVG(gen_ph2) AS avg_gen_ph2,
            AVG(gen_ph3) AS avg_gen_ph3,
            AVG(frequency) AS avg_frequency,
            AVG(voltage) AS avg_voltage,
            AVG(battery_voltage) AS avg_battery_voltage,
            AVG(battery_soc) AS avg_battery_soc,
            COUNT(*) AS sample_count
        FROM raw_readings
        GROUP BY bucket, site_id
        """,
    )
    print("Continuous aggregate 'readings_hourly' created.")

    _exec_autocommit(
        engine,
        """
        CREATE MATERIALIZED VIEW IF NOT EXISTS readings_daily
        WITH (timescaledb.continuous) AS
        SELECT
            time_bucket('1 day', time) AS bucket,
            site_id,
            AVG(con_total) AS avg_con_total,
            MAX(con_total) AS max_con_total,
            MIN(con_total) AS min_con_total,
            AVG(gen_total) AS avg_gen_total,
            MAX(gen_total) AS max_gen_total,
            MIN(gen_total) AS min_gen_total,
            AVG(con_ph1) AS avg_con_ph1,
            AVG(con_ph2) AS avg_con_ph2,
            AVG(con_ph3) AS avg_con_ph3,
            AVG(gen_ph1) AS avg_gen_ph1,
            AVG(gen_ph2) AS avg_gen_ph2,
            AVG(gen_ph3) AS avg_gen_ph3,
            AVG(frequency) AS avg_frequency,
            AVG(voltage) AS avg_voltage,
            AVG(battery_voltage) AS avg_battery_voltage,
            AVG(battery_soc) AS avg_battery_soc,
            COUNT(*) AS sample_count
        FROM raw_readings
        GROUP BY bucket, site_id
        """,
    )
    print("Continuous aggregate 'readings_daily' created.")

    # Enable compression on raw_readings
    with engine.connect() as conn:
        conn.execute(
            text(
                "ALTER TABLE raw_readings SET ("
                "  timescaledb.compress,"
                "  timescaledb.compress_segmentby = 'site_id'"
                ")"
            )
        )
        conn.commit()

        conn.execute(
            text(
                "SELECT add_compression_policy('raw_readings', "
                "INTERVAL '30 days', if_not_exists => true)"
            )
        )
        conn.commit()
        print("Compression policy added (compress data older than 30 days).")

    print("TimescaleDB setup complete.")


def init_db(url: str = DATABASE_URL):
    """Full database initialization: tables + TimescaleDB features."""
    engine = get_engine(url)
    create_tables(engine)
    setup_timescaledb(engine)
    return engine


if __name__ == "__main__":
    engine = init_db()
    print("\nDatabase ready at:", DATABASE_URL)
