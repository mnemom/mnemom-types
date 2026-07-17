/**
 * Canonical gateway verdict/advisory vocabulary (MNE-492 Slice 3).
 *
 * `mnemom-platform`'s gateway (`gateway/src/mnemom-headers.ts`) is the
 * producer: every response carries a structured `X-Mnemom-Verdict` header
 * (`front=<v>; autonomy=<v>; integrity=<v>; back=<v>`) plus an optional
 * `X-Mnemom-Advisory` JSON array, per ADR-042. `VerdictValue`,
 * `CheckpointVerdicts`, and `MnemomAdvisory` here are that header contract's
 * canonical shape — the types this package is the single source of truth
 * for, per this package's "types-only" doctrine (see errors.ts for the one
 * deliberate exception).
 *
 * This module is TYPES ONLY, deliberately. The header build/parse logic
 * (`buildMnemomVerdict`, `finalizeMnemomHeaders`, the per-phase setters, the
 * `AegisStatus`/`SafeHouseVerdict` → canonical mappers) stays in
 * `mnemom-platform/gateway/src/mnemom-headers.ts` — that's gateway-internal
 * wiring, not a shape other services need to reproduce. Only the SHAPE moves
 * here, so a consumer that needs to represent (not build) a verdict/advisory
 * — mnemom-api's Dojo/Safe-House-explain code today — has one canonical type
 * to import instead of a hand-declared parallel union that can silently go
 * stale (found live during MNE-492 scoping: mnemom-api's
 * `AegisVerdictStatus` hand-mirrors this exact vocab but is missing
 * `"unverified"`, a real per-axis value the gateway has emitted since
 * MNE-770 C2b for background AIP-analysis failures).
 *
 * Gateway is NOT wired to import from here yet — that's the fail-open hot
 * path, deliberately left for a follow-up, more carefully reviewed PR (see
 * the mnemom-types PR description for this module). Landing the types here
 * first, unconsumed by the producer, is intentionally the smaller, zero-
 * runtime-risk first step: nothing changes at the gateway until that
 * follow-up lands, but consumers can start migrating off their hand-mirrors
 * today.
 */

/**
 * The four possible states of a Safe House / AIP checkpoint outcome on a
 * single request axis. `unverified` is the checkpoint-didn't-run state (see
 * MNE-770 C2b: emitted when integrity analysis fails in the background and
 * no verdict was actually computed) — distinct from `pass`, which means the
 * checkpoint ran and found nothing.
 */
export type VerdictValue = 'pass' | 'observed' | 'nudged' | 'enforced' | 'unverified';

/**
 * The four canonical per-request checkpoint axes carried in the
 * `X-Mnemom-Verdict` response header: `front=<v>; autonomy=<v>;
 * integrity=<v>; back=<v>`.
 */
export interface CheckpointVerdicts {
  front: VerdictValue;
  autonomy: VerdictValue;
  integrity: VerdictValue;
  back: VerdictValue;
}

/**
 * A single entry in the `X-Mnemom-Advisory` response header (a JSON array,
 * capped at 5 entries by the gateway for header-size safety). Omitted from
 * the response entirely when no advisories fired for the request.
 */
export interface MnemomAdvisory {
  source: string;
  text: string;
  severity?: 'info' | 'warn' | 'critical';
  id?: string;
}
