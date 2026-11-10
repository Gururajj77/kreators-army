import { cleanText, validateBrief, type ApiErrorBody, type LeadInput } from '@kreators/shared';
import { Hono, type Context } from 'hono';
import type { AppEnv } from '../env';
import { HttpError, readJson } from '../http';

export const contact = new Hono<AppEnv>();

const HOURLY_LIMIT = 5;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Kept as v1 hashed it (SHA-256 of "<ADMIN_KEY>:<ip>"), so the hourly limit does not reset for anyone on deploy (admin brief 1.1).
async function hashIp(ip: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const text = (value: unknown, max: number, multiline = false) => (typeof value === 'string' ? cleanText(value, { multiline }).slice(0, max) : '');
const fail = (c: Context<AppEnv>, error: string, field?: string) => c.json<ApiErrorBody & { field?: string }>({ error, requestId: c.get('requestId'), ...(field ? { field } : {}) }, 400);

/**
 * POST /api/contact (V2-SPEC 2.9). A trial request (kind 'trial') carries the brand and the guided brief; a question (or a
 * v1 form with no kind) does not. Every free-text value goes through cleanText. An unknown brief option is a 400, never
 * dropped. The honeypot and the 5-an-hour limit per address stay as in v1.
 */
contact.post('/', async (c) => {
  let body: Partial<LeadInput> & Record<string, unknown>;
  try {
    body = await readJson(c.req.raw, 64 * 1024);
  } catch (err) {
    if (err instanceof HttpError) return c.json<ApiErrorBody>({ error: err.status === 413 ? 'That message is too long. Please email us instead.' : 'That request was not valid JSON.', requestId: c.get('requestId') }, err.status === 413 ? 413 : 400);
    throw err;
  }
  // A bot fills in the hidden field. It is told all went well, so it has no reason to try again.
  if (text(body.company, 100)) return c.json({ ok: true }, 201);

  const kind = body.kind === undefined || body.kind === null ? 'question' : body.kind;
  if (kind !== 'trial' && kind !== 'question') return fail(c, 'Unknown kind of enquiry.', 'kind');
  const name = text(body.name, 120);
  const email = text(body.email, 200);
  if (!name) return fail(c, 'Please add your name.', 'name');
  if (!EMAIL.test(email)) return fail(c, 'Please add a valid email address.', 'email');
  const brand = text(body.brand, 200);
  if (kind === 'trial' && !brand) return fail(c, 'Please add the brand this trial is for.', 'brand');
  if (brand.length > 120) return fail(c, 'The brand name is too long (at most 120 characters).', 'brand');

  let brief: string | null = null;
  if (kind === 'trial' && body.brief !== undefined && body.brief !== null) {
    const r = validateBrief(body.brief);
    if (!r.ok) return fail(c, r.error, `brief.${r.field}`);
    brief = JSON.stringify(r.brief);
  }

  const ipHash = await hashIp(c.req.header('CF-Connecting-IP') ?? 'unknown', c.env.ADMIN_KEY ?? 'local');
  const recent = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')").bind(ipHash).first<{ n: number }>();
  if ((recent?.n ?? 0) >= HOURLY_LIMIT) return c.json<ApiErrorBody>({ error: 'Too many messages. Please email us instead.', requestId: c.get('requestId') }, 429);

  await c.env.DB.prepare(
    "INSERT INTO leads (id, name, email, phone, service, message, ip_hash, kind, brand, brief, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')",
  )
    .bind(crypto.randomUUID(), name, email, text(body.phone, 40), text(body.service, 60), text(body.message, 4000, true), ipHash, kind, kind === 'trial' ? brand : brand.slice(0, 120), brief)
    .run();
  return c.json({ ok: true }, 201);
});
