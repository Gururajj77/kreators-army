/**
 * M1 POST /api/admin/mega/inspect { link, refresh?, videoId? } -> MegaInspect (admin brief 4.4). MEGA's own problems are a 200 with ok: false.
 * (admin8) GET /api/admin/mega/source?video=<id> | ?probe=<handle> -> MegaFileSource: what the admin's browser needs to read one MEGA file
 * itself (posters, hover clips, the drawer's preview); the Worker never touches video bytes. Behind the same guard as every admin route.
 * The key comes from the row's mega_url (file link), its mega_key (file in a shared folder) or, only while mega_url is NULL, the MEGA_LINKS
 * line with the same handle; for an unsaved link, from its mega_probes row. No MEGA call, no-store, and the key is never logged.
 */
import { parseMegaLink, type MegaFileSource, type MegaInspect } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { HttpError, readJson } from '../../http';
import { inspect, probeForHandle } from '../../mega/inspect';
import { keyFromSecret } from '../../mega/lookup';
import { b64urlDecode } from '../../mega/protocol';

export const mega = new Hono<AppEnv>();

mega.post('/mega/inspect', async (c) => {
  const body = await readJson<{ link?: unknown; refresh?: unknown; videoId?: unknown }>(c.req.raw);
  if (typeof body.link !== 'string' || !body.link.trim() || body.link.length > 4000) throw new HttpError(400, 'bad-request', 'Paste a MEGA link.', { field: 'link' });
  const out = await inspect(c.env, c.executionCtx, body.link, { refresh: body.refresh === true, videoId: typeof body.videoId === 'string' ? body.videoId : undefined });
  return c.json<MegaInspect>(out.inspect);
});

interface SourceRow {
  mega_handle: string | null;
  mega_url: string | null;
  mega_key: string | null;
  mega_size: number | null;
}

const KEY43 = /^[\w-]{43}$/;

/** The source of a saved row or a probe, or null when its link does not parse, does not match the handle, or the key is missing. */
export function megaFileSource(row: SourceRow, megaLinks: string | undefined): MegaFileSource | null {
  const handle = row.mega_handle;
  if (!handle) return null;
  const size = row.mega_size && row.mega_size > 0 ? row.mega_size : null;
  if (!row.mega_url) {
    const key = keyFromSecret(handle, megaLinks);
    return key && b64urlDecode(key).length === 32 ? { kind: 'file', handle, key, size } : null;
  }
  const parsed = parseMegaLink(row.mega_url);
  if (!parsed.ok) return null;
  const link = parsed.link;
  if (link.kind === 'file' && link.handle === handle && KEY43.test(link.key43) && b64urlDecode(link.key43).length === 32) return { kind: 'file', handle, key: link.key43, size };
  if (link.kind === 'folder-file' && link.nodeHandle === handle && row.mega_key && KEY43.test(row.mega_key) && b64urlDecode(row.mega_key).length === 32) {
    return { kind: 'folder-file', folder: link.folderHandle, node: link.nodeHandle, key: row.mega_key, size };
  }
  return null;
}

mega.get('/mega/source', async (c) => {
  const id = c.req.query('video');
  const probeHandle = c.req.query('probe');
  let row: SourceRow | null = null;
  if (id) {
    if (id.length > 200) throw new HttpError(400, 'bad-request', 'Bad video id.');
    row = await c.env.DB.prepare('SELECT mega_handle, mega_url, mega_key, mega_size FROM videos WHERE id = ?').bind(id).first<SourceRow>();
    if (!row) throw new HttpError(404, 'not-found', 'No video with that id.');
    if (!row.mega_handle) throw new HttpError(409, 'mega-unusable', 'This video has no MEGA file.');
  } else if (probeHandle && /^[\w-]{8}$/.test(probeHandle)) {
    const p = await probeForHandle(c.env.DB, probeHandle);
    if (!p) throw new HttpError(404, 'not-found', 'Check the MEGA link again: the check is more than a day old.');
    row = { mega_handle: p.handle, mega_url: p.link, mega_key: p.file_key, mega_size: p.size };
  } else throw new HttpError(400, 'bad-request', 'Ask for ?video=<id> or ?probe=<handle>.');
  const src = megaFileSource(row, c.env.MEGA_LINKS);
  if (!src) throw new HttpError(409, 'mega-unusable', row.mega_url ? "This video's MEGA link has no usable key. Paste the full link again." : 'The key for this MEGA file is not in MEGA_LINKS any more. Paste its full link.');
  c.header('Cache-Control', 'no-store');
  return c.json<MegaFileSource>(src);
});
