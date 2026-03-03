"""Tests for Pydantic model validation and serialization."""

import json

import pytest
from pydantic import ValidationError

from mnemom_types import (
    ReputationComponent,
    ReputationScore,
    A2ATrustExtension,
    ReputationGateConfig,
    GateResult,
    RiskContext,
    ContributingFactor,
    RiskAssessment,
    TeamOutlier,
    TeamCluster,
    ValueDivergence,
    TeamRiskAssessment,
    Team,
    TeamMember,
    TeamRosterChange,
    TeamMemberRequirements,
    TeamAlignmentCardMeta,
    TeamReputationComponent,
    TeamReputationScore,
    TeamReputationSnapshot,
    A2ATeamTrustExtension,
)


# ── Fixtures ────────────────────────────────────────────────────

def _component(**overrides) -> dict:
    base = {
        "key": "integrity_ratio",
        "label": "Integrity Ratio",
        "score": 900,
        "weight": 0.4,
        "weighted_score": 360,
        "factors": ["High clear rate"],
    }
    return {**base, **overrides}


def _reputation_score(**overrides) -> dict:
    base = {
        "agent_id": "agent-001",
        "score": 850,
        "grade": "AA",
        "tier": "Established",
        "is_eligible": True,
        "checkpoint_count": 120,
        "confidence": "high",
        "components": [_component()],
        "computed_at": "2026-03-01T00:00:00Z",
        "trend_30d": 5.2,
        "visibility": "public",
    }
    return {**base, **overrides}


def _a2a_extension(**overrides) -> dict:
    base = {
        "extension_uri": "https://mnemom.ai/ext/trust/v1",
        "provider": "mnemom",
        "score": 850,
        "grade": "AA",
        "confidence": "high",
        "verified_url": "https://api.mnemom.ai/verify/agent-001",
        "badge_url": "https://mnemom.ai/badge/agent-001",
        "methodology_url": "https://mnemom.ai/methodology",
        "last_updated": "2026-03-01T00:00:00Z",
    }
    return {**base, **overrides}


def _risk_assessment(**overrides) -> dict:
    base = {
        "assessment_id": "ra-001",
        "agent_id": "agent-001",
        "risk_score": 0.65,
        "risk_level": "high",
        "recommendation": "review",
        "confidence": 0.85,
        "contributing_factors": [],
        "suggested_thresholds": {"low": 0.25, "medium": 0.5, "high": 0.75},
        "explanation": "Elevated risk",
        "created_at": "2026-03-01T00:00:00Z",
    }
    return {**base, **overrides}


# ── ReputationComponent ────────────────────────────────────────

class TestReputationComponent:
    def test_valid(self):
        c = ReputationComponent(**_component())
        assert c.key == "integrity_ratio"
        assert c.score == 900

    def test_missing_required_field_raises(self):
        data = _component()
        del data["key"]
        with pytest.raises(ValidationError):
            ReputationComponent(**data)

    def test_defaults_factors_to_empty_list(self):
        data = _component()
        del data["factors"]
        c = ReputationComponent(**data)
        assert c.factors == []


# ── ReputationScore ────────────────────────────────────────────

class TestReputationScore:
    def test_valid(self):
        s = ReputationScore(**_reputation_score())
        assert s.agent_id == "agent-001"
        assert s.grade == "AA"

    def test_invalid_grade_raises(self):
        with pytest.raises(ValidationError):
            ReputationScore(**_reputation_score(grade="AAAA"))

    def test_invalid_confidence_raises(self):
        with pytest.raises(ValidationError):
            ReputationScore(**_reputation_score(confidence="very_high"))

    def test_invalid_visibility_raises(self):
        with pytest.raises(ValidationError):
            ReputationScore(**_reputation_score(visibility="secret"))

    def test_optional_a2a_extension(self):
        s = ReputationScore(**_reputation_score())
        assert s.a2a_trust_extension is None

        s2 = ReputationScore(
            **_reputation_score(a2a_trust_extension=_a2a_extension())
        )
        assert s2.a2a_trust_extension is not None
        assert s2.a2a_trust_extension.provider == "mnemom"

    def test_json_round_trip(self):
        s = ReputationScore(**_reputation_score())
        dumped = s.model_dump_json()
        restored = ReputationScore.model_validate_json(dumped)
        assert restored == s


# ── A2ATrustExtension ──────────────────────────────────────────

class TestA2ATrustExtension:
    def test_valid(self):
        ext = A2ATrustExtension(**_a2a_extension())
        assert ext.provider == "mnemom"

    def test_json_round_trip(self):
        ext = A2ATrustExtension(**_a2a_extension())
        restored = A2ATrustExtension.model_validate_json(ext.model_dump_json())
        assert restored == ext


# ── Gate types ─────────────────────────────────────────────────

class TestGateTypes:
    def test_gate_config_defaults(self):
        cfg = ReputationGateConfig()
        assert cfg.min_score is None
        assert cfg.min_grade is None
        assert cfg.base_url == "https://api.mnemom.ai"

    def test_gate_result(self):
        r = GateResult(allowed=False, reason="Below threshold")
        assert r.allowed is False
        assert r.score is None

    def test_gate_result_with_score(self):
        score = ReputationScore(**_reputation_score())
        r = GateResult(allowed=True, score=score)
        assert r.allowed is True
        assert r.score.agent_id == "agent-001"


# ── Risk types ─────────────────────────────────────────────────

class TestRiskContext:
    def test_minimal(self):
        ctx = RiskContext(action_type="data_access")
        assert ctx.action_type == "data_access"
        assert ctx.amount is None

    def test_full(self):
        ctx = RiskContext(
            action_type="financial_transaction",
            amount=1000,
            counterparty_id="agent-002",
            use_case="payment",
            risk_tolerance="conservative",
            team_task="joint op",
            coordination_mode="consensus",
        )
        assert ctx.amount == 1000
        assert ctx.coordination_mode == "consensus"

    def test_invalid_action_type_raises(self):
        with pytest.raises(ValidationError):
            RiskContext(action_type="invalid_action")


class TestContributingFactor:
    def test_valid(self):
        f = ContributingFactor(
            component="integrity_ratio",
            label="Integrity",
            weight=0.4,
            raw_value=300,
            risk_contribution=0.28,
            explanation="Low integrity",
        )
        assert f.risk_contribution == 0.28


class TestRiskAssessment:
    def test_valid(self):
        a = RiskAssessment(**_risk_assessment())
        assert a.risk_level == "high"

    def test_invalid_risk_level_raises(self):
        with pytest.raises(ValidationError):
            RiskAssessment(**_risk_assessment(risk_level="extreme"))

    def test_json_round_trip(self):
        a = RiskAssessment(**_risk_assessment())
        restored = RiskAssessment.model_validate_json(a.model_dump_json())
        assert restored == a

    def test_with_proof(self):
        a = RiskAssessment(
            **_risk_assessment(proof_id="zk-001", proof_status="verified")
        )
        assert a.proof_status == "verified"


class TestTeamRiskAssessment:
    def test_minimal(self):
        tra = TeamRiskAssessment(
            assessment_id="tra-001",
            team_risk_score=0.35,
            team_risk_level="medium",
            team_coherence_score=0.7,
            team_recommendation="approve_team",
            portfolio_risk=0.3,
            coherence_risk=0.2,
            concentration_risk=0.1,
            weakest_link_risk=0.4,
            shapley_values={"a1": 0.5, "a2": 0.5},
            synergy_type="synergistic",
            explanation="OK",
            created_at="2026-03-01T00:00:00Z",
        )
        assert tra.team_recommendation == "approve_team"

    def test_json_round_trip(self):
        tra = TeamRiskAssessment(
            assessment_id="tra-001",
            team_risk_score=0.35,
            team_risk_level="medium",
            team_coherence_score=0.7,
            team_recommendation="approve_team",
            portfolio_risk=0.3,
            coherence_risk=0.2,
            concentration_risk=0.1,
            weakest_link_risk=0.4,
            shapley_values={},
            synergy_type="neutral",
            explanation="OK",
            created_at="2026-03-01T00:00:00Z",
        )
        restored = TeamRiskAssessment.model_validate_json(tra.model_dump_json())
        assert restored == tra


# ── Team types ─────────────────────────────────────────────────

class TestTeam:
    def test_valid(self):
        t = Team(
            id="team-001",
            org_id="org-001",
            name="Alpha",
            status="active",
            member_count=5,
            created_at="2026-01-01T00:00:00Z",
            updated_at="2026-03-01T00:00:00Z",
        )
        assert t.name == "Alpha"
        assert t.description is None

    def test_invalid_status_raises(self):
        with pytest.raises(ValidationError):
            Team(
                id="t",
                org_id="o",
                name="X",
                status="deleted",
                member_count=1,
                created_at="2026-01-01T00:00:00Z",
                updated_at="2026-01-01T00:00:00Z",
            )


class TestTeamMember:
    def test_active_member(self):
        m = TeamMember(
            team_id="team-001",
            agent_id="agent-001",
            added_at="2026-01-15T00:00:00Z",
        )
        assert m.removed_at is None

    def test_removed_member(self):
        m = TeamMember(
            team_id="team-001",
            agent_id="agent-001",
            added_at="2026-01-15T00:00:00Z",
            removed_at="2026-02-01T00:00:00Z",
        )
        assert m.removed_at is not None


class TestTeamRosterChange:
    def test_valid(self):
        rc = TeamRosterChange(
            id="rc-001",
            team_id="team-001",
            change_type="agent_added",
            agent_id="agent-005",
            created_at="2026-02-01T00:00:00Z",
        )
        assert rc.actor_id is None


class TestTeamAlignmentCardMeta:
    def test_minimal(self):
        meta = TeamAlignmentCardMeta(team_id="team-001", card_source="manual")
        assert meta.team_mission is None

    def test_full(self):
        meta = TeamAlignmentCardMeta(
            team_id="team-001",
            card_source="hybrid",
            team_mission="Provide financial analysis",
            coordination_mode="collaborative",
            member_requirements=TeamMemberRequirements(
                required_values=["transparency"],
                min_retention_days=90,
            ),
        )
        assert meta.member_requirements.min_retention_days == 90


# ── Team Reputation types ──────────────────────────────────────

class TestTeamReputationComponent:
    def test_valid(self):
        c = TeamReputationComponent(
            key="coherence_history",
            label="Coherence History",
            score=750,
            weight=0.35,
            weighted_score=263,
        )
        assert c.key == "coherence_history"

    def test_invalid_key_raises(self):
        with pytest.raises(ValidationError):
            TeamReputationComponent(
                key="invalid_key",
                label="Bad",
                score=0,
                weight=0,
                weighted_score=0,
            )


class TestTeamReputationScore:
    def test_json_round_trip(self):
        ts = TeamReputationScore(
            team_id="team-001",
            team_name="Alpha",
            score=780,
            grade="A",
            confidence="medium",
            is_eligible=True,
            components=[
                TeamReputationComponent(
                    key="coherence_history",
                    label="Coherence History",
                    score=750,
                    weight=0.35,
                    weighted_score=263,
                )
            ],
            total_assessments=50,
            trend_30d=3.1,
            visibility="public",
            computed_at="2026-03-01T00:00:00Z",
            member_count=5,
        )
        restored = TeamReputationScore.model_validate_json(ts.model_dump_json())
        assert restored == ts


class TestTeamReputationSnapshot:
    def test_valid(self):
        snap = TeamReputationSnapshot(
            team_id="team-001",
            week_start="2026-02-24",
            score=780,
            grade="A",
            components={
                "coherence_history": 750,
                "member_quality": 800,
                "operational_record": 700,
                "structural_stability": 900,
                "assessment_density": 600,
            },
            created_at="2026-03-01T00:00:00Z",
        )
        assert snap.components["member_quality"] == 800


class TestA2ATeamTrustExtension:
    def test_defaults(self):
        ext = A2ATeamTrustExtension(
            score=780,
            grade="A",
            confidence="medium",
            member_count=5,
            verified_url="https://example.com/verify",
            badge_url="https://example.com/badge",
            methodology_url="https://example.com/method",
            last_updated="2026-03-01T00:00:00Z",
        )
        assert ext.extension_uri == "https://mnemom.ai/ext/team-trust/v1"
        assert ext.provider == "mnemom"
