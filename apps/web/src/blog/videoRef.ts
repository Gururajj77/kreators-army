// Resolves a post's VideoRef (brand + title phrase) against the live library (/api/videos). Tolerant on purpose: library titles carry a number, a
// "Brand - " prefix and a date ("03 Waxys - Smell It And Guess 20-04"), and their case and apostrophes vary ("When You Can’T Afford").
// The validator runs the same matcher over .work/v2/blog/source/live-videos.json.

import type { VideoRef } from './types';

/** Lowercase, accents and apostrophes removed, everything else that is not a letter or digit a space. */
export function foldWords(s: string): string[] {
  return s
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/['’‘`]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

const squash = (s: string) => foldWords(s).join('');

/** A library title's words without its leading number, "Brand - " prefix and trailing "DD-MM" date. */
export function titleWords(title: string, brand: string): string[] {
  let t = title.trim().replace(/^\d+\s+/, '').replace(/\s+\d{1,2}-\d{1,2}$/, '');
  const dash = /^(.+?)\s+-\s+(.+)$/.exec(t);
  if (dash && squash(dash[1] as string) === squash(brand)) t = dash[2] as string;
  return foldWords(t);
}

const leadingNumber = (title: string) => Number(/^\s*(\d+)/.exec(title)?.[1] ?? Number.MAX_SAFE_INTEGER);

/** Where `needle` sits as a run of whole words in `hay`, or -1. */
function runAt(hay: string[], needle: string[]): number {
  if (!needle.length || needle.length > hay.length) return -1;
  outer: for (let i = 0; i + needle.length <= hay.length; i++) {
    for (let j = 0; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}

/**
 * Every video the ref could mean, best first: the whole library title as written, then a title equal to the phrase, then titles holding it; within
 * each, library number order. The ref's own number, "Brand - " prefix and date are ignored like the library's.
 */
export function matchVideos<V extends { brand: string; title: string }>(ref: Pick<VideoRef, 'brand' | 'title'>, videos: readonly V[]): V[] {
  const brand = squash(ref.brand);
  const whole = squash(ref.title);
  const want = titleWords(ref.title, ref.brand);
  const hits: { v: V; rank: number; n: number }[] = [];
  for (const v of videos) {
    if (squash(v.brand) !== brand) continue;
    const words = titleWords(v.title, v.brand);
    const rank = squash(v.title) === whole ? 0 : words.length === want.length && runAt(words, want) === 0 ? 1 : runAt(words, want) >= 0 ? 2 : -1;
    if (rank >= 0) hits.push({ v, rank, n: leadingNumber(v.title) });
  }
  hits.sort((a, b) => a.rank - b.rank || a.n - b.n);
  return hits.map((h) => h.v);
}

/** The one video a ref names (its `nth` match, default the first), or null: render the block's fallback. */
export function matchVideo<V extends { brand: string; title: string }>(ref: VideoRef, videos: readonly V[]): V | null {
  return matchVideos(ref, videos)[(ref.nth ?? 1) - 1] ?? null;
}
