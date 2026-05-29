/**
 * Canonical Mnemom error envelope — the single cross-service definition.
 *
 * Every Mnemom API 4xx/5xx response conforms to the NESTED canonical envelope
 * (ADR-API-001 conv 1): `error` is ALWAYS an object, never a bare string.
 *
 *     { "error": { "code": "<snake_case>", "message": "<human>", "details"?: <any> },
 *       "spec_deviation"?: { "keyword", "field"?, "original_status"? } }
 *
 * Source-verified across the fleet (CLI wave-1, SDK wave-2): the spec-validate
 * enforce hook normalizes every body to this shape on the wire. Two flat shapes
 * still exist at the source level (`{error:"msg"}` and `{error:"msg",code}`) for
 * non-enforce contexts (local dev, enforce=observe) — the parser tolerates them.
 *
 * This is the ONE parser the whole fleet imports (CLI, SDK, website, risk,
 * reputation) instead of maintaining five drifting copies. It is the deliberate
 * exception to this package's "types-only" doctrine: a single, tiny,
 * dependency-free runtime helper that IS the source of truth for error parsing.
 *
 * ENVIRONMENT-AGNOSTIC by design: `parseMnemomError` takes an already-parsed
 * BODY object — never a fetch Response — so no runtime/fetch dependency leaks
 * into this package. Each consumer keeps its own thin `Response → body` adapter
 * (res.json() / res.clone().json() / pydantic) and delegates the parsing LOGIC
 * here. The HTTP status lives on the Response, not the body, so it's supplied
 * to `MnemomError.fromResponse` (which assembles status + effectiveStatus).
 */

/**
 * Enforce-hook deviation sibling. The enforce hook can REWRITE an undocumented
 * status to a synthetic 500, attaching `original_status` = the true status.
 * Consumers MUST branch on `MnemomError.effectiveStatus`, not the wire `status`.
 */
export interface SpecDeviation {
  keyword?: string;
  field?: string;
  original_status?: number;
}

/** The canonical wire error envelope — `error` is always an object. */
export interface ErrorEnvelope {
  error: {
    /** Stable, machine-matchable failure code (lowercase snake_case). */
    code: string;
    /** Human-readable, care-framed explanation. */
    message: string;
    /** Optional structured context (validation findings, conflict diff, …). */
    details?: unknown;
  };
  spec_deviation?: SpecDeviation;
}

/**
 * Fields parsed FROM THE BODY (envelope) alone. Deliberately does NOT include
 * `status`/`effectiveStatus` — those come from the HTTP Response, not the body,
 * and are assembled by `MnemomError.fromResponse`.
 */
export interface ParsedMnemomError {
  /** Stable machine code (`error.code`). */
  code?: string;
  /** Human-readable message (`error.message`, or a flat-shape fallback). */
  message?: string;
  /** Structured failure context (`error.details`). */
  details?: unknown;
  /** The enforce-hook deviation sibling, when present (carries original_status). */
  specDeviation?: SpecDeviation;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Parse a Mnemom error BODY (already-parsed object/string) NESTED-FIRST.
 *
 * Priority: nested `error.{message,code,details}` → flat `error:"msg"` →
 * top-level `message`/`detail` → top-level `code`. Reading the nested object's
 * fields FIRST is the whole point: a naive top-level-string read sees
 * `body.error` as an object and silently drops the message (the bug this kills).
 *
 * Environment-agnostic: takes a BODY, never a Response. Never throws.
 */
export function parseMnemomError(body: unknown): ParsedMnemomError {
  let message: string | undefined;
  let code: string | undefined;
  let details: unknown;
  let specDeviation: SpecDeviation | undefined;

  if (typeof body === 'string') {
    if (body.length > 0) message = body;
  } else if (isObject(body)) {
    const err = body.error;
    if (isObject(err)) {
      // Canonical nested {error:{code,message,details}}.
      if (typeof err.message === 'string' && err.message.length > 0) message = err.message;
      if (typeof err.code === 'string' && err.code.length > 0) code = err.code;
      details = err.details;
    } else if (typeof err === 'string' && err.length > 0) {
      // Flat {error:"msg"}.
      message = err;
    }
    // Top-level fallbacks when the above didn't populate.
    if (!message) {
      for (const key of ['message', 'detail']) {
        const v = body[key];
        if (typeof v === 'string' && v.length > 0) {
          message = v;
          break;
        }
      }
    }
    if (!code && typeof body.code === 'string' && body.code.length > 0) code = body.code;
    const dev = body.spec_deviation;
    if (isObject(dev)) specDeviation = dev as SpecDeviation;
  }

  return { code, message, details, specDeviation };
}

/** Constructor fields for MnemomError (status comes from the Response). */
export interface MnemomErrorFields {
  status?: number;
  effectiveStatus?: number;
  code?: string;
  details?: unknown;
  specDeviation?: SpecDeviation;
}

/**
 * Reference structured error. Consumers MAY use it directly or as a base for
 * their own care-framed subclasses (e.g. the SDK's AuthError/ValidationError).
 * Carries the parsed fields plus the HTTP status so callers branch on
 * `.effectiveStatus`/`.code` without re-parsing the message string.
 */
export class MnemomError extends Error {
  /** Wire HTTP status (may be a synthetic 500 from the enforce hook). */
  readonly status?: number;
  /**
   * The TRUE intended status: `specDeviation.original_status ?? status`.
   * Branch on THIS for 404/empty-state detection — the enforce hook can rewrite
   * an undocumented status to a synthetic 500.
   */
  readonly effectiveStatus?: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly specDeviation?: SpecDeviation;

  constructor(message: string, fields: MnemomErrorFields = {}) {
    super(message);
    this.name = 'MnemomError';
    this.status = fields.status;
    this.code = fields.code;
    this.details = fields.details;
    this.specDeviation = fields.specDeviation;
    this.effectiveStatus =
      fields.effectiveStatus ?? fields.specDeviation?.original_status ?? fields.status;
  }

  /**
   * Assemble a MnemomError from a raw wire BODY + HTTP status. Runs the
   * canonical body parser, computes `effectiveStatus`, and falls back to
   * `${fallbackMessage}: ${status}` when the body carried no message.
   */
  static fromResponse(
    body: unknown,
    status?: number,
    fallbackMessage = 'Request failed',
  ): MnemomError {
    const parsed = parseMnemomError(body);
    const message =
      parsed.message ?? `${fallbackMessage}${status !== undefined ? `: ${status}` : ''}`;
    return new MnemomError(message, {
      status,
      code: parsed.code,
      details: parsed.details,
      specDeviation: parsed.specDeviation,
    });
  }
}
