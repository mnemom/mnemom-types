/**
 * Reputation constants.
 *
 * Centralizes grade ordinals, grade scale definitions, and
 * component weight definitions used across all services and SDKs.
 */

import type { ReputationGrade } from './reputation';

/** Ordinal ranking of reputation grades (higher = better). */
export const GRADE_ORDINALS: Record<ReputationGrade, number> = {
  AAA: 7,
  AA: 6,
  A: 5,
  BBB: 4,
  BB: 3,
  B: 2,
  CCC: 1,
  NR: 0,
};

/** Grade scale definition with tier names and score boundaries. */
export interface GradeScaleEntry {
  grade: ReputationGrade;
  tier: string;
  min: number;
  max: number;
}

/** Grade scale from highest to lowest. */
export const GRADE_SCALE: GradeScaleEntry[] = [
  { grade: 'AAA', tier: 'Exemplary',   min: 900, max: 1000 },
  { grade: 'AA',  tier: 'Established', min: 800, max: 899 },
  { grade: 'A',   tier: 'Reliable',    min: 700, max: 799 },
  { grade: 'BBB', tier: 'Developing',  min: 600, max: 699 },
  { grade: 'BB',  tier: 'Emerging',    min: 500, max: 599 },
  { grade: 'B',   tier: 'Concerning',  min: 400, max: 499 },
  { grade: 'CCC', tier: 'Critical',    min: 200, max: 399 },
];

/** Component weight definition. */
export interface ComponentWeightEntry {
  key: string;
  label: string;
  weight: number;
  source: string;
}

/** Scoring component weights. */
export const COMPONENT_WEIGHTS: ComponentWeightEntry[] = [
  { key: 'integrity_ratio',        label: 'Integrity Ratio',        weight: 0.40, source: 'Checkpoint clear rate' },
  { key: 'compliance',             label: 'Compliance',             weight: 0.20, source: 'Violation impact decay' },
  { key: 'drift_stability',        label: 'Drift Stability',        weight: 0.20, source: 'Session stability ratio' },
  { key: 'trace_completeness',     label: 'Trace Completeness',     weight: 0.10, source: 'Trace/checkpoint balance' },
  { key: 'coherence_compatibility', label: 'Coherence Compatibility', weight: 0.10, source: 'Fleet coherence data' },
];
