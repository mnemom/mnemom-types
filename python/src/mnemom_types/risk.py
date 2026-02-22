"""Risk assessment types.

Defines types for individual and team risk assessment,
context-aware decisioning, and ZK-proven risk classification.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Enums / union types
# ---------------------------------------------------------------------------

RiskLevel = Literal["low", "medium", "high", "critical"]
"""Risk severity level."""

RiskRecommendation = Literal["approve", "review", "deny"]
"""Recommendation for an individual agent action."""

TeamRecommendation = Literal[
    "approve_team", "approve_individuals_only", "review", "deny"
]
"""Recommendation for a team operation."""

ActionType = Literal[
    "financial_transaction",
    "data_access",
    "task_delegation",
    "tool_invocation",
    "autonomous_operation",
    "multi_agent_coordination",
]
"""Type of action being assessed."""

RiskTolerance = Literal["conservative", "moderate", "aggressive"]
"""Caller's risk appetite."""

CoordinationMode = Literal["parallel", "sequential", "hierarchical", "consensus"]
"""How agents in a team coordinate."""

SynergyType = Literal["synergistic", "neutral", "anti-synergistic"]
"""Synergy classification for a team."""

ProofStatus = Literal["none", "pending", "proving", "verified", "failed"]
"""ZK proof status."""


# ---------------------------------------------------------------------------
# Context
# ---------------------------------------------------------------------------

class RiskContext(BaseModel):
    """Context provided by the caller when requesting a risk assessment."""

    action_type: ActionType = Field(..., description="Type of action being assessed")
    amount: Optional[float] = Field(None, description="Monetary amount if applicable")
    counterparty_id: Optional[str] = Field(None, description="Counterparty agent ID")
    use_case: Optional[str] = Field(None, description="Freeform use-case description")
    risk_tolerance: Optional[RiskTolerance] = Field(
        None, description="Caller's risk appetite"
    )
    team_task: Optional[str] = Field(None, description="Team task description")
    coordination_mode: Optional[CoordinationMode] = Field(
        None, description="How agents coordinate"
    )


# ---------------------------------------------------------------------------
# Individual risk
# ---------------------------------------------------------------------------

class ContributingFactor(BaseModel):
    """A single factor contributing to the risk score."""

    component: str = Field(..., description="Component key")
    label: str = Field(..., description="Human-readable label")
    weight: float = Field(..., description="Weight in the composite")
    raw_value: float = Field(..., description="Raw component score (0-1000)")
    risk_contribution: float = Field(
        ..., description="Contribution to final risk score"
    )
    explanation: str = Field(..., description="Human-readable explanation")


class RiskAssessment(BaseModel):
    """Result of an individual risk assessment."""

    assessment_id: str = Field(..., description="Unique ID (prefix: ra-)")
    agent_id: str = Field(..., description="Assessed agent ID")
    risk_score: float = Field(..., description="Composite risk score (0-1)")
    risk_level: RiskLevel = Field(..., description="Classified risk level")
    recommendation: RiskRecommendation = Field(
        ..., description="Action recommendation"
    )
    confidence: float = Field(..., description="Assessment confidence (0-1)")
    contributing_factors: list[ContributingFactor] = Field(
        default_factory=list, description="Breakdown of contributing factors"
    )
    suggested_thresholds: dict[str, float] = Field(
        default_factory=dict, description="Risk level thresholds used"
    )
    explanation: str = Field(..., description="Human-readable explanation")
    proof_id: Optional[str] = Field(None, description="ZK proof ID if requested")
    proof_status: Optional[ProofStatus] = Field(
        None, description="Current proof status"
    )
    created_at: str = Field(..., description="ISO 8601 timestamp")


# ---------------------------------------------------------------------------
# Team risk
# ---------------------------------------------------------------------------

class TeamOutlier(BaseModel):
    """An agent flagged as a statistical outlier within the team."""

    agent_id: str = Field(..., description="Outlier agent ID")
    individual_risk_score: float = Field(
        ..., description="Agent's individual risk score"
    )
    shapley_value: float = Field(
        ..., description="Agent's marginal contribution to team risk"
    )
    systemic_contribution: float = Field(
        ..., description="Agent's systemic risk contribution"
    )
    primary_risk_factors: list[str] = Field(
        default_factory=list, description="Primary risk factor labels"
    )


class TeamCluster(BaseModel):
    """A cluster of agents sharing correlated risk."""

    cluster_id: str = Field(..., description="Cluster identifier")
    agent_ids: list[str] = Field(
        default_factory=list, description="Agents in this cluster"
    )
    internal_risk: float = Field(
        ..., description="Average intra-cluster risk"
    )
    shared_risk_factors: list[str] = Field(
        default_factory=list, description="Shared risk factors"
    )


class ValueDivergence(BaseModel):
    """A value declared by some agents but missing / conflicting in others."""

    value: str = Field(..., description="Value name")
    declaring_agents: list[str] = Field(
        default_factory=list, description="Agents declaring this value"
    )
    missing_agents: list[str] = Field(
        default_factory=list, description="Agents missing this value"
    )
    conflicting_agents: list[str] = Field(
        default_factory=list, description="Agents with conflicting interpretation"
    )
    risk_impact: float = Field(..., description="Impact on team risk score")


class TeamRiskAssessment(BaseModel):
    """Result of a team risk assessment."""

    assessment_id: str = Field(..., description="Unique ID (prefix: tra-)")
    team_risk_score: float = Field(..., description="Composite team risk (0-1)")
    team_risk_level: RiskLevel = Field(..., description="Classified risk level")
    team_coherence_score: float = Field(
        ..., description="Team coherence quality (0-1)"
    )
    team_recommendation: TeamRecommendation = Field(
        ..., description="Team action recommendation"
    )
    portfolio_risk: float = Field(
        ..., description="Aggregate quality pillar (0-1)"
    )
    coherence_risk: float = Field(
        ..., description="Coherence quality pillar (0-1)"
    )
    concentration_risk: float = Field(
        ..., description="Concentration risk (0-1)"
    )
    weakest_link_risk: float = Field(
        ..., description="Weakest link pillar (0-1)"
    )
    individual_assessments: list[RiskAssessment] = Field(
        default_factory=list, description="Individual assessments for each agent"
    )
    outliers: list[TeamOutlier] = Field(
        default_factory=list, description="Statistical outliers"
    )
    clusters: list[TeamCluster] = Field(
        default_factory=list, description="Risk-correlated clusters"
    )
    value_divergences: list[ValueDivergence] = Field(
        default_factory=list, description="Value divergences across team"
    )
    shapley_values: dict[str, float] = Field(
        default_factory=dict, description="Agent ID → Shapley value mapping"
    )
    synergy_type: SynergyType = Field(
        ..., description="Team synergy classification"
    )
    explanation: str = Field(..., description="Human-readable explanation")
    proof_id: Optional[str] = Field(None, description="ZK proof ID if requested")
    proof_status: Optional[ProofStatus] = Field(
        None, description="Current proof status"
    )
    created_at: str = Field(..., description="ISO 8601 timestamp")
