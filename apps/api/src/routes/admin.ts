import { VIDEO_ASPECTS, isValidPosterUrl, parseVideoRef, type AdminVideo, type ApiErrorBody, type Lead, type VideoAspect } from '@kreators/shared';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../env';
import { toAdminVideo, type VideoRow } from './videos';

export const admin = new Hono<AppEnv>();

const encoder = new TextEncoder();

async function keysMatch(given: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([crypto.subtle.digest('SHA-256', encoder.encode(given)), crypto.subtle.digest('SHA-256', encoder.encode(expected))]);
  return crypto.subtle.timingSafeEqual(a, b);
}

admin.use('*', async (c, next) => {
  const expected = c.env.ADMIN_KEY;
  const given = c.req.header('Authorization')?.replace(/^Bearer /, '');
  if (!expected || !given || !(await keysMatch(given, expected))) return c.json<ApiErrorBody>({ error: 'unauthorized', requestId: c.get('requestId') }, 401);
  return next();
});

/** The columns a request may change; each value has been checked before it gets here. */
interface VideoFields {
  title?: string;
  brand?: string;
  category?: string | null;
  platform?: string | null;
  source?: string;
  ref?: string;
  aspect?: VideoAspect;
  poster_url?: string | null;
  views?: number;
  featured?: number;
  sort_order?: number;
  published?: number;
}

function bad(message: string): never {
  throw new HTTPException(400, { message });
}

function text(value: unknown, name: string, max: number): string {
  if (typeof value !== 'string' || !value.trim()) bad(`${name} is required`);
  const out = value.trim();
  if (out.length > max) bad(`${name} is too long (at most ${max} characters)`);
  return out;
}

function optionalText(value: unknown, name: string, max: number): string | null {
  return value === null || value === '' ? null : text(value, name, max);
}

function count(value: unknown, name: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) bad(`${name} must be a whole number, zero or more`);
  return value;
}

function flag(value: unknown, name: string): number {
  if (typeof value !== 'boolean') bad(`${name} must be true or false`);
  return value ? 1 : 0;
}

function readFields(body: Record<string, unknown>): VideoFields {
  const fields: VideoFields = {};
  if (body.url !== undefined) {
    if (typeof body.url !== 'string') bad('url must be text');
    const parsed = parseVideoRef(body.url);
    if (!parsed) bad('url must be a YouTube link, a wave.video player link or embed code, or a /media/ path');
    fields.source = parsed.source;
    fields.ref = parsed.ref;
  }
  if (body.title !== undefined) fields.title = text(body.title, 'title', 140);
  if (body.brand !== undefined) fields.brand = text(body.brand, 'brand', 60);
  if (body.category !== undefined) fields.category = optionalText(body.category, 'category', 40);
  if (body.platform !== undefined) fields.platform = optionalText(body.platform, 'platform', 40);
  if (body.aspect !== undefined) {
    if (!VIDEO_ASPECTS.includes(body.aspect as VideoAspect)) bad('aspect must be vertical or landscape');
    fields.aspect = body.aspect as VideoAspect;
  }
  if (body.posterUrl !== undefined) {
    const poster = optionalText(body.posterUrl, 'posterUrl', 500);
    if (poster && !isValidPosterUrl(poster)) bad('posterUrl must be an https image or a /media/ path');
    fields.poster_url = poster;
  }
  if (body.views !== undefined) fields.views = count(body.views, 'views');
  if (body.sortOrder !== undefined) fields.sort_order = count(body.sortOrder, 'sortOrder');
  if (body.featured !== undefined) fields.featured = flag(body.featured, 'featured');
  if (body.published !== undefined) fields.published = flag(body.published, 'published');
  return fields;
}

function isDuplicate(err: unknown): boolean {
  return err instanceof Error && err.message.includes('UNIQUE');
}

admin.get('/videos', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM videos ORDER BY sort_order ASC, views DESC').all<VideoRow>();
  return c.json<{ videos: AdminVideo[] }>({ videos: results.map(toAdminVideo) });
});

admin.post('/videos', async (c) => {
  const fields = readFields(await c.req.json());
  if (!fields.source || !fields.ref) bad('url is required');
  if (!fields.title) bad('title is required');
  if (!fields.brand) bad('brand is required');

  const row = { id: crypto.randomUUID(), ...fields };
  const columns = Object.keys(row);
  try {
    const created = await c.env.DB.prepare(`INSERT INTO videos (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')}) RETURNING *`)
      .bind(...Object.values(row))
      .first<VideoRow>();
    return c.json<{ video: AdminVideo }>({ video: toAdminVideo(created as VideoRow) }, 201);
  } catch (err) {
    if (isDuplicate(err)) return c.json<ApiErrorBody>({ error: 'that video is already in the library' }, 409);
    throw err;
  }
});

admin.patch('/videos/:id', async (c) => {
  const fields = readFields(await c.req.json());
  const columns = Object.keys(fields);
  if (columns.length === 0) bad('nothing to change');
  try {
    const updated = await c.env.DB.prepare(`UPDATE videos SET ${columns.map((k) => `${k} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ? RETURNING *`)
      .bind(...Object.values(fields), c.req.param('id'))
      .first<VideoRow>();
    if (!updated) return c.json<ApiErrorBody>({ error: 'no video with that id' }, 404);
    return c.json<{ video: AdminVideo }>({ video: toAdminVideo(updated) });
  } catch (err) {
    if (isDuplicate(err)) return c.json<ApiErrorBody>({ error: 'that video is already in the library' }, 409);
    throw err;
  }
});

admin.delete('/videos/:id', async (c) => {
  const { meta } = await c.env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(c.req.param('id')).run();
  if (meta.changes === 0) return c.json<ApiErrorBody>({ error: 'no video with that id' }, 404);
  return c.json({ ok: true });
});

admin.get('/leads', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, name, email, phone, service, message, created_at AS createdAt FROM leads ORDER BY created_at DESC LIMIT 200').all<Lead>();
  return c.json<{ leads: Lead[] }>({ leads: results });
});
