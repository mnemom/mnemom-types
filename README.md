# @mnemom/types

[![CI](https://github.com/mnemom/mnemom-types/actions/workflows/ci.yml/badge.svg)](https://github.com/mnemom/mnemom-types/actions/workflows/ci.yml)
[![CodeQL](https://github.com/mnemom/mnemom-types/actions/workflows/codeql.yml/badge.svg)](https://github.com/mnemom/mnemom-types/actions/workflows/codeql.yml)
[![npm](https://img.shields.io/npm/v/@mnemom/types.svg)](https://www.npmjs.com/package/@mnemom/types)
[![PyPI](https://img.shields.io/pypi/v/mnemom-types.svg)](https://pypi.org/project/mnemom-types/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**Shared type definitions for Mnemom services and SDKs.**

Single source of truth for reputation grades, score tiers, risk levels, team shapes, and the constants (grade ordinals, component weights, score boundaries) used by every Mnemom repo. Published as a dual TypeScript + Python package so services and client SDKs agree on the wire format.

## Install

```bash
# TypeScript
npm install @mnemom/types

# Python
pip install mnemom-types
```

## What's in it

| Module | Exports |
|---|---|
| `reputation` | `ReputationGrade` (`AAA` … `CCC` + `NR`), `ReputationScore`, `ReputationComponent`, `ConfidenceLevel`, `A2ATrustExtension` |
| `gate` | `ReputationGateConfig`, `GateResult` — shapes used by `reputation-check` GitHub Action and other gate clients |
| `risk` | `RiskLevel`, `RiskRecommendation`, `TeamRecommendation`, and assessment payload shapes |
| `team` | `Team`, `TeamStatus`, `TeamReputationScore`, and roster types |
| `constants` | `GRADE_ORDINALS`, `GRADE_SCALE` (tier names + score ranges), `COMPONENT_WEIGHTS` |

## Usage

### TypeScript

```typescript
import type { ReputationScore, ReputationGrade } from '@mnemom/types';
import { GRADE_ORDINALS, GRADE_SCALE, COMPONENT_WEIGHTS } from '@mnemom/types';

// Type-check a score from the API
function isAbove(score: ReputationScore, grade: ReputationGrade): boolean {
  return GRADE_ORDINALS[score.grade] >= GRADE_ORDINALS[grade];
}

// Look up the tier a score falls into
const tier = GRADE_SCALE.find(t => score.score >= t.min && score.score <= t.max);
```

### Python

```python
from mnemom_types import ReputationScore, ReputationGrade
from mnemom_types.constants import GRADE_ORDINALS, GRADE_SCALE

def is_above(score: ReputationScore, grade: ReputationGrade) -> bool:
    return GRADE_ORDINALS[score.grade] >= GRADE_ORDINALS[grade]
```

## Where these types are used

- **`mnemom-api`** — request/response payloads for `/v1/reputation/*`, `/v1/risk/*`, `/v1/teams/*`
- **`mnemom-reputation`** — score computation, grade assignment, snapshot shape
- **`mnemom-risk`** — risk assessment inputs and outputs
- **`reputation-check`** — the GitHub Action's input/output contract
- **`aap`, `aip`** — SDK clients that query or verify reputation
- **`mnemom-website`** — `RiskMethodology.tsx` imports the canonical risk constants (MNE-492 Slice 2)
- **`mnemom-platform`** — `shared/sdk` imports the canonical error envelope (`parseMnemomError`)

When these shapes change, they change here first and every downstream repo bumps its `@mnemom/types` / `mnemom-types` dependency in lockstep.

## Breaking-diff gate (MNE-492)

`api-surface-gate` (`.github/workflows/ci.yml`) regenerates the exported-symbol surface of
`typescript/src/index.ts` and diffs it against the committed baseline (`typescript/api-surface.txt`),
failing on any non-additive change (removed export, renamed export, kind/type change). It has run
on every PR since #61 and has not needed a false-positive override.

It is currently **advisory** — not yet in `main`'s required status checks
(`scripts/branch-protection/required-checks.json` records the intended target list, which adds
`api-surface-gate` to the existing four). Promoting it is a deliberate, human-run action —
`scripts/branch-protection/apply-required-checks.sh` — not something CI or this PR merge does
automatically.

## Development

```bash
# Install everything
npm ci
cd python && pip install -e '.[dev]' && cd ..

# Lint
npm run lint:ts
npm run lint:py

# Test
cd typescript && npm test
cd ../python && pytest
```

Both packages are versioned and released together. See `.github/workflows/publish.yml`.

## License

Apache 2.0 — see [`LICENSE`](./LICENSE).
