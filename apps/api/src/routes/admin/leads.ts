/**
 * Enquiries (admin brief 4.3 L1 to L5, 4.9). /leads.csv is registered before /leads/:id.
 *   L1 GET    /leads?status=&kind=&completion=&q=&cursor=&limit=   -> AdminLeadList (completion: complete | partial, form7)
 *   L2 GET    /leads/:id                               -> { lead }
 *   L3 PATCH  /leads/:id   { status?, note? }          -> { lead }
 *   L4 DELETE /leads/:id                               -> 204 (permanent; only from Archived)
 *   L5 GET    /leads.csv?status=&kind=&completion=&from=&to=       -> text/csv with a BOM and the formula guard
 */
import { BRIEF_STEP_TITLES, briefLabel, cleanText, LEAD_COMPLETIONS, LEAD_KINDS, LEAD_STATUSES, type AdminLead, type AdminLeadList, type LeadCompletion, type LeadStatus, type TrialBrief } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { HttpError, readJson } from '../../http';

export const leads = new Hono<AppEnv>();

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  created_at: string;
  kind: 'trial' | 'question';
  brand: string;
  brief: string | null;
  status: LeadStatus;
  status_at: string | null;
  note: string;
  completion: LeadCompletion;
  step_reached: number | null;
  steps: string | null;
  updated_at: string | null;
}

const COLUMNS = 'id, name, email, phone, service, message, created_at, kind, brand, brief, status, status_at, note, completion, step_reached, steps, updated_at';

function stepsOf(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).filter((e): e is [string, string] => /^[1-6]$/.test(e[0]) && typeof e[1] === 'string'));
  } catch {
    return {};
  }
}

function toLead(r: LeadRow): AdminLead {
  let brief: TrialBrief | null = null;
  if (r.brief) {
    try {
      brief = JSON.parse(r.brief) as TrialBrief;
    } catch {
      brief = null;
    }
  }
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    service: r.service,
    message: r.message,
    createdAt: r.created_at,
    kind: r.kind,
    brand: r.brand,
    brief,
    status: r.status,
    statusAt: r.status_at,
    note: r.note,
    completion: r.completion ?? 'complete',
    stepReached: r.step_reached ?? null,
    steps: stepsOf(r.steps),
    updatedAt: r.updated_at ?? null,
  };
}

/** The shared WHERE for the list and the CSV. Values are bound; `q` is matched with instr, never LIKE. */
function filters(query: (k: string) => string | undefined): { where: string[]; binds: unknown[] } {
  const where: string[] = [];
  const binds: unknown[] = [];
  const status = query('status') ?? 'all';
  if (status !== 'all') {
    if (!LEAD_STATUSES.includes(status as LeadStatus)) throw new HttpError(400, 'bad-request', 'status must be new, contacted, archived or all.', { field: 'status' });
    where.push('status = ?');
    binds.push(status);
  }
  const kind = query('kind');
  if (kind) {
    if (!LEAD_KINDS.includes(kind as 'trial')) throw new HttpError(400, 'bad-request', 'kind must be trial or question.', { field: 'kind' });
    where.push('kind = ?');
    binds.push(kind);
  }
  const completion = query('completion');
  if (completion && completion !== 'all') {
    if (!LEAD_COMPLETIONS.includes(completion as LeadCompletion)) throw new HttpError(400, 'bad-request', 'completion must be complete, partial or all.', { field: 'completion' });
    where.push('completion = ?');
    binds.push(completion);
  }
  const q = query('q')?.trim();
  if (q) {
    if (q.length > 60) throw new HttpError(400, 'bad-request', 'Search is at most 60 characters.', { field: 'q' });
    where.push('(instr(lower(name), lower(?)) > 0 OR instr(lower(email), lower(?)) > 0 OR instr(lower(brand), lower(?)) > 0 OR instr(lower(phone), lower(?)) > 0)');
    binds.push(q, q, q, q);
  }
  for (const [param, op] of [
    ['from', '>='],
    ['to', '<'],
  ] as const) {
    const v = query(param);
    if (!v) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new HttpError(400, 'bad-request', `${param} must be yyyy-mm-dd.`, { field: param });
    // `to` is inclusive: everything before the next day.
    where.push(param === 'to' ? `created_at < date(?, '+1 day')` : `created_at ${op} ?`);
    binds.push(v);
  }
  return { where, binds };
}

leads.get('/leads', async (c) => {
  const db = c.env.DB;
  const { where, binds } = filters((k) => c.req.query(k));
  const limitRaw = c.req.query('limit');
  const limit = limitRaw === undefined ? 50 : Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new HttpError(400, 'bad-request', 'limit must be 1 to 100.', { field: 'limit' });
  const cursor = c.req.query('cursor');
  if (cursor) {
    const m = /^(.{10,30})\|([\w-]{1,64})$/.exec(cursor);
    if (!m) throw new HttpError(400, 'bad-request', 'Bad cursor.', { field: 'cursor' });
    where.push('(created_at < ? OR (created_at = ? AND id < ?))');
    binds.push(m[1], m[1], m[2]);
  }
  const sql = `SELECT ${COLUMNS} FROM leads ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC LIMIT ?`;
  const [list, counts] = await db.batch<LeadRow | { status: LeadStatus; n: number }>([
    db.prepare(sql).bind(...binds, limit + 1),
    db.prepare('SELECT status, completion, COUNT(*) AS n FROM leads GROUP BY status, completion'),
  ]);
  const rows = list!.results as LeadRow[];
  const more = rows.length > limit;
  const page = rows.slice(0, limit);
  const last = page.at(-1);
  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  const partial = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  for (const r of counts!.results as { status: LeadStatus; completion: LeadCompletion; n: number }[]) (r.completion === 'partial' ? partial : byStatus)[r.status] += r.n;
  return c.json<AdminLeadList>({ leads: page.map(toLead), nextCursor: more && last ? `${last.created_at}|${last.id}` : null, counts: byStatus, partial });
});

// ---------------------------------------------------------------- L5 CSV (before /leads/:id)

const CSV_COLUMNS = ['created_at', 'status', 'kind', 'name', 'email', 'phone', 'brand', 'website', 'agency', 'package', 'videos', 'brands', 'objective', 'integration', 'must_haves', 'viewer_response', 'reference_links', 'brand_guide_url', 'message', 'note', 'completion', 'stopped_at_step'];

/** Every cell quoted with " doubled; a cell that starts with =, +, -, @, a tab or a carriage return gets a leading '. */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function withOther(label: string, other: string): string {
  return other ? `${label}: ${other}` : label;
}

leads.get('/leads.csv', async (c) => {
  const { where, binds } = filters((k) => c.req.query(k));
  const { results } = await c.env.DB.prepare(`SELECT ${COLUMNS} FROM leads ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC LIMIT 5000`)
    .bind(...binds)
    .all<LeadRow>();
  const lines = [CSV_COLUMNS.map(csvCell).join(',')];
  for (const r of results) {
    const l = toLead(r);
    const b = l.brief;
    const cells = [
      l.createdAt,
      l.status,
      l.kind,
      l.name,
      l.email,
      l.phone,
      l.brand,
      b?.website ?? '',
      b?.isAgency ? 'yes' : '',
      b?.package ? briefLabel('package', b.package) : l.service,
      b?.videos ?? '',
      b?.brands ?? '',
      b?.objective ? withOther(briefLabel('objective', b.objective), b.objectiveOther) : '',
      b?.integration ? withOther(briefLabel('integration', b.integration), b.integrationOther) : '',
      b ? [...b.mustHaves.map((m) => (m === 'other' && b.mustHavesOther ? withOther(briefLabel('mustHave', m), b.mustHavesOther) : briefLabel('mustHave', m)))].join(' | ') : '',
      b?.viewerResponse ?? '',
      b?.referenceLinks.join(' | ') ?? '',
      b?.brandGuideUrl ?? '',
      l.message,
      l.note,
      l.completion,
      l.completion !== 'partial' ? '' : l.kind === 'question' ? 'before sending' : l.stepReached ? `${l.stepReached}: ${BRIEF_STEP_TITLES[l.stepReached as 1] ?? ''}` : '',
    ];
    lines.push(cells.map(csvCell).join(','));
  }
  const day = new Date().toISOString().slice(0, 10);
  return c.body(`﻿${lines.join('\r\n')}\r\n`, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="kreators-enquiries-${day}.csv"`,
  });
});

// ---------------------------------------------------------------- L2 to L4

async function load(db: D1Database, id: string): Promise<LeadRow> {
  const row = await db.prepare(`SELECT ${COLUMNS} FROM leads WHERE id = ?`).bind(id).first<LeadRow>();
  if (!row) throw new HttpError(404, 'not-found', 'No enquiry with that id.');
  return row;
}

leads.get('/leads/:id', async (c) => c.json({ lead: toLead(await load(c.env.DB, c.req.param('id'))) }));

leads.patch('/leads/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const body = await readJson<{ status?: unknown; note?: unknown }>(c.req.raw);
  const row = await load(db, id);
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (body.status !== undefined) {
    if (!LEAD_STATUSES.includes(body.status as LeadStatus)) throw new HttpError(400, 'bad-request', 'status must be new, contacted or archived.', { field: 'status' });
    if (body.status !== row.status) {
      sets.push("status = ?, status_at = datetime('now')");
      binds.push(body.status);
    }
  }
  if (body.note !== undefined) {
    if (typeof body.note !== 'string') throw new HttpError(400, 'bad-request', 'note must be text.', { field: 'note' });
    const note = cleanText(body.note, { multiline: true });
    if (note.length > 2000) throw new HttpError(400, 'bad-request', 'The note is at most 2000 characters.', { field: 'note' });
    sets.push('note = ?');
    binds.push(note);
  }
  if (sets.length) await db.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = ?`).bind(...binds, id).run();
  return c.json({ lead: toLead(await load(db, id)) });
});

leads.delete('/leads/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const row = await load(db, id);
  if (row.status !== 'archived') throw new HttpError(409, 'conflict', 'Archive the enquiry first; only archived enquiries can be deleted for good.');
  await db.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
  return c.body(null, 204);
});
