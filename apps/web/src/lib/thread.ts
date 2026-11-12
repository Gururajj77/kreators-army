import { brandKey, isMultiBrand, type Video } from '@kreators/shared';
import { INTERACTION_THREAD, type CastId } from './content';
import { shuffleForLoad } from './videoFind';

// Home #interaction: INTERACTION_THREAD resolved against the live library (also the kit's thread and the Founders page's examples). The candidates
// are taken in this page load's random order (r18: which questions show, and their order, change on every load), and the first four with a live
// video are shown, each asked by the next character in THREAD_CAST order; a video never answers twice. (r19) A question whose video is its brand's
// only one in the library is skipped (the founder: random surfaces draw from brands with 2 or more videos); such questions fill in, in this load's
// order, only when fewer than four are left.

/** Who asks, in display order: the first question is Bolu's, the fourth Gola's. */
export const THREAD_CAST: readonly CastId[] = ['bolu', 'tiko', 'sochu', 'gola'];

export interface ThreadPair {
  who: CastId;
  question: string;
  video: Video;
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
/** Titles compare without punctuation ("Salt Vs. Sweet" = "salt vs sweet"). */
const titleKey = (s: string) => norm(s).replace(/[^a-z0-9]+/g, ' ').trim();
/** One brand key starts with the other ("Ansh" = "Ansh Mehra"), at three characters or more so a stray initial matches nothing. */
const sameBrand = (a: string, b: string) => {
  const x = brandKey(a);
  const y = brandKey(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return Math.min(x.length, y.length) >= 3 && (x.startsWith(y) || y.startsWith(x));
};

/** The candidate's video when its ids are gone: same brand, the first title phrase that matches (in the order listed), not one already used. */
function findByTitle(videos: readonly Video[], brand: string, titles: readonly string[], used: ReadonlySet<string>): Video | undefined {
  const own = videos.filter((v) => !used.has(v.id) && sameBrand(v.brand, brand));
  for (const t of titles) {
    const hit = own.find((v) => titleKey(v.title).includes(titleKey(t)));
    if (hit) return hit;
  }
  return undefined;
}

/** This load's order of the candidates: the same on every surface and every render of the visit, new on each page load. */
const candidates = () => shuffleForLoad(INTERACTION_THREAD, 'thread', { key: (t) => t.q });

/** The candidate's live video, by its ids, then by brand and title, not one already used. */
function videoFor({ videoId, alsoIds = [], brand, titles }: (typeof INTERACTION_THREAD)[number], videos: readonly Video[], used: ReadonlySet<string>): Video | undefined {
  const ids = videoId ? [videoId, ...alsoIds] : alsoIds;
  return ids.map((id) => videos.find((v) => v.id === id && !used.has(v.id))).find(Boolean) ?? findByTitle(videos, brand, titles, used);
}

/**
 * The thread for this library: up to `max` pairs, in this load's candidate order, the askers in THREAD_CAST order. Questions answered by a video
 * whose brand has 2 or more videos in the library come first; one answered by its brand's only video joins only while the thread has fewer than
 * four (THREAD_CAST.length), keeping its place in this load's order.
 */
export function resolveThread(videos: readonly Video[], max = THREAD_CAST.length): ThreadPair[] {
  const multi = isMultiBrand(videos);
  const order = candidates();
  const used = new Set<string>();
  const picked: { at: number; question: string; video: Video }[] = [];
  const skipped: number[] = [];
  order.forEach((c, at) => {
    if (picked.length >= max) return;
    const video = videoFor(c, videos, used);
    if (!video) return;
    if (!multi(video)) {
      skipped.push(at);
      return;
    }
    used.add(video.id);
    picked.push({ at, question: c.q, video });
  });
  // Too few: the single-brand questions fill up to four, in this load's order.
  const fill = Math.min(max, THREAD_CAST.length);
  for (const at of skipped) {
    if (picked.length >= fill) break;
    const c = order[at] as (typeof INTERACTION_THREAD)[number];
    const video = videoFor(c, videos, used);
    if (!video) continue;
    used.add(video.id);
    picked.push({ at, question: c.q, video });
  }
  return picked
    .sort((a, b) => a.at - b.at)
    .map(({ question, video }, i) => ({ who: THREAD_CAST[i % THREAD_CAST.length] as CastId, question, video }));
}
