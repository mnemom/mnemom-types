import { describe, it, expect } from 'vitest';

import {
  GRADE_ORDINALS,
  GRADE_SCALE,
  COMPONENT_WEIGHTS,
} from '../index';

describe('GRADE_ORDINALS', () => {
  it('contains all 8 grades', () => {
    const grades = Object.keys(GRADE_ORDINALS);
    expect(grades).toHaveLength(8);
    expect(grades).toEqual(
      expect.arrayContaining(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'NR'])
    );
  });

  it('orders grades from NR=0 to AAA=7', () => {
    expect(GRADE_ORDINALS.NR).toBe(0);
    expect(GRADE_ORDINALS.CCC).toBe(1);
    expect(GRADE_ORDINALS.B).toBe(2);
    expect(GRADE_ORDINALS.BB).toBe(3);
    expect(GRADE_ORDINALS.BBB).toBe(4);
    expect(GRADE_ORDINALS.A).toBe(5);
    expect(GRADE_ORDINALS.AA).toBe(6);
    expect(GRADE_ORDINALS.AAA).toBe(7);
  });

  it('has strictly increasing ordinals', () => {
    const sorted = Object.entries(GRADE_ORDINALS).sort(([, a], [, b]) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i][1]).toBeGreaterThan(sorted[i - 1][1]);
    }
  });
});

describe('GRADE_SCALE', () => {
  it('contains 7 entries (AAA through CCC, excluding NR)', () => {
    expect(GRADE_SCALE).toHaveLength(7);
  });

  it('is sorted from highest to lowest grade', () => {
    for (let i = 1; i < GRADE_SCALE.length; i++) {
      expect(GRADE_SCALE[i - 1].min).toBeGreaterThan(GRADE_SCALE[i].min);
    }
  });

  it('covers the full 200-1000 range without gaps or overlaps', () => {
    expect(GRADE_SCALE[0].max).toBe(1000);
    expect(GRADE_SCALE[GRADE_SCALE.length - 1].min).toBe(200);

    for (let i = 1; i < GRADE_SCALE.length; i++) {
      expect(GRADE_SCALE[i].max).toBe(GRADE_SCALE[i - 1].min - 1);
    }
  });

  it('has required fields on every entry', () => {
    for (const entry of GRADE_SCALE) {
      expect(entry.grade).toEqual(expect.any(String));
      expect(entry.tier).toEqual(expect.any(String));
      expect(entry.min).toEqual(expect.any(Number));
      expect(entry.max).toEqual(expect.any(Number));
      expect(entry.max).toBeGreaterThanOrEqual(entry.min);
    }
  });
});

describe('COMPONENT_WEIGHTS', () => {
  it('contains 5 components', () => {
    expect(COMPONENT_WEIGHTS).toHaveLength(5);
  });

  it('has weights that sum to 1.0', () => {
    const total = COMPONENT_WEIGHTS.reduce((sum, c) => sum + c.weight, 0);
    expect(total).toBeCloseTo(1.0, 10);
  });

  it('has all required fields', () => {
    for (const entry of COMPONENT_WEIGHTS) {
      expect(entry.key).toEqual(expect.any(String));
      expect(entry.label).toEqual(expect.any(String));
      expect(entry.weight).toEqual(expect.any(Number));
      expect(entry.source).toEqual(expect.any(String));
      expect(entry.weight).toBeGreaterThan(0);
      expect(entry.weight).toBeLessThanOrEqual(1);
    }
  });

  it('has unique keys', () => {
    const keys = COMPONENT_WEIGHTS.map(c => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
