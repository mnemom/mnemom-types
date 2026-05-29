# AGENTS.md — mnemom-types

You are a coding agent working on **@mnemom/types** / **mnemom-types** —
the shared type-definition package every Mnemom service and SDK
imports.

Audience: AI coding tools (Claude Code, Cursor, Cline, Aider) and
humans onboarding via them.

## What this repo is

The single source of truth for shapes the entire Mnemom fleet shares
on the wire: reputation grades, score tiers, risk levels, team shapes,
component weights, score boundaries. If two services disagree on what
"AAA" means, that's a bug here.

Published as a dual-language package:
- `typescript/` — `@mnemom/types` on npm
- `python/` — `mnemom-types` on PyPI

License: Apache-2.0.

## Stack

- TypeScript: tsup bundler, vitest, strict tsconfig.
- Python: hatchling, pytest, ruff, mypy.
- Top-level npm scripts orchestrate cross-language lint.

## Install + dev

```bash
# Top-level lint (both languages)
npm install                      # installs eslint + prettier devDeps
npm run lint                     # runs eslint + prettier on TypeScript
npm run lint:py                  # cd python && ruff + mypy

# TypeScript
cd typescript
npm install
npm test                         # vitest run
npm run typecheck                # tsc --noEmit
npm run build                    # tsup → dist/

# Python
cd python
pip install -e ".[dev]"
pytest
ruff check .
mypy src/
```

## Project layout

```
typescript/
  src/                    # TypeScript types + constants
    index.ts              # public API (single entry point)
  tests/
  package.json            # @mnemom/types
python/
  src/mnemom_types/       # Python types + constants (mirror)
  tests/
  pyproject.toml          # mnemom-types
README.md                 # User-facing usage docs
```

## Conventions

- **The two implementations must agree on every value.** Grade
  ordinals, score boundaries, component weights — if the number
  differs between Python and TypeScript, the whole fleet has split
  realities. Add a parity test when you add a constant.
- **Versions stay in lockstep.** Bump
  `typescript/package.json::version` and
  `python/pyproject.toml::project.version` together.
- **Apache-2.0 only.**
- This package is **types + constants + ONE canonical error parser** —
  otherwise no runtime logic, no I/O, no side effects. The single
  deliberate exception is `src/errors.ts` / `errors.py`
  (`parseMnemomError` / `parse_mnemom_error` + the `MnemomError`
  shape): the fleet-wide error-envelope parser, dependency-free, kept
  here ON PURPOSE so every consumer (CLI, SDK, website, risk,
  reputation) imports ONE nested-first parser instead of five drifting
  copies. Do NOT add OTHER runtime logic — that belongs in a consumer
  (mnemom-reputation, mnemom-website's `lib/reputation.ts`, etc.). And
  do NOT delete the error parser as a "types-only violation" — it is
  load-bearing shared infrastructure.
- Commit messages: imperative, concise, describe the **why**.

## Branch protection + deploy

- Never commit directly to `main`. Always feature branch first.
- Branch protection enforced.
- Deploy: `mnemom/deploy` orchestrator publishes both packages on
  tagged releases.

## What you should NOT do

- Don't add runtime dependencies. This is types + constants + the one
  canonical error parser (`src/errors.ts` / `errors.py`) — and that
  parser stays dependency-free. No new deps.
- Don't drift TypeScript and Python apart.
- Don't break wire compatibility (rename a grade, bump score
  boundaries) without coordinating across every consumer.
- Don't relicense.
- Don't skip pre-commit hooks (`--no-verify`).
- Don't `git push --force` to `main`.

## Cross-links

- **Major consumers**: mnemom-website, mnemom-api, mnemom-reputation,
  mnemom-risk, mnemom-platform — all import from this package.
- **Mintlify-hosted methodology docs** (the trust-rating math that
  defines the constants here): https://www.mnemom.ai/methodology
