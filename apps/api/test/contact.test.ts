// (form7) The guided brief saves as it goes: POST /api/contact/draft upserts one partial lead per form session, the send turns
// that row into the complete lead, and the draft endpoint has the sent form's checks, size limit, honeypot and hourly limit.
import { beforeEach, describe, expect, it } from 'vitest';
import type { AdminLead, AdminLeadList } from '@kreators/shared';
import worker from '../src/index';
import { HOURLY_LIMIT, MAX_DRAFT_SAVES } from '../src/routes/contact';
import { installFakeCache, makeD1 } from './d1-sqlite';

const KEY = 'amber-basil-cedar-delta-1234';
const ORIGIN = 'https://kreators.test';
const DRAFT = 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e';

let d1: ReturnType<typeof makeD1>;
let env: Record<string, unknown>;
const ctx = { waitUntil: () => undefined, passThroughOnException: () => undefined } as unknown as ExecutionContext;

async function post(path: string, body: unknown, ip = '198.51.100.7', type = 'application/json'): Promise<Response> {
  return worker.fetch(
    new Request(`${ORIGIN}${path}`, { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers: { 'Content-Type': type, 'CF-Connecting-IP': ip, Origin: ORIGIN } }),
    env as never,
    ctx,
  );
}
async function admin<T>(path: string): Promise<T> {
  const res = await worker.fetch(new Request(`${ORIGIN}/api/admin${path}`, { headers: { Authorization: `Bearer ${KEY}`, 'CF-Connecting-IP': '203.0.113.9' } }), env as never, ctx);
  expect(res.status).toBe(200);
  return (await res.json()) as T;
}
const rows = () => d1.db.prepare('SELECT * FROM leads ORDER BY created_at').all() as Record<string, unknown>[];

const step1 = { draftId: DRAFT, kind: 'trial', step: 1, reached: 2, name: 'Priya', email: 'priya@example.com', phone: '', brand: 'Chai Co', service: '10 videos', message: '', brief: { website: 'chai.co', package: '10' } };

beforeEach(() => {
  d1 = makeD1();
  installFakeCache();
  env = { DB: d1.d1, ADMIN_KEY: KEY, PUBLIC_URL: ORIGIN };
});

describe('POST /api/contact/draft (upsert)', () => {
  it('stores one partial lead for the first step, then updates the same row with each later step', async () => {
    expect((await post('/api/contact/draft', step1)).status).toBe(201);
    let all = rows();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ completion: 'partial', status: 'new', step_reached: 2, draft_id: DRAFT, name: 'Priya', brand: 'Chai Co', saves: 1 });
    expect(Object.keys(JSON.parse(all[0]!.steps as string))).toEqual(['1']);

    const res = await post('/api/contact/draft', { ...step1, step: 2, reached: 3, brief: { ...step1.brief, objective: 'paid' } });
    expect(res.status).toBe(200);
    all = rows();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ step_reached: 3, saves: 2 });
    expect(JSON.parse(all[0]!.brief as string)).toMatchObject({ objective: 'paid', website: 'chai.co', package: '10' });
    expect(Object.keys(JSON.parse(all[0]!.steps as string)).sort()).toEqual(['1', '2']);

    // Going back to step 1 and leaving: the furthest step stays 3.
    await post('/api/contact/draft', { ...step1, step: 1, reached: 1 });
    expect(rows()[0]).toMatchObject({ step_reached: 3, saves: 3 });
  });

  it('takes a sendBeacon body sent as text/plain', async () => {
    expect((await post('/api/contact/draft', JSON.stringify(step1), undefined, 'text/plain;charset=UTF-8')).status).toBe(201);
    expect(rows()).toHaveLength(1);
  });

  it('a phone alone is enough to start a draft; question drafts are always step 1', async () => {
    const res = await post('/api/contact/draft', { draftId: DRAFT, kind: 'question', step: 4, reached: 6, name: '', email: '', phone: '+91 98450 12345', message: 'How fast?' });
    expect(res.status).toBe(201);
    expect(rows()[0]).toMatchObject({ kind: 'question', email: '', phone: '+91 98450 12345', step_reached: 1, completion: 'partial' });
  });

  it('the admin inbox lists it as partial with its steps, filters by completion, and keeps it out of the New count', async () => {
    await post('/api/contact/draft', { ...step1, step: 2, reached: 3 });
    await post('/api/contact', { kind: 'question', name: 'Ravi', email: 'ravi@example.com', phone: '', service: '', message: 'Hi' });
    const all = await admin<AdminLeadList>('/leads');
    expect(all.leads).toHaveLength(2);
    expect(all.counts.new).toBe(1);
    expect(all.partial.new).toBe(1);
    const partial = await admin<AdminLeadList>('/leads?completion=partial');
    expect(partial.leads.map((l) => l.name)).toEqual(['Priya']);
    expect(partial.leads[0]).toMatchObject({ completion: 'partial', stepReached: 3 });
    expect(Object.keys(partial.leads[0]!.steps)).toEqual(['2']);
    expect((await admin<AdminLeadList>('/leads?completion=complete')).leads.map((l) => l.name)).toEqual(['Ravi']);
    const csv = await worker.fetch(new Request(`${ORIGIN}/api/admin/leads.csv?completion=partial`, { headers: { Authorization: `Bearer ${KEY}` } }), env as never, ctx);
    expect(await csv.text()).toContain('"partial","3: Brand integration"');
  });
});

describe('completion', () => {
  it('sending with the draft id turns the same row into the complete lead: no duplicate', async () => {
    await post('/api/contact/draft', step1);
    const sent = { kind: 'trial', draftId: DRAFT, name: 'Priya S', email: 'priya@example.com', phone: '', brand: 'Chai Co', service: '10 videos', message: 'Thanks', brief: { package: '10', objective: 'organic' } };
    expect((await post('/api/contact', sent)).status).toBe(201);
    const all = rows();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ completion: 'complete', name: 'Priya S', message: 'Thanks', step_reached: 6 });
    expect(all[0]!.completed_at).toBeTruthy();
    expect(Object.keys(JSON.parse(all[0]!.steps as string)).sort()).toEqual(['1', '6']);

    // A second press, and a late beacon from the closing page, change nothing.
    expect((await post('/api/contact', sent)).status).toBe(201);
    expect((await post('/api/contact/draft', { ...step1, name: 'Overwritten' })).status).toBe(200);
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toMatchObject({ name: 'Priya S', completion: 'complete' });
    const lead = (await admin<{ lead: AdminLead }>(`/leads/${all[0]!.id as string}`)).lead;
    expect(lead).toMatchObject({ completion: 'complete', stepReached: 6 });
  });

  it('a send whose draft was never stored is one new complete row; a send without a draft id works as before', async () => {
    expect((await post('/api/contact', { kind: 'question', draftId: DRAFT, name: 'A', email: 'a@example.com', phone: '', service: '', message: 'Q' })).status).toBe(201);
    expect((await post('/api/contact', { kind: 'question', name: 'B', email: 'b@example.com', phone: '', service: '', message: 'Q' })).status).toBe(201);
    const all = rows();
    expect(all).toHaveLength(2);
    expect(all.every((r) => r.completion === 'complete')).toBe(true);
    expect(all.find((r) => r.name === 'B')).toMatchObject({ draft_id: null, step_reached: null });
  });

  it('a partial the founder archived comes back to New when it is sent', async () => {
    await post('/api/contact/draft', step1);
    d1.db.exec("UPDATE leads SET status = 'archived'");
    await post('/api/contact', { kind: 'trial', draftId: DRAFT, name: 'Priya', email: 'priya@example.com', phone: '', brand: 'Chai Co', service: '', message: '' });
    expect(rows()[0]).toMatchObject({ status: 'new', completion: 'complete' });
  });
});

describe('validation', () => {
  it.each([
    ['no draft id', { ...step1, draftId: undefined }, 'draftId'],
    ['a malformed draft id', { ...step1, draftId: 'short' }, 'draftId'],
    ['no email or phone', { ...step1, email: '', phone: '' }, 'email'],
    ['a phone nobody could call', { ...step1, email: '', phone: '12' }, 'email'],
    ['a broken email', { ...step1, email: 'priya@' }, 'email'],
    ['an unknown kind', { ...step1, kind: 'spam' }, 'kind'],
    ['a step out of range', { ...step1, step: 9 }, 'step'],
    ['an unknown brief option', { ...step1, brief: { objective: 'world-domination' } }, 'brief.objective'],
    ['a reference that is not a link', { ...step1, brief: { referenceLinks: ['javascript:alert(1)'] } }, 'brief.referenceLinks'],
    ['a brand over 120 characters', { ...step1, brand: 'x'.repeat(121) }, 'brand'],
  ])('%s is a 400 naming the field, and nothing is stored', async (_, body, field) => {
    const res = await post('/api/contact/draft', body);
    expect(res.status).toBe(400);
    expect(((await res.json()) as { field?: string }).field).toBe(field);
    expect(rows()).toHaveLength(0);
  });

  it('a draft may have no name or brand yet; free text is cleaned', async () => {
    expect((await post('/api/contact/draft', { ...step1, name: '', brand: '', message: 'Hi\u0000 there' })).status).toBe(201);
    expect(rows()[0]).toMatchObject({ name: '', brand: '' });
    expect(String(rows()[0]!.message)).not.toContain('\u0000');
  });

  it('over 64 KB is a 413; not JSON is a 400', async () => {
    expect((await post('/api/contact/draft', { ...step1, message: 'x'.repeat(70 * 1024) })).status).toBe(413);
    expect((await post('/api/contact/draft', '{not json')).status).toBe(400);
    expect(rows()).toHaveLength(0);
  });

  it('the honeypot is told all went well and nothing is stored', async () => {
    const res = await post('/api/contact/draft', { ...step1, company: 'Acme Bots' });
    expect(res.status).toBe(201);
    expect(rows()).toHaveLength(0);
  });

  it('a write from another site is refused', async () => {
    const res = await worker.fetch(new Request(`${ORIGIN}/api/contact/draft`, { method: 'POST', body: JSON.stringify(step1), headers: { Origin: 'https://evil.example' } }), env as never, ctx);
    expect(res.status).toBe(403);
  });
});

describe('rate limit', () => {
  it(`new drafts count toward the ${HOURLY_LIMIT}-an-hour limit per address; saving the same draft again does not`, async () => {
    for (let i = 0; i < HOURLY_LIMIT; i++) expect((await post('/api/contact/draft', { ...step1, draftId: `${DRAFT.slice(0, -1)}${i}` })).status).toBe(201);
    expect((await post('/api/contact/draft', step1)).status).toBe(429);
    expect((await post('/api/contact', { kind: 'question', name: 'C', email: 'c@example.com', phone: '', service: '', message: 'Q' })).status).toBe(429);
    // Updating and sending an existing draft still work: they add no row.
    const mine = `${DRAFT.slice(0, -1)}0`;
    expect((await post('/api/contact/draft', { ...step1, draftId: mine, step: 2, reached: 3 })).status).toBe(200);
    expect((await post('/api/contact', { kind: 'trial', draftId: mine, name: 'Priya', email: 'priya@example.com', phone: '', brand: 'Chai Co', service: '', message: '' })).status).toBe(201);
    expect(rows()).toHaveLength(HOURLY_LIMIT);
    // Another address is unaffected.
    expect((await post('/api/contact/draft', step1, '198.51.100.99')).status).toBe(201);
  });

  it(`one draft takes at most ${MAX_DRAFT_SAVES} saves`, async () => {
    await post('/api/contact/draft', step1);
    d1.db.exec(`UPDATE leads SET saves = ${MAX_DRAFT_SAVES}`);
    expect((await post('/api/contact/draft', { ...step1, step: 2 })).status).toBe(429);
  });
});
