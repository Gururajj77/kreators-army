// The blog's registry: every post in ./posts, found by file name, so writers never edit an index (FORMAT.md section 2). The metas load with the blog's
// pages (small: the index, related posts and next post need them); each body is its own chunk, loaded when its page opens. A file whose name starts
// with "_" is left out. The five v1 slugs fall back to lib/content.ts (./legacy.ts) until their rewrites land as files (and are not drafts).
//
// Vite only (import.meta.glob): the page chunks and the build's prerender (./prerender.tsx) import this; the validator does not.

import { LEGACY_POSTS } from './legacy';
import { BLOG_CATEGORIES, type BlogCategory, type Post, type PostMeta, type PostSummary } from './types';

const metaFiles = import.meta.glob<PostMeta>(['./posts/*.meta.ts', '!./posts/_*'], { eager: true, import: 'default' });
const bodyFiles = import.meta.glob<Post>(['./posts/*.ts', '!./posts/*.meta.ts', '!./posts/_*'], { import: 'default' });
// (bento10) Each post's widgets and framework names, a few bytes each, made from the post file by scripts/blogSummary.ts (the bodies stay lazy).
const summaryFiles = import.meta.glob<PostSummary>(['./posts/*.ts', '!./posts/*.meta.ts', '!./posts/_*'], {
  query: '?summary',
  import: 'default',
  eager: true,
});
const NO_SUMMARY: PostSummary = { widgets: [], frameworks: [] };

export interface BlogEntry {
  slug: string;
  meta: PostMeta;
  /** A v1 post from lib/content.ts: no dates, answer, FAQ or sources yet. */
  legacy: boolean;
  /** The post body. The same promise every time, readable by React's use() without suspending once it has settled. */
  load: () => Promise<Post>;
  /** (bento10) Its widgets and framework names, for the index tiles. Empty for a v1 post. */
  summary: PostSummary;
}

/** Problems the build's prerender fails on (a meta.slug that is not the file name). The pages skip such files. */
export const REGISTRY_ERRORS: string[] = [];
/** A post still being written (a meta file without its post, or the reverse): left out, and the build says so, but it does not fail. */
export const REGISTRY_WARNINGS: string[] = [];

const slugOf = (file: string) => /\.\/posts\/([^/]+?)(\.meta)?\.ts$/.exec(file)?.[1] ?? '';

type Tracked<T> = Promise<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
};

/** One promise per slug, marked as React's use() reads a thenable, so a post opened before renders at once. A failed load is retried next time. */
function memo(load: () => Promise<Post>): () => Promise<Post> {
  let p: Tracked<Post> | null = null;
  return () => {
    if (p && p.status !== 'rejected') return p;
    const next: Tracked<Post> = load();
    next.status = 'pending';
    next.then(
      (value) => {
        next.status = 'fulfilled';
        next.value = value;
      },
      (reason: unknown) => {
        next.status = 'rejected';
        next.reason = reason;
      },
    );
    p = next;
    return next;
  };
}

function build(): BlogEntry[] {
  const out: BlogEntry[] = [];
  const bodies = new Map(Object.entries(bodyFiles).map(([file, load]) => [slugOf(file), load]));
  const summaries = new Map(Object.entries(summaryFiles).map(([file, summary]) => [slugOf(file.replace(/\?summary$/, '')), summary]));
  for (const [file, meta] of Object.entries(metaFiles)) {
    const slug = slugOf(file);
    const load = bodies.get(slug);
    if (!load) {
      REGISTRY_WARNINGS.push(`posts/${slug}.meta.ts has no post file yet (posts/${slug}.ts): not published`);
      continue;
    }
    if (!meta || meta.slug !== slug) {
      REGISTRY_ERRORS.push(`${file}: meta.slug "${meta?.slug}" must equal the file name "${slug}"`);
      continue;
    }
    out.push({
      slug,
      meta,
      legacy: false,
      load: memo(load),
      summary: summaries.get(slug) ?? NO_SUMMARY,
    });
  }
  for (const slug of bodies.keys())
    if (!out.some((e) => e.slug === slug) && !Object.keys(metaFiles).some((f) => slugOf(f) === slug))
      REGISTRY_WARNINGS.push(`posts/${slug}.ts has no meta file yet (posts/${slug}.meta.ts): not published`);
  // A v1 slug keeps its live page until its rewrite is published: a rewrite still marked draft does not take the address (or de-index it).
  for (const post of LEGACY_POSTS) {
    const i = out.findIndex((e) => e.slug === post.meta.slug);
    if (i >= 0 && !out[i]?.meta.draft) continue;
    if (i >= 0) out.splice(i, 1);
    out.push({
      slug: post.meta.slug,
      meta: post.meta,
      legacy: true,
      load: memo(() => Promise.resolve(post)),
      summary: NO_SUMMARY,
    });
  }
  return out.sort(compareEntries);
}

const categoryRank = (c: BlogCategory) => {
  const i = BLOG_CATEGORIES.indexOf(c);
  return i < 0 ? BLOG_CATEGORIES.length : i;
};

/** Cluster order (PLAN.md), the hub first, then newest first (v1 posts, undated, after the dated ones), then by title. */
export function compareEntries(a: BlogEntry, b: BlogEntry): number {
  return (
    categoryRank(a.meta.category) - categoryRank(b.meta.category) ||
    Number(Boolean(b.meta.hub)) - Number(Boolean(a.meta.hub)) ||
    (b.meta.datePublished || '0').localeCompare(a.meta.datePublished || '0') ||
    a.meta.title.localeCompare(b.meta.title)
  );
}

/** Every post, drafts included (a draft still has its page, served noindex). */
export const ALL_ENTRIES: readonly BlogEntry[] = build();

/** What the index, related posts, next post, the sitemap, RSS and llms.txt list: no drafts. */
export const ENTRIES: readonly BlogEntry[] = ALL_ENTRIES.filter((e) => !e.meta.draft);

export const entryBySlug = (slug: string): BlogEntry | undefined => ALL_ENTRIES.find((e) => e.slug === slug);

/** Slugs a link may point at: a post that has a page. A planned post without one yet renders its link as plain text. */
export const LIVE_SLUGS: ReadonlySet<string> = new Set(ALL_ENTRIES.map((e) => e.slug));

/**
 * Up to `n` posts to read next: the post's own `related` (those that exist), then its cluster, then the rest, never itself or a draft. The cluster's
 * hub comes first among the fill.
 */
export function relatedEntries(meta: PostMeta, related: readonly string[], n = 3): BlogEntry[] {
  const out: BlogEntry[] = [];
  const add = (e: BlogEntry | undefined) => {
    if (e && e.slug !== meta.slug && !e.meta.draft && !out.includes(e) && out.length < n) out.push(e);
  };
  for (const slug of related) add(entryBySlug(slug));
  for (const e of ENTRIES) if (e.meta.category === meta.category) add(e);
  for (const e of ENTRIES) add(e);
  return out;
}

/** The post after this one in index order, wrapping round; undefined when it is the only one. */
export function nextEntry(slug: string): BlogEntry | undefined {
  const i = ENTRIES.findIndex((e) => e.slug === slug);
  if (ENTRIES.length < 2) return undefined;
  const next = ENTRIES[(i + 1) % ENTRIES.length];
  return next && next.slug !== slug ? next : undefined;
}
