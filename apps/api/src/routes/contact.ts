import { DRAFT_ID, LEAD_EMAIL, cleanText, isPhone, validateBrief, type ApiErrorBody, type LeadDraftInput, type LeadInput } from '@kreators/shared';
import { Hono, type Context } from 'hono';
import type { AppEnv } from '../env';
import { HttpError, readJson } from '../http';

export const contact = new Hono<AppEnv>();

/** New rows (a sent enquiry or a form session's first saved draft) per address per hour. */
export const HOURLY_LIMIT = 5;
/**
 * Saves one draft may take. (save16) The form saves on every button press, each choice and each field left, but only when
 * something changed: one careful pass through the brief is about 25 to 35 saves, a second pass from the review's Edit links
 * about 20 more, plus one per tab switch with a change. 100 leaves room for that; a bot still cannot write without limit.
 */
export const MAX_DRAFT_SAVES = 100;
const BODY_LIMIT = 64 * 1024;

// Kept as v1 hashed it (SHA-256 of "<ADMIN_KEY>:<ip>"), so the hourly limit does not reset for anyone on deploy (admin brief 1.1).
async function hashIp(ip: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const text = (value: unknown, max: number, multiline = false) => (typeof value === 'string' ? cleanText(value, { multiline }).slice(0, max) : '');
const fail = (c: Context<AppEnv>, error: string, field?: string) => c.json<ApiErrorBody & { field?: string }>({ error, requestId: c.get('requestId'), ...(field ? { field } : {}) }, 400);
const tooMany = (c: Context<AppEnv>) => c.json<ApiErrorBody>({ error: 'Too many messages. Please email us instead.', requestId: c.get('requestId') }, 429);
/** SQLite's datetime('now') format, so every timestamp in the row reads alike. */
const stamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

type Body = Record<string, unknown>;

async function readLead(c: Context<AppEnv>): Promise<Body | Response> {
  try {
    return await readJson<Body>(c.req.raw, BODY_LIMIT);
  } catch (err) {
    if (err instanceof HttpError) return c.json<ApiErrorBody>({ error: err.status === 413 ? 'That message is too long. Please email us instead.' : 'That request was not valid JSON.', requestId: c.get('requestId') }, err.status === 413 ? 413 : 400);
    throw err;
  }
}

interface CleanLead {
  kind: 'trial' | 'question';
  name: string;
  email: string;
  phone: string;
  brand: string;
  service: string;
  message: string;
  brief: string | null;
}

/**
 * The one set of checks for a sent enquiry and a saved draft. A sent one needs a name and a valid email (and a brand for a
 * trial), as in v1. A draft may have neither name nor brand yet, but needs a valid email or a phone someone could call,
 * so an empty draft is never stored. Every free-text value goes through cleanText; an unknown brief option is a 400.
 */
function cleanLead(c: Context<AppEnv>, body: Body, draft: boolean): CleanLead | Response {
  const kind = body.kind === undefined || body.kind === null ? 'question' : body.kind;
  if (kind !== 'trial' && kind !== 'question') return fail(c, 'Unknown kind of enquiry.', 'kind');
  const name = text(body.name, 120);
  const email = text(body.email, 200);
  const phone = text(body.phone, 40);
  if (draft) {
    if (email && !LEAD_EMAIL.test(email)) return fail(c, 'Please add a valid email address.', 'email');
    if (!email && !isPhone(phone)) return fail(c, 'A draft needs a valid email address or phone number.', 'email');
  } else {
    if (!name) return fail(c, 'Please add your name.', 'name');
    if (!LEAD_EMAIL.test(email)) return fail(c, 'Please add a valid email address.', 'email');
  }
  const brand = text(body.brand, 200);
  if (kind === 'trial' && !brand && !draft) return fail(c, 'Please add the brand this trial is for.', 'brand');
  if (brand.length > 120) return fail(c, 'The brand name is too long (at most 120 characters).', 'brand');

  let brief: string | null = null;
  if (kind === 'trial' && body.brief !== undefined && body.brief !== null) {
    const r = validateBrief(body.brief);
    if (!r.ok) return fail(c, r.error, `brief.${r.field}`);
    brief = JSON.stringify(r.brief);
  }
  return { kind, name, email, phone, brand: kind === 'trial' ? brand : brand.slice(0, 120), service: text(body.service, 60), message: text(body.message, 4000, true), brief };
}

async function ipHashOf(c: Context<AppEnv>) {
  return hashIp(c.req.header('CF-Connecting-IP') ?? 'unknown', c.env.ADMIN_KEY ?? 'local');
}

async function overLimit(c: Context<AppEnv>, ipHash: string): Promise<boolean> {
  const recent = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')").bind(ipHash).first<{ n: number }>();
  return (recent?.n ?? 0) >= HOURLY_LIMIT;
}

const step = (value: unknown, kind: CleanLead['kind']): number | null => {
  if (kind === 'question') return 1;
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6 ? value : null;
};

function withStep(steps: string | null, at: number, when: string): string {
  let map: Record<string, string> = {};
  try {
    const parsed: unknown = steps ? JSON.parse(steps) : {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) map = parsed as Record<string, string>;
  } catch {
    map = {};
  }
  map[String(at)] = when;
  return JSON.stringify(map);
}

interface DraftRow {
  id: string;
  completion: 'partial' | 'complete';
  steps: string | null;
  step_reached: number | null;
  saves: number;
}

const findDraft = (c: Context<AppEnv>, draftId: string) =>
  c.env.DB.prepare('SELECT id, completion, steps, step_reached, saves FROM leads WHERE draft_id = ?').bind(draftId).first<DraftRow>();

/**
 * POST /api/contact (V2-SPEC 2.9). A trial request (kind 'trial') carries the brand and the guided brief; a question (or a
 * v1 form with no kind) does not. The honeypot and the 5-an-hour limit per address stay as in v1. (form7) With the form
 * session's draftId, the saved partial lead becomes this complete one: no second row, and not counted again by the limit.
 */
contact.post('/', async (c) => {
  const body = await readLead(c);
  if (body instanceof Response) return body;
  // A bot fills in the hidden field. It is told all went well, so it has no reason to try again.
  if (text(body.company, 100)) return c.json({ ok: true }, 201);
  const lead = cleanLead(c, body as Partial<LeadInput> & Body, false);
  if (lead instanceof Response) return lead;

  const db = c.env.DB;
  const when = stamp();
  // An id that is not one of ours (an old form, or a mangled one) is ignored: the enquiry is still taken.
  const draftId = typeof body.draftId === 'string' && DRAFT_ID.test(body.draftId) ? body.draftId : null;
  const last = lead.kind === 'trial' ? 6 : 1;
  if (draftId) {
    const row = await findDraft(c, draftId);
    // Sent already (a double press, or a retry after a lost answer): the same success, never a second row.
    if (row?.completion === 'complete') return c.json({ ok: true }, 201);
    if (row) {
      // Sending is when it is received: the inbox orders by created_at. A partial the founder archived comes back to New.
      await db
        .prepare(
          `UPDATE leads SET name = ?, email = ?, phone = ?, service = ?, message = ?, kind = ?, brand = ?, brief = ?, completion = 'complete',
             step_reached = ?, steps = ?, saves = saves + 1, created_at = ?, updated_at = ?, completed_at = ?,
             status = CASE WHEN status = 'archived' THEN 'new' ELSE status END
           WHERE id = ? AND completion = 'partial'`,
        )
        .bind(lead.name, lead.email, lead.phone, lead.service, lead.message, lead.kind, lead.brand, lead.brief, Math.max(row.step_reached ?? 0, last), withStep(row.steps, last, when), when, when, when, row.id)
        .run();
      return c.json({ ok: true }, 201);
    }
  }

  const ipHash = await ipHashOf(c);
  if (await overLimit(c, ipHash)) return tooMany(c);
  await db
    .prepare(
      `INSERT INTO leads (id, name, email, phone, service, message, ip_hash, kind, brand, brief, status, draft_id, completion, step_reached, steps, updated_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 'complete', ?, ?, ?, ?)`,
    )
    .bind(crypto.randomUUID(), lead.name, lead.email, lead.phone, lead.service, lead.message, ipHash, lead.kind, lead.brand, lead.brief, draftId, draftId ? last : null, draftId ? withStep(null, last, when) : null, when, when)
    .run();
  return c.json({ ok: true }, 201);
});

/**
 * POST /api/contact/draft (form7, save16). The answers so far, sent on each button press, choice or field left, and when the page is left
 * (navigator.sendBeacon, so the body may arrive as text/plain). Upserts one partial lead per draftId: the furthest step
 * reached, when each step was saved, and the answers. Same checks, size limit, honeypot and hourly limit as a sent
 * enquiry (the limit counts the draft's row once, when it is first stored). A draft that was already sent is left alone.
 */
contact.post('/draft', async (c) => {
  const body = await readLead(c);
  if (body instanceof Response) return body;
  if (text(body.company, 100)) return c.json({ ok: true }, 201);
  const draftId = typeof body.draftId === 'string' && DRAFT_ID.test(body.draftId) ? body.draftId : null;
  if (!draftId) return fail(c, 'A draft needs its id.', 'draftId');
  const lead = cleanLead(c, body as Partial<LeadDraftInput> & Body, true);
  if (lead instanceof Response) return lead;
  const at = step(body.step, lead.kind);
  if (at === null) return fail(c, 'step must be a whole number from 1 to 6.', 'step');
  const reached = Math.max(at, step(body.reached, lead.kind) ?? at);

  const db = c.env.DB;
  const when = stamp();
  const row = await findDraft(c, draftId);
  if (row?.completion === 'complete') return c.json({ ok: true, sent: true }, 200);
  if (row) {
    if (row.saves >= MAX_DRAFT_SAVES) return tooMany(c);
    await db
      .prepare(
        `UPDATE leads SET name = ?, email = ?, phone = ?, service = ?, message = ?, kind = ?, brand = ?, brief = ?,
           step_reached = ?, steps = ?, saves = saves + 1, updated_at = ?
         WHERE id = ? AND completion = 'partial'`,
      )
      .bind(lead.name, lead.email, lead.phone, lead.service, lead.message, lead.kind, lead.brand, lead.brief, Math.max(row.step_reached ?? 0, reached), withStep(row.steps, at, when), when, row.id)
      .run();
    return c.json({ ok: true }, 200);
  }

  const ipHash = await ipHashOf(c);
  if (await overLimit(c, ipHash)) return tooMany(c);
  try {
    await db
      .prepare(
        `INSERT INTO leads (id, name, email, phone, service, message, ip_hash, kind, brand, brief, status, draft_id, completion, step_reached, steps, saves, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 'partial', ?, ?, 1, ?)`,
      )
      .bind(crypto.randomUUID(), lead.name, lead.email, lead.phone, lead.service, lead.message, ipHash, lead.kind, lead.brand, lead.brief, draftId, reached, withStep(null, at, when), when)
      .run();
  } catch (err) {
    // Two saves of a new draft at once (Next, then the page closing): the other one stored it.
    if (err instanceof Error && /UNIQUE/i.test(err.message)) return c.json({ ok: true }, 200);
    throw err;
  }
  return c.json({ ok: true }, 201);
});
