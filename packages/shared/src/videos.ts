import type { TrialBrief } from './brief.ts';
import type { ParsedMegaLink } from './megaLinks.ts';

export const VIDEO_ASPECTS = ['vertical', 'landscape'] as const;
export type VideoAspect = (typeof VIDEO_ASPECTS)[number];

/**
 * What the deprecated public `source` field holds: 'file' for a bundled stream, 'mega' for a MEGA entry (its `ref` is the MEGA embed or, for a
 * file inside a shared folder, MEGA's own page), then the two v1 embeds.
 */
export type PublicVideoSource = 'file' | 'youtube' | 'wave' | 'mega';

/**
 * One published video, as GET /api/videos returns it. A whitelist built by the API: it never carries a `mega_*` column, an import id or a
 * folder's own key outside the two MEGA addresses below. A MEGA entry plays in MEGA's own embed player, never through this site's Worker: its
 * embed address (file key after '#') is public by design (the founder's choice, Nov 2026).
 */
export interface Video {
  id: string;
  title: string;
  brand: string;
  category: string | null;
  platform: string | null;
  aspect: VideoAspect;
  views: number;
  /** The day it was uploaded, 'YYYY-MM-DD', or null. */
  uploadDate: string | null;
  featured: boolean;
  /** A bundled file on this site, '/media/<name>.mp4', same-origin and seekable. Null for MEGA entries and embeds. */
  streamUrl: string | null;
  /** The bundled copy of a MEGA entry. The player plays it only when MEGA has no embed for the file (a file inside a shared folder). */
  fallbackUrl: string | null;
  /**
   * The player to open in an iframe: MEGA's embed ('https://mega.nz/embed/<handle>#<key>') for a MEGA file link, else (no stream) the
   * youtube-nocookie or wave.video player address. Null when there is none.
   */
  embedUrl: string | null;
  /**
   * MEGA's own page for a MEGA file that has no embed (a file inside a shared folder: 'https://mega.nz/folder/<f>#<key>/file/<node>'), opened in
   * a new tab. Null otherwise. The API always sends it; it is optional only so a tile built by hand (the admin drawer, the Trial sample) need
   * not name it.
   */
  watchUrl?: string | null;
  posterUrl: string | null;
  /** A muted preview of `streamUrl` (a bundled file) is allowed. Never true for MEGA: a MEGA entry previews only its stored clip. */
  previewOk: boolean;
  /**
   * A stored hover clip (a few seconds, silent, small), '/media/pv/<id>/<sha16>.<mp4|webm>', or null. When set, every muted preview
   * plays it instead of anything else. Device rules still apply in the browser.
   */
  previewUrl: string | null;
  durationMs: number | null;
  links: { instagram: string | null; youtube: string | null };
  /** @deprecated v1 tabs only; removed one release after v2. A bundled stream reads 'file' with `ref` = `streamUrl`. */
  source: PublicVideoSource;
  /** @deprecated v1 tabs only: the bundled stream, the YouTube id, the wave.video player, or the MEGA embed (or page) address. */
  ref: string;
}

export interface VideoListResponse {
  videos: Video[];
}

/** MEGA's embed player for one public file link. Nothing else may go into the player's iframe as a MEGA address. */
export const MEGA_EMBED_RE = /^https:\/\/mega\.nz\/embed\/[A-Za-z0-9_-]{8}#[A-Za-z0-9_-]{43}$/;
/** MEGA's own page for a file inside a shared folder. */
export const MEGA_FOLDER_FILE_RE = /^https:\/\/mega\.nz\/folder\/[A-Za-z0-9_-]{8}#[A-Za-z0-9_-]{22}\/file\/[A-Za-z0-9_-]{8}$/;

/** True when `url` is a MEGA embed player address (see MEGA_EMBED_RE). */
export function isMegaEmbed(url: string | null | undefined): url is string {
  return !!url && MEGA_EMBED_RE.test(url);
}

/**
 * Where a MEGA file plays for the public, built from its parsed link with no network call: a file link has MEGA's embed player; a file
 * inside a shared folder has none (MEGA's embed page only takes a public file handle, `a:'g', p:<handle>`), so it gets MEGA's own page.
 */
export function megaPlayerUrls(link: ParsedMegaLink): { embedUrl: string | null; watchUrl: string | null } {
  if (link.kind === 'file') return { embedUrl: `https://mega.nz/embed/${link.handle}#${link.key43}`, watchUrl: null };
  if (link.kind === 'folder-file') return { embedUrl: null, watchUrl: `https://mega.nz/folder/${link.folderHandle}#${link.folderKey22}/file/${link.nodeHandle}` };
  return { embedUrl: null, watchUrl: null };
}

/**
 * The embed address the player opens: MEGA's embed with its own autoplay option ('!1a' after the key, as MEGA's "Embed code" dialog writes
 * it; the iframe must also carry allow="autoplay"). Any other address is returned as it is.
 */
export function playerEmbedSrc(url: string): string {
  return isMegaEmbed(url) ? `${url}!1a` : url;
}

/**
 * The address a muted preview plays when there is no stored clip: a bundled file as it is, null for MEGA entries and embeds. It does not
 * check `previewOk` or the device: the caller does (V2-SPEC 3.4).
 */
export function previewSrc(video: Pick<Video, 'streamUrl'>): string | null {
  return video.streamUrl && !video.streamUrl.startsWith('/media/v/') ? video.streamUrl : null;
}

export interface LeadInput {
  /** 'trial' sends the guided brief; missing means 'question', so the v1 form keeps working. */
  kind?: 'trial' | 'question';
  name: string;
  email: string;
  phone: string;
  /** Required (1 to 120 characters) when kind is 'trial'. */
  brand?: string;
  /** The package label, at most 60 characters: "10 videos", "25 videos (from the calculator)". */
  service: string;
  message: string;
  /** Trial requests only; ignored for questions. Validated by the API with validateBrief. */
  brief?: TrialBrief;
  /** A hidden field a person never fills in. */
  company?: string;
  /** (form7) The form session's draft id: sending turns that saved partial lead into this complete one (no duplicate). */
  draftId?: string;
}

/**
 * (form7) POST /api/contact/draft: the answers so far, saved when a step is completed or the page is left. Same fields and
 * limits as LeadInput, except name and brand may be empty and it needs a valid email OR phone. One row per draftId.
 */
export interface LeadDraftInput extends Omit<LeadInput, 'draftId' | 'brand'> {
  draftId: string;
  kind: 'trial' | 'question';
  brand: string;
  /** The step whose answers this saves: 1 to 5, 6 = the review (question mode: 1). */
  step: number;
  /** The furthest step reached so far. */
  reached: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: string;
}

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com']);
const YOUTUBE_ID = /^[\w-]{11}$/;

function youtubeId(url: URL): string | null {
  if (url.hostname === 'youtu.be') {
    const id = url.pathname.split('/')[1] ?? '';
    return YOUTUBE_ID.test(id) ? id : null;
  }
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;
  const [, kind, value] = url.pathname.split('/');
  const id = kind === 'watch' ? url.searchParams.get('v') : kind === 'shorts' || kind === 'embed' || kind === 'live' || kind === 'v' ? value : null;
  return id && YOUTUBE_ID.test(id) ? id : null;
}

function isWavePlayer(url: URL): boolean {
  const host = url.hostname;
  if (host === 'wave.video' || host === 'www.wave.video') return url.pathname.startsWith('/embed/');
  return host.endsWith('.wave.video') && url.pathname.length > 1;
}

/**
 * @deprecated for the web app (read `streamUrl`, `embedUrl` and `posterUrl`). Kept for the API's v1 `url` alias.
 * Turns a YouTube link, a wave.video player link, a whole iframe embed code, or a /media/ path into a v1 source and ref.
 */
export function parseVideoRef(input: string): { source: PublicVideoSource; ref: string } | null {
  const trimmed = input.trim();
  const fromIframe = /<iframe\b[^>]*\bsrc=["']([^"']+)["']/i.exec(trimmed)?.[1];
  const value = (fromIframe ?? trimmed).replace(/&amp;/g, '&');

  if (/^\/media\/[\w.-]+\.mp4$/.test(value) && !value.includes('..')) return { source: 'file', ref: value };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;

  const id = youtubeId(url);
  if (id) return { source: 'youtube', ref: id };
  if (isWavePlayer(url)) return { source: 'wave', ref: url.href };
  return null;
}

/** A poster is a path on this site or an https image; anything else could be used to smuggle a scheme into the page. */
export function isValidPosterUrl(value: string): boolean {
  if (/^\/(media|logos)\/[\w.-]+\.(jpe?g|png|webp)$/.test(value)) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/** @deprecated for the web app: read `video.embedUrl`. */
export function videoEmbedUrl(video: Pick<Video, 'source' | 'ref'>): string | null {
  if (video.source === 'youtube') return `https://www.youtube-nocookie.com/embed/${video.ref}?autoplay=1&rel=0&playsinline=1`;
  if (video.source === 'wave') return video.ref;
  return null;
}

/** @deprecated for the web app: read `video.posterUrl` (the API already applies this fallback). */
export function videoPoster(video: Pick<Video, 'source' | 'ref' | 'posterUrl'>): string | null {
  if (video.posterUrl) return video.posterUrl;
  return video.source === 'youtube' ? `https://i.ytimg.com/vi/${video.ref}/hqdefault.jpg` : null;
}

export function formatViews(views: number): string {
  const short = (n: number, unit: string) => `${Number.isInteger(n) ? n : n.toFixed(1)}${unit}`;
  if (views >= 1_000_000) return short(views / 1_000_000, 'M');
  if (views >= 1_000) return short(Math.round(views / 100) / 10, 'K');
  return String(views);
}
