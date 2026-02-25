/**
 * Team types.
 *
 * Canonical definitions for Mnemom teams, team reputation scores,
 * team alignment cards, and team roster management.
 */

import type { ConfidenceLevel, ReputationGrade } from './reputation';

// ---------------------------------------------------------------------------
// Team Identity
// ---------------------------------------------------------------------------

/** Status of a team. */
export type TeamStatus = 'active' | 'archived';

/** A registered team of agents. */
export interface Team {
  /** Team identifier (uuid) */
  id: string;
  /** Organization that owns this team */
  org_id: string;
  /** Display name */
  name: string;
  /** Optional description */
  description: string | null;
  /** Team status */
  status: TeamStatus;
  /** Freeform metadata (environment, domain, etc.) */
  metadata: Record<string, unknown>;
  /** Number of active members */
  member_count: number;
  /** When the team was created (ISO 8601) */
  created_at: string;
  /** When the team was last updated (ISO 8601) */
  updated_at: string;
}

/** A member of a team (current or historical). */
export interface TeamMember {
  /** Team identifier */
  team_id: string;
  /** Agent identifier */
  agent_id: string;
  /** Agent display name (if available) */
  agent_name?: string;
  /** When the agent was added (ISO 8601) */
  added_at: string;
  /** When the agent was removed (null = still active) (ISO 8601) */
  removed_at: string | null;
}

/** A roster change event type. */
export type RosterChangeType = 'agent_added' | 'agent_removed';

/** A logged roster change event. */
export interface TeamRosterChange {
  /** Change event identifier */
  id: string;
  /** Team identifier */
  team_id: string;
  /** Type of change */
  change_type: RosterChangeType;
  /** Agent affected */
  agent_id: string;
  /** User who made the change (null for system actions) */
  actor_id: string | null;
  /** When the change occurred (ISO 8601) */
  created_at: string;
}

// ---------------------------------------------------------------------------
// Team Alignment Card
// ---------------------------------------------------------------------------

/** How the team alignment card was created. */
export type TeamCardSource = 'manual' | 'auto_derived' | 'hybrid';

/** Coordination mode for team operations. */
export type TeamCoordinationMode = 'collaborative' | 'hierarchical' | 'autonomous';

/** Requirements that team members must satisfy. */
export interface TeamMemberRequirements {
  /** Values that members are required to declare */
  required_values?: string[];
  /** Minimum audit retention days for members */
  min_retention_days?: number;
}

/** Team-specific metadata on an alignment card. */
export interface TeamAlignmentCardMeta {
  /** Team identifier */
  team_id: string;
  /** How the card was created */
  card_source: TeamCardSource;
  /** Team mission statement */
  team_mission?: string;
  /** How the team coordinates internally */
  coordination_mode?: TeamCoordinationMode;
  /** Requirements for team members */
  member_requirements?: TeamMemberRequirements;
}

// ---------------------------------------------------------------------------
// Team Reputation
// ---------------------------------------------------------------------------

/** Machine-readable key for a team reputation component. */
export type TeamReputationComponentKey =
  | 'coherence_history'
  | 'member_quality'
  | 'operational_record'
  | 'structural_stability'
  | 'assessment_density';

/** A single component contributing to a team's reputation score. */
export interface TeamReputationComponent {
  /** Machine-readable key */
  key: TeamReputationComponentKey;
  /** Human-readable label */
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

/** Full reputation score for a team. */
export interface TeamReputationScore {
  /** Team identifier */
  team_id: string;
  /** Team display name */
  team_name: string;
  /** Numeric reputation score (0-1000) */
  score: number;
  /** Letter grade (same scale as individual) */
  grade: ReputationGrade;
  /** Confidence in the score */
  confidence: ConfidenceLevel;
  /** Whether the team is eligible for reputation (total_assessments >= 10) */
  is_eligible: boolean;
  /** Score components breakdown */
  components: TeamReputationComponent[];
  /** Total team risk assessments feeding this score */
  total_assessments: number;
  /** When the team was last assessed (ISO 8601, null if never) */
  last_assessed: string | null;
  /** 30-day score trend (positive = improving) */
  trend_30d: number;
  /** Visibility setting */
  visibility: 'public' | 'unlisted' | 'private';
  /** When the score was computed (ISO 8601) */
  computed_at: string;
  /** Number of active members */
  member_count: number;
  /** Optional A2A team trust extension */
  a2a_trust_extension?: A2ATeamTrustExtension;
}

/** A2A trust extension for inter-team reputation sharing. */
export interface A2ATeamTrustExtension {
  /** URI identifying this extension */
  extension_uri: 'https://mnemom.ai/ext/team-trust/v1';
  /** Reputation provider identifier */
  provider: 'mnemom';
  /** Numeric reputation score */
  score: number;
  /** Letter grade */
  grade: ReputationGrade;
  /** Confidence in the score */
  confidence: ConfidenceLevel;
  /** Number of active team members */
  member_count: number;
  /** URL to verify the score */
  verified_url: string;
  /** URL to the team's badge */
  badge_url: string;
  /** URL to the scoring methodology */
  methodology_url: string;
  /** When the score was last updated (ISO 8601) */
  last_updated: string;
}

/** Weekly reputation snapshot for a team. */
export interface TeamReputationSnapshot {
  /** Team identifier */
  team_id: string;
  /** Monday of the snapshot week (ISO 8601 date) */
  week_start: string;
  /** Score at snapshot time */
  score: number;
  /** Grade at snapshot time */
  grade: ReputationGrade;
  /** Component scores at snapshot time */
  components: Record<TeamReputationComponentKey, number>;
  /** When the snapshot was created (ISO 8601) */
  created_at: string;
}
