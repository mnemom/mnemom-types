"""Canonical Mnemom error envelope — the single cross-service definition.

Every Mnemom API 4xx/5xx response conforms to the NESTED canonical envelope
(ADR-API-001 conv 1): ``error`` is ALWAYS an object, never a bare string::

    {"error": {"code": "<snake_case>", "message": "<human>", "details"?: <any>},
     "spec_deviation"?: {"keyword", "field"?, "original_status"?}}

Source-verified across the fleet (CLI wave-1, SDK wave-2): the spec-validate
enforce hook normalizes every body to this shape on the wire. Two flat shapes
still exist at the source level (``{"error": "msg"}`` and
``{"error": "msg", "code": ...}``) for non-enforce contexts (local dev,
enforce=observe) — the parser tolerates them.

This is the ONE parser the whole fleet imports (risk, reputation, and any other
Python client) instead of maintaining drifting copies. It is the deliberate
exception to this package's "types-only" doctrine: a single, tiny,
dependency-free runtime helper (pydantic is already a dependency) that IS the
source of truth for error parsing. Mirror of ``typescript/src/errors.ts``.

ENVIRONMENT-AGNOSTIC: ``parse_mnemom_error`` takes an already-parsed BODY (dict
or str), never an HTTP response object. The HTTP status lives on the response,
not the body, so it's supplied to ``MnemomError.from_response`` (which assembles
status + effective_status).
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class SpecDeviation(BaseModel):
    """Enforce-hook deviation sibling.

    The enforce hook can REWRITE an undocumented status to a synthetic 500,
    attaching ``original_status`` = the true status. Consumers MUST branch on
    ``MnemomError.effective_status``, not the wire ``status``.
    """

    keyword: Optional[str] = Field(None, description="Deviation keyword")
    field: Optional[str] = Field(None, description="Offending field path")
    original_status: Optional[int] = Field(
        None, description="The true status the enforce hook rewrote away"
    )


class ErrorBody(BaseModel):
    """The inner object of the canonical envelope (never a bare string)."""

    code: str = Field(..., description="Stable lowercase snake_case failure code")
    message: str = Field(..., description="Human-readable, care-framed explanation")
    details: Any = Field(None, description="Optional structured failure context")


class ErrorEnvelope(BaseModel):
    """The canonical wire error envelope — ``error`` is always an object."""

    error: ErrorBody
    spec_deviation: Optional[SpecDeviation] = None


class ParsedMnemomError(BaseModel):
    """Fields parsed FROM THE BODY alone.

    Deliberately does NOT include ``status``/``effective_status`` — those come
    from the HTTP response, not the body, and are assembled by
    ``MnemomError.from_response``.
    """

    code: Optional[str] = Field(None, description="Stable machine code (error.code)")
    message: Optional[str] = Field(None, description="Human-readable message")
    details: Any = Field(None, description="Structured failure context (error.details)")
    spec_deviation: Optional[SpecDeviation] = Field(
        None, description="The enforce-hook deviation sibling (carries original_status)"
    )


def parse_mnemom_error(body: Any) -> ParsedMnemomError:
    """Parse a Mnemom error BODY (already-parsed dict/str) NESTED-FIRST.

    Priority: nested ``error.{message,code,details}`` -> flat ``error: "msg"``
    -> top-level ``message``/``detail`` -> top-level ``code``. Reading the
    nested object's fields FIRST is the whole point: a naive top-level read sees
    ``body["error"]`` as a dict and silently drops the message (the bug this
    kills). Environment-agnostic: takes a BODY, never a response. Never raises.
    """
    message: Optional[str] = None
    code: Optional[str] = None
    details: Any = None
    spec_deviation: Optional[SpecDeviation] = None

    if isinstance(body, str):
        if body:
            message = body
    elif isinstance(body, dict):
        err = body.get("error")
        if isinstance(err, dict):
            # Canonical nested {"error": {"code", "message", "details"}}.
            msg = err.get("message")
            if isinstance(msg, str) and msg:
                message = msg
            c = err.get("code")
            if isinstance(c, str) and c:
                code = c
            details = err.get("details")
        elif isinstance(err, str) and err:
            # Flat {"error": "msg"}.
            message = err
        # Top-level fallbacks when the above didn't populate.
        if not message:
            for key in ("message", "detail"):
                v = body.get(key)
                if isinstance(v, str) and v:
                    message = v
                    break
        if not code:
            c = body.get("code")
            if isinstance(c, str) and c:
                code = c
        dev = body.get("spec_deviation")
        if isinstance(dev, dict):
            spec_deviation = SpecDeviation(**dev)

    return ParsedMnemomError(
        code=code, message=message, details=details, spec_deviation=spec_deviation
    )


class MnemomError(Exception):
    """Reference structured error.

    Consumers MAY raise it directly or subclass it for their own care-framed
    error hierarchy. Carries the parsed fields plus the HTTP status so callers
    branch on ``effective_status``/``code`` without re-parsing the message.
    """

    def __init__(
        self,
        message: str,
        *,
        status: Optional[int] = None,
        effective_status: Optional[int] = None,
        code: Optional[str] = None,
        details: Any = None,
        spec_deviation: Optional[SpecDeviation] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code
        self.details = details
        self.spec_deviation = spec_deviation
        self.effective_status = (
            effective_status
            if effective_status is not None
            else (
                spec_deviation.original_status
                if spec_deviation and spec_deviation.original_status is not None
                else status
            )
        )

    @classmethod
    def from_response(
        cls,
        body: Any,
        status: Optional[int] = None,
        fallback_message: str = "Request failed",
    ) -> MnemomError:
        """Assemble a MnemomError from a raw wire BODY + HTTP status."""
        parsed = parse_mnemom_error(body)
        message = parsed.message or (
            f"{fallback_message}: {status}" if status is not None else fallback_message
        )
        return cls(
            message,
            status=status,
            code=parsed.code,
            details=parsed.details,
            spec_deviation=parsed.spec_deviation,
        )
