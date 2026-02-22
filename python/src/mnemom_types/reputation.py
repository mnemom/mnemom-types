"""Reputation score types.

Canonical definitions for Mnemom reputation scores, grades,
confidence levels, and score components.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

ReputationGrade = Literal["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "NR"]
"""Reputation grade scale from AAA (highest) to NR (not rated)."""

ConfidenceLevel = Literal["insufficient", "low", "medium", "high"]
"""Confidence level of a reputation score."""


class ReputationComponent(BaseModel):
    """A single component contributing to an agent's reputation score."""

    key: str = Field(..., description="Machine-readable key (e.g. 'integrity_ratio')")
    label: str = Field(..., description="Human-readable label (e.g. 'Integrity Ratio')")
    score: float = Field(..., description="Raw component score (0-1000)")
    weight: float = Field(..., description="Weight applied to this component (0-1)")
    weighted_score: float = Field(..., description="score * weight, rounded")
    factors: list[str] = Field(default_factory=list, description="Human-readable factors")


class A2ATrustExtension(BaseModel):
    """A2A trust extension for inter-agent reputation sharing."""

    extension_uri: str = Field(..., description="URI identifying this extension")
    provider: str = Field(..., description="Reputation provider identifier")
    score: float = Field(..., description="Numeric reputation score")
    grade: ReputationGrade = Field(..., description="Letter grade")
    confidence: ConfidenceLevel = Field(..., description="Confidence in the score")
    verified_url: str = Field(..., description="URL to verify the score")
    badge_url: str = Field(..., description="URL to the agent's badge")
    methodology_url: str = Field(..., description="URL to the scoring methodology")
    last_updated: str = Field(
        ..., description="When the score was last updated (ISO 8601)"
    )


class ReputationScore(BaseModel):
    """Full reputation score for an agent."""

    agent_id: str = Field(..., description="Agent identifier")
    score: float = Field(..., description="Numeric reputation score (0-1000)")
    grade: ReputationGrade = Field(..., description="Letter grade")
    tier: str = Field(..., description="Tier label (e.g. 'Exemplary', 'Reliable')")
    is_eligible: bool = Field(
        ..., description="Whether the agent is eligible for reputation"
    )
    checkpoint_count: int = Field(
        ..., description="Number of checkpoints contributing to the score"
    )
    confidence: ConfidenceLevel = Field(..., description="Confidence in the score")
    components: list[ReputationComponent] = Field(
        ..., description="Score components breakdown"
    )
    computed_at: str = Field(
        ..., description="When the score was computed (ISO 8601)"
    )
    trend_30d: float = Field(
        ..., description="30-day score trend (positive = improving)"
    )
    visibility: Literal["public", "unlisted", "private"] = Field(
        ..., description="Visibility setting"
    )
    a2a_trust_extension: Optional[A2ATrustExtension] = Field(
        None, description="Optional A2A trust extension"
    )
