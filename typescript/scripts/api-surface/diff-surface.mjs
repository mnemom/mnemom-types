// @ts-check
/**
 * Breaking-diff classifier CLI for the @mnemom/types public API surface.
 *
 * Compares the committed baseline (api-surface.txt) against the surface freshly
 * extracted from the current source, and classifies every difference:
 *
 *   REMOVED  export disappeared            -> BREAKING (fail)
 *   CHANGED  kind or normalized type moved -> BREAKING (fail)
 *   ADDED    new export                    -> ADDITIVE (pass; suggests a MINOR bump)
 *
 * INTENTIONALLY CONSERVATIVE — it over-flags on purpose. ANY non-additive change
 * to a public symbol is reported BREAKING. It does NOT try to prove a change is
 * "safe" (e.g. a widened union, an optional field becoming required, a narrowed
 * return type): on a wire contract consumed across repos, such changes CAN break
 * a consumer, and a missed breaking change (false negative) is far worse than an
 * over-flag (false positive) that a human confirms is safe and overrides. When in
 * doubt, it fails. Versioning policy (what bump a change warrants) is owned by
 * release-please, not this gate — the gate only CLASSIFIES the diff.
 *
 * Override path for a confirmed-safe breaking change: regenerate and commit the
 * baseline (`npm run api:surface`) in the same PR. That makes the contract change
 * explicit and reviewable in the diff, which is the point.
 *
 * The classification logic lives in ./classify.mjs (pure, unit-tested); this file
 * is the thin I/O + reporting shell. See ./README.md.
 *
 * Usage:
 *   node scripts/api-surface/diff-surface.mjs --baseline api-surface.txt --current <file>
 *
 * In CI this is wired via package.json `api:surface:check`, which regenerates the
 * current surface to a temp file and passes it as --current.
 *
 * Exit codes: 0 = no breaking changes (additive or identical); 1 = breaking; 2 = usage/IO error.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { classifySurfaces } from "./classify.mjs";

function parseArgs(argv) {
  const args = { baseline: "api-surface.txt", current: null };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--baseline") args.baseline = rest[++i];
    else if (a === "--current") args.current = rest[++i];
  }
  return args;
}

function main() {
  const { baseline, current } = parseArgs(process.argv);
  const baselinePath = resolve(process.cwd(), baseline);
  if (!existsSync(baselinePath)) {
    console.error(
      `diff-surface: baseline ${baseline} not found. Generate it with \`npm run api:surface\`.`,
    );
    process.exit(2);
  }
  if (!current) {
    console.error("diff-surface: --current <file> is required (the freshly-extracted surface).");
    process.exit(2);
  }
  const currentPath = resolve(process.cwd(), current);
  if (!existsSync(currentPath)) {
    console.error(`diff-surface: current surface ${current} not found.`);
    process.exit(2);
  }

  const { removed, changed, added, breakingCount, duplicate } = classifySurfaces(
    readFileSync(baselinePath, "utf8"),
    readFileSync(currentPath, "utf8"),
  );

  if (duplicate) {
    console.error(
      `diff-surface: duplicate export "${duplicate}" in a surface file — extractor bug.`,
    );
    process.exit(2);
  }

  const out = [];
  out.push("@mnemom/types — public API surface breaking-diff gate");
  out.push(
    "(intentionally conservative: ANY non-additive change is flagged BREAKING; human confirms + overrides safe changes by committing a regenerated baseline)",
  );
  out.push("");

  if (removed.length) {
    out.push(`BREAKING — ${removed.length} removed export(s):`);
    for (const r of removed) out.push(`  - ${r.name} (${r.kind})`);
    out.push("");
  }
  if (changed.length) {
    out.push(`BREAKING — ${changed.length} changed export(s):`);
    for (const c of changed) {
      const kindNote = c.kindChanged ? ` kind ${c.was.kind} -> ${c.now.kind};` : "";
      out.push(`  - ${c.name}:${kindNote}`);
      out.push(`      was: ${c.was.typeText}`);
      out.push(`      now: ${c.now.typeText}`);
    }
    out.push("");
  }
  if (added.length) {
    out.push(
      `ADDITIVE — ${added.length} new export(s) (non-breaking; suggests a MINOR version bump):`,
    );
    for (const a of added) out.push(`  + ${a.name} (${a.kind})`);
    out.push("");
  }
  if (!removed.length && !changed.length && !added.length) {
    out.push("No public API surface changes.");
    out.push("");
  }

  if (breakingCount > 0) {
    out.push(
      `RESULT: FAIL — ${breakingCount} breaking change(s) to the @mnemom/types public surface.`,
    );
    out.push(
      "If these changes are intentional and you have confirmed downstream consumers are handled:",
    );
    out.push("  1. Regenerate + commit the baseline in this PR:  npm run api:surface");
    out.push("  2. Land a corresponding MAJOR version bump (release-please owns the version).");
    out.push("The committed baseline diff makes the contract change explicit and reviewable.");
    process.stdout.write(out.join("\n") + "\n");
    process.exit(1);
  }

  if (added.length) {
    out.push(
      "RESULT: PASS (additive only). Commit the regenerated baseline so it tracks the new surface:  npm run api:surface",
    );
  } else {
    out.push("RESULT: PASS — surface matches baseline.");
  }
  process.stdout.write(out.join("\n") + "\n");
  process.exit(0);
}

main();
