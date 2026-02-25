/**
 * Team reputation constants.
 *
 * Centralizes team-specific scoring weights, eligibility thresholds,
 * and configuration constants used across all services and SDKs.
 */

import type { TeamReputationComponentKey } from './team';

/** Team reputation component weight definition. */
export interface TeamComponentWeightEntry {
  key: TeamReputationComponentKey;
  label: string;
  weight: number;
  description: string;
  source: string;
}

/** Team reputation scoring component weights. */
export const TEAM_COMPONENT_WEIGHTS: TeamComponentWeightEntry[] = [
  {
    key: 'coherence_history',
    label: 'Coherence History',
    weight: 0.35,
    description: 'How consistently well-aligned is this team over time?',
    source: 'Historical team risk assessments (CQ pillar)',
  },
  {
    key: 'member_quality',
    label: 'Member Quality',
    weight: 0.25,
    description: 'Floor quality — the team is only as strong as its members',
    source: 'Member individual Trust Scores (tail-risk weighted)',
  },
  {
    key: 'operational_record',
    label: 'Operational Track Record',
    weight: 0.20,
    description: 'How often has this team been assessed as low-risk?',
    source: 'Historical team risk assessment outcomes',
  },
  {
    key: 'structural_stability',
    label: 'Structural Stability',
    weight: 0.10,
    description: "Is the team's contagion profile stable? Does it churn members?",
    source: 'SR pillar trends + roster change frequency',
  },
  {
    key: 'assessment_density',
    label: 'Assessment Density',
    weight: 0.10,
    description: 'Is this team actively monitored?',
    source: 'Count + recency of team assessments',
  },
];

/** Minimum number of team assessments before a score is generated. */
export const TEAM_ELIGIBILITY_THRESHOLD = 10;

/** Maximum number of agents in a team. */
export const TEAM_MAX_SIZE = 50;

/** Minimum number of agents in a team. */
export const TEAM_MIN_SIZE = 2;

/** Maximum team assessments per day (anti-gaming). */
export const TEAM_MAX_ASSESSMENTS_PER_DAY = 100;

/** Team confidence thresholds (minimum assessments for each level). */
export const TEAM_CONFIDENCE_THRESHOLDS: Record<string, number> = {
  insufficient: 0,
  low: 10,
  medium: 30,
  high: 100,
};

/** CQ mission alignment blend weights. */
export const CQ_MISSION_BLEND = {
  /** Weight for member-to-member coherence */
  member: 0.70,
  /** Weight for member-to-team-card coherence */
  mission: 0.30,
};

/** Points deducted per roster change in the structural stability component. */
export const ROSTER_CHURN_PENALTY_PER_CHANGE = 50;

/** Lookback window for roster churn penalty (days). */
export const ROSTER_CHURN_LOOKBACK_DAYS = 90;
