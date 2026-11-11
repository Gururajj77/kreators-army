import type { TrialBrief } from './brief.ts';

export const VIDEO_ASPECTS = ['vertical', 'landscape'] as const;
export type VideoAspect = (typeof VIDEO_ASPECTS)[number];

/** What the deprecated public `source` field holds: a stream (MEGA or bundled) reads 'file', then the two v1 embeds. */
export type PublicVideoSource = 'file' | 'youtube' | 'wave';

/**
 * One published video, as GET /api/videos returns it. A whitelist built by the API: it never carries a MEGA link, a key, a
 * handle outside a stream path, or any `mega_*` column.
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
  /** Same-origin and seekable. MEGA: '/media/v/<id>.mp4?v=<tag8>'. Bundled: '/media/<name>.mp4'. Null for embed-only entries. */
  streamUrl: string | null;
  /** The bundled copy of a MEGA entry. The player uses it only after the stream has failed. */
  fallbackUrl: string | null;
  /** v1 embeds only, when there is no stream: the youtube-nocookie or wave.video player address. */
  embedUrl: string | null;
  posterUrl: string | null;
  /** Muted previews (hover, hero deck, thread reply, work reel) are allowed. Device rules still apply in the browser. */
  previewOk: boolean;
  /**
   * A stored hover clip (a few seconds, silent, small), '/media/pv/<id>/<sha16>.<mp4|webm>', or null. When set, every muted preview
   * plays it instead of the stream, whatever `previewOk` says. Device rules still apply in the browser.
   */
  previewUrl: string | null;
  durationMs: number | null;
  links: { instagram: string | null; youtube: string | null };
  /** @deprecated v1 tabs only; removed one release after v2. A stream reads 'file' with `ref` = `streamUrl`. */
  source: PublicVideoSource;
  /** @deprecated v1 tabs only: the stream URL, the YouTube id, or the wave.video player address. */
  ref: string;
}

export interface VideoListResponse {
  videos: Video[];
}

/** True when the video streams from MEGA through this site (its stream URL is '/media/v/...'). */
export function isMegaStream(video: Pick<Video, 'streamUrl'>): boolean {
  return !!video.streamUrl && video.streamUrl.startsWith('/media/v/');
}

const withParam = (url: string, param: string) => `${url}${url.includes('?') ? '&' : '?'}${param}`;

/**
 * The address a muted preview plays: the MEGA stream bounded to its first 6 seconds ('<streamUrl>&preview=6'), a bundled file
 * as it is, null for embeds. It does not check `previewOk` or the device: the caller does (V2-SPEC 3.4).
 */
export function previewSrc(video: Pick<Video, 'streamUrl'>): string | null {
  if (!video.streamUrl) return null;
  return isMegaStream(video) ? withParam(video.streamUrl, 'preview=6') : video.streamUrl;
}

/** The player's health check after a MEGA stream failed ('<streamUrl>&probe=1'). Null for anything that is not MEGA. */
export function probeSrc(video: Pick<Video, 'streamUrl'>): string | null {
  return isMegaStream(video) ? withParam(video.streamUrl!, 'probe=1') : null;
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
