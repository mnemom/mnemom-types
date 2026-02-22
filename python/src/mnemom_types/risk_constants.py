"""Risk assessment constants.

Centralizes action-type weight profiles, risk thresholds,
and composition weights used by the risk engine.
"""

from __future__ import annotations

from typing import TypedDict

# ---------------------------------------------------------------------------
# Action-type weight profiles
# ---------------------------------------------------------------------------


class ActionTypeProfile(TypedDict):
    integrity_ratio: float
    compliance: float
    drift_stability: float
    trace_completeness: float
    coherence_compatibility: float


ACTION_TYPE_PROFILES: dict[str, ActionTypeProfile] = {
    "financial_transaction": {
        "integrity_ratio": 0.30,
        "compliance": 0.30,
        "drift_stability": 0.15,
        "trace_completeness": 0.10,
        "coherence_compatibility": 0.15,
    },
    "data_access": {
        "integrity_ratio": 0.35,
        "compliance": 0.25,
        "drift_stability": 0.15,
        "trace_completeness": 0.15,
        "coherence_compatibility": 0.10,
    },
    "task_delegation": {
        "integrity_ratio": 0.25,
        "compliance": 0.15,
        "drift_stability": 0.15,
        "trace_completeness": 0.10,
        "coherence_compatibility": 0.35,
    },
    "tool_invocation": {
        "integrity_ratio": 0.40,
        "compliance": 0.20,
        "drift_stability": 0.20,
        "trace_completeness": 0.10,
        "coherence_compatibility": 0.10,
    },
    "autonomous_operation": {
        "integrity_ratio": 0.35,
        "compliance": 0.25,
        "drift_stability": 0.20,
        "trace_completeness": 0.10,
        "coherence_compatibility": 0.10,
    },
    "multi_agent_coordination": {
        "integrity_ratio": 0.20,
        "compliance": 0.15,
        "drift_stability": 0.15,
        "trace_completeness": 0.10,
        "coherence_compatibility": 0.40,
    },
}
"""Context-aware component weight overrides per action type."""


# ---------------------------------------------------------------------------
# Risk thresholds
# ---------------------------------------------------------------------------


class RiskThresholdSet(TypedDict):
    low: float
    medium: float
    high: float


RISK_THRESHOLDS: dict[str, RiskThresholdSet] = {
    "conservative": {"low": 0.15, "medium": 0.35, "high": 0.55},
    "moderate": {"low": 0.25, "medium": 0.50, "high": 0.75},
    "aggressive": {"low": 0.35, "medium": 0.60, "high": 0.85},
}
"""Risk level boundaries per tolerance. Score < low -> low, < medium -> medium, etc."""


# ---------------------------------------------------------------------------
# Composition weights
# ---------------------------------------------------------------------------


class TeamRiskWeights(TypedDict):
    portfolio: float
    coherence: float
    weakest_link: float
    concentration: float


TEAM_RISK_WEIGHTS: TeamRiskWeights = {
    "portfolio": 0.30,
    "coherence": 0.30,
    "weakest_link": 0.25,
    "concentration": 0.15,
}
"""Weights for the team risk composite score."""


class IndividualRiskWeights(TypedDict):
    context: float
    recency: float
    confidence_penalty: float


INDIVIDUAL_RISK_WEIGHTS: IndividualRiskWeights = {
    "context": 0.60,
    "recency": 0.30,
    "confidence_penalty": 0.10,
}
"""Weights for the individual risk composite score."""


# ---------------------------------------------------------------------------
# Recency decay
# ---------------------------------------------------------------------------

VIOLATION_SEVERITY_WEIGHTS: dict[str, float] = {
    "critical": 1.0,
    "high": 0.7,
    "medium": 0.4,
    "low": 0.1,
}
"""Severity weights for violation recency penalty."""

RECENCY_HALF_LIFE_DAYS: int = 30
"""Half-life in days for the exponential decay of violations."""


# ---------------------------------------------------------------------------
# Confidence penalty
# ---------------------------------------------------------------------------

CONFIDENCE_PENALTIES: dict[str, float] = {
    "insufficient": 0.3,
    "low": 0.2,
    "medium": 0.1,
    "high": 0.0,
}
"""Confidence penalty values by confidence level."""


# ---------------------------------------------------------------------------
# Team coherence sub-weights
# ---------------------------------------------------------------------------

COHERENCE_SUBWEIGHTS: dict[str, float] = {
    "value_overlap": 0.35,
    "priority_alignment": 0.25,
    "behavioral_corr_penalty": 0.15,
    "boundary_compatibility": 0.25,
}
"""Pairwise coherence sub-component weights."""


# ---------------------------------------------------------------------------
# Circuit breakers
# ---------------------------------------------------------------------------

CIRCUIT_BREAKER_MIN_REPUTATION: int = 200
"""Minimum reputation score before circuit breaker fires."""

CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT: int = 100
"""Minimum pairwise boundary compatibility before circuit breaker fires."""
