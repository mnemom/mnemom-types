"""Canonical gateway verdict/advisory vocabulary (MNE-492 Slice 3).

``mnemom-platform``'s gateway (``gateway/src/mnemom-headers.ts``) is the
producer: every response carries a structured ``X-Mnemom-Verdict`` header
(``front=<v>; autonomy=<v>; integrity=<v>; back=<v>``) plus an optional
``X-Mnemom-Advisory`` JSON array, per ADR-042. ``VerdictValue``,
``CheckpointVerdicts``, and ``MnemomAdvisory`` here are that header
contract's canonical shape. Mirror of ``typescript/src/verdict.ts`` — see
that file's doc comment for the full rationale (including the live
``AegisVerdictStatus`` drift this closes: it hand-mirrors this vocab but is
missing ``"unverified"``, a real per-axis value the gateway has emitted
since MNE-770 C2b for background AIP-analysis failures).

TYPES ONLY, deliberately — the header build/parse logic stays in the
gateway. Gateway itself is NOT wired to import from here yet (fail-open hot
path, left for a follow-up, more carefully reviewed change); this lands the
shape only, so Python-side consumers (if any) have the same canonical vocab
TypeScript consumers get.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

VerdictValue = Literal["pass", "observed", "nudged", "enforced", "unverified"]
"""The four possible states of a Safe House / AIP checkpoint outcome on a
single request axis. ``unverified`` is the checkpoint-didn't-run state
(MNE-770 C2b) — distinct from ``pass``, which means the checkpoint ran and
found nothing."""


class CheckpointVerdicts(BaseModel):
    """The four canonical per-request checkpoint axes carried in the
    ``X-Mnemom-Verdict`` response header: ``front=<v>; autonomy=<v>;
    integrity=<v>; back=<v>``."""

    front: VerdictValue
    autonomy: VerdictValue
    integrity: VerdictValue
    back: VerdictValue


class MnemomAdvisory(BaseModel):
    """A single entry in the ``X-Mnemom-Advisory`` response header (a JSON
    array, capped at 5 entries by the gateway for header-size safety).
    Omitted from the response entirely when no advisories fired for the
    request."""

    source: str
    text: str
    severity: Optional[Literal["info", "warn", "critical"]] = Field(
        None, description="Advisory severity, when classified"
    )
    id: Optional[str] = Field(None, description="Stable advisory identifier, when assigned")
