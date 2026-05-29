import { describe, it, expect } from 'vitest';

import { parseMnemomError, MnemomError } from '../errors';

describe('parseMnemomError (body-only)', () => {
  it('reads the canonical NESTED {error:{code,message,details}} first', () => {
    const p = parseMnemomError({
      error: { code: 'not_found', message: 'agent is not on file', details: { id: 'x' } },
    });
    expect(p.message).toBe('agent is not on file');
    expect(p.code).toBe('not_found');
    expect(p.details).toEqual({ id: 'x' });
  });

  it('does NOT drop the message when error is an object (the regression)', () => {
    // A naive top-level-string read would see body.error as an object and
    // return undefined — this is the bug the parser exists to kill.
    const p = parseMnemomError({ error: { code: 'forbidden', message: 'outside org scope' } });
    expect(p.message).toBe('outside org scope');
  });

  it('tolerates the flat {error:"msg"} shape', () => {
    const p = parseMnemomError({ error: 'plain flat message' });
    expect(p.message).toBe('plain flat message');
    expect(p.code).toBeUndefined();
  });

  it('tolerates flat {error:"msg", code} (auth-route shape)', () => {
    const p = parseMnemomError({ error: 'auth not configured', code: 'auth_not_configured' });
    expect(p.message).toBe('auth not configured');
    expect(p.code).toBe('auth_not_configured');
  });

  it('falls back to top-level message/detail only when error carries none', () => {
    expect(parseMnemomError({ message: 'legacy top-level' }).message).toBe('legacy top-level');
    expect(parseMnemomError({ detail: 'detail field' }).message).toBe('detail field');
  });

  it('captures spec_deviation from the body', () => {
    const p = parseMnemomError({
      error: { code: 'undocumented_status_code', message: 'Internal error.' },
      spec_deviation: { keyword: 'status_code_conformance', original_status: 404 },
    });
    expect(p.specDeviation?.original_status).toBe(404);
  });

  it('accepts a bare string body', () => {
    expect(parseMnemomError('raw text').message).toBe('raw text');
  });

  it('returns empty fields (no throw) for null / non-object bodies', () => {
    expect(parseMnemomError(null).message).toBeUndefined();
    expect(parseMnemomError(undefined).message).toBeUndefined();
    expect(parseMnemomError(42).message).toBeUndefined();
  });
});

describe('MnemomError', () => {
  it('carries the structured fields', () => {
    const e = new MnemomError('boom', { status: 409, code: 'conflict', details: { a: 1 } });
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toBe('boom');
    expect(e.status).toBe(409);
    expect(e.effectiveStatus).toBe(409);
    expect(e.code).toBe('conflict');
    expect(e.details).toEqual({ a: 1 });
  });

  it('fromResponse assembles status + prefers the server message', () => {
    const e = MnemomError.fromResponse(
      { error: { code: 'forbidden', message: 'outside org scope' } },
      403,
    );
    expect(e.message).toBe('outside org scope');
    expect(e.status).toBe(403);
    expect(e.effectiveStatus).toBe(403);
    expect(e.code).toBe('forbidden');
  });

  it('fromResponse falls back to "${fallback}: ${status}" when no message', () => {
    const e = MnemomError.fromResponse({}, 503, 'Request failed');
    expect(e.message).toBe('Request failed: 503');
  });

  it('fromResponse: effectiveStatus unwraps an enforce-hook synthetic-500 rewrite', () => {
    const e = MnemomError.fromResponse(
      {
        error: { code: 'undocumented_status_code', message: 'Internal error.' },
        spec_deviation: { keyword: 'status_code_conformance', original_status: 404 },
      },
      500,
    );
    expect(e.status).toBe(500); // wire
    expect(e.effectiveStatus).toBe(404); // true — consumers branch on this
    expect(e.specDeviation?.original_status).toBe(404);
  });
});
