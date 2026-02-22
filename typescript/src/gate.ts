/**
 * Reputation gate types.
 *
 * Types for gating agent interactions based on reputation
 * score and grade thresholds.
 */

import type { ReputationGrade, ReputationScore } from './reputation';

/** Configuration for a reputation gate. */
export interface ReputationGateConfig {
  /** Minimum numeric score required (0-1000) */
  minScore?: number;
  /** Minimum letter grade required */
  minGrade?: ReputationGrade;
  /** Base URL for the reputation API */
  baseUrl?: string;
}

/** Result of a reputation gate check. */
export interface GateResult {
  /** Whether the agent is allowed through the gate */
  allowed: boolean;
  /** The agent's reputation score (null if fetch failed) */
  score: ReputationScore | null;
  /** Human-readable reason for denial (if not allowed) */
  reason?: string;
}
