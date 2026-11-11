// What every block and widget of a post reads: whether this is the build's static render or the live page, the post's slug (for storage keys),
// its citation numbers and sources, the posts that have pages (for links), and the live page's own renderers for library videos and mechanism
// chips. This folder never imports the site's browser-only modules (components/ui, tabs, video, lib/store), so the build can render it in Node.

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { inlineCites } from '../inline';
import type { Post, Source, VideoBlock } from '../types';
import { widgetStorageKey } from '../types';

/** 'static': the build's prerender (every text shown, nothing interactive). 'live': the page in the browser. */
export type RenderMode = 'static' | 'live';

export interface BlogRender {
  mode: RenderMode;
  slug: string;
  /** Source id to its number, in order of first use. */
  cites: ReadonlyMap<string, number>;
  sources: ReadonlyMap<string, Source>;
  /** Slugs with a page: a link to any other /blog/<slug> renders as text. */
  liveSlugs: ReadonlySet<string>;
  /** The live page's library video (resolved against /api/videos, opening the site's player). The static render draws its own fallback. */
  video?: (block: VideoBlock) => ReactNode;
  /** The live page's mechanism chips (with their hover demos). */
  mechanisms?: (caption?: string) => ReactNode;
}

const Ctx = createContext<BlogRender>({ mode: 'static', slug: '', cites: new Map(), sources: new Map(), liveSlugs: new Set() });

export const BlogRenderProvider = Ctx.Provider;
export const useBlog = () => useContext(Ctx);
export const useLive = () => useContext(Ctx).mode === 'live';

/**
 * Every source cited, numbered in order of first use: the answer, the takeaways, the body (inline [^id] and block `source` fields, in reading order)
 * and the FAQ. Sources never cited are numbered after them, in their listed order.
 */
export function citeNumbers(post: Pick<Post, 'answer' | 'takeaways' | 'body' | 'faqs' | 'sources'>): Map<string, number> {
  const order: string[] = [];
  const add = (id: string) => {
    if (!order.includes(id)) order.push(id);
  };
  const walk = (v: unknown, key?: string): void => {
    if (typeof v === 'string') {
      if (key === 'source') add(v);
      else if (v.includes('[^')) for (const id of inlineCites(v)) add(id);
    } else if (Array.isArray(v)) for (const x of v) walk(x);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  walk(post.answer);
  walk(post.takeaways);
  walk(post.body);
  walk(post.faqs);
  const known = new Set(post.sources.map((s) => s.id));
  const out = new Map<string, number>();
  for (const id of order) if (known.has(id)) out.set(id, out.size + 1);
  for (const s of post.sources) if (!out.has(s.id)) out.set(s.id, out.size + 1);
  return out;
}

/** State kept in localStorage under ka:blog:<slug>:<widget id>, read once and written on change. Storage that throws is ignored. */
export function useStored<T>(widgetId: string, fallback: T, valid: (v: unknown) => v is T): [T, (next: T) => void] {
  const { slug, mode } = useBlog();
  const key = widgetStorageKey(slug, widgetId);
  const [value, setValue] = useState<T>(() => {
    if (mode !== 'live') return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (valid(parsed)) return parsed;
      }
    } catch {
      // Private windows and blocked storage: start fresh.
    }
    return fallback;
  });
  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Not saved; the page still works for this visit.
      }
    },
    [key],
  );
  return [value, set];
}

/** Moves only when the visitor has not asked for stillness (theme.js and the Pause control set data-still on <html>). */
export const motionAllowed = () => typeof document === 'undefined' || !('still' in document.documentElement.dataset);
