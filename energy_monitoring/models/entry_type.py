"""Month-stat entry type enum.

Allows flexible trend comparisons by marking entries as:
- ACTUAL:    real measured month data
- BASELINE:  nominal / reference value for the site
- PREDICTED: forecasted value for a given month
"""

import enum


class EntryType(enum.Enum):
    ACTUAL = "actual"
    BASELINE = "baseline"
    PREDICTED = "predicted"
