// @ts-check
/**
 * Pure classifier for the @mnemom/types public API surface breaking-diff gate.
 *
 * No I/O — takes two surface texts (baseline, current) and returns a structured
 * classification. The CLI wrapper (diff-surface.mjs) handles file reading,
 * reporting, and process exit. Keeping the logic pure makes it unit-testable
 * from vitest without spawning a process or pulling in node type definitions.
 *
 * See ./README.md for the conservative posture (any non-additive change is
 * breaking; the gate only classifies — versioning policy is release-please's).
 */

/**
 * @typedef {{ kind: string, typeText: string }} SurfaceEntry
 * @typedef {{ name: string, kind: string }} Removed
 * @typedef {{ name: string, kind: string }} Added
 * @typedef {{ name: string, kindChanged: boolean, was: SurfaceEntry, now: SurfaceEntry }} Changed
 * @typedef {{ removed: Removed[], changed: Changed[], added: Added[], breakingCount: number, duplicate: string | null }} Classification
 */

/**
 * Parse a surface file into Map<name, SurfaceEntry>, ignoring `#` comment lines.
 * Returns the first duplicate export name encountered (extractor bug) or null.
 * @param {string} text
 * @returns {{ map: Map<string, SurfaceEntry>, duplicate: string | null }}
 */
export function parseSurface(text) {
  /** @type {Map<string, SurfaceEntry>} */
  const map = new Map();
  let duplicate = null;
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const tab = line.indexOf("\t");
    if (tab < 0) continue;
    const name = line.slice(0, tab);
    const rest = line.slice(tab + 1);
    const tab2 = rest.indexOf("\t");
    const kind = tab2 < 0 ? rest : rest.slice(0, tab2);
    const typeText = tab2 < 0 ? "" : rest.slice(tab2 + 1);
    if (map.has(name) && duplicate === null) duplicate = name;
    map.set(name, { kind, typeText });
  }
  return { map, duplicate };
}

/**
 * Classify the difference between a baseline and a current surface.
 * Conservative: ANY non-additive change is breaking.
 * @param {string} baselineText
 * @param {string} currentText
 * @returns {Classification}
 */
export function classifySurfaces(baselineText, currentText) {
  const base = parseSurface(baselineText);
  const curr = parseSurface(currentText);
  const duplicate = base.duplicate || curr.duplicate;

  /** @type {Removed[]} */
  const removed = [];
  /** @type {Changed[]} */
  const changed = [];
  /** @type {Added[]} */
  const added = [];

  for (const [name, b] of base.map) {
    const c = curr.map.get(name);
    if (!c) {
      removed.push({ name, kind: b.kind });
    } else if (c.kind !== b.kind || c.typeText !== b.typeText) {
      changed.push({ name, kindChanged: c.kind !== b.kind, was: b, now: c });
    }
  }
  for (const [name, c] of curr.map) {
    if (!base.map.has(name)) added.push({ name, kind: c.kind });
  }

  return {
    removed,
    changed,
    added,
    breakingCount: removed.length + changed.length,
    duplicate,
  };
}
