"""mnemom-types — Shared type definitions for Mnemom services and SDKs.

Example::

    from mnemom_types import ReputationScore, ReputationGrade
    from mnemom_types import GRADE_ORDINALS, COMPONENT_WEIGHTS
    from mnemom_types import RiskAssessment, TeamRiskAssessment
"""

from mnemom_types.constants import (
    COMPONENT_WEIGHTS,
    GRADE_ORDINALS,
    GRADE_SCALE,
    ComponentWeightEntry,
    GradeScaleEntry,
)
from mnemom_types.gate import GateResult, ReputationGateConfig
from mnemom_types.reputation import (
    A2ATrustExtension,
    ConfidenceLevel,
    ReputationComponent,
    ReputationGrade,
    ReputationScore,
)
from mnemom_types.risk import (
    ActionType,
    ContributingFactor,
    CoordinationMode,
    ProofStatus,
    RiskAssessment,
    RiskContext,
    RiskLevel,
    RiskRecommendation,
    RiskTolerance,
    SynergyType,
    TeamCluster,
    TeamOutlier,
    TeamRecommendation,
    TeamRiskAssessment,
    ValueDivergence,
)
from mnemom_types.team import (
    A2ATeamTrustExtension,
    Team,
    TeamAlignmentCardMeta,
    TeamCardSource,
    TeamCoordinationMode,
    TeamMember,
    TeamMemberRequirements,
    TeamReputationComponent,
    TeamReputationComponentKey,
    TeamReputationScore,
    TeamReputationSnapshot,
    TeamRosterChange,
    TeamStatus,
    RosterChangeType,
)
from mnemom_types.team_constants import (
    CQ_MISSION_BLEND,
    ROSTER_CHURN_LOOKBACK_DAYS,
    ROSTER_CHURN_PENALTY_PER_CHANGE,
    TEAM_COMPONENT_WEIGHTS,
    TEAM_CONFIDENCE_THRESHOLDS,
    TEAM_ELIGIBILITY_THRESHOLD,
    TEAM_MAX_ASSESSMENTS_PER_DAY,
    TEAM_MAX_SIZE,
    TEAM_MIN_SIZE,
    TeamComponentWeightEntry,
)
from mnemom_types.risk_constants import (
    ACTION_TYPE_PROFILES,
    CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT,
    CIRCUIT_BREAKER_MIN_REPUTATION,
    COHERENCE_SUBWEIGHTS,
    CONFIDENCE_PENALTIES,
    INDIVIDUAL_RISK_WEIGHTS,
    RECENCY_HALF_LIFE_DAYS,
    RISK_THRESHOLDS,
    TEAM_RISK_WEIGHTS,
    VIOLATION_SEVERITY_WEIGHTS,
    ActionTypeProfile,
    IndividualRiskWeights,
    RiskThresholdSet,
    TeamRiskWeights,
)

__all__ = [
    # Reputation types
    "ReputationGrade",
    "ConfidenceLevel",
    "ReputationComponent",
    "ReputationScore",
    "A2ATrustExtension",
    # Gate types
    "ReputationGateConfig",
    "GateResult",
    # Reputation constants
    "GRADE_ORDINALS",
    "GRADE_SCALE",
    "COMPONENT_WEIGHTS",
    "GradeScaleEntry",
    "ComponentWeightEntry",
    # Risk types
    "RiskLevel",
    "RiskRecommendation",
    "TeamRecommendation",
    "ActionType",
    "RiskTolerance",
    "CoordinationMode",
    "SynergyType",
    "ProofStatus",
    "RiskContext",
    "ContributingFactor",
    "RiskAssessment",
    "TeamOutlier",
    "TeamCluster",
    "ValueDivergence",
    "TeamRiskAssessment",
    # Risk constants
    "ACTION_TYPE_PROFILES",
    "RISK_THRESHOLDS",
    "TEAM_RISK_WEIGHTS",
    "INDIVIDUAL_RISK_WEIGHTS",
    "VIOLATION_SEVERITY_WEIGHTS",
    "RECENCY_HALF_LIFE_DAYS",
    "CONFIDENCE_PENALTIES",
    "COHERENCE_SUBWEIGHTS",
    "CIRCUIT_BREAKER_MIN_REPUTATION",
    "CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT",
    "ActionTypeProfile",
    "RiskThresholdSet",
    "TeamRiskWeights",
    "IndividualRiskWeights",
    # Team types
    "TeamStatus",
    "Team",
    "TeamMember",
    "RosterChangeType",
    "TeamRosterChange",
    "TeamCardSource",
    "TeamCoordinationMode",
    "TeamMemberRequirements",
    "TeamAlignmentCardMeta",
    "TeamReputationComponentKey",
    "TeamReputationComponent",
    "TeamReputationScore",
    "A2ATeamTrustExtension",
    "TeamReputationSnapshot",
    # Team constants
    "TEAM_COMPONENT_WEIGHTS",
    "TEAM_ELIGIBILITY_THRESHOLD",
    "TEAM_MAX_SIZE",
    "TEAM_MIN_SIZE",
    "TEAM_MAX_ASSESSMENTS_PER_DAY",
    "TEAM_CONFIDENCE_THRESHOLDS",
    "CQ_MISSION_BLEND",
    "ROSTER_CHURN_PENALTY_PER_CHANGE",
    "ROSTER_CHURN_LOOKBACK_DAYS",
    "TeamComponentWeightEntry",
]
