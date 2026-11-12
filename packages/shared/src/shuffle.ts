// Seeded orders: one small generator (mulberry32 from any string) and a shuffle built on it. The web app deals every public list of videos with
// these, from one seed per page load (apps/web/src/lib/videoFind.ts shuffleForLoad), so each load shows the reels in a new order while a re-render
// or a route change within the visit keeps it. The library's shareable ?sort=shuffle&seed= order is built on the same generator: keep it as is.

/** mulberry32, seeded from a string: the same seed always gives the same sequence in [0, 1). */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353) >>> 0;
  let t = h >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** One item's place under a seed, in [0, 1): it depends only on the seed and the item's key, never on the rest of the list. A full 53-bit string
 *  hash (cyrb53), since keys that share most of their characters ("seed-circlestore-1", "-2") must still land independently. */
export function seededKey(seed: string, key: string): number {
  const text = `${seed}|${key}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)) / 9007199254740992;
}

export interface SeededShuffleOptions<T> {
  /** The item's stable key (default: the string itself, else its `id`, else its index). */
  key?: (item: T, index: number) => string;
  /** Lower tiers come first, shuffled within each tier: e.g. videos with a poster before those without. Default: one tier. */
  tier?: (item: T) => number;
}

const defaultKey = (item: unknown, index: number): string => {
  if (typeof item === 'string') return item;
  const id = (item as { id?: unknown } | null)?.id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : `#${index}`;
};

/**
 * A new array with the same items in a seeded random order (nothing lost, nothing added). Each item's place comes from its own key, so a part of a
 * list (a filter, a category) keeps the relative order the whole list had under the same seed.
 */
export function seededShuffle<T>(list: readonly T[], seed: string, options: SeededShuffleOptions<T> = {}): T[] {
  const keyOf = options.key ?? defaultKey;
  const tierOf = options.tier ?? (() => 0);
  return list
    .map((item, i) => ({ item, i, tier: tierOf(item), at: seededKey(seed, keyOf(item, i)) }))
    .sort((a, b) => a.tier - b.tier || a.at - b.at || a.i - b.i)
    .map((x) => x.item);
}
