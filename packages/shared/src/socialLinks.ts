/**
 * Instagram and YouTube links where a video is posted (admin brief 3.2). The stored value is always rebuilt from the parsed
 * code or id, never the input, so no other scheme or host can reach an href on the site.
 */
import { decodeHtmlEntities } from './megaLinks.ts';

export type SocialLinkResult = { ok: true; url: string } | { ok: false; problem: 'not-instagram' | 'not-youtube' | 'not-a-post' | 'not-a-video' };
export type YouTubeLinkResult = { ok: true; url: string; id: string; shorts: boolean } | { ok: false; problem: 'not-youtube' | 'not-a-video' };

function toUrl(input: string): URL | null {
  const text = decodeHtmlEntities(String(input ?? '')).trim();
  const fromIframe = /<iframe\b[^>]*\bsrc=["']([^"']+)["']/i.exec(text)?.[1];
  const value = (fromIframe ?? text).trim();
  if (!value || /\s/.test(value)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

const IG_HOSTS = /* @__PURE__ */ new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com', 'instagr.am', 'www.instagr.am']);
const IG_CODE = /^[\w-]{5,64}$/;

/**
 * instagram.com/reel|reels|p|tv/<code> and /<username>/reel|p|tv/<code>, on instagram.com, www., m. or instagr.am.
 * Canonical: https://www.instagram.com/<reel|p|tv>/<code>/ ("reels" becomes "reel"; the query, such as igsh, is dropped).
 */
export function parseInstagram(input: string): SocialLinkResult {
  const url = toUrl(input);
  if (!url || !IG_HOSTS.has(url.hostname.toLowerCase())) return { ok: false, problem: 'not-instagram' };
  const parts = url.pathname.split('/').filter(Boolean);
  const at = parts.findIndex((p) => ['reel', 'reels', 'p', 'tv'].includes(p.toLowerCase()));
  if (at < 0 || at > 1 || !IG_CODE.test(parts[at + 1] ?? '')) return { ok: false, problem: 'not-a-post' };
  const kind = parts[at]!.toLowerCase() === 'reels' ? 'reel' : parts[at]!.toLowerCase();
  return { ok: true, url: `https://www.instagram.com/${kind}/${parts[at + 1]}/` };
}

const YT_HOSTS = /* @__PURE__ */ new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);
const YT_ID = /^[\w-]{11}$/;

/**
 * youtube.com (www., m., music.), youtube-nocookie.com and youtu.be: /shorts/<id>, /watch?v=<id>, /live/<id>, /embed/<id>,
 * /v/<id> and youtu.be/<id>. Canonical: https://www.youtube.com/shorts/<id> for a Short, else /watch?v=<id> (timestamps
 * and si dropped). A channel or @handle link is refused.
 */
export function parseYouTube(input: string): YouTubeLinkResult {
  const url = toUrl(input);
  if (!url) return { ok: false, problem: 'not-youtube' };
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  let shorts = false;
  if (host === 'youtu.be' || host === 'www.youtu.be') id = url.pathname.split('/')[1] ?? null;
  else if (YT_HOSTS.has(host)) {
    const [, kind, value] = url.pathname.split('/');
    if (kind === 'watch') id = url.searchParams.get('v');
    else if (kind === 'shorts') {
      id = value ?? null;
      shorts = true;
    } else if (kind === 'live' || kind === 'embed' || kind === 'v') id = value ?? null;
    else return { ok: false, problem: 'not-a-video' };
  } else return { ok: false, problem: 'not-youtube' };
  if (!id || !YT_ID.test(id)) return { ok: false, problem: 'not-a-video' };
  return { ok: true, url: shorts ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`, id, shorts };
}

/** The 11-character id of a stored (canonical) YouTube URL. */
export function youTubeIdOf(canonical: string): string | null {
  const r = parseYouTube(canonical);
  return r.ok ? r.id : null;
}
