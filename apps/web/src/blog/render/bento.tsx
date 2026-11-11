// (bento10) The blog's bento: one grid of mixed tiles for the index (a 2x2 feature, 2x1 hubs, 1x1 guides, and the search, stats and call-to-action
// tiles woven in) and the post page's card-like parts (related posts). Server-safe, like the rest of render/: the build draws the same tiles in Node.
//
// The grid packs densely (CSS grid-auto-flow: dense). Which cells each tile spans at each width is decided here, by the same first-fit packing the
// browser does, so the last tile can take exactly the cells left on the last row and no width ever shows a hole:
//   c4  4 columns, 1280 px and wider      c3  3 columns, 1068 to 1279 px      c2  2 columns, 735 to 1067 px      c1  one column (phones)
// Each tile carries data-w4/h4, data-w3/h3, data-w2/h2 and blog.css applies them inside its own media query.

import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { CLOSING } from '../../lib/content';
import type { BlogCategory, PostMeta, PostSummary } from '../types';
import { PrimaryAction } from './blocks';

// ---------- Layout ----------

export const BENTO_COLS = { c4: 4, c3: 3, c2: 2 } as const;
type ColsKey = keyof typeof BENTO_COLS;
const KEYS = Object.keys(BENTO_COLS) as ColsKey[];

/** A tile's shape, [columns, rows], at each width. */
export type TileSize = 'feature' | 'wide' | 'tools' | 'small' | 'lead';
const SPANS: Record<TileSize, Record<ColsKey, [number, number]>> = {
  feature: { c4: [2, 2], c3: [2, 2], c2: [2, 2] },
  wide: { c4: [2, 1], c3: [2, 1], c2: [2, 1] },
  // The search and filters: a wide bar on four and two columns; on three, a panel beside the feature with the reading stats under it.
  tools: { c4: [2, 1], c3: [1, 1], c2: [2, 1] },
  small: { c4: [1, 1], c3: [1, 1], c2: [1, 1] },
  // The first related post: wide where three tiles would not fill the row.
  lead: { c4: [2, 1], c3: [1, 1], c2: [2, 1] },
};

export interface BentoSlot {
  size: TileSize;
  /**
   * 'fill': the last tile; it takes the cells left on the last row (the whole row when none are left). 'flex': may grow one column when the fill
   * would otherwise be left a single cell on three or four columns.
   */
  role?: 'fill' | 'flex';
}

export type SlotSpans = Partial<Record<`data-${'w' | 'h'}${4 | 3 | 2}`, number>>;

/** First-fit dense packing, as the browser does it. Returns the free cells left in the rows used. */
function pack(spans: [number, number][], cols: number): { rows: number; free: boolean[][] } {
  const grid: boolean[][] = [];
  const row = (r: number) => (grid[r] ??= Array.from({ length: cols }, () => false));
  let rows = 0;
  for (const [w0, h] of spans) {
    const w = Math.min(w0, cols);
    let placed = false;
    for (let r = 0; !placed; r++) {
      for (let c = 0; c + w <= cols && !placed; c++) {
        let fits = true;
        for (let dr = 0; dr < h && fits; dr++) for (let dc = 0; dc < w && fits; dc++) if (row(r + dr)[c + dc]) fits = false;
        if (!fits) continue;
        for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) row(r + dr)[c + dc] = true;
        rows = Math.max(rows, r + h);
        placed = true;
      }
    }
  }
  return {
    rows,
    free: grid.slice(0, rows).map((r) => r.map((taken) => !taken)),
  };
}

/** The cells free at the end of the last row, when every other row is full; null when the packing left a hole elsewhere. */
function tailGap(spans: [number, number][], cols: number): number | null {
  const { rows, free } = pack(spans, cols);
  if (!rows) return 0;
  for (let r = 0; r < rows - 1; r++) if (free[r]?.some(Boolean)) return null;
  const last = free[rows - 1] ?? [];
  const n = last.filter(Boolean).length;
  // The free cells must be the row's end, so the fill tile lands there.
  return last.slice(cols - n).every(Boolean) ? n : null;
}

/** Each slot's spans at each width, so the grid ends flush. */
export function bentoLayout(slots: readonly BentoSlot[]): SlotSpans[] {
  const out: SlotSpans[] = slots.map(() => ({}));
  for (const key of KEYS) {
    const cols = BENTO_COLS[key];
    const n = key.slice(1) as '4' | '3' | '2';
    const spans = slots.map((s) => [...SPANS[s.size][key]] as [number, number]);
    const fill = slots.findIndex((s) => s.role === 'fill');
    const flex = slots.findIndex((s) => s.role === 'flex');
    if (fill >= 0) {
      const others = spans.filter((_, i) => i !== fill);
      let gap = tailGap(others, cols);
      if (gap === 1 && cols >= 3 && flex >= 0) {
        const span = spans[flex] as [number, number];
        span[0] = Math.min(cols, span[0] + 1);
        gap = tailGap(
          spans.filter((_, i) => i !== fill),
          cols,
        );
      }
      // Nothing left on the last row: the fill tile takes a row of its own.
      (spans[fill] as [number, number])[0] = gap ? gap : cols;
    } else {
      // No fill tile: the last tile stretches over whatever its row has left.
      const gap = tailGap(spans, cols);
      const last = spans[spans.length - 1];
      if (gap && last) last[0] += gap;
    }
    spans.forEach(([w, h], i) => {
      const o = out[i] as SlotSpans;
      o[`data-w${n}`] = w;
      o[`data-h${n}`] = h;
    });
  }
  return out;
}

// ---------- What a tile shows ----------

/** Each cluster keeps one of the cast's hues (the covers use the same). */
export type Tone = 'tiko' | 'gola' | 'bolu' | 'sochu';
export const CLUSTER_TONE: Record<BlogCategory, Tone> = {
  Understand: 'tiko',
  Plan: 'sochu',
  Shoot: 'gola',
  'Edit and publish': 'bolu',
};
export const toneOf = (c: BlogCategory): Tone => CLUSTER_TONE[c] ?? 'tiko';

/** The widgets as readers know them, most hands-on first: a tile names the first few its post holds. */
const WIDGET_LABELS: [string, string][] = [
  ['quiz', 'Quiz'],
  ['calculator', 'Calculator'],
  ['questionBuilder', 'Question builder'],
  ['decisionTree', 'Decision tree'],
  ['picker', 'Picker'],
  ['scoreCard', 'Scorecard'],
  ['flipCards', 'Flip cards'],
  ['beforeAfter', 'Before and after'],
  ['poll', 'Poll'],
  ['checklist', 'Checklist'],
  ['slides', 'Slides'],
  ['timeline', 'Timeline'],
  ['reveal', 'Reveal'],
];

export function widgetChips(summary: PostSummary | undefined, max: number): string[] {
  if (!summary) return [];
  const have = new Set(summary.widgets);
  return WIDGET_LABELS.filter(([k]) => have.has(k))
    .slice(0, max)
    .map(([, label]) => label);
}

const NUMBER_WORDS: Record<string, string> = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  eleven: '11',
  twelve: '12',
  fifteen: '15',
  twenty: '20',
};

const MARK_STOP = new Set(['vox', 'pop', 'pops', 'street', 'interview', 'interviews', 'video', 'videos', 'india', 'indian', 'for', 'a', 'the', 'how', 'to', 'of', 'in', 'and']);

/**
 * The tile's oversized mark, pulled from the post: the number in its title ("120", "11"), else a short name it uses (UGC, MoFu, B2B), else its first
 * framework that is one short word (PACE, S.T.A.C.K.), else "?" for a question, else the topic word of its search query (BRIEF).
 */
export function markOf(meta: PostMeta, summary?: PostSummary): string {
  const words = meta.title.split(/[\s:,]+/).filter(Boolean);
  for (const w of words) {
    const digits = /^(\d{1,4})(?:-[a-z]+)?$/i.exec(w);
    if (digits) return digits[1] as string;
    const named = NUMBER_WORDS[w.toLowerCase()];
    if (named) return named;
  }
  const short = words.find((w) => /^[A-Za-z0-9]{2,5}$/.test(w) && /[A-Z].*[A-Z0-9]|[a-z][A-Z]/.test(w));
  if (short) return short;
  const fw = summary?.frameworks.map((f) => f.replace(/\./g, '')).find((f) => /^[A-Z]{3,6}$/.test(f));
  if (fw) return fw;
  if (meta.title.includes('?')) return '?';
  // The word the post is about: the last of its search query that is not the format's own name.
  const topic = meta.primaryQuery
    .split(/\s+/)
    .filter((w) => !MARK_STOP.has(w))
    .pop();
  if (topic && topic.length <= 8) return topic.toUpperCase();
  return '“';
}

// ---------- Tiles ----------

/** A title whose hyphenated words never break at the hyphen ("a 5-|phase playbook"). */
function Title({ text }: { text: string }) {
  const parts = text.split(/(\S*-\S*)/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="bb-nw">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** The art panel: the cluster's hue behind reeded glass, the mark seen through it, and (live) the post's library video standing in front. */
export function TileArt({ tone, mark, media }: { tone: Tone; mark: string; media?: ReactNode }) {
  return (
    <span className="bb-art" data-tone={tone} aria-hidden>
      <span className="bb-mark" data-len={Math.min(mark.length, 8)} data-mark={mark}>
        {mark}
      </span>
      <span className="bb-flutes" />
      {media}
    </span>
  );
}

export interface PostTileProps {
  meta: PostMeta;
  summary?: PostSummary;
  size: TileSize;
  spans?: SlotSpans;
  eyebrow?: string;
  heading?: 'h2' | 'h3';
  /** The live page's library video for this post (feature and wide tiles). */
  media?: ReactNode;
  id?: string;
}

/** A post as one link: the art, the cluster, the title, a line of description where there is room, the minutes and what is interactive inside. */
export function PostTile({ meta, summary, size, spans, eyebrow, heading = 'h3', media, id }: PostTileProps) {
  const H = heading;
  const tone = toneOf(meta.category);
  const titleId = `bt-${meta.slug}`;
  const big = size === 'feature' || size === 'wide' || size === 'lead';
  const chips = widgetChips(summary, big ? 3 : 2);
  return (
    <a
      href={`/blog/${meta.slug}`}
      id={id}
      className="plate plate-link bb-tile bb-post story"
      data-size={size}
      data-tone-key={tone}
      data-slug={meta.slug}
      data-media={media ? '' : undefined}
      aria-labelledby={titleId}
      {...spans}
    >
      <div className="bb-in">
        <TileArt tone={tone} mark={markOf(meta, summary)} media={media} />
        <div className="bb-body">
          <span className="eyebrow bb-cat">{eyebrow ?? meta.category}</span>
          <H id={titleId} className="bb-title">
            <Title text={meta.title} />
          </H>
          <p className="bb-desc">{meta.description}</p>
          <p className="bb-meta">
            <span className="bb-min">{meta.readingMinutes ? `${meta.readingMinutes} min read` : 'Read'}</span>
            {chips.length > 0 && (
              <span className="bb-chips">
                <span className="sr-only">. Interactive: </span>
                {chips.map((c) => (
                  <span key={c} className="bb-chip">
                    {c}
                  </span>
                ))}
              </span>
            )}
            <ArrowRight className="bb-go size-4" aria-hidden />
          </p>
        </div>
      </div>
    </a>
  );
}

/** Reading stats from the metas: never a claim about the business. */
export function StatsTile({
  metas,
  summaries,
  spans,
}: {
  metas: readonly PostMeta[];
  summaries: ReadonlyMap<string, PostSummary>;
  spans?: SlotSpans;
}) {
  const minutes = metas.reduce((n, m) => n + (m.readingMinutes || 0), 0);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const tools = metas.reduce((n, m) => n + (summaries.get(m.slug)?.widgets.length ? 1 : 0), 0);
  const clusters = new Set(metas.map((m) => m.category)).size;
  const byCluster = (Object.keys(CLUSTER_TONE) as BlogCategory[]).map((c) => ({ c, n: metas.filter((m) => m.category === c).length })).filter((x) => x.n);
  return (
    <div className="plate bb-tile bb-stats" {...spans}>
      <p className="bb-stats-big">
        <span className="bb-stats-n">{metas.length}</span>
        <span className="bb-stats-unit">guides</span>
      </p>
      <span className="bb-stats-bar" aria-hidden>
        {byCluster.map(({ c, n }) => (
          <span key={c} data-tone={toneOf(c)} style={{ flexGrow: n }} />
        ))}
      </span>
      <dl className="bb-stats-list">
        <div>
          <dt>Reading</dt>
          <dd>{hours ? `${hours} h ${rest} min` : `${minutes} min`}</dd>
        </div>
        <div>
          <dt>Clusters</dt>
          <dd>{clusters}</dd>
        </div>
        {tools > 0 && (
          <div>
            <dt>Hands-on</dt>
            <dd>{tools === metas.length ? 'Every guide' : `${tools} guides`}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

/** The soft ask: a trial video (never "free", nothing promised) and the library. */
export function CtaTile({ spans, heading = 'h2' }: { spans?: SlotSpans; heading?: 'h2' | 'h3' }) {
  const H = heading;
  return (
    <section className="plate bb-tile bb-cta" data-tone="ink" aria-labelledby="bb-cta-h" {...spans}>
      <span className="bb-cta-glow" aria-hidden />
      <div className="bb-cta-in">
        <div className="bb-cta-copy">
          <span className="eyebrow">{CLOSING.eyebrow}</span>
          <H id="bb-cta-h" className="bb-cta-title">
            Want to see a vox pop made with your product?
          </H>
          <p className="bb-cta-body">{CLOSING.body}</p>
        </div>
        <div className="bb-cta-actions">
          <PrimaryAction />
          <a href="/video-library" className="btn btn-ghost">
            {CLOSING.secondary}
            <ArrowRight className="btn-arrow size-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

/** The grid itself. */
export function Bento({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div className={`bb ${className ?? ''}`} role={label ? 'group' : undefined} aria-label={label}>
      {children}
    </div>
  );
}
