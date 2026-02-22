"""Reputation gate types.

Types for gating agent interactions based on reputation
score and grade thresholds.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from .reputation import ReputationGrade, ReputationScore


class ReputationGateConfig(BaseModel):
    """Configuration for a reputation gate."""

    min_score: Optional[float] = Field(
        None, description="Minimum numeric score required (0-1000)"
    )
    min_grade: Optional[ReputationGrade] = Field(
        None, description="Minimum letter grade required"
    )
    base_url: str = Field(
        "https://api.mnemom.ai", description="Base URL for the reputation API"
    )


class GateResult(BaseModel):
    """Result of a reputation gate check."""

    allowed: bool = Field(..., description="Whether the agent passed the gate")
    score: Optional[ReputationScore] = Field(
        None, description="The agent's reputation score (None on fetch error)"
    )
    reason: Optional[str] = Field(
        None, description="Reason for denial (None if allowed)"
    )
