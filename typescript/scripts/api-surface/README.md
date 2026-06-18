# API-surface breaking-diff gate

A build-time gate that classifies changes to the **`@mnemom/types` public API
surface** as either breaking or additive, so the wire-format contract this
package owns cannot change shape underneath its consumers (`mnemom-api`,
`mnemom-platform`'s `@mnemom/sdk`, `mnemom-website`, …) without that change being
explicit and reviewed.

It converts the recurring "silently-broken-at-runtime" class — a service changes
a payload shape and clients only discover it in production — into a **build-time
signal at the contract's own repo**, where every consumer's correctness derives.

## How it works

1. **`extract-surface.mjs`** loads `src/index.ts` with the TypeScript type-checker
   and emits a normalized, sorted representation of every exported symbol:

   ```
   <name>\t<kind>\t<normalized-type>
   ```

   Object shapes (interfaces, classes, object type-aliases) are expanded
   member-by-member, so a change to a single field — its type, its optionality,
   or its presence — moves that symbol's line. Library/primitive types
   (`string`, `Error`, `Date`, …) and dependency types are rendered flat, so the
   surface stays scoped to the contract this package owns. The normalization is
   independent of comments, formatting, and declaration order, so the committed
   baseline diffs cleanly with no cosmetic churn.

2. **`api-surface.txt`** is the committed baseline — the agreed-upon current
   public surface. It is generated, not hand-edited.

3. **`diff-surface.mjs`** regenerates the current surface and classifies every
   difference against the baseline:

   | difference                    | classification | result                           |
   | ----------------------------- | -------------- | -------------------------------- |
   | export removed                | breaking       | **FAIL**                         |
   | export's kind or type changed | breaking       | **FAIL**                         |
   | export added                  | additive       | **PASS** (suggests a MINOR bump) |
   | identical                     | —              | PASS                             |

## Intentionally conservative

The gate **over-flags on purpose.** ANY non-additive change to a public symbol is
reported breaking. It does **not** try to prove a change is "safe" (a widened
union, an optional field becoming required, a narrowed return type): on a wire
contract consumed across repos, such changes _can_ break a consumer, and a missed
breaking change (false negative) is far worse than an over-flag (false positive)
that a human confirms is safe and overrides. **When in doubt, it fails.**

The gate only **classifies** the diff. Versioning policy — what version bump a
change warrants — is owned by `release-please`, not this gate.

## Overriding a confirmed-safe / intended breaking change

When a breaking change _is_ intentional and downstream consumers are handled,
regenerate and commit the baseline **in the same PR**:

```bash
npm run api:surface
```

The committed `api-surface.txt` diff then makes the contract change explicit and
reviewable in the PR, alongside the corresponding MAJOR version bump. That review
is exactly the human override the conservative posture is designed to route to.

## Commands

```bash
npm run api:surface         # regenerate + write the committed baseline (api-surface.txt)
npm run api:surface:check   # regenerate current surface + diff vs baseline (the gate)
```

`api:surface:check` reads from source (`src/`) and needs no build step.
