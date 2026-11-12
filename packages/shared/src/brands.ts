// Brands with more than one video (r19, the founder: "in the randomization keep the ones with more than one video in that brand, single videos of
// any brand can be skipped"). The web app's random surfaces (the Home hero deck, the Work bento and rail, the footer ring, the format pages' random
// draw, the Testimonials posters, the Home chat and the Founders examples) draw from videos whose brand has two or more videos in the whole library;
// a brand's only video joins them only to fill a surface that would otherwise show fewer cards. The library grid, search and filters list every video.

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

/** A brand name compared without case, spaces, punctuation or a trailing domain ("CircleStore.in" = "Circlestore" = "Circle Store"). */
export const brandKey = (s: string | null | undefined): string =>
  norm(s ?? '')
    .replace(/\.(in|com|co|io|app|store|shop)$/, '')
    .replace(/[^a-z0-9]/g, '');

/** How many videos each brand has (by brandKey). Videos with no brand are not counted: each is a brand of its own, with one video. */
export function brandCounts(videos: readonly { brand: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of videos) {
    const k = brandKey(v.brand);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

/** A test for "this video's brand has 2 or more videos in `all`" (counted once, over the whole list). */
export function isMultiBrand(all: readonly { brand: string }[]): (v: { brand: string }) => boolean {
  const counts = brandCounts(all);
  return (v) => {
    const k = brandKey(v.brand);
    return k !== '' && (counts.get(k) ?? 0) >= 2;
  };
}

export interface MultiBrandOptions<T> {
  /** The whole published library the brands are counted over (default: `subset` itself). Never a filtered part such as posters only. */
  all?: readonly { brand: string }[];
  /** How many videos the surface needs. When fewer multi-brand videos than this exist, single-brand ones fill up to it. Default 0 (no top-up). */
  need?: number;
  /** The order the single-brand videos fill in (e.g. this load's random order, posters first). Default: as listed. */
  rank?: (singles: T[]) => T[];
}

/**
 * The videos of `subset` for a random surface, in `subset`'s order: every one whose brand has 2 or more videos in `all`, plus, only when those are
 * fewer than `need`, the first single-brand ones by `rank` up to `need`, so a surface never shows fewer cards than it could.
 */
export function multiBrand<T extends { brand: string }>(subset: readonly T[], options: MultiBrandOptions<T> = {}): T[] {
  const multi = isMultiBrand(options.all ?? subset);
  const keep = new Set<T>(subset.filter(multi));
  const short = (options.need ?? 0) - keep.size;
  if (short > 0) {
    const singles = subset.filter((v) => !keep.has(v));
    for (const v of (options.rank ?? ((l: T[]) => l))(singles).slice(0, short)) keep.add(v);
  }
  return subset.filter((v) => keep.has(v));
}
