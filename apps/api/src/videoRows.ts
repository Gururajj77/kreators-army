/**
 * Library rows and the two shapes they leave the Worker in. `toPublicVideo` is a whitelist: it never spreads the row, so no
 * mega_* column, key, link or import id can reach /api/videos (V2-SPEC 2.10, 2.13). `toAdminVideo` is for /api/admin only.
 */
import {
  codecParts,
  isPlayable,
  megaPlayerUrls,
  parseMegaLink,
  streamGrade,
  type AdminPoster,
  type AdminPreview,
  type AdminVideo,
  type MegaMeta,
  type MegaProblem,
  type PublicVideoSource,
  type Video,
  type VideoAspect,
  type VideoProblem,
  type VideoSource,
  youTubeIdOf,
} from '@kreators/shared';
import { keyFromSecret } from './mega/lookup';
import { parseSniffMeta, type SniffMeta } from './mega/sniff';
import { sha256Hex } from './mega/protocol';
import { previewPath } from './previews';

/** What GET /api/videos reads (V2-SPEC 2.10). mega_url is read only to build MEGA's embed (or page) address. */
export const PUBLIC_COLUMNS = `v.id, v.title, v.brand, v.category, v.platform, v.aspect, v.views, v.upload_date, v.featured,
       v.mega_handle, v.mega_url, v.mega_meta, v.mega_duration_ms, v.file_ref, v.wave_ref,
       v.instagram_url, v.youtube_url, v.poster_url, p.sha AS poster_sha, p.mime AS poster_mime, pv.sha AS preview_sha, pv.mime AS preview_mime`;

/** The public listing's tables. The joins name small columns only, so no poster or clip BLOB is ever read here. */
export const PUBLIC_FROM = 'FROM videos v LEFT JOIN posters p ON p.video_id = v.id LEFT JOIN video_previews pv ON pv.video_id = v.id';

export const ADMIN_COLUMNS = `v.id, v.title, v.brand, v.category, v.platform, v.aspect, v.views, v.upload_date, v.featured, v.sort_order, v.published,
       v.created_at, v.updated_at, v.source, v.mega_handle, v.mega_url, v.mega_name, v.mega_size, v.mega_width, v.mega_height,
       v.mega_duration_ms, v.mega_bitrate, v.mega_codec, v.mega_fast_start, v.mega_checked_at, v.mega_error, v.mega_meta,
       v.file_ref, v.wave_ref, v.instagram_url, v.youtube_url, v.poster_url, v.import_id, v.deleted_at,
       p.sha AS poster_sha, p.mime AS poster_mime, p.width AS poster_width, p.height AS poster_height, p.time_ms AS poster_time_ms, p.auto AS poster_auto,
       pv.sha AS preview_sha, pv.mime AS preview_mime, pv.size AS preview_size, pv.width AS preview_width, pv.height AS preview_height,
       pv.duration_ms AS preview_duration_ms, pv.start_ms AS preview_start_ms, pv.made_at AS preview_made_at`;

export const ADMIN_FROM = 'FROM videos v LEFT JOIN posters p ON p.video_id = v.id LEFT JOIN video_previews pv ON pv.video_id = v.id';

export interface PublicRow {
  id: string;
  title: string;
  brand: string;
  category: string | null;
  platform: string | null;
  aspect: VideoAspect;
  views: number;
  upload_date: string | null;
  featured: number;
  mega_handle: string | null;
  mega_url: string | null;
  mega_meta: string | null;
  mega_duration_ms: number | null;
  file_ref: string | null;
  wave_ref: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  poster_url: string | null;
  poster_sha: string | null;
  poster_mime: string | null;
  /** From video_previews (migration 0008); undefined from a query that does not join it. */
  preview_sha?: string | null;
  preview_mime?: string | null;
}

export interface VideoRow extends PublicRow {
  sort_order: number;
  published: number;
  created_at: string;
  updated_at: string;
  source: VideoSource;
  mega_name: string | null;
  mega_size: number | null;
  mega_width: number | null;
  mega_height: number | null;
  mega_bitrate: number | null;
  mega_codec: string | null;
  mega_fast_start: number | null;
  mega_checked_at: string | null;
  mega_error: MegaProblem | null;
  import_id: string | null;
  deleted_at: string | null;
  poster_width: number | null;
  poster_height: number | null;
  poster_time_ms: number | null;
  poster_auto?: number | null;
  preview_size?: number | null;
  preview_width?: number | null;
  preview_height?: number | null;
  preview_duration_ms?: number | null;
  preview_start_ms?: number | null;
  preview_made_at?: string | null;
}

const EXT: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };
export const posterExt = (mime: string) => EXT[mime] ?? 'jpg';

/** Public poster order: the stored poster, then the v1 poster_url, then YouTube's thumbnail for a YouTube-only entry, else null. */
export function posterUrl(row: Pick<PublicRow, 'id' | 'poster_sha' | 'poster_mime' | 'poster_url' | 'mega_handle' | 'file_ref' | 'wave_ref' | 'youtube_url'>): string | null {
  if (row.poster_sha && row.poster_mime) return `/media/p/${encodeURIComponent(row.id)}/${row.poster_sha}.${posterExt(row.poster_mime)}`;
  if (row.poster_url) return row.poster_url;
  if (!row.mega_handle && !row.file_ref && !row.wave_ref && row.youtube_url) {
    const id = youTubeIdOf(row.youtube_url);
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

/** The old Worker stream's preview bound (8 MiB): kept only for the admin's check facts (inspect.ts). */
const PREVIEW_MAX = 8 * 1024 * 1024;

/** V2-SPEC 2.4.4: the first 6 s fit the preview bound, the file is at most 8 Mbps, and its video is H.264. False when never sniffed. */
export function previewOkFromMeta(meta: SniffMeta | null): boolean {
  if (!meta) return false;
  const prev6 = meta.prev?.['6'];
  const vc = meta.vc ?? '';
  return typeof prev6 === 'number' && prev6 + 65536 <= PREVIEW_MAX && typeof meta.kbps === 'number' && meta.kbps <= 8000 && /^avc[13]\b/.test(vc);
}

/** A muted preview of the stream is allowed: bundled files only. A MEGA entry never streams through this site, so it previews its stored clip only. */
function previewOk(row: Pick<PublicRow, 'mega_handle' | 'file_ref'>): boolean {
  return !row.mega_handle && !!row.file_ref;
}

/** The stored hover clip's address, or null. */
export function previewUrl(row: Pick<PublicRow, 'id' | 'preview_sha' | 'preview_mime'>): string | null {
  return row.preview_sha && row.preview_mime ? previewPath(row.id, row.preview_sha, row.preview_mime) : null;
}

const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;

/**
 * Where a MEGA row plays for the public: MEGA's embed (file link) or MEGA's own page (file in a shared folder). A row whose key is still only in
 * the MEGA_LINKS secret (mega_url NULL) builds the embed from the secret's line with the same handle: a string match, nothing decrypted.
 */
export function megaPublicUrls(row: Pick<PublicRow, 'mega_handle' | 'mega_url'>, megaLinks?: string): { embedUrl: string | null; watchUrl: string | null } {
  const none = { embedUrl: null, watchUrl: null };
  if (!row.mega_handle) return none;
  if (!row.mega_url) {
    const key = keyFromSecret(row.mega_handle, megaLinks);
    return key ? megaPlayerUrls({ kind: 'file', handle: row.mega_handle, key43: key }) : none;
  }
  const parsed = parseMegaLink(row.mega_url);
  if (!parsed.ok) return none;
  const link = parsed.link;
  // The row's handle must be the link's own file: a stale or mismatched link plays nothing rather than another file.
  if (link.kind === 'file' && link.handle === row.mega_handle) return megaPlayerUrls(link);
  if (link.kind === 'folder-file' && link.nodeHandle === row.mega_handle) return megaPlayerUrls(link);
  return none;
}

/**
 * The public shape. `megaLinks` is env.MEGA_LINKS (only for rows whose key is still in the secret). Async for its callers' sake (it used to
 * hash a stream tag); it makes no network call.
 */
export async function toPublicVideo(row: PublicRow, megaLinks?: string): Promise<Video> {
  const mega = row.mega_handle ? megaPublicUrls(row, megaLinks) : null;
  const stream = row.mega_handle ? null : row.file_ref;
  const ytId = row.youtube_url ? youTubeIdOf(row.youtube_url) : null;
  let embedUrl: string | null = null;
  let source: PublicVideoSource = 'file';
  let ref = stream ?? '';
  if (mega && (mega.embedUrl || mega.watchUrl)) {
    embedUrl = mega.embedUrl;
    source = 'mega';
    ref = (mega.embedUrl ?? mega.watchUrl)!;
  } else if (mega && row.file_ref) {
    // A MEGA row with no usable link but a bundled copy: v1 tabs play the copy.
    ref = row.file_ref;
  } else if (!stream && row.wave_ref) {
    embedUrl = row.wave_ref;
    source = 'wave';
    ref = row.wave_ref;
  } else if (!stream && ytId) {
    embedUrl = youtubeEmbed(ytId);
    source = 'youtube';
    ref = ytId;
  }
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    category: row.category,
    platform: row.platform,
    aspect: row.aspect,
    views: row.views,
    uploadDate: row.upload_date,
    featured: row.featured === 1,
    streamUrl: stream,
    fallbackUrl: row.mega_handle ? row.file_ref : null,
    embedUrl,
    watchUrl: mega?.watchUrl ?? null,
    posterUrl: posterUrl(row),
    previewOk: previewOk(row),
    previewUrl: previewUrl(row),
    durationMs: row.mega_duration_ms,
    links: { instagram: row.instagram_url, youtube: row.youtube_url },
    source,
    ref,
  };
}

/** The facts columns as the shared MegaMeta, or null when the file was never checked. */
export function megaMetaFromRow(row: Pick<VideoRow, 'mega_name' | 'mega_size' | 'mega_width' | 'mega_height' | 'mega_duration_ms' | 'mega_bitrate' | 'mega_codec' | 'mega_fast_start'>): MegaMeta | null {
  if (row.mega_size === null || row.mega_size === undefined) return null;
  return {
    name: row.mega_name,
    size: row.mega_size,
    width: row.mega_width,
    height: row.mega_height,
    durationMs: row.mega_duration_ms,
    bitrate: row.mega_bitrate,
    codec: row.mega_codec,
    fastStart: row.mega_fast_start === null ? null : row.mega_fast_start === 1,
  };
}

const UNREACHABLE = new Set<string>(['not-found', 'removed', 'blocked', 'bad-key', 'not-video']);

/** Every problem of a row, blocking first (BLOCKING_PROBLEMS), then warnings. */
export function problemsFor(row: VideoRow): VideoProblem[] {
  const out: VideoProblem[] = [];
  if (!row.title.trim()) out.push('no-title');
  if (!row.brand.trim()) out.push('no-brand');
  if (row.source === 'none') out.push('no-stream');
  if (row.mega_handle && row.mega_error && UNREACHABLE.has(row.mega_error)) out.push('mega-unreachable');
  const meta = row.mega_handle ? megaMetaFromRow(row) : null;
  const { video, audio } = codecParts(meta?.codec);
  if (video === 'hvc1' || video === 'hev1') out.push('hevc');
  else if (meta && !isPlayable(meta)) out.push('video-codec');
  if (!posterUrl(row)) out.push('no-poster');
  if (meta) {
    const grade = streamGrade(meta);
    if (grade === 'heavy') out.push('mega-heavy');
    if (grade === 'too-heavy') out.push('mega-too-heavy');
    if (audio && !['mp4a', 'Opus', 'fLaC'].includes(audio)) out.push('audio-codec');
    if (meta.fastStart === false) out.push('not-fast-start');
    if (!meta.width || !meta.height || !meta.durationMs) out.push('no-header-info');
  }
  if (row.mega_handle && !row.mega_url) out.push('mega-key-in-secret');
  if (row.source === 'youtube' || row.source === 'wave') out.push('no-mega');
  return out;
}

export async function toAdminVideo(row: VideoRow): Promise<AdminVideo> {
  const pub = await toPublicVideo(row);
  let poster: AdminPoster | null = null;
  if (row.poster_sha && row.poster_mime) poster = { url: pub.posterUrl!, stored: true, width: row.poster_width, height: row.poster_height, timeMs: row.poster_time_ms, auto: row.poster_auto === 1 };
  else if (pub.posterUrl) poster = { url: pub.posterUrl, stored: false, width: null, height: null, timeMs: null };
  const preview: AdminPreview | null =
    pub.previewUrl && row.preview_mime
      ? {
          url: pub.previewUrl,
          mime: row.preview_mime === 'video/webm' ? 'video/webm' : 'video/mp4',
          size: row.preview_size ?? 0,
          width: row.preview_width ?? null,
          height: row.preview_height ?? null,
          durationMs: row.preview_duration_ms ?? null,
          startMs: row.preview_start_ms ?? null,
          madeAt: row.preview_made_at ? new Date(`${row.preview_made_at.replace(' ', 'T')}Z`).toISOString() : new Date(0).toISOString(),
        }
      : null;
  let mega: AdminVideo['mega'] = null;
  if (row.mega_handle) {
    const meta = megaMetaFromRow(row);
    const fileLink = row.mega_url && /^https:\/\/mega\.nz\/file\/[\w-]{8}#[\w-]{43}$/.exec(row.mega_url) ? row.mega_url : null;
    mega = {
      handle: row.mega_handle,
      kind: row.mega_url?.startsWith('https://mega.nz/folder/') ? 'folder-file' : 'file',
      url: row.mega_url,
      keyIn: row.mega_url ? 'library' : 'secret',
      meta,
      grade: streamGrade(meta),
      checkedAt: row.mega_checked_at ? new Date(`${row.mega_checked_at.replace(' ', 'T')}Z`).toISOString() : null,
      error: row.mega_error,
      embedUrl: fileLink ? fileLink.replace('/file/', '/embed/') : null,
      playable: isPlayable(meta),
      previewOk: pub.previewOk,
      // (admin8) Which file the row points at, for the admin's thumbnails & previews maker (a new file is made again). Not secret: a hash.
      tag: await sha256Hex(row.mega_url ?? `secret:${row.mega_handle}`, 8),
    };
  }
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    category: row.category,
    platform: row.platform,
    aspect: row.aspect,
    views: row.views,
    uploadDate: row.upload_date,
    featured: row.featured === 1,
    published: row.published === 1,
    sortOrder: row.sort_order,
    source: row.source,
    streamUrl: pub.streamUrl,
    mega,
    fileRef: row.file_ref,
    waveRef: row.wave_ref,
    instagramUrl: row.instagram_url,
    youtubeUrl: row.youtube_url,
    poster,
    preview,
    importId: row.import_id,
    problems: problemsFor(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

