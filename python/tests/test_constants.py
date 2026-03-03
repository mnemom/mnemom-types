"""Tests for reputation and risk constants."""

import math

from mnemom_types import (
    GRADE_ORDINALS,
    GRADE_SCALE,
    COMPONENT_WEIGHTS,
    ACTION_TYPE_PROFILES,
    RISK_THRESHOLDS,
    TEAM_RISK_WEIGHTS,
    INDIVIDUAL_RISK_WEIGHTS,
    VIOLATION_SEVERITY_WEIGHTS,
    RECENCY_HALF_LIFE_DAYS,
    CONFIDENCE_PENALTIES,
    COHERENCE_SUBWEIGHTS,
    CIRCUIT_BREAKER_MIN_REPUTATION,
    CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT,
    TEAM_COMPONENT_WEIGHTS,
    TEAM_ELIGIBILITY_THRESHOLD,
    TEAM_MAX_SIZE,
    TEAM_MIN_SIZE,
    TEAM_MAX_ASSESSMENTS_PER_DAY,
    TEAM_CONFIDENCE_THRESHOLDS,
    CQ_MISSION_BLEND,
    ROSTER_CHURN_PENALTY_PER_CHANGE,
    ROSTER_CHURN_LOOKBACK_DAYS,
)


# ── GRADE_ORDINALS ──────────────────────────────────────────────

class TestGradeOrdinals:
    def test_has_8_grades(self):
        assert len(GRADE_ORDINALS) == 8

    def test_ordinal_values(self):
        assert GRADE_ORDINALS["NR"] == 0
        assert GRADE_ORDINALS["CCC"] == 1
        assert GRADE_ORDINALS["AAA"] == 7

    def test_strictly_increasing(self):
        sorted_pairs = sorted(GRADE_ORDINALS.items(), key=lambda x: x[1])
        for i in range(1, len(sorted_pairs)):
            assert sorted_pairs[i][1] > sorted_pairs[i - 1][1]


# ── GRADE_SCALE ─────────────────────────────────────────────────

class TestGradeScale:
    def test_has_7_entries(self):
        assert len(GRADE_SCALE) == 7

    def test_sorted_highest_to_lowest(self):
        for i in range(1, len(GRADE_SCALE)):
            assert GRADE_SCALE[i - 1]["min"] > GRADE_SCALE[i]["min"]

    def test_covers_200_to_1000(self):
        assert GRADE_SCALE[0]["max"] == 1000
        assert GRADE_SCALE[-1]["min"] == 200

    def test_no_gaps_or_overlaps(self):
        for i in range(1, len(GRADE_SCALE)):
            assert GRADE_SCALE[i]["max"] == GRADE_SCALE[i - 1]["min"] - 1


# ── COMPONENT_WEIGHTS ──────────────────────────────────────────

class TestComponentWeights:
    def test_has_5_components(self):
        assert len(COMPONENT_WEIGHTS) == 5

    def test_weights_sum_to_1(self):
        total = sum(c["weight"] for c in COMPONENT_WEIGHTS)
        assert math.isclose(total, 1.0, rel_tol=1e-9)

    def test_unique_keys(self):
        keys = [c["key"] for c in COMPONENT_WEIGHTS]
        assert len(set(keys)) == len(keys)


# ── ACTION_TYPE_PROFILES ────────────────────────────────────────

class TestActionTypeProfiles:
    def test_has_6_profiles(self):
        assert len(ACTION_TYPE_PROFILES) == 6

    def test_each_profile_sums_to_1(self):
        for name, profile in ACTION_TYPE_PROFILES.items():
            total = sum(profile.values())
            assert math.isclose(total, 1.0, rel_tol=1e-9), f"{name} sums to {total}"

    def test_all_values_between_0_and_1(self):
        for profile in ACTION_TYPE_PROFILES.values():
            for val in profile.values():
                assert 0 <= val <= 1


# ── RISK_THRESHOLDS ────────────────────────────────────────────

class TestRiskThresholds:
    def test_has_3_tolerances(self):
        assert set(RISK_THRESHOLDS.keys()) == {"conservative", "moderate", "aggressive"}

    def test_ascending_within_each(self):
        for t in RISK_THRESHOLDS.values():
            assert t["low"] < t["medium"] < t["high"]

    def test_aggressive_higher_than_conservative(self):
        assert RISK_THRESHOLDS["aggressive"]["low"] > RISK_THRESHOLDS["conservative"]["low"]
        assert RISK_THRESHOLDS["aggressive"]["high"] > RISK_THRESHOLDS["conservative"]["high"]


# ── COMPOSITION WEIGHTS ────────────────────────────────────────

class TestCompositionWeights:
    def test_team_risk_weights_sum_to_1(self):
        total = sum(TEAM_RISK_WEIGHTS.values())
        assert math.isclose(total, 1.0, rel_tol=1e-9)

    def test_individual_risk_weights_sum_to_1(self):
        total = sum(INDIVIDUAL_RISK_WEIGHTS.values())
        assert math.isclose(total, 1.0, rel_tol=1e-9)


# ── VIOLATION SEVERITY ─────────────────────────────────────────

class TestViolationSeverity:
    def test_has_4_levels(self):
        assert len(VIOLATION_SEVERITY_WEIGHTS) == 4

    def test_critical_is_1(self):
        assert VIOLATION_SEVERITY_WEIGHTS["critical"] == 1.0

    def test_descending_order(self):
        assert (
            VIOLATION_SEVERITY_WEIGHTS["critical"]
            > VIOLATION_SEVERITY_WEIGHTS["high"]
            > VIOLATION_SEVERITY_WEIGHTS["medium"]
            > VIOLATION_SEVERITY_WEIGHTS["low"]
        )


# ── CONFIDENCE PENALTIES ───────────────────────────────────────

class TestConfidencePenalties:
    def test_high_is_zero(self):
        assert CONFIDENCE_PENALTIES["high"] == 0.0

    def test_increases_with_lower_confidence(self):
        assert (
            CONFIDENCE_PENALTIES["insufficient"]
            > CONFIDENCE_PENALTIES["low"]
            > CONFIDENCE_PENALTIES["medium"]
            > CONFIDENCE_PENALTIES["high"]
        )


# ── COHERENCE SUBWEIGHTS ──────────────────────────────────────

class TestCoherenceSubweights:
    def test_sums_to_1(self):
        total = sum(COHERENCE_SUBWEIGHTS.values())
        assert math.isclose(total, 1.0, rel_tol=1e-9)


# ── SCALARS ────────────────────────────────────────────────────

class TestScalarConstants:
    def test_recency_half_life(self):
        assert RECENCY_HALF_LIFE_DAYS == 30

    def test_circuit_breaker_reputation(self):
        assert CIRCUIT_BREAKER_MIN_REPUTATION == 200

    def test_circuit_breaker_boundary(self):
        assert CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT == 100


# ── TEAM CONSTANTS ─────────────────────────────────────────────

class TestTeamConstants:
    def test_component_weights_count(self):
        assert len(TEAM_COMPONENT_WEIGHTS) == 5

    def test_component_weights_sum_to_1(self):
        total = sum(c["weight"] for c in TEAM_COMPONENT_WEIGHTS)
        assert math.isclose(total, 1.0, rel_tol=1e-9)

    def test_component_keys(self):
        keys = [c["key"] for c in TEAM_COMPONENT_WEIGHTS]
        assert keys == [
            "coherence_history",
            "member_quality",
            "operational_record",
            "structural_stability",
            "assessment_density",
        ]

    def test_eligibility_threshold(self):
        assert TEAM_ELIGIBILITY_THRESHOLD == 10

    def test_team_size_bounds(self):
        assert TEAM_MIN_SIZE == 2
        assert TEAM_MAX_SIZE == 50
        assert TEAM_MAX_SIZE > TEAM_MIN_SIZE

    def test_max_assessments(self):
        assert TEAM_MAX_ASSESSMENTS_PER_DAY == 100

    def test_confidence_thresholds_ascending(self):
        assert (
            TEAM_CONFIDENCE_THRESHOLDS["insufficient"]
            < TEAM_CONFIDENCE_THRESHOLDS["low"]
            < TEAM_CONFIDENCE_THRESHOLDS["medium"]
            < TEAM_CONFIDENCE_THRESHOLDS["high"]
        )

    def test_cq_mission_blend_sums_to_1(self):
        total = CQ_MISSION_BLEND["member"] + CQ_MISSION_BLEND["mission"]
        assert math.isclose(total, 1.0, rel_tol=1e-9)

    def test_roster_churn(self):
        assert ROSTER_CHURN_PENALTY_PER_CHANGE == 50
        assert ROSTER_CHURN_LOOKBACK_DAYS == 90
