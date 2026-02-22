/**
 * Risk assessment constants.
 *
 * Centralizes action-type weight profiles, risk thresholds,
 * and composition weights used by the risk engine.
 */

import type { ActionType, RiskLevel, RiskTolerance } from './risk';

// ---------------------------------------------------------------------------
// Action-type weight profiles
// ---------------------------------------------------------------------------

/** Weight overrides for reputation components per action type. */
export interface ActionTypeProfile {
  integrity_ratio: number;
  compliance: number;
  drift_stability: number;
  trace_completeness: number;
  coherence_compatibility: number;
}

/**
 * Context-aware component weight overrides.
 *
 * Financial contexts weight compliance higher (0.30 vs default 0.20);
 * delegation contexts weight coherence higher (0.35 vs default 0.10).
 */
export const ACTION_TYPE_PROFILES: Record<ActionType, ActionTypeProfile> = {
  financial_transaction: {
    integrity_ratio: 0.30,
    compliance: 0.30,
    drift_stability: 0.15,
    trace_completeness: 0.10,
    coherence_compatibility: 0.15,
  },
  data_access: {
    integrity_ratio: 0.35,
    compliance: 0.25,
    drift_stability: 0.15,
    trace_completeness: 0.15,
    coherence_compatibility: 0.10,
  },
  task_delegation: {
    integrity_ratio: 0.25,
    compliance: 0.15,
    drift_stability: 0.15,
    trace_completeness: 0.10,
    coherence_compatibility: 0.35,
  },
  tool_invocation: {
    integrity_ratio: 0.40,
    compliance: 0.20,
    drift_stability: 0.20,
    trace_completeness: 0.10,
    coherence_compatibility: 0.10,
  },
  autonomous_operation: {
    integrity_ratio: 0.35,
    compliance: 0.25,
    drift_stability: 0.20,
    trace_completeness: 0.10,
    coherence_compatibility: 0.10,
  },
  multi_agent_coordination: {
    integrity_ratio: 0.20,
    compliance: 0.15,
    drift_stability: 0.15,
    trace_completeness: 0.10,
    coherence_compatibility: 0.40,
  },
};

// ---------------------------------------------------------------------------
// Risk thresholds
// ---------------------------------------------------------------------------

/** Boundary thresholds for risk level classification. */
export interface RiskThresholdSet {
  low: number;
  medium: number;
  high: number;
}

/**
 * Risk level boundaries per tolerance.
 *
 * Score < low → low risk, < medium → medium, < high → high, >= high → critical.
 */
export const RISK_THRESHOLDS: Record<RiskTolerance, RiskThresholdSet> = {
  conservative: { low: 0.15, medium: 0.35, high: 0.55 },
  moderate:     { low: 0.25, medium: 0.50, high: 0.75 },
  aggressive:   { low: 0.35, medium: 0.60, high: 0.85 },
};

// ---------------------------------------------------------------------------
// Composition weights
// ---------------------------------------------------------------------------

/** Weights for the team risk composite score. */
export interface TeamRiskWeights {
  portfolio: number;
  coherence: number;
  weakest_link: number;
  concentration: number;
}

export const TEAM_RISK_WEIGHTS: TeamRiskWeights = {
  portfolio: 0.30,
  coherence: 0.30,
  weakest_link: 0.25,
  concentration: 0.15,
};

/** Weights for the individual risk composite score. */
export interface IndividualRiskWeights {
  context: number;
  recency: number;
  confidence_penalty: number;
}

export const INDIVIDUAL_RISK_WEIGHTS: IndividualRiskWeights = {
  context: 0.60,
  recency: 0.30,
  confidence_penalty: 0.10,
};

// ---------------------------------------------------------------------------
// Recency decay
// ---------------------------------------------------------------------------

/** Severity weights for violation recency penalty. */
export const VIOLATION_SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 1.0,
  high: 0.7,
  medium: 0.4,
  low: 0.1,
};

/** Half-life in days for the exponential decay of violations. */
export const RECENCY_HALF_LIFE_DAYS = 30;

// ---------------------------------------------------------------------------
// Confidence penalty
// ---------------------------------------------------------------------------

/** Confidence penalty values by confidence level. */
export const CONFIDENCE_PENALTIES: Record<string, number> = {
  insufficient: 0.3,
  low: 0.2,
  medium: 0.1,
  high: 0.0,
};

// ---------------------------------------------------------------------------
// Team coherence sub-weights
// ---------------------------------------------------------------------------

/** Pairwise coherence sub-component weights. */
export const COHERENCE_SUBWEIGHTS = {
  value_overlap: 0.35,
  priority_alignment: 0.25,
  behavioral_corr_penalty: 0.15,
  boundary_compatibility: 0.25,
} as const;

// ---------------------------------------------------------------------------
// Circuit breakers
// ---------------------------------------------------------------------------

/** Minimum reputation score before circuit breaker fires. */
export const CIRCUIT_BREAKER_MIN_REPUTATION = 200;

/** Minimum pairwise boundary compatibility before circuit breaker fires. */
export const CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT = 100;

// ---------------------------------------------------------------------------
// Team recommendation mapping
// ---------------------------------------------------------------------------

/** Team risk score boundaries for recommendation mapping. */
export const TEAM_RECOMMENDATION_THRESHOLDS: Record<
  string,
  { max: number; level: RiskLevel }
> = {
  approve_team_low:      { max: 0.20, level: 'low' },
  approve_team_medium:   { max: 0.40, level: 'medium' },
  individuals_only_high: { max: 0.60, level: 'high' },
  deny_critical:         { max: 1.00, level: 'critical' },
};
