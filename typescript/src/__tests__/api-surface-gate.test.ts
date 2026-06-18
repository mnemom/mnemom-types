/**
 * Behavioral lock for the api-surface breaking-diff gate classifier
 * (scripts/api-surface/classify.mjs).
 *
 * Exercises the classifier against fixture surfaces so the conservative posture
 * cannot be silently weakened: removals/changes are breaking, additions are not.
 * The pure classifier is tested here; diff-surface.mjs is the thin CLI shell that
 * maps `breakingCount > 0` to a non-zero exit.
 */
import { describe, it, expect } from "vitest";
// @ts-expect-error — .mjs gate script, no .d.ts; shape asserted by the tests below.
import { classifySurfaces, parseSurface } from "../../scripts/api-surface/classify.mjs";

const BASELINE = [
  "# header line ignored",
  "# Export count: 3",
  "Alpha\tinterface\t{ a: string; b: number }",
  'Beta\ttype\t"x" | "y"',
  "gamma\tvalue\t{ k: number }",
  "",
].join("\n");

describe("api-surface breaking-diff classifier", () => {
  it("parses surface lines, skipping comments and blanks", () => {
    const { map, duplicate } = parseSurface(BASELINE);
    expect(duplicate).toBeNull();
    expect(map.size).toBe(3);
    expect(map.get("Alpha")).toEqual({ kind: "interface", typeText: "{ a: string; b: number }" });
  });

  it("reports no changes (breakingCount 0) when identical", () => {
    const r = classifySurfaces(BASELINE, BASELINE);
    expect(r.breakingCount).toBe(0);
    expect(r.removed).toHaveLength(0);
    expect(r.changed).toHaveLength(0);
    expect(r.added).toHaveLength(0);
  });

  it("flags a REMOVED export as breaking", () => {
    const current = [
      "Alpha\tinterface\t{ a: string; b: number }",
      "gamma\tvalue\t{ k: number }",
    ].join("\n");
    const r = classifySurfaces(BASELINE, current);
    expect(r.breakingCount).toBe(1);
    expect(r.removed.map((x: { name: string }) => x.name)).toEqual(["Beta"]);
  });

  it("flags a member-level TYPE change as breaking", () => {
    const current = [
      "Alpha\tinterface\t{ a: string; b: string }", // b: number -> string
      'Beta\ttype\t"x" | "y"',
      "gamma\tvalue\t{ k: number }",
    ].join("\n");
    const r = classifySurfaces(BASELINE, current);
    expect(r.breakingCount).toBe(1);
    expect(r.changed).toHaveLength(1);
    expect(r.changed[0].name).toBe("Alpha");
    expect(r.changed[0].kindChanged).toBe(false);
  });

  it("flags a KIND change (interface -> value) as breaking", () => {
    const current = [
      "Alpha\tvalue\t{ a: string; b: number }",
      'Beta\ttype\t"x" | "y"',
      "gamma\tvalue\t{ k: number }",
    ].join("\n");
    const r = classifySurfaces(BASELINE, current);
    expect(r.breakingCount).toBe(1);
    expect(r.changed[0].kindChanged).toBe(true);
  });

  it("classifies an ADDED export as additive (non-breaking)", () => {
    const current = [
      "Alpha\tinterface\t{ a: string; b: number }",
      'Beta\ttype\t"x" | "y"',
      'Delta\ttype\t"new"',
      "gamma\tvalue\t{ k: number }",
    ].join("\n");
    const r = classifySurfaces(BASELINE, current);
    expect(r.breakingCount).toBe(0);
    expect(r.added.map((x: { name: string }) => x.name)).toEqual(["Delta"]);
  });

  it("treats an addition mixed with a removal as breaking (breaking wins)", () => {
    const current = [
      "Alpha\tinterface\t{ a: string; b: number }",
      'Delta\ttype\t"new"', // added
      "gamma\tvalue\t{ k: number }",
      // Beta removed
    ].join("\n");
    const r = classifySurfaces(BASELINE, current);
    expect(r.breakingCount).toBe(1);
    expect(r.added).toHaveLength(1);
    expect(r.removed).toHaveLength(1);
  });

  it("surfaces a duplicate export name (extractor-bug guard)", () => {
    const dup = ['Alpha\ttype\t"a"', 'Alpha\ttype\t"b"'].join("\n");
    const { duplicate } = parseSurface(dup);
    expect(duplicate).toBe("Alpha");
  });
});
