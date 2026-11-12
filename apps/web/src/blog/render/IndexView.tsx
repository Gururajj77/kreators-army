// The blog index: the masthead, then one bento (./bento.tsx) of every guide with the search and filters woven in (the live page's own; the static
// HTML has a search form and the clusters as links to their hubs). With a search or a filter on, the search tile and the matches.

import { Fragment, type ReactNode } from 'react';
import { foldWords } from '../videoRef';
import { BLOG_CATEGORIES, type BlogCategory, type PostMeta, type PostSummary } from '../types';
import { Bento, PostTile, StatsTile, bentoLayout, type BentoSlot, type SlotSpans, type TileSize } from './bento';
import { categorySlug } from './PostView';

/** One line under each cluster's heading. */
export const CATEGORY_LINES: Record<BlogCategory, string> = {
  Understand: 'What vox pop is, why it holds attention, and where it fits next to other formats.',
  Plan: 'Strategy, briefs and the funnel: the work before anyone picks up a mic.',
  Shoot: 'Questions, interview technique and consent on the street.',
  'Edit and publish': 'Hooks, the edit, and where the finished videos go.',
};

export const BLOG_TITLE = 'Blog';
export const BLOG_DESCRIPTION =
  'Guides to vox pop and street interview videos for brands: strategy, questions, shooting, editing and where to post, from Kreators.Army.';
export const BLOG_LEAD = 'Notes on vox pop, street interviews and short-form video.';

export interface BlogFilter {
  q: string;
  category: BlogCategory | null;
  tag: string | null;
}

/** Every word of the search must appear in the title, description, tags or queries, ignoring case and accents. */
export function filterPosts(metas: readonly PostMeta[], f: BlogFilter): PostMeta[] {
  const words = foldWords(f.q);
  return metas.filter((m) => {
    if (f.category && m.category !== f.category) return false;
    if (f.tag && !m.tags.includes(f.tag)) return false;
    if (!words.length) return true;
    const hay = foldWords([m.title, m.description, m.primaryQuery, ...m.secondaryQueries, ...m.tags, m.category].join(' ')).join(' ');
    return words.every((w) => hay.includes(w));
  });
}

export const isFiltering = (f: BlogFilter) => Boolean(f.q.trim() || f.category || f.tag);

/** Tags by how many posts use them, then by name. */
export function tagList(metas: readonly PostMeta[]): string[] {
  const count = new Map<string, number>();
  for (const m of metas) for (const t of m.tags) count.set(t, (count.get(t) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
}

export interface IndexProps {
  metas: readonly PostMeta[];
  /** (bento10) Each post's widgets and framework names (registry), for the tiles' chips and marks. */
  summaries?: ReadonlyMap<string, PostSummary>;
  /** What goes inside the search tile: the live page's search and filters, or StaticTools. */
  tools: ReactNode;
  results: readonly PostMeta[] | null;
  empty?: ReactNode;
  /** The live page's library video for a feature or wide tile (the static page shows the art alone). */
  media?: (meta: PostMeta) => ReactNode;
}

const NONE: ReadonlyMap<string, PostSummary> = new Map();

/**
 * (bento10) One bento: the first cluster's hub as the 2x2 feature, the search and filters beside it, the other hubs as wide tiles spaced through the
 * first rows with the reading stats, then every other guide in cluster order, and the call to action filling the last row. With a search or a filter
 * on, the search tile and the matches. The same markup is the build's static /blog.
 */
export function IndexView({ metas, summaries = NONE, tools, results, empty, media }: IndexProps) {
  const hubs = BLOG_CATEGORIES.map((c) => metas.find((m) => m.category === c && m.hub)).filter((m): m is PostMeta => Boolean(m));
  const rest = metas.filter((m) => !hubs.includes(m));

  type Item = {
    key: string;
    slot: BentoSlot;
    draw: (spans: SlotSpans) => ReactNode;
  };
  const tile = (m: PostMeta, size: TileSize, opts: { flex?: boolean; hub?: boolean } = {}): Item => ({
    key: m.slug,
    slot: { size, role: opts.flex ? 'flex' : undefined },
    draw: (spans) => (
      <PostTile
        meta={m}
        summary={summaries.get(m.slug)}
        size={size}
        spans={spans}
        eyebrow={opts.hub ? `Start here \u00b7 ${m.category}` : undefined}
        id={opts.hub ? `cat-${categorySlug(m.category)}` : undefined}
        media={media && (size === 'feature' || size === 'wide') ? media(m) : undefined}
      />
    ),
  });
  const toolsTile: Item = {
    key: 'tools',
    slot: { size: 'tools' },
    draw: (spans) => (
      <div className="plate bb-tile bb-tools bi-tools" {...spans}>
        {tools}
      </div>
    ),
  };

  const items: Item[] = [];
  if (results) {
    items.push(toolsTile);
    if (results.length) {
      results.forEach((m, i) => items.push(tile(m, 'small', { flex: i === 0 })));
    } else {
      items.push({
        key: 'empty',
        slot: { size: 'small', role: 'fill' },
        draw: (spans) => (
          <div className="plate bb-tile bb-empty bi-empty" {...spans}>
            {empty}
          </div>
        ),
      });
    }
  } else {
    const [feature, ...wides] = hubs;
    if (feature) items.push(tile(feature, 'feature', { hub: true }));
    items.push(toolsTile);
    // The wide hubs, spaced so no two sit side by side: one beside the feature, one after the stats, one after three guides.
    const queue = [...rest];
    const take = (n: number) => queue.splice(0, n).forEach((m) => items.push(tile(m, 'small')));
    if (wides[0]) items.push(tile(wides[0], 'wide', { hub: true }));
    items.push({
      key: 'stats',
      slot: { size: 'small', role: 'flex' },
      draw: (spans) => <StatsTile metas={metas} summaries={summaries} spans={spans} />,
    });
    if (wides[1]) items.push(tile(wides[1], 'wide', { hub: true }));
    take(3);
    if (wides[2]) items.push(tile(wides[2], 'wide', { hub: true }));
    // The rest in cluster order, every sixth one wide (with its library video, live), so the lower rows keep a rhythm instead of a plain grid.
    queue.splice(0).forEach((m, i) => items.push(tile(m, i % 6 === 3 ? 'wide' : 'small')));
    // No closing CTA tile here: the footer's "Get started" band follows right below and says the same thing (founder, 2026-11-12).
    // With no fill tile, bentoLayout stretches the last tile over whatever its row has left, so the grid still ends flush.
  }
  const spans = bentoLayout(items.map((i) => i.slot));

  return (
    <div className="blog">
      <div className="ground" aria-hidden />
      <div className="wrap blog-in">
        <header className="blog-mast">
          <div className="blog-mast-title">
            <span className="eyebrow">Blog</span>
            <h1 className="display">
              Word from the <span className="g-word">street</span>
            </h1>
          </div>
          <p className="lead">{BLOG_LEAD}</p>
        </header>

        <section className="bi-section" aria-labelledby="bi-h">
          <h2 id="bi-h" className="sr-only">
            {results ? 'Matching guides' : 'Guides'}
          </h2>
          <Bento className="bi-grid">
            {items.map((it, i) => (
              <Fragment key={it.key}>{it.draw(spans[i] ?? {})}</Fragment>
            ))}
          </Bento>
        </section>
      </div>
    </div>
  );
}

/** The search tile's title. */
export const TOOLS_TITLE = 'Find a guide';
export const TOOLS_LINE = 'Search by question, format or step, or pick a cluster.';

/**
 * The static HTML's search tile, laid out as the live one: a search form (GET /blog?q=, which the app reads) and the clusters as links to their hubs.
 * The live page swaps in its own search and filters.
 */
export function StaticTools({ metas }: { metas: readonly PostMeta[] }) {
  const clusters = BLOG_CATEGORIES.filter((c) => metas.some((m) => m.category === c));
  return (
    <div className="bi-controls">
      <p className="bb-tools-title">{TOOLS_TITLE}</p>
      <p className="bb-tools-line">{TOOLS_LINE}</p>
      <form className="bi-row" action="/blog" method="get" role="search">
        <label className="bi-search">
          <svg viewBox="0 0 24 24" width="16" height="16" className="size-4" aria-hidden focusable="false">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Search the blog</span>
          <input type="search" name="q" className="field" placeholder="Search the blog" autoComplete="off" />
        </label>
      </form>
      <nav aria-label="Clusters">
        <div className="chip-rail" data-size="sm" data-wrap="">
          {clusters.map((c) => (
            <a key={c} className="chip-opt" href={`#cat-${categorySlug(c)}`}>
              <span className="chip-label">{c}</span>
              <span className="chip-count">{metas.filter((m) => m.category === c).length}</span>
            </a>
          ))}
        </div>
      </nav>
      <p className="bi-count small">{metas.length} guides</p>
    </div>
  );
}
