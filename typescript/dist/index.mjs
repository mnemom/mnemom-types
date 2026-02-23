// src/constants.ts
var GRADE_ORDINALS = {
  AAA: 7,
  AA: 6,
  A: 5,
  BBB: 4,
  BB: 3,
  B: 2,
  CCC: 1,
  NR: 0
};
var GRADE_SCALE = [
  { grade: "AAA", tier: "Exemplary", min: 900, max: 1e3 },
  { grade: "AA", tier: "Established", min: 800, max: 899 },
  { grade: "A", tier: "Reliable", min: 700, max: 799 },
  { grade: "BBB", tier: "Developing", min: 600, max: 699 },
  { grade: "BB", tier: "Emerging", min: 500, max: 599 },
  { grade: "B", tier: "Concerning", min: 400, max: 499 },
  { grade: "CCC", tier: "Critical", min: 200, max: 399 }
];
var COMPONENT_WEIGHTS = [
  { key: "integrity_ratio", label: "Integrity Ratio", weight: 0.4, source: "Checkpoint clear rate" },
  { key: "compliance", label: "Compliance", weight: 0.2, source: "Violation impact decay" },
  { key: "drift_stability", label: "Drift Stability", weight: 0.2, source: "Session stability ratio" },
  { key: "trace_completeness", label: "Trace Completeness", weight: 0.1, source: "Trace/checkpoint balance" },
  { key: "coherence_compatibility", label: "Coherence Compatibility", weight: 0.1, source: "Fleet coherence data" }
];

// src/risk-constants.ts
var ACTION_TYPE_PROFILES = {
  financial_transaction: {
    integrity_ratio: 0.3,
    compliance: 0.3,
    drift_stability: 0.15,
    trace_completeness: 0.1,
    coherence_compatibility: 0.15
  },
  data_access: {
    integrity_ratio: 0.35,
    compliance: 0.25,
    drift_stability: 0.15,
    trace_completeness: 0.15,
    coherence_compatibility: 0.1
  },
  task_delegation: {
    integrity_ratio: 0.25,
    compliance: 0.15,
    drift_stability: 0.15,
    trace_completeness: 0.1,
    coherence_compatibility: 0.35
  },
  tool_invocation: {
    integrity_ratio: 0.4,
    compliance: 0.2,
    drift_stability: 0.2,
    trace_completeness: 0.1,
    coherence_compatibility: 0.1
  },
  autonomous_operation: {
    integrity_ratio: 0.35,
    compliance: 0.25,
    drift_stability: 0.2,
    trace_completeness: 0.1,
    coherence_compatibility: 0.1
  },
  multi_agent_coordination: {
    integrity_ratio: 0.2,
    compliance: 0.15,
    drift_stability: 0.15,
    trace_completeness: 0.1,
    coherence_compatibility: 0.4
  }
};
var RISK_THRESHOLDS = {
  conservative: { low: 0.15, medium: 0.35, high: 0.55 },
  moderate: { low: 0.25, medium: 0.5, high: 0.75 },
  aggressive: { low: 0.35, medium: 0.6, high: 0.85 }
};
var TEAM_RISK_WEIGHTS = {
  portfolio: 0.3,
  coherence: 0.3,
  weakest_link: 0.25,
  concentration: 0.15
};
var INDIVIDUAL_RISK_WEIGHTS = {
  context: 0.6,
  recency: 0.3,
  confidence_penalty: 0.1
};
var VIOLATION_SEVERITY_WEIGHTS = {
  critical: 1,
  high: 0.7,
  medium: 0.4,
  low: 0.1
};
var RECENCY_HALF_LIFE_DAYS = 30;
var CONFIDENCE_PENALTIES = {
  insufficient: 0.3,
  low: 0.2,
  medium: 0.1,
  high: 0
};
var COHERENCE_SUBWEIGHTS = {
  value_overlap: 0.35,
  priority_alignment: 0.25,
  behavioral_corr_penalty: 0.15,
  boundary_compatibility: 0.25
};
var CIRCUIT_BREAKER_MIN_REPUTATION = 200;
var CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT = 100;
var TEAM_RECOMMENDATION_THRESHOLDS = {
  approve_team_low: { max: 0.2, level: "low" },
  approve_team_medium: { max: 0.4, level: "medium" },
  individuals_only_high: { max: 0.6, level: "high" },
  deny_critical: { max: 1, level: "critical" }
};
export {
  ACTION_TYPE_PROFILES,
  CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT,
  CIRCUIT_BREAKER_MIN_REPUTATION,
  COHERENCE_SUBWEIGHTS,
  COMPONENT_WEIGHTS,
  CONFIDENCE_PENALTIES,
  GRADE_ORDINALS,
  GRADE_SCALE,
  INDIVIDUAL_RISK_WEIGHTS,
  RECENCY_HALF_LIFE_DAYS,
  RISK_THRESHOLDS,
  TEAM_RECOMMENDATION_THRESHOLDS,
  TEAM_RISK_WEIGHTS,
  VIOLATION_SEVERITY_WEIGHTS
};
//# sourceMappingURL=index.mjs.map