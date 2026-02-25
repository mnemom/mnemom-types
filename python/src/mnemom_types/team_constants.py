"""Team reputation constants.

Centralizes team-specific scoring weights, eligibility thresholds,
and configuration constants used across all services and SDKs.
"""

from __future__ import annotations

from typing import TypedDict


class TeamComponentWeightEntry(TypedDict):
    key: str
    label: str
    weight: float
    description: str
    source: str


TEAM_COMPONENT_WEIGHTS: list[TeamComponentWeightEntry] = [
    {
        "key": "coherence_history",
        "label": "Coherence History",
        "weight": 0.35,
        "description": "How consistently well-aligned is this team over time?",
        "source": "Historical team risk assessments (CQ pillar)",
    },
    {
        "key": "member_quality",
        "label": "Member Quality",
        "weight": 0.25,
        "description": "Floor quality — the team is only as strong as its members",
        "source": "Member individual Trust Scores (tail-risk weighted)",
    },
    {
        "key": "operational_record",
        "label": "Operational Track Record",
        "weight": 0.20,
        "description": "How often has this team been assessed as low-risk?",
        "source": "Historical team risk assessment outcomes",
    },
    {
        "key": "structural_stability",
        "label": "Structural Stability",
        "weight": 0.10,
        "description": "Is the team's contagion profile stable? Does it churn members?",
        "source": "SR pillar trends + roster change frequency",
    },
    {
        "key": "assessment_density",
        "label": "Assessment Density",
        "weight": 0.10,
        "description": "Is this team actively monitored?",
        "source": "Count + recency of team assessments",
    },
]
"""Team reputation scoring component weights."""

TEAM_ELIGIBILITY_THRESHOLD: int = 10
"""Minimum number of team assessments before a score is generated."""

TEAM_MAX_SIZE: int = 50
"""Maximum number of agents in a team."""

TEAM_MIN_SIZE: int = 2
"""Minimum number of agents in a team."""

TEAM_MAX_ASSESSMENTS_PER_DAY: int = 100
"""Maximum team assessments per day (anti-gaming)."""

TEAM_CONFIDENCE_THRESHOLDS: dict[str, int] = {
    "insufficient": 0,
    "low": 10,
    "medium": 30,
    "high": 100,
}
"""Team confidence thresholds (minimum assessments for each level)."""

CQ_MISSION_BLEND: dict[str, float] = {
    "member": 0.70,
    "mission": 0.30,
}
"""CQ mission alignment blend weights."""

ROSTER_CHURN_PENALTY_PER_CHANGE: int = 50
"""Points deducted per roster change in structural stability."""

ROSTER_CHURN_LOOKBACK_DAYS: int = 90
"""Lookback window for roster churn penalty (days)."""
