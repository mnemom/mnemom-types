import { describe, it, expect } from 'vitest';

import {
  GRADE_ORDINALS,
  GRADE_SCALE,
  COMPONENT_WEIGHTS,
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
  TEAM_COMPONENT_WEIGHTS,
  TEAM_ELIGIBILITY_THRESHOLD,
  TEAM_MAX_SIZE,
  TEAM_MIN_SIZE,
  TEAM_MAX_ASSESSMENTS_PER_DAY,
  TEAM_CONFIDENCE_THRESHOLDS,
  CQ_MISSION_BLEND,
  ROSTER_CHURN_PENALTY_PER_CHANGE,
  ROSTER_CHURN_LOOKBACK_DAYS,
} from '../index';

describe('export completeness', () => {
  it('exports all reputation constants', () => {
    expect(GRADE_ORDINALS).toBeDefined();
    expect(GRADE_SCALE).toBeDefined();
    expect(COMPONENT_WEIGHTS).toBeDefined();
  });

  it('exports all risk constants', () => {
    expect(ACTION_TYPE_PROFILES).toBeDefined();
    expect(RISK_THRESHOLDS).toBeDefined();
    expect(TEAM_RISK_WEIGHTS).toBeDefined();
    expect(INDIVIDUAL_RISK_WEIGHTS).toBeDefined();
    expect(VIOLATION_SEVERITY_WEIGHTS).toBeDefined();
    expect(RECENCY_HALF_LIFE_DAYS).toBeDefined();
    expect(CONFIDENCE_PENALTIES).toBeDefined();
    expect(COHERENCE_SUBWEIGHTS).toBeDefined();
    expect(CIRCUIT_BREAKER_MIN_REPUTATION).toBeDefined();
    expect(CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT).toBeDefined();
    expect(TEAM_RECOMMENDATION_THRESHOLDS).toBeDefined();
  });

  it('exports all team constants', () => {
    expect(TEAM_COMPONENT_WEIGHTS).toBeDefined();
    expect(TEAM_ELIGIBILITY_THRESHOLD).toBeDefined();
    expect(TEAM_MAX_SIZE).toBeDefined();
    expect(TEAM_MIN_SIZE).toBeDefined();
    expect(TEAM_MAX_ASSESSMENTS_PER_DAY).toBeDefined();
    expect(TEAM_CONFIDENCE_THRESHOLDS).toBeDefined();
    expect(CQ_MISSION_BLEND).toBeDefined();
    expect(ROSTER_CHURN_PENALTY_PER_CHANGE).toBeDefined();
    expect(ROSTER_CHURN_LOOKBACK_DAYS).toBeDefined();
  });
});
