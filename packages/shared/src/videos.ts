export const VIDEO_SOURCES = ['youtube', 'wave', 'file'] as const;
export type VideoSource = (typeof VIDEO_SOURCES)[number];

export const VIDEO_ASPECTS = ['vertical', 'landscape'] as const;
export type VideoAspect = (typeof VIDEO_ASPECTS)[number];

export interface Video {
  id: string;
  title: string;
  brand: string;
  category: string | null;
  platform: string | null;
  source: VideoSource;
  /** A YouTube id, a wave.video embed URL, or a path under /media/. */
  ref: string;
  aspect: VideoAspect;
  posterUrl: string | null;
  views: number;
  featured: boolean;
}

export interface VideoListResponse {
  videos: Video[];
}

/** An unpublished video is only ever visible through the admin API. */
export interface AdminVideo extends Video {
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  /** A hidden field a person never fills in. */
  company?: string;
}

export interface Lead extends Omit<LeadInput, 'company'> {
  id: string;
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
 * Turns what someone pastes (a YouTube link, a wave.video player link, a whole iframe embed code, or a /media/ path) into what
 * the database stores. Only these shapes pass, because the result becomes the address of an iframe on the public site.
 */
export function parseVideoRef(input: string): { source: VideoSource; ref: string } | null {
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

export function videoEmbedUrl(video: Pick<Video, 'source' | 'ref'>): string | null {
  if (video.source === 'youtube') return `https://www.youtube-nocookie.com/embed/${video.ref}?autoplay=1&rel=0&playsinline=1`;
  if (video.source === 'wave') return video.ref;
  return null;
}

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
