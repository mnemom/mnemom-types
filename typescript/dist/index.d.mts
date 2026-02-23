/**
 * Reputation score types.
 *
 * Canonical definitions for Mnemom reputation scores, grades,
 * confidence levels, and score components.
 */
/** Reputation grade scale from AAA (highest) to NR (not rated). */
type ReputationGrade = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'NR';
/** Confidence level of a reputation score. */
type ConfidenceLevel = 'insufficient' | 'low' | 'medium' | 'high';
/** A single component contributing to an agent's reputation score. */
interface ReputationComponent {
    /** Machine-readable key (e.g. "integrity_ratio", "compliance") */
    key: string;
    /** Human-readable label (e.g. "Integrity Ratio", "Compliance") */
    label: string;
    /** Raw component score (0-1000) */
    score: number;
    /** Weight applied to this component (0-1) */
    weight: number;
    /** score * weight, rounded */
    weighted_score: number;
    /** Human-readable factors explaining the score */
    factors: string[];
}
/** Full reputation score for an agent. */
interface ReputationScore {
    /** Agent identifier */
    agent_id: string;
    /** Numeric reputation score (0-1000) */
    score: number;
    /** Letter grade */
    grade: ReputationGrade;
    /** Tier label (e.g. "Exemplary", "Reliable") */
    tier: string;
    /** Whether the agent is eligible for reputation (checkpoint_count >= 50) */
    is_eligible: boolean;
    /** Number of checkpoints contributing to the score */
    checkpoint_count: number;
    /** Confidence in the score */
    confidence: ConfidenceLevel;
    /** Score components breakdown */
    components: ReputationComponent[];
    /** When the score was computed (ISO 8601) */
    computed_at: string;
    /** 30-day score trend (positive = improving) */
    trend_30d: number;
    /** Visibility setting */
    visibility: 'public' | 'unlisted' | 'private';
    /** Optional A2A trust extension */
    a2a_trust_extension?: A2ATrustExtension;
}
/** A2A trust extension for inter-agent reputation sharing. */
interface A2ATrustExtension {
    /** URI identifying this extension */
    extension_uri: string;
    /** Reputation provider identifier */
    provider: string;
    /** Numeric reputation score */
    score: number;
    /** Letter grade */
    grade: ReputationGrade;
    /** Confidence in the score */
    confidence: ConfidenceLevel;
    /** URL to verify the score */
    verified_url: string;
    /** URL to the agent's badge */
    badge_url: string;
    /** URL to the scoring methodology */
    methodology_url: string;
    /** When the score was last updated (ISO 8601) */
    last_updated: string;
}

/**
 * Reputation gate types.
 *
 * Types for gating agent interactions based on reputation
 * score and grade thresholds.
 */

/** Configuration for a reputation gate. */
interface ReputationGateConfig {
    /** Minimum numeric score required (0-1000) */
    minScore?: number;
    /** Minimum letter grade required */
    minGrade?: ReputationGrade;
    /** Base URL for the reputation API */
    baseUrl?: string;
}
/** Result of a reputation gate check. */
interface GateResult {
    /** Whether the agent is allowed through the gate */
    allowed: boolean;
    /** The agent's reputation score (null if fetch failed) */
    score: ReputationScore | null;
    /** Human-readable reason for denial (if not allowed) */
    reason?: string;
}

/**
 * Reputation constants.
 *
 * Centralizes grade ordinals, grade scale definitions, and
 * component weight definitions used across all services and SDKs.
 */

/** Ordinal ranking of reputation grades (higher = better). */
declare const GRADE_ORDINALS: Record<ReputationGrade, number>;
/** Grade scale definition with tier names and score boundaries. */
interface GradeScaleEntry {
    grade: ReputationGrade;
    tier: string;
    min: number;
    max: number;
}
/** Grade scale from highest to lowest. */
declare const GRADE_SCALE: GradeScaleEntry[];
/** Component weight definition. */
interface ComponentWeightEntry {
    key: string;
    label: string;
    weight: number;
    source: string;
}
/** Scoring component weights. */
declare const COMPONENT_WEIGHTS: ComponentWeightEntry[];

/**
 * Risk assessment types.
 *
 * Defines types for individual and team risk assessment,
 * context-aware decisioning, and ZK-proven risk classification.
 */
/** Risk severity level. */
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
/** Recommendation for an individual agent action. */
type RiskRecommendation = 'approve' | 'review' | 'deny';
/** Recommendation for a team operation. */
type TeamRecommendation = 'approve_team' | 'approve_individuals_only' | 'review' | 'deny';
/** Type of action being assessed. */
type ActionType = 'financial_transaction' | 'data_access' | 'task_delegation' | 'tool_invocation' | 'autonomous_operation' | 'multi_agent_coordination';
/** Caller's risk appetite. */
type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
/** How agents in a team coordinate. */
type CoordinationMode = 'parallel' | 'sequential' | 'hierarchical' | 'consensus';
/** Synergy classification for a team. */
type SynergyType = 'synergistic' | 'neutral' | 'anti-synergistic';
/** ZK proof status. */
type ProofStatus = 'none' | 'pending' | 'proving' | 'verified' | 'failed';
/** Context provided by the caller when requesting a risk assessment. */
interface RiskContext {
    action_type: ActionType;
    amount?: number;
    counterparty_id?: string;
    use_case?: string;
    risk_tolerance?: RiskTolerance;
    team_task?: string;
    coordination_mode?: CoordinationMode;
}
/** A single factor contributing to the risk score. */
interface ContributingFactor {
    component: string;
    label: string;
    weight: number;
    raw_value: number;
    risk_contribution: number;
    explanation: string;
}
/** Result of an individual risk assessment. */
interface RiskAssessment {
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
/** An agent flagged as a statistical outlier within the team. */
interface TeamOutlier {
    agent_id: string;
    individual_risk_score: number;
    shapley_value: number;
    systemic_contribution: number;
    primary_risk_factors: string[];
}
/** A cluster of agents sharing correlated risk. */
interface TeamCluster {
    cluster_id: string;
    agent_ids: string[];
    internal_risk: number;
    shared_risk_factors: string[];
}
/** A value declared by some agents but missing / conflicting in others. */
interface ValueDivergence {
    value: string;
    declaring_agents: string[];
    missing_agents: string[];
    conflicting_agents: string[];
    risk_impact: number;
}
/** Result of a team risk assessment. */
interface TeamRiskAssessment {
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

/**
 * Risk assessment constants.
 *
 * Centralizes action-type weight profiles, risk thresholds,
 * and composition weights used by the risk engine.
 */

/** Weight overrides for reputation components per action type. */
interface ActionTypeProfile {
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
declare const ACTION_TYPE_PROFILES: Record<ActionType, ActionTypeProfile>;
/** Boundary thresholds for risk level classification. */
interface RiskThresholdSet {
    low: number;
    medium: number;
    high: number;
}
/**
 * Risk level boundaries per tolerance.
 *
 * Score < low → low risk, < medium → medium, < high → high, >= high → critical.
 */
declare const RISK_THRESHOLDS: Record<RiskTolerance, RiskThresholdSet>;
/** Weights for the team risk composite score. */
interface TeamRiskWeights {
    portfolio: number;
    coherence: number;
    weakest_link: number;
    concentration: number;
}
declare const TEAM_RISK_WEIGHTS: TeamRiskWeights;
/** Weights for the individual risk composite score. */
interface IndividualRiskWeights {
    context: number;
    recency: number;
    confidence_penalty: number;
}
declare const INDIVIDUAL_RISK_WEIGHTS: IndividualRiskWeights;
/** Severity weights for violation recency penalty. */
declare const VIOLATION_SEVERITY_WEIGHTS: Record<string, number>;
/** Half-life in days for the exponential decay of violations. */
declare const RECENCY_HALF_LIFE_DAYS = 30;
/** Confidence penalty values by confidence level. */
declare const CONFIDENCE_PENALTIES: Record<string, number>;
/** Pairwise coherence sub-component weights. */
declare const COHERENCE_SUBWEIGHTS: {
    readonly value_overlap: 0.35;
    readonly priority_alignment: 0.25;
    readonly behavioral_corr_penalty: 0.15;
    readonly boundary_compatibility: 0.25;
};
/** Minimum reputation score before circuit breaker fires. */
declare const CIRCUIT_BREAKER_MIN_REPUTATION = 200;
/** Minimum pairwise boundary compatibility before circuit breaker fires. */
declare const CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT = 100;
/** Team risk score boundaries for recommendation mapping. */
declare const TEAM_RECOMMENDATION_THRESHOLDS: Record<string, {
    max: number;
    level: RiskLevel;
}>;

export { type A2ATrustExtension, ACTION_TYPE_PROFILES, type ActionType, type ActionTypeProfile, CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT, CIRCUIT_BREAKER_MIN_REPUTATION, COHERENCE_SUBWEIGHTS, COMPONENT_WEIGHTS, CONFIDENCE_PENALTIES, type ComponentWeightEntry, type ConfidenceLevel, type ContributingFactor, type CoordinationMode, GRADE_ORDINALS, GRADE_SCALE, type GateResult, type GradeScaleEntry, INDIVIDUAL_RISK_WEIGHTS, type IndividualRiskWeights, type ProofStatus, RECENCY_HALF_LIFE_DAYS, RISK_THRESHOLDS, type ReputationComponent, type ReputationGateConfig, type ReputationGrade, type ReputationScore, type RiskAssessment, type RiskContext, type RiskLevel, type RiskRecommendation, type RiskThresholdSet, type RiskTolerance, type SynergyType, TEAM_RECOMMENDATION_THRESHOLDS, TEAM_RISK_WEIGHTS, type TeamCluster, type TeamOutlier, type TeamRecommendation, type TeamRiskAssessment, type TeamRiskWeights, VIOLATION_SEVERITY_WEIGHTS, type ValueDivergence };
