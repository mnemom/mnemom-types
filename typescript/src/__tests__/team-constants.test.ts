import { describe, it, expect } from 'vitest';

import {
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

describe('TEAM_COMPONENT_WEIGHTS', () => {
  it('contains 5 components', () => {
    expect(TEAM_COMPONENT_WEIGHTS).toHaveLength(5);
  });

  it('weights sum to 1.0', () => {
    const total = TEAM_COMPONENT_WEIGHTS.reduce((s, c) => s + c.weight, 0);
    expect(total).toBeCloseTo(1.0, 10);
  });

  it('has the expected component keys', () => {
    const keys = TEAM_COMPONENT_WEIGHTS.map(c => c.key);
    expect(keys).toEqual([
      'coherence_history',
      'member_quality',
      'operational_record',
      'structural_stability',
      'assessment_density',
    ]);
  });

  it('has all required fields', () => {
    for (const entry of TEAM_COMPONENT_WEIGHTS) {
      expect(entry.key).toEqual(expect.any(String));
      expect(entry.label).toEqual(expect.any(String));
      expect(entry.weight).toEqual(expect.any(Number));
      expect(entry.description).toEqual(expect.any(String));
      expect(entry.source).toEqual(expect.any(String));
    }
  });

  it('has unique keys', () => {
    const keys = TEAM_COMPONENT_WEIGHTS.map(c => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('team scalar constants', () => {
  it('TEAM_ELIGIBILITY_THRESHOLD is 10', () => {
    expect(TEAM_ELIGIBILITY_THRESHOLD).toBe(10);
  });

  it('TEAM_MAX_SIZE > TEAM_MIN_SIZE', () => {
    expect(TEAM_MAX_SIZE).toBeGreaterThan(TEAM_MIN_SIZE);
  });

  it('TEAM_MIN_SIZE is 2', () => {
    expect(TEAM_MIN_SIZE).toBe(2);
  });

  it('TEAM_MAX_SIZE is 50', () => {
    expect(TEAM_MAX_SIZE).toBe(50);
  });

  it('TEAM_MAX_ASSESSMENTS_PER_DAY is 100', () => {
    expect(TEAM_MAX_ASSESSMENTS_PER_DAY).toBe(100);
  });

  it('ROSTER_CHURN_PENALTY_PER_CHANGE is 50', () => {
    expect(ROSTER_CHURN_PENALTY_PER_CHANGE).toBe(50);
  });

  it('ROSTER_CHURN_LOOKBACK_DAYS is 90', () => {
    expect(ROSTER_CHURN_LOOKBACK_DAYS).toBe(90);
  });
});

describe('TEAM_CONFIDENCE_THRESHOLDS', () => {
  it('has 4 levels', () => {
    expect(Object.keys(TEAM_CONFIDENCE_THRESHOLDS)).toHaveLength(4);
  });

  it('thresholds increase with confidence', () => {
    expect(TEAM_CONFIDENCE_THRESHOLDS.insufficient).toBeLessThan(
      TEAM_CONFIDENCE_THRESHOLDS.low
    );
    expect(TEAM_CONFIDENCE_THRESHOLDS.low).toBeLessThan(
      TEAM_CONFIDENCE_THRESHOLDS.medium
    );
    expect(TEAM_CONFIDENCE_THRESHOLDS.medium).toBeLessThan(
      TEAM_CONFIDENCE_THRESHOLDS.high
    );
  });
});

describe('CQ_MISSION_BLEND', () => {
  it('member + mission weights sum to 1.0', () => {
    expect(CQ_MISSION_BLEND.member + CQ_MISSION_BLEND.mission).toBeCloseTo(1.0, 10);
  });
});
