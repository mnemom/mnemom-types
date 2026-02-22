/**
 * Reputation score types.
 *
 * Canonical definitions for Mnemom reputation scores, grades,
 * confidence levels, and score components.
 */

/** Reputation grade scale from AAA (highest) to NR (not rated). */
export type ReputationGrade = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'NR';

/** Confidence level of a reputation score. */
export type ConfidenceLevel = 'insufficient' | 'low' | 'medium' | 'high';

/** A single component contributing to an agent's reputation score. */
export interface ReputationComponent {
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
export interface ReputationScore {
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
export interface A2ATrustExtension {
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
