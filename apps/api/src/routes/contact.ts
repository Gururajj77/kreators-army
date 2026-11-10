import type { ApiErrorBody, LeadInput } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';

export const contact = new Hono<AppEnv>();

const HOURLY_LIMIT = 5;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function hashIp(ip: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const field = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

contact.post('/', async (c) => {
  const body = await c.req.json<Partial<LeadInput>>();
  // A bot fills in the hidden field. It is told all went well, so it has no reason to try again.
  if (field(body.company, 100)) return c.json({ ok: true }, 201);

  const name = field(body.name, 120);
  const email = field(body.email, 200);
  if (!name) return c.json<ApiErrorBody>({ error: 'Please add your name.' }, 400);
  if (!EMAIL.test(email)) return c.json<ApiErrorBody>({ error: 'Please add a valid email address.' }, 400);

  const ipHash = await hashIp(c.req.header('CF-Connecting-IP') ?? 'unknown', c.env.ADMIN_KEY ?? 'local');
  const recent = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')").bind(ipHash).first<{ n: number }>();
  if ((recent?.n ?? 0) >= HOURLY_LIMIT) return c.json<ApiErrorBody>({ error: 'Too many messages. Please email us instead.' }, 429);

  await c.env.DB.prepare('INSERT INTO leads (id, name, email, phone, service, message, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), name, email, field(body.phone, 40), field(body.service, 60), field(body.message, 4000), ipHash)
    .run();
  return c.json({ ok: true }, 201);
});
