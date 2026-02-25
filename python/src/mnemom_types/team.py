"""Team types.

Canonical definitions for Mnemom teams, team reputation scores,
team alignment cards, and team roster management.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

from mnemom_types.reputation import ConfidenceLevel, ReputationGrade

# ---------------------------------------------------------------------------
# Team Identity
# ---------------------------------------------------------------------------

TeamStatus = Literal["active", "archived"]
"""Status of a team."""

RosterChangeType = Literal["agent_added", "agent_removed"]
"""A roster change event type."""


class Team(BaseModel):
    """A registered team of agents."""

    id: str = Field(..., description="Team identifier (uuid)")
    org_id: str = Field(..., description="Organization that owns this team")
    name: str = Field(..., description="Display name")
    description: Optional[str] = Field(None, description="Optional description")
    status: TeamStatus = Field(..., description="Team status")
    metadata: dict = Field(default_factory=dict, description="Freeform metadata")
    member_count: int = Field(..., description="Number of active members")
    created_at: str = Field(..., description="When the team was created (ISO 8601)")
    updated_at: str = Field(..., description="When the team was last updated (ISO 8601)")


class TeamMember(BaseModel):
    """A member of a team (current or historical)."""

    team_id: str = Field(..., description="Team identifier")
    agent_id: str = Field(..., description="Agent identifier")
    agent_name: Optional[str] = Field(None, description="Agent display name")
    added_at: str = Field(..., description="When the agent was added (ISO 8601)")
    removed_at: Optional[str] = Field(
        None, description="When the agent was removed (null = active)"
    )


class TeamRosterChange(BaseModel):
    """A logged roster change event."""

    id: str = Field(..., description="Change event identifier")
    team_id: str = Field(..., description="Team identifier")
    change_type: RosterChangeType = Field(..., description="Type of change")
    agent_id: str = Field(..., description="Agent affected")
    actor_id: Optional[str] = Field(
        None, description="User who made the change (null for system)"
    )
    created_at: str = Field(..., description="When the change occurred (ISO 8601)")


# ---------------------------------------------------------------------------
# Team Alignment Card
# ---------------------------------------------------------------------------

TeamCardSource = Literal["manual", "auto_derived", "hybrid"]
"""How the team alignment card was created."""

TeamCoordinationMode = Literal["collaborative", "hierarchical", "autonomous"]
"""Coordination mode for team operations."""


class TeamMemberRequirements(BaseModel):
    """Requirements that team members must satisfy."""

    required_values: Optional[list[str]] = Field(
        None, description="Values that members are required to declare"
    )
    min_retention_days: Optional[int] = Field(
        None, description="Minimum audit retention days for members"
    )


class TeamAlignmentCardMeta(BaseModel):
    """Team-specific metadata on an alignment card."""

    team_id: str = Field(..., description="Team identifier")
    card_source: TeamCardSource = Field(..., description="How the card was created")
    team_mission: Optional[str] = Field(None, description="Team mission statement")
    coordination_mode: Optional[TeamCoordinationMode] = Field(
        None, description="How the team coordinates internally"
    )
    member_requirements: Optional[TeamMemberRequirements] = Field(
        None, description="Requirements for team members"
    )


# ---------------------------------------------------------------------------
# Team Reputation
# ---------------------------------------------------------------------------

TeamReputationComponentKey = Literal[
    "coherence_history",
    "member_quality",
    "operational_record",
    "structural_stability",
    "assessment_density",
]
"""Machine-readable key for a team reputation component."""


class TeamReputationComponent(BaseModel):
    """A single component contributing to a team's reputation score."""

    key: TeamReputationComponentKey = Field(..., description="Machine-readable key")
    label: str = Field(..., description="Human-readable label")
    score: float = Field(..., description="Raw component score (0-1000)")
    weight: float = Field(..., description="Weight applied to this component (0-1)")
    weighted_score: float = Field(..., description="score * weight, rounded")
    factors: list[str] = Field(
        default_factory=list, description="Human-readable factors"
    )


class A2ATeamTrustExtension(BaseModel):
    """A2A trust extension for inter-team reputation sharing."""

    extension_uri: str = Field(
        default="https://mnemom.ai/ext/team-trust/v1",
        description="URI identifying this extension",
    )
    provider: str = Field(default="mnemom", description="Reputation provider")
    score: float = Field(..., description="Numeric reputation score")
    grade: ReputationGrade = Field(..., description="Letter grade")
    confidence: ConfidenceLevel = Field(..., description="Confidence in the score")
    member_count: int = Field(..., description="Number of active team members")
    verified_url: str = Field(..., description="URL to verify the score")
    badge_url: str = Field(..., description="URL to the team's badge")
    methodology_url: str = Field(
        ..., description="URL to the scoring methodology"
    )
    last_updated: str = Field(
        ..., description="When the score was last updated (ISO 8601)"
    )


class TeamReputationScore(BaseModel):
    """Full reputation score for a team."""

    team_id: str = Field(..., description="Team identifier")
    team_name: str = Field(..., description="Team display name")
    score: float = Field(..., description="Numeric reputation score (0-1000)")
    grade: ReputationGrade = Field(..., description="Letter grade")
    confidence: ConfidenceLevel = Field(..., description="Confidence in the score")
    is_eligible: bool = Field(
        ..., description="Whether the team is eligible (assessments >= 10)"
    )
    components: list[TeamReputationComponent] = Field(
        ..., description="Score components breakdown"
    )
    total_assessments: int = Field(
        ..., description="Total team risk assessments feeding this score"
    )
    last_assessed: Optional[str] = Field(
        None, description="When the team was last assessed (ISO 8601)"
    )
    trend_30d: float = Field(
        ..., description="30-day score trend (positive = improving)"
    )
    visibility: Literal["public", "unlisted", "private"] = Field(
        ..., description="Visibility setting"
    )
    computed_at: str = Field(
        ..., description="When the score was computed (ISO 8601)"
    )
    member_count: int = Field(..., description="Number of active members")
    a2a_trust_extension: Optional[A2ATeamTrustExtension] = Field(
        None, description="Optional A2A team trust extension"
    )


class TeamReputationSnapshot(BaseModel):
    """Weekly reputation snapshot for a team."""

    team_id: str = Field(..., description="Team identifier")
    week_start: str = Field(
        ..., description="Monday of the snapshot week (ISO 8601 date)"
    )
    score: float = Field(..., description="Score at snapshot time")
    grade: ReputationGrade = Field(..., description="Grade at snapshot time")
    components: dict[str, float] = Field(
        ..., description="Component scores at snapshot time"
    )
    created_at: str = Field(
        ..., description="When the snapshot was created (ISO 8601)"
    )
