"""Load raw parquet / gzip-parquet data files."""

from __future__ import annotations

from pathlib import Path

import pandas as pd


def load_parquet(filepath: str | Path) -> pd.DataFrame:
    """Load a parquet file (may have .gzip extension) into a DataFrame.

    Returns a DataFrame with a DatetimeIndex named '_time'.
    """
    df = pd.read_parquet(filepath)
    if not isinstance(df.index, pd.DatetimeIndex):
        if "_time" in df.columns:
            df = df.set_index("_time")
        else:
            raise ValueError(
                f"Cannot find a datetime index or '_time' column in {filepath}"
            )
    df = df.sort_index()
    return df


def infer_sample_interval_minutes(df: pd.DataFrame) -> float:
    """Infer the most common sample interval from the index."""
    diffs = pd.Series(df.index).diff().dropna()
    if diffs.empty:
        return 1.0
    mode_diff = diffs.mode().iloc[0]
    return mode_diff.total_seconds() / 60.0
