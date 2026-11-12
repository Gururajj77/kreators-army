import { seededRandom, seededShuffle, type SeededShuffleOptions, type Video } from '@kreators/shared';

// The video library's finding rules, kept free of React so they read (and test) on their own: the facets and their counts, the sorts, the search
// and its suggestions, and the upload date as words. Used by site/VideoLibrary.tsx, and for the date by the tiles and the player.

// ---------- Upload dates ----------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

/** 'YYYY-MM-DD' as numbers, or null for anything else. */
function day(date: string | null | undefined): { y: number; m: number; d: number } | null {
  const hit = date ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) : null;
  if (!hit) return null;
  const [y, m, d] = [Number(hit[1]), Number(hit[2]), Number(hit[3])];
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 ? { y, m, d } : null;
}

/** "Nov 2026" for an upload date, or null when there is none. */
export function uploadMonth(date: string | null | undefined): string | null {
  const t = day(date);
  return t ? `${MONTHS[t.m - 1]} ${t.y}` : null;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ---------- Words: accents, case and punctuation folded away ----------

const FOLD: Record<string, string> = { ø: 'o', æ: 'ae', œ: 'oe', ß: 'ss', ł: 'l', đ: 'd', ð: 'd', þ: 'th', ı: 'i' };

export function fold(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[øæœßłđðþı]/g, (c) => FOLD[c] ?? c);
}

const wordsOf = (s: string | null | undefined): string[] => (s ? fold(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean) : []);

/** Words that carry no filter on their own ("videos by fyndflow"). */
const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'for', 'by', 'on', 'in', 'at', 'with', 'from', 'to', 'video', 'videos']);

/** The query as folded words, edges trimmed of punctuation (a trailing "+" stays: "1m+"). */
export function tokens(q: string): string[] {
  return fold(q)
    .split(/[\s,]+/)
    .map((t) => t.replace(/^[^\p{L}\p{N}]+/u, '').replace(/[^\p{L}\p{N}+]+$/u, ''))
    .filter(Boolean);
}

/** Optimal string alignment distance (Damerau-Levenshtein with adjacent swaps), stopping early once it passes `max`. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let low = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min((prev[j] as number) + 1, (cur[j - 1] as number) + 1, (prev[j - 1] as number) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, (prev2[j - 2] as number) + 1);
      cur[j] = v;
      low = Math.min(low, v);
    }
    if (low > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length] as number;
}

/** A word typed with one slip (5 letters or more): a letter missing, extra, wrong or swapped, against the whole word or its start. */
function near(t: string, w: string): boolean {
  if (t.length < 5) return false;
  if (distance(t, w, 1) <= 1) return true;
  if (w.length > t.length) return distance(t, w.slice(0, t.length), 1) <= 1 || distance(t, w.slice(0, t.length + 1), 1) <= 1;
  return false;
}

/** A token against a set of words and one folded string: the start of a word, inside the string (3 letters or more), or near a word. */
function textHit(t: string, words: string[], compact: string): boolean {
  return words.some((w) => w.startsWith(t)) || (t.length >= 3 && compact.includes(t)) || words.some((w) => near(t, w));
}

// ---------- Shorthands ----------

const INSTAGRAM = new Set(['ig', 'insta', 'instagram']);
const YOUTUBE = new Set(['yt', 'youtube', 'shorts']);
const VERTICAL = new Set(['vertical', 'portrait', '9:16']);
const LANDSCAPE = new Set(['landscape', 'horizontal', 'wide', '16:9']);

const isInstagram = (v: Video) => Boolean(v.links.instagram) || fold(v.platform ?? '').includes('instagram');
const isYouTube = (v: Video) => Boolean(v.links.youtube) || /youtube|shorts/.test(fold(v.platform ?? ''));

/** What a shorthand token means, or null when it is just a word. */
function shorthand(t: string): ((v: Video) => boolean) | null {
  if (INSTAGRAM.has(t)) return isInstagram;
  if (YOUTUBE.has(t)) return isYouTube;
  if (VERTICAL.has(t)) return (v) => v.aspect === 'vertical';
  if (LANDSCAPE.has(t)) return (v) => v.aspect === 'landscape';
  const reach = /^(\d+(?:\.\d+)?)([km])\+?$/.exec(t);
  if (reach) {
    const floor = Number(reach[1]) * (reach[2] === 'm' ? 1_000_000 : 1_000);
    return (v) => v.views > 0 && v.views >= floor;
  }
  if (/^(19|20)\d{2}$/.test(t)) return (v) => Boolean(v.uploadDate?.startsWith(t));
  return null;
}

// ---------- The search ----------

interface Indexed {
  words: string[];
  compact: string;
}

const index = new WeakMap<Video, Indexed>();

function indexed(v: Video): Indexed {
  let hit = index.get(v);
  if (!hit) {
    const t = day(v.uploadDate);
    const date = t ? [MONTHS[t.m - 1]?.toLowerCase() ?? '', MONTHS_LONG[t.m - 1] ?? '', String(t.y)] : [];
    hit = {
      words: [...wordsOf(v.title), ...wordsOf(v.brand), ...wordsOf(v.category), ...wordsOf(v.platform), ...date],
      compact: fold([v.title, v.brand, v.category, v.platform].filter(Boolean).join(' ')),
    };
    index.set(v, hit);
  }
  return hit;
}

/** Every word of the query matches the video (AND): its shorthand, or the title, brand, category, platform or upload month and year. */
export function matchesQuery(v: Video, toks: string[]): boolean {
  const ix = indexed(v);
  return toks.every((t) => {
    if (STOP.has(t)) return true;
    if (shorthand(t)?.(v)) return true;
    return textHit(t, ix.words, ix.compact);
  });
}

// ---------- Facets ----------

export interface FacetOption {
  value: string;
  label: string;
  /** Its words in the chips above the grid and in the empty state ("Uploaded in 2025"). */
  chip?: string;
  match: (v: Video) => boolean;
}

export interface FacetDef {
  /** The address key. */
  key: string;
  /** The rail's name. */
  label: string;
  /** Every option the library's videos give this group, in order. */
  options: FacetOption[];
  /** What a value in the address means (also one with no option, which then matches nothing), or null to ignore it. */
  test: (value: string) => ((v: Video) => boolean) | null;
}

function valuesOf(videos: Video[], key: 'category' | 'platform'): string[] {
  const seen = new Set<string>();
  for (const v of videos) if (v[key]) seen.add(v[key] as string);
  return [...seen].sort((a, b) => a.localeCompare(b));
}

const REACH: FacetOption[] = [
  { value: '1m', label: '1M+ views', match: (v) => v.views >= 1_000_000 },
  { value: '100k', label: '100K+ views', match: (v) => v.views >= 100_000 },
  // Unknown views (0) are in none of these.
  { value: 'under', label: 'Under 100K views', match: (v) => v.views > 0 && v.views < 100_000 },
];

const POSTED: FacetOption[] = [
  { value: 'instagram', label: 'Instagram', chip: 'Posted on Instagram', match: (v) => Boolean(v.links.instagram) },
  { value: 'youtube', label: 'YouTube', chip: 'Posted on YouTube', match: (v) => Boolean(v.links.youtube) },
];

const SHAPES: FacetOption[] = [
  { value: 'vertical', label: 'Vertical', match: (v) => v.aspect === 'vertical' },
  { value: 'landscape', label: 'Landscape', match: (v) => v.aspect === 'landscape' },
];

/** The upload date options for `today`: this month, the last three months, this year, then each earlier year a video has. */
function dateOptions(videos: Video[], today: Date): FacetOption[] {
  const y = today.getFullYear();
  const ym = iso(today).slice(0, 7);
  const since = iso(new Date(y, today.getMonth() - 3, today.getDate()));
  const years = [...new Set(videos.map((v) => day(v.uploadDate)?.y).filter((n): n is number => n !== undefined && n < y))].sort((a, b) => b - a);
  return [
    { value: 'month', label: 'This month', chip: 'Uploaded this month', match: (v: Video) => Boolean(v.uploadDate?.startsWith(ym)) },
    { value: '3m', label: 'Last 3 months', chip: 'Uploaded in the last 3 months', match: (v: Video) => Boolean(v.uploadDate && v.uploadDate >= since) },
    { value: 'year', label: 'This year', chip: 'Uploaded this year', match: (v: Video) => Boolean(v.uploadDate?.startsWith(`${y}-`)) },
    ...years.map((n) => ({ value: String(n), label: String(n), chip: `Uploaded in ${n}`, match: (v: Video) => Boolean(v.uploadDate?.startsWith(`${n}-`)) })),
  ];
}

const fixed = (options: FacetOption[]) => (value: string) => options.find((o) => o.value === value)?.match ?? null;

/** The library's facet groups, in the bar's order (the brand rings last; they sit in the header). */
export function facetDefs(videos: Video[], today = new Date()): FacetDef[] {
  const dates = dateOptions(videos, today);
  const brands = brandsOf(videos);
  return [
    {
      key: 'date',
      label: 'Uploaded',
      options: dates,
      // An earlier year in the address works even when no video has it (it then matches nothing).
      test: (value) => fixed(dates)(value) ?? (/^\d{4}$/.test(value) ? (v) => Boolean(v.uploadDate?.startsWith(`${value}-`)) : null),
    },
    { key: 'shape', label: 'Shape', options: SHAPES, test: fixed(SHAPES) },
    { key: 'reach', label: 'Reach', options: REACH, test: fixed(REACH) },
    { key: 'category', label: 'Category', options: valuesOf(videos, 'category').map((c) => ({ value: c, label: c, match: (v) => v.category === c })), test: (c) => (v) => v.category === c },
    { key: 'platform', label: 'Platform', options: valuesOf(videos, 'platform').map((p) => ({ value: p, label: p, match: (v) => v.platform === p })), test: (p) => (v) => v.platform === p },
    { key: 'posted', label: 'Posted on', options: POSTED, test: fixed(POSTED) },
    { key: 'brand', label: 'Brand', options: brands.map((b) => ({ value: b, label: b, match: (v) => v.brand === b })), test: (b) => (v) => v.brand === b },
  ];
}

/** Brands in the order the library lists them (the founder's order), each once. */
export function brandsOf(videos: Video[]): string[] {
  const seen = new Set<string>();
  for (const v of videos) if (v.brand) seen.add(v.brand);
  return [...seen];
}

export type Selection = Record<string, string[]>;

export interface Facet {
  def: FacetDef;
  /** The options to show: a count above 0 under the other filters, or selected. Same-set duplicates (this month = this year) are dropped. */
  options: (FacetOption & { count: number })[];
  selected: string[];
  /** Two or more options are useful across the whole library (or one is selected): the rail shows. */
  show: boolean;
}

/** Within a group the values are OR'd; across groups and with the search, AND'd. `skip` leaves one group out (for its own counts). */
export function passes(v: Video, defs: FacetDef[], sel: Selection, toks: string[], skip?: string): boolean {
  for (const d of defs) {
    if (d.key === skip) continue;
    const preds = (sel[d.key] ?? []).map(d.test).filter((p): p is (v: Video) => boolean => p !== null);
    if (preds.length && !preds.some((p) => p(v))) return false;
  }
  return toks.length === 0 || matchesQuery(v, toks);
}

/** The facets with disjunctive counts: each option counts the videos that pass every other group and the search. */
export function facets(videos: Video[], defs: FacetDef[], sel: Selection, toks: string[]): Facet[] {
  return defs.map((def) => {
    const selected = sel[def.key] ?? [];
    // Options that match the very same videos across the library say the same thing twice; the first (the narrowest date) stays.
    const sets: string[] = [];
    const useful = def.options.filter((o) => {
      const ids = videos.filter(o.match).map((v) => v.id);
      const key = ids.join('|');
      if (ids.length === 0 || sets.includes(key)) return selected.includes(o.value);
      sets.push(key);
      return true;
    });
    const rest = videos.filter((v) => passes(v, defs, sel, toks, def.key));
    const options = useful.map((o) => ({ ...o, count: rest.filter(o.match).length })).filter((o) => o.count > 0 || selected.includes(o.value));
    // A selected value with no option (an old link) still gets a chip to take it off.
    for (const value of selected) if (!options.some((o) => o.value === value)) options.push({ value, label: value, match: () => false, count: 0 });
    return { def, options, selected, show: selected.length > 0 || (sets.length >= 2 && options.length > 0) };
  });
}

/** How a selected value reads in the chips row and the empty state. */
export function chipLabel(def: FacetDef, value: string): string {
  const o = def.options.find((x) => x.value === value);
  if (def.key === 'date' && !o) return `Uploaded in ${value}`;
  return o?.chip ?? o?.label ?? value;
}

// ---------- Sorts ----------

export interface SortDef {
  value: string;
  label: string;
}

const numDate = (v: Video) => (day(v.uploadDate) ? Number(v.uploadDate!.replaceAll('-', '')) : null);
const knownViews = (v: Video) => (v.views > 0 ? v.views : null);
const knownLength = (v: Video) => (v.durationMs && v.durationMs > 0 ? v.durationMs : null);

/** The orders that mean something for these videos. Shuffled (the default: a fresh random order per visit) and Our picks always; Newest and Oldest
 *  with a date; Shortest and Longest when most have a length. */
export function sortsFor(videos: Video[]): SortDef[] {
  const dated = videos.some((v) => numDate(v) !== null);
  const timed = videos.filter((v) => knownLength(v) !== null).length;
  return [
    { value: 'shuffle', label: 'Shuffled' },
    { value: 'featured', label: 'Our picks' },
    ...(dated
      ? [
          { value: 'new', label: 'Newest' },
          { value: 'old', label: 'Oldest' },
        ]
      : []),
    { value: 'views', label: 'Most viewed' },
    { value: 'least', label: 'Least viewed' },
    { value: 'brand', label: 'Brand A to Z' },
    ...(timed >= 2 && timed * 2 >= videos.length
      ? [
          { value: 'short', label: 'Shortest' },
          { value: 'long', label: 'Longest' },
        ]
      : []),
  ];
}

/** A new shuffle seed (each visit's default order, and the Shuffle button): short, URL-safe. */
export const newShuffleSeed = () => Math.random().toString(36).slice(2, 8);

// ---------- This page load's order: every public list of videos (and the Home chat's questions) ----------

let loadSeed: string | undefined;

/** One seed per page load, made on the first call (in the browser: the app renders on the client only), so a re-render or a route change within
 *  the visit keeps every order and a full reload deals new ones. Each reel gets its turn at the prominent places. */
export function pageLoadSeed(): string {
  loadSeed ??= newShuffleSeed();
  return loadSeed;
}

/** A video with a poster before one without (no blank cards in the prominent places while alternatives exist). */
export const posterFirst = (v: Video) => (v.posterUrl ? 0 : 1);

/** This load's order of `list` for one surface (`salt`: each surface its own order). Stable for the visit; `tier` puts lower tiers first. */
export function shuffleForLoad<T>(list: readonly T[], salt: string, options?: SeededShuffleOptions<T>): T[] {
  return seededShuffle(list, `${pageLoadSeed()}:${salt}`, options);
}

/** Missing values (no date, unknown views, no length) go last in both directions. Ties keep the library's order. */
const by = (get: (v: Video) => number | null, dir: 1 | -1) => (a: Video, b: Video) => {
  const x = get(a);
  const y = get(b);
  if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
  return (x - y) * dir;
};

export function sortVideos(list: Video[], sort: string, seed = '1'): Video[] {
  const out = [...list];
  if (sort === 'shuffle') {
    const rnd = seededRandom(seed);
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
  } else if (sort === 'new') out.sort(by(numDate, -1));
  else if (sort === 'old') out.sort(by(numDate, 1));
  else if (sort === 'views') out.sort(by(knownViews, -1));
  else if (sort === 'least') out.sort(by(knownViews, 1));
  else if (sort === 'brand') out.sort((a, b) => a.brand.localeCompare(b.brand, undefined, { sensitivity: 'base' }));
  else if (sort === 'short') out.sort(by(knownLength, 1));
  else if (sort === 'long') out.sort(by(knownLength, -1));
  return out;
}

// ---------- Suggestions ----------

export interface Suggestion {
  key: string;
  value: string;
  label: string;
  kind: string;
  count: number;
}

const KINDS: Record<string, string> = { brand: 'Brand', category: 'Category', platform: 'Platform', date: 'Year', shape: 'Shape' };

/**
 * Filters the typed words point at: brands, categories, platforms, years and shapes whose words every typed word starts (or nearly spells), not yet
 * selected, with the number of videos the filter would leave (the search itself aside, since picking one takes its words out of the box).
 */
export function suggest(videos: Video[], fs: Facet[], sel: Selection, q: string, max = 6): Suggestion[] {
  const toks = tokens(q).filter((t) => !STOP.has(t));
  if (toks.length === 0) return [];
  const thisYear = String(new Date().getFullYear());
  const out: (Suggestion & { rank: number })[] = [];
  for (const f of fs) {
    const kind = KINDS[f.def.key];
    if (!kind || !f.show) continue;
    const rest = videos.filter((v) => passes(v, fs.map((x) => x.def), sel, [], f.def.key));
    for (const o of f.def.options) {
      if (f.selected.includes(o.value)) continue;
      // Years only: "This month" and its kind are chips, not words someone types.
      if (f.def.key === 'date' && !/^\d{4}$/.test(o.value) && o.value !== 'year') continue;
      const label = f.def.key === 'date' && o.value === 'year' ? thisYear : o.label;
      const words = wordsOf(label);
      const compact = fold(label);
      if (!toks.every((t) => textHit(t, words, compact))) continue;
      const count = rest.filter(o.match).length;
      if (count === 0) continue;
      const whole = toks.join(' ');
      const rank = compact === whole ? 0 : compact.startsWith(whole) ? 1 : toks.every((t) => words.some((w) => w.startsWith(t))) ? 2 : 3;
      out.push({ key: f.def.key, value: o.value, label, kind, count, rank });
    }
  }
  return out
    // Years newest first; anything else A to Z.
    .sort((a, b) => a.rank - b.rank || b.count - a.count || (a.kind === 'Year' && b.kind === 'Year' ? b.label.localeCompare(a.label) : a.label.localeCompare(b.label)))
    .slice(0, max)
    .map(({ rank: _rank, ...s }) => s);
}

/** The box after a suggestion is picked: the words that pointed at it go, any others stay. */
export function withoutWordsOf(q: string, label: string): string {
  const words = wordsOf(label);
  const compact = fold(label);
  return q
    .split(/\s+/)
    .filter((raw) => {
      const [t] = tokens(raw);
      return t !== undefined && !textHit(t, words, compact);
    })
    .join(' ');
}
