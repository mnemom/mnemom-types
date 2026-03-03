import { describe, it, expect } from 'vitest';

import type {
  ReputationScore,
  ReputationComponent,
  A2ATrustExtension,
  ReputationGateConfig,
  GateResult,
  RiskAssessment,
  ContributingFactor,
  RiskContext,
  TeamRiskAssessment,
  TeamOutlier,
  TeamCluster,
  ValueDivergence,
  Team,
  TeamMember,
  TeamRosterChange,
  TeamReputationScore,
  TeamReputationComponent,
  TeamReputationSnapshot,
  TeamAlignmentCardMeta,
} from '../index';

describe('serialization round-trips', () => {
  it('ReputationScore survives JSON round-trip', () => {
    const score: ReputationScore = {
      agent_id: 'agent-001',
      score: 850,
      grade: 'AA',
      tier: 'Established',
      is_eligible: true,
      checkpoint_count: 120,
      confidence: 'high',
      components: [
        {
          key: 'integrity_ratio',
          label: 'Integrity Ratio',
          score: 900,
          weight: 0.4,
          weighted_score: 360,
          factors: ['High clear rate'],
        },
      ],
      computed_at: '2026-03-01T00:00:00Z',
      trend_30d: 5.2,
      visibility: 'public',
    };

    const roundTripped = JSON.parse(JSON.stringify(score));
    expect(roundTripped).toEqual(score);
  });

  it('ReputationScore with A2A extension survives round-trip', () => {
    const extension: A2ATrustExtension = {
      extension_uri: 'https://mnemom.ai/ext/trust/v1',
      provider: 'mnemom',
      score: 850,
      grade: 'AA',
      confidence: 'high',
      verified_url: 'https://api.mnemom.ai/verify/agent-001',
      badge_url: 'https://mnemom.ai/badge/agent-001',
      methodology_url: 'https://mnemom.ai/methodology',
      last_updated: '2026-03-01T00:00:00Z',
    };

    const score: ReputationScore = {
      agent_id: 'agent-001',
      score: 850,
      grade: 'AA',
      tier: 'Established',
      is_eligible: true,
      checkpoint_count: 120,
      confidence: 'high',
      components: [],
      computed_at: '2026-03-01T00:00:00Z',
      trend_30d: 5.2,
      visibility: 'public',
      a2a_trust_extension: extension,
    };

    const roundTripped = JSON.parse(JSON.stringify(score));
    expect(roundTripped).toEqual(score);
  });

  it('GateResult survives round-trip', () => {
    const result: GateResult = {
      allowed: false,
      score: null,
      reason: 'Score below minimum threshold',
    };

    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it('RiskAssessment survives round-trip', () => {
    const factor: ContributingFactor = {
      component: 'integrity_ratio',
      label: 'Integrity Ratio',
      weight: 0.4,
      raw_value: 300,
      risk_contribution: 0.28,
      explanation: 'Low integrity ratio',
    };

    const assessment: RiskAssessment = {
      assessment_id: 'ra-001',
      agent_id: 'agent-001',
      risk_score: 0.65,
      risk_level: 'high',
      recommendation: 'review',
      confidence: 0.85,
      contributing_factors: [factor],
      suggested_thresholds: { low: 0.25, medium: 0.5, high: 0.75, critical: 1.0 },
      explanation: 'Elevated risk due to low integrity',
      proof_id: 'zk-001',
      proof_status: 'verified',
      created_at: '2026-03-01T00:00:00Z',
    };

    expect(JSON.parse(JSON.stringify(assessment))).toEqual(assessment);
  });

  it('RiskContext survives round-trip', () => {
    const ctx: RiskContext = {
      action_type: 'financial_transaction',
      amount: 1000,
      counterparty_id: 'agent-002',
      use_case: 'payment',
      risk_tolerance: 'conservative',
      team_task: 'joint operation',
      coordination_mode: 'consensus',
    };

    expect(JSON.parse(JSON.stringify(ctx))).toEqual(ctx);
  });

  it('TeamRiskAssessment survives round-trip', () => {
    const assessment: TeamRiskAssessment = {
      assessment_id: 'tra-001',
      team_risk_score: 0.35,
      team_risk_level: 'medium',
      team_coherence_score: 0.7,
      team_recommendation: 'approve_team',
      portfolio_risk: 0.3,
      coherence_risk: 0.2,
      concentration_risk: 0.1,
      weakest_link_risk: 0.4,
      individual_assessments: [],
      outliers: [
        {
          agent_id: 'agent-003',
          individual_risk_score: 0.8,
          shapley_value: 0.3,
          systemic_contribution: 0.15,
          primary_risk_factors: ['low compliance'],
        },
      ],
      clusters: [
        {
          cluster_id: 'cl-1',
          agent_ids: ['agent-001', 'agent-002'],
          internal_risk: 0.2,
          shared_risk_factors: ['shared domain'],
        },
      ],
      value_divergences: [
        {
          value: 'transparency',
          declaring_agents: ['agent-001'],
          missing_agents: ['agent-003'],
          conflicting_agents: [],
          risk_impact: 0.05,
        },
      ],
      shapley_values: { 'agent-001': 0.3, 'agent-002': 0.3, 'agent-003': 0.4 },
      synergy_type: 'synergistic',
      explanation: 'Moderate team risk with good coherence',
      created_at: '2026-03-01T00:00:00Z',
    };

    expect(JSON.parse(JSON.stringify(assessment))).toEqual(assessment);
  });

  it('Team survives round-trip', () => {
    const team: Team = {
      id: 'team-001',
      org_id: 'org-001',
      name: 'Alpha Squad',
      description: 'Test team',
      status: 'active',
      metadata: { env: 'production' },
      member_count: 5,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
    };

    expect(JSON.parse(JSON.stringify(team))).toEqual(team);
  });

  it('TeamMember survives round-trip', () => {
    const member: TeamMember = {
      team_id: 'team-001',
      agent_id: 'agent-001',
      agent_name: 'Alpha-1',
      added_at: '2026-01-15T00:00:00Z',
      removed_at: null,
    };

    expect(JSON.parse(JSON.stringify(member))).toEqual(member);
  });

  it('TeamRosterChange survives round-trip', () => {
    const change: TeamRosterChange = {
      id: 'rc-001',
      team_id: 'team-001',
      change_type: 'agent_added',
      agent_id: 'agent-005',
      actor_id: null,
      created_at: '2026-02-01T00:00:00Z',
    };

    expect(JSON.parse(JSON.stringify(change))).toEqual(change);
  });

  it('TeamReputationScore survives round-trip', () => {
    const component: TeamReputationComponent = {
      key: 'coherence_history',
      label: 'Coherence History',
      score: 750,
      weight: 0.35,
      weighted_score: 263,
      factors: ['Consistent alignment over 90 days'],
    };

    const teamScore: TeamReputationScore = {
      team_id: 'team-001',
      team_name: 'Alpha Squad',
      score: 780,
      grade: 'A',
      confidence: 'medium',
      is_eligible: true,
      components: [component],
      total_assessments: 50,
      last_assessed: '2026-03-01T00:00:00Z',
      trend_30d: 3.1,
      visibility: 'public',
      computed_at: '2026-03-01T00:00:00Z',
      member_count: 5,
    };

    expect(JSON.parse(JSON.stringify(teamScore))).toEqual(teamScore);
  });

  it('TeamReputationSnapshot survives round-trip', () => {
    const snapshot: TeamReputationSnapshot = {
      team_id: 'team-001',
      week_start: '2026-02-24',
      score: 780,
      grade: 'A',
      components: {
        coherence_history: 750,
        member_quality: 800,
        operational_record: 700,
        structural_stability: 900,
        assessment_density: 600,
      },
      created_at: '2026-03-01T00:00:00Z',
    };

    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
  });

  it('TeamAlignmentCardMeta survives round-trip', () => {
    const meta: TeamAlignmentCardMeta = {
      team_id: 'team-001',
      card_source: 'hybrid',
      team_mission: 'Provide reliable financial analysis',
      coordination_mode: 'collaborative',
      member_requirements: {
        required_values: ['transparency', 'accuracy'],
        min_retention_days: 90,
      },
    };

    expect(JSON.parse(JSON.stringify(meta))).toEqual(meta);
  });
});
