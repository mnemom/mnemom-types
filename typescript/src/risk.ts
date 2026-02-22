/**
 * Risk assessment types.
 *
 * Defines types for individual and team risk assessment,
 * context-aware decisioning, and ZK-proven risk classification.
 */

// ---------------------------------------------------------------------------
// Enums / union types
// ---------------------------------------------------------------------------

/** Risk severity level. */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Recommendation for an individual agent action. */
export type RiskRecommendation = 'approve' | 'review' | 'deny';

/** Recommendation for a team operation. */
export type TeamRecommendation =
  | 'approve_team'
  | 'approve_individuals_only'
  | 'review'
  | 'deny';

/** Type of action being assessed. */
export type ActionType =
  | 'financial_transaction'
  | 'data_access'
  | 'task_delegation'
  | 'tool_invocation'
  | 'autonomous_operation'
  | 'multi_agent_coordination';

/** Caller's risk appetite. */
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

/** How agents in a team coordinate. */
export type CoordinationMode =
  | 'parallel'
  | 'sequential'
  | 'hierarchical'
  | 'consensus';

/** Synergy classification for a team. */
export type SynergyType = 'synergistic' | 'neutral' | 'anti-synergistic';

/** ZK proof status. */
export type ProofStatus =
  | 'none'
  | 'pending'
  | 'proving'
  | 'verified'
  | 'failed';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/** Context provided by the caller when requesting a risk assessment. */
export interface RiskContext {
  action_type: ActionType;
  amount?: number;
  counterparty_id?: string;
  use_case?: string;
  risk_tolerance?: RiskTolerance;
  team_task?: string;
  coordination_mode?: CoordinationMode;
}

// ---------------------------------------------------------------------------
// Individual risk
// ---------------------------------------------------------------------------

/** A single factor contributing to the risk score. */
export interface ContributingFactor {
  component: string;
  label: string;
  weight: number;
  raw_value: number;
  risk_contribution: number;
  explanation: string;
}

/** Result of an individual risk assessment. */
export interface RiskAssessment {
  assessment_id: string;
  agent_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  recommendation: RiskRecommendation;
  confidence: number;
  contributing_factors: ContributingFactor[];
  suggested_thresholds: Record<RiskLevel, number>;
  explanation: string;
  proof_id?: string;
  proof_status?: ProofStatus;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Team risk
// ---------------------------------------------------------------------------

/** An agent flagged as a statistical outlier within the team. */
export interface TeamOutlier {
  agent_id: string;
  individual_risk_score: number;
  shapley_value: number;
  systemic_contribution: number;
  primary_risk_factors: string[];
}

/** A cluster of agents sharing correlated risk. */
export interface TeamCluster {
  cluster_id: string;
  agent_ids: string[];
  internal_risk: number;
  shared_risk_factors: string[];
}

/** A value declared by some agents but missing / conflicting in others. */
export interface ValueDivergence {
  value: string;
  declaring_agents: string[];
  missing_agents: string[];
  conflicting_agents: string[];
  risk_impact: number;
}

/** Result of a team risk assessment. */
export interface TeamRiskAssessment {
  assessment_id: string;
  team_risk_score: number;
  team_risk_level: RiskLevel;
  team_coherence_score: number;
  team_recommendation: TeamRecommendation;
  portfolio_risk: number;
  coherence_risk: number;
  concentration_risk: number;
  weakest_link_risk: number;
  individual_assessments: RiskAssessment[];
  outliers: TeamOutlier[];
  clusters: TeamCluster[];
  value_divergences: ValueDivergence[];
  shapley_values: Record<string, number>;
  synergy_type: SynergyType;
  explanation: string;
  proof_id?: string;
  proof_status?: ProofStatus;
  created_at: string;
}
