import { describe, it, expect } from 'vitest';

import {
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
} from '../index';

describe('ACTION_TYPE_PROFILES', () => {
  const actionTypes = [
    'financial_transaction',
    'data_access',
    'task_delegation',
    'tool_invocation',
    'autonomous_operation',
    'multi_agent_coordination',
  ] as const;

  it('has profiles for all 6 action types', () => {
    expect(Object.keys(ACTION_TYPE_PROFILES)).toHaveLength(6);
    for (const at of actionTypes) {
      expect(ACTION_TYPE_PROFILES[at]).toBeDefined();
    }
  });

  it('each profile weights sum to 1.0', () => {
    for (const [key, profile] of Object.entries(ACTION_TYPE_PROFILES)) {
      const sum =
        profile.integrity_ratio +
        profile.compliance +
        profile.drift_stability +
        profile.trace_completeness +
        profile.coherence_compatibility;
      expect(sum).toBeCloseTo(1.0, 10);
    }
  });

  it('all profile weights are between 0 and 1', () => {
    for (const profile of Object.values(ACTION_TYPE_PROFILES)) {
      for (const val of Object.values(profile)) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('RISK_THRESHOLDS', () => {
  const tolerances = ['conservative', 'moderate', 'aggressive'] as const;

  it('has thresholds for all 3 tolerances', () => {
    for (const t of tolerances) {
      expect(RISK_THRESHOLDS[t]).toBeDefined();
    }
  });

  it('thresholds are in ascending order (low < medium < high)', () => {
    for (const t of tolerances) {
      const { low, medium, high } = RISK_THRESHOLDS[t];
      expect(low).toBeLessThan(medium);
      expect(medium).toBeLessThan(high);
    }
  });

  it('aggressive thresholds are higher than conservative', () => {
    expect(RISK_THRESHOLDS.aggressive.low).toBeGreaterThan(
      RISK_THRESHOLDS.conservative.low
    );
    expect(RISK_THRESHOLDS.aggressive.high).toBeGreaterThan(
      RISK_THRESHOLDS.conservative.high
    );
  });
});

describe('composition weights', () => {
  it('TEAM_RISK_WEIGHTS sum to 1.0', () => {
    const sum =
      TEAM_RISK_WEIGHTS.portfolio +
      TEAM_RISK_WEIGHTS.coherence +
      TEAM_RISK_WEIGHTS.weakest_link +
      TEAM_RISK_WEIGHTS.concentration;
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it('INDIVIDUAL_RISK_WEIGHTS sum to 1.0', () => {
    const sum =
      INDIVIDUAL_RISK_WEIGHTS.context +
      INDIVIDUAL_RISK_WEIGHTS.recency +
      INDIVIDUAL_RISK_WEIGHTS.confidence_penalty;
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe('violation severity weights', () => {
  it('has 4 levels', () => {
    expect(Object.keys(VIOLATION_SEVERITY_WEIGHTS)).toHaveLength(4);
  });

  it('critical=1.0 and low=0.1', () => {
    expect(VIOLATION_SEVERITY_WEIGHTS.critical).toBe(1.0);
    expect(VIOLATION_SEVERITY_WEIGHTS.low).toBe(0.1);
  });

  it('are in descending order: critical > high > medium > low', () => {
    expect(VIOLATION_SEVERITY_WEIGHTS.critical).toBeGreaterThan(
      VIOLATION_SEVERITY_WEIGHTS.high
    );
    expect(VIOLATION_SEVERITY_WEIGHTS.high).toBeGreaterThan(
      VIOLATION_SEVERITY_WEIGHTS.medium
    );
    expect(VIOLATION_SEVERITY_WEIGHTS.medium).toBeGreaterThan(
      VIOLATION_SEVERITY_WEIGHTS.low
    );
  });
});

describe('scalar constants', () => {
  it('RECENCY_HALF_LIFE_DAYS is 30', () => {
    expect(RECENCY_HALF_LIFE_DAYS).toBe(30);
  });

  it('CIRCUIT_BREAKER_MIN_REPUTATION is 200', () => {
    expect(CIRCUIT_BREAKER_MIN_REPUTATION).toBe(200);
  });

  it('CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT is 100', () => {
    expect(CIRCUIT_BREAKER_MIN_BOUNDARY_COMPAT).toBe(100);
  });
});

describe('CONFIDENCE_PENALTIES', () => {
  it('has 4 levels', () => {
    expect(Object.keys(CONFIDENCE_PENALTIES)).toHaveLength(4);
  });

  it('high confidence has zero penalty', () => {
    expect(CONFIDENCE_PENALTIES.high).toBe(0.0);
  });

  it('penalties increase as confidence decreases', () => {
    expect(CONFIDENCE_PENALTIES.insufficient).toBeGreaterThan(
      CONFIDENCE_PENALTIES.low
    );
    expect(CONFIDENCE_PENALTIES.low).toBeGreaterThan(
      CONFIDENCE_PENALTIES.medium
    );
    expect(CONFIDENCE_PENALTIES.medium).toBeGreaterThan(
      CONFIDENCE_PENALTIES.high
    );
  });
});

describe('COHERENCE_SUBWEIGHTS', () => {
  it('sums to 1.0', () => {
    const sum =
      COHERENCE_SUBWEIGHTS.value_overlap +
      COHERENCE_SUBWEIGHTS.priority_alignment +
      COHERENCE_SUBWEIGHTS.behavioral_corr_penalty +
      COHERENCE_SUBWEIGHTS.boundary_compatibility;
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe('TEAM_RECOMMENDATION_THRESHOLDS', () => {
  it('has 4 entries', () => {
    expect(Object.keys(TEAM_RECOMMENDATION_THRESHOLDS)).toHaveLength(4);
  });

  it('last entry has max=1.0', () => {
    expect(TEAM_RECOMMENDATION_THRESHOLDS.deny_critical.max).toBe(1.0);
  });
});
