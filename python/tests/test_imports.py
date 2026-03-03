"""Test that all public symbols are importable from the top-level package."""

import mnemom_types


EXPECTED_EXPORTS = [
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


def test_all_exports_importable():
    """Every name in __all__ is importable."""
    for name in mnemom_types.__all__:
        assert hasattr(mnemom_types, name), f"{name} in __all__ but not importable"


def test_expected_exports_present():
    """Every expected export is in __all__."""
    for name in EXPECTED_EXPORTS:
        assert name in mnemom_types.__all__, f"{name} missing from __all__"


def test_no_unexpected_exports():
    """__all__ only contains expected exports."""
    extras = set(mnemom_types.__all__) - set(EXPECTED_EXPORTS)
    assert not extras, f"Unexpected exports: {extras}"


def test_submodule_imports():
    """Submodules are importable directly."""
    from mnemom_types import reputation
    from mnemom_types import gate
    from mnemom_types import constants
    from mnemom_types import risk
    from mnemom_types import risk_constants
    from mnemom_types import team
    from mnemom_types import team_constants
    from mnemom_types import a2a

    assert hasattr(reputation, "ReputationScore")
    assert hasattr(gate, "GateResult")
    assert hasattr(constants, "GRADE_ORDINALS")
    assert hasattr(risk, "RiskAssessment")
    assert hasattr(risk_constants, "ACTION_TYPE_PROFILES")
    assert hasattr(team, "Team")
    assert hasattr(team_constants, "TEAM_COMPONENT_WEIGHTS")
    assert hasattr(a2a, "A2ATrustExtension")
