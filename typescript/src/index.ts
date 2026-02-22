/**
 * @mnemom/types — Shared type definitions for Mnemom services and SDKs.
 *
 * @example
 * ```typescript
 * import type { ReputationScore, ReputationGrade } from '@mnemom/types';
 * import { GRADE_ORDINALS, COMPONENT_WEIGHTS } from '@mnemom/types';
 * ```
 */

// Reputation types
export type {
  ReputationGrade,
  ConfidenceLevel,
  ReputationComponent,
  ReputationScore,
  A2ATrustExtension,
} from './reputation';

// Gate types
export type {
  ReputationGateConfig,
  GateResult,
} from './gate';

// Constants
export {
  GRADE_ORDINALS,
  GRADE_SCALE,
  COMPONENT_WEIGHTS,
} from './constants';

export type {
  GradeScaleEntry,
  ComponentWeightEntry,
} from './constants';

// Risk types
export type {
  RiskLevel,
  RiskRecommendation,
  TeamRecommendation,
  ActionType,
  RiskTolerance,
  CoordinationMode,
  SynergyType,
  ProofStatus,
  RiskContext,
  ContributingFactor,
  RiskAssessment,
  TeamOutlier,
  TeamCluster,
  ValueDivergence,
  TeamRiskAssessment,
} from './risk';

// Risk constants
export {
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
  TEAM_RECOMMENDATION_THRESHOLDS,
} from './risk-constants';

export type {
  ActionTypeProfile,
  RiskThresholdSet,
  TeamRiskWeights,
  IndividualRiskWeights,
} from './risk-constants';
