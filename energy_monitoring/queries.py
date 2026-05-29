"""
Sample queries demonstrating TimescaleDB capabilities.

These show how a single SQL query can answer questions that previously
required pulling data from multiple systems and combining in Python.
"""

from sqlalchemy import text


def query_site_monthly_summary(engine, site_id: int, year: int, month: int):
    """
    Get a full monthly summary for a site by joining
    time-series aggregates with site metadata in a single query.
    """
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    s.name AS site_name,
                    s.measurement_type,
                    s.location,
                    COUNT(*) AS total_readings,
                    AVG(r.con_total) / 1000.0 AS avg_con_kw,
                    MAX(r.con_total) / 1000.0 AS max_con_kw,
                    AVG(r.gen_total) / 1000.0 AS avg_gen_kw,
                    MAX(r.gen_total) / 1000.0 AS max_gen_kw,
                    SUM(r.con_total) / 1000.0 / 60.0 AS total_con_kwh,
                    SUM(r.gen_total) / 1000.0 / 60.0 AS total_gen_kwh,
                    AVG(r.frequency) AS avg_frequency
                FROM raw_readings r
                JOIN sites s ON s.id = r.site_id
                WHERE r.site_id = :site_id
                  AND EXTRACT(YEAR FROM r.time) = :year
                  AND EXTRACT(MONTH FROM r.time) = :month
                GROUP BY s.name, s.measurement_type, s.location
            """),
            {"site_id": site_id, "year": year, "month": month},
        )
        return result.mappings().first()


def query_daily_energy_from_hypertable(engine, site_id: int, year: int, month: int):
    """
    Use TimescaleDB time_bucket to compute daily energy directly in SQL.
    This replaces the Python calc_daily_energy() function for ad-hoc queries.
    """
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    time_bucket('1 day', time) AS day,
                    SUM(con_total) / 1000.0 / 60.0 AS con_energy_kwh,
                    SUM(gen_total) / 1000.0 / 60.0 AS gen_energy_kwh,
                    SUM(con_ph1) / 1000.0 / 60.0 AS con_ph1_kwh,
                    SUM(con_ph2) / 1000.0 / 60.0 AS con_ph2_kwh,
                    SUM(con_ph3) / 1000.0 / 60.0 AS con_ph3_kwh,
                    SUM(gen_ph1) / 1000.0 / 60.0 AS gen_ph1_kwh,
                    SUM(gen_ph2) / 1000.0 / 60.0 AS gen_ph2_kwh,
                    SUM(gen_ph3) / 1000.0 / 60.0 AS gen_ph3_kwh,
                    COUNT(*) AS sample_count
                FROM raw_readings
                WHERE site_id = :site_id
                  AND EXTRACT(YEAR FROM time) = :year
                  AND EXTRACT(MONTH FROM time) = :month
                GROUP BY day
                ORDER BY day
            """),
            {"site_id": site_id, "year": year, "month": month},
        )
        return result.mappings().all()


def query_hourly_profile(engine, site_id: int, year: int, month: int):
    """
    Hourly average generation/consumption profile for a month.
    Uses the continuous aggregate for fast results.
    """
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    EXTRACT(HOUR FROM bucket) AS hour_of_day,
                    AVG(avg_con_total) / 1000.0 AS avg_con_kw,
                    AVG(avg_gen_total) / 1000.0 AS avg_gen_kw,
                    AVG(avg_frequency) AS avg_frequency
                FROM readings_hourly
                WHERE site_id = :site_id
                  AND EXTRACT(YEAR FROM bucket) = :year
                  AND EXTRACT(MONTH FROM bucket) = :month
                GROUP BY hour_of_day
                ORDER BY hour_of_day
            """),
            {"site_id": site_id, "year": year, "month": month},
        )
        return result.mappings().all()


def query_month_stats_with_trends(engine, site_id: int):
    """
    Pull all month stats for a site with month-over-month trends,
    computed entirely in SQL using window functions.
    """
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    year, month,
                    daily_energy_con_total_mean,
                    daily_energy_gen_total_mean,
                    total_energy_con_total,
                    total_energy_gen_total,
                    LAG(daily_energy_con_total_mean) OVER (ORDER BY year, month)
                        AS prev_month_con_mean,
                    LAG(daily_energy_gen_total_mean) OVER (ORDER BY year, month)
                        AS prev_month_gen_mean,
                    CASE
                        WHEN LAG(daily_energy_con_total_mean) OVER (ORDER BY year, month) > 0
                        THEN (daily_energy_con_total_mean
                              - LAG(daily_energy_con_total_mean) OVER (ORDER BY year, month))
                             / LAG(daily_energy_con_total_mean) OVER (ORDER BY year, month)
                             * 100.0
                    END AS con_pct_change,
                    CASE
                        WHEN LAG(daily_energy_gen_total_mean) OVER (ORDER BY year, month) > 0
                        THEN (daily_energy_gen_total_mean
                              - LAG(daily_energy_gen_total_mean) OVER (ORDER BY year, month))
                             / LAG(daily_energy_gen_total_mean) OVER (ORDER BY year, month)
                             * 100.0
                    END AS gen_pct_change
                FROM mu3pep_month_stats
                WHERE site_id = :site_id
                  AND entry_type = 'ACTUAL'
                ORDER BY year, month
            """),
            {"site_id": site_id},
        )
        return result.mappings().all()


def query_cross_site_comparison(engine, year: int, month: int):
    """
    Compare performance across all sites in a single query.
    This is the type of query that was impossible with InfluxDB alone.
    """
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    s.name AS site_name,
                    s.measurement_type,
                    s.location,
                    COUNT(r.*) AS total_readings,
                    SUM(r.gen_total) / 1000.0 / 60.0 AS total_gen_kwh,
                    SUM(r.con_total) / 1000.0 / 60.0 AS total_con_kwh,
                    AVG(r.gen_total) / 1000.0 AS avg_gen_kw,
                    AVG(r.con_total) / 1000.0 AS avg_con_kw
                FROM raw_readings r
                JOIN sites s ON s.id = r.site_id
                WHERE EXTRACT(YEAR FROM r.time) = :year
                  AND EXTRACT(MONTH FROM r.time) = :month
                GROUP BY s.name, s.measurement_type, s.location
                ORDER BY total_gen_kwh DESC
            """),
            {"year": year, "month": month},
        )
        return result.mappings().all()


def query_downtime_periods(engine, site_id: int, year: int, month: int,
                           threshold_w: float = 100.0):
    """
    Find periods of zero/low generation using TimescaleDB gap detection.
    """
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                WITH low_gen AS (
                    SELECT
                        time,
                        gen_total,
                        CASE WHEN gen_total <= :threshold THEN 1 ELSE 0 END AS is_down
                    FROM raw_readings
                    WHERE site_id = :site_id
                      AND EXTRACT(YEAR FROM time) = :year
                      AND EXTRACT(MONTH FROM time) = :month
                ),
                grouped AS (
                    SELECT
                        time,
                        is_down,
                        SUM(CASE WHEN is_down = 0 THEN 1 ELSE 0 END)
                            OVER (ORDER BY time) AS grp
                    FROM low_gen
                )
                SELECT
                    MIN(time) AS downtime_start,
                    MAX(time) AS downtime_end,
                    COUNT(*) AS minutes_down,
                    COUNT(*) / 60.0 AS hours_down
                FROM grouped
                WHERE is_down = 1
                GROUP BY grp
                HAVING COUNT(*) >= 10
                ORDER BY downtime_start
            """),
            {"site_id": site_id, "year": year, "month": month, "threshold": threshold_w},
        )
        return result.mappings().all()
