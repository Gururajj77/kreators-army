/**
 * Small helpers for the admin API's answers: the error body every admin route uses (AdminErrorBody, with a `code` the admin
 * UI maps to its copy), and request bodies read under a size limit (checked from Content-Length and while reading).
 */
import type { AdminErrorBody, AdminErrorCode } from '@kreators/shared';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { AppEnv } from './env';

export class HttpError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: AdminErrorCode,
    message: string,
    readonly extra: Partial<AdminErrorBody> = {},
    readonly headers: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function errorBody(c: Context<AppEnv>, err: HttpError): AdminErrorBody {
  return { error: err.message, code: err.code, requestId: c.get('requestId'), ...err.extra };
}

export function adminError(c: Context<AppEnv>, status: ContentfulStatusCode, code: AdminErrorCode, message: string, extra: Partial<AdminErrorBody> = {}, headers: Record<string, string> = {}): Response {
  for (const [k, v] of Object.entries(headers)) c.header(k, v);
  return c.json<AdminErrorBody>({ error: message, code, requestId: c.get('requestId'), ...extra }, status);
}

export const bad = (message: string, field?: string): never => {
  throw new HttpError(400, 'bad-request', message, field ? { field } : {});
};

/** Body limits (admin brief 4.1): JSON 64 KB, dry run 1.2 MB, commit 256 KB, poster 512 KiB. */
export const LIMITS = { json: 64 * 1024, dryRun: 1_200_000, commit: 256 * 1024, poster: 512 * 1024 } as const;

/** The request body as bytes, refusing more than `max` (413 too-large) before or while reading. */
export async function readBody(req: Request, max: number): Promise<Uint8Array> {
  const declared = Number(req.headers.get('Content-Length'));
  if (Number.isFinite(declared) && declared > max) throw new HttpError(413, 'too-large', `That is too large (at most ${max} bytes).`);
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) {
      await reader.cancel().catch(() => undefined);
      throw new HttpError(413, 'too-large', `That is too large (at most ${max} bytes).`);
    }
    parts.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

/** A JSON object body (an empty body reads as {}), at most `max` bytes. */
export async function readJson<T = Record<string, unknown>>(req: Request, max: number = LIMITS.json): Promise<T> {
  const bytes = await readBody(req, max);
  if (!bytes.length) return {} as T;
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, 'bad-request', 'That request was not valid JSON.');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'bad-request', 'The body must be a JSON object.');
  return value as T;
}
