import type { Video } from '@kreators/shared';
import { INTERACTION_THREAD, type CastId } from './content';

// Home #interaction: INTERACTION_THREAD resolved against the live library (also the kit's thread). The first four candidates with a live video, each
// asked by the next character in THREAD_CAST order; a video never answers twice.

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
/** Brand names compare without spaces, punctuation or a trailing domain ("CircleStore.in" = "Circle Store"). */
const brandKey = (s: string) => norm(s).replace(/\.(in|com|co|io|app|store|shop)$/, '').replace(/[^a-z0-9]/g, '');
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

/** The thread for this library: up to `max` pairs, in candidate order, the askers in THREAD_CAST order. */
export function resolveThread(videos: readonly Video[], max = THREAD_CAST.length): ThreadPair[] {
  const used = new Set<string>();
  const pairs: ThreadPair[] = [];
  for (const { q, videoId, alsoIds = [], brand, titles } of INTERACTION_THREAD) {
    if (pairs.length >= max) break;
    const ids = videoId ? [videoId, ...alsoIds] : alsoIds;
    const video = ids.map((id) => videos.find((v) => v.id === id && !used.has(v.id))).find(Boolean) ?? findByTitle(videos, brand, titles, used);
    if (!video) continue;
    used.add(video.id);
    pairs.push({ who: THREAD_CAST[pairs.length % THREAD_CAST.length] as CastId, question: q, video });
  }
  return pairs;
}
