// The internal routes a post may link to (from App.tsx), for the validator's link check and for the renderer. Keep in step with App.tsx.

import { FAQS } from '../lib/content';

/** Every public page (App.tsx). /admin is never linked. */
export const STATIC_ROUTES = [
  '/',
  '/video-library',
  '/how-we-work',
  '/trial',
  '/pricing',
  '/why-kreators',
  '/why-voxpop',
  '/testimonials',
  '/founders',
  '/events',
  '/retail',
  '/numbers',
  '/blog',
  '/careers',
  '/contact',
  '/contact-us',
  '/faq',
  '/legal/privacy',
  '/legal/terms',
] as const;

/** /faq/:slug answers (lib/content.ts FAQS). */
export const FAQ_SLUGS: readonly string[] = FAQS.map((f) => f.slug);

/** The five posts already live (lib/content.ts POSTS). Their URLs stay valid when they move to this format. */
export const LEGACY_BLOG_SLUGS = ['what-is-vox-pop-content', 'how-a-vox-pop-shoot-works', 'where-to-post-vox-pop-videos', 'what-goes-in-a-vox-pop-brief', 'eleven-ways-to-vary-a-vox-pop-batch'] as const;

/** The section ids each page is known to have, for #hash links. An unknown hash is a warning, not a failure. */
export const ROUTE_ANCHORS: Readonly<Record<string, readonly string[]>> = {
  '/': ['work', 'services', 'how-it-works', 'interaction', 'about', 'features', 'pricing', 'faq'],
  '/how-we-work': ['the-idea', 'before-the-shoot', 'on-the-street', 'in-the-edit', 'variety', 'results'],
  '/trial': ['trial-content', 'trial-sample', 'brief', 'after'],
  '/pricing': ['payment'],
  '/why-voxpop': ['vp-stop'],
  '/events': ['before-the-doors', 'on-the-floor', 'the-recap'],
};

/** Query keys a page reads, for ?query links. */
export const ROUTE_QUERIES: Readonly<Record<string, readonly string[]>> = {
  '/video-library': ['q', 'v', 'sort', 'seed'],
  // (blogcore10) The blog index's search and filters (site/pages/Blog.tsx); category takes a cluster's slug: understand, plan, shoot, edit-and-publish.
  '/blog': ['q', 'category', 'tag'],
  '/contact': ['package', 'videos', 'brands', 'topic', 'format', 'plan', 'service'],
  '/contact-us': ['package', 'videos', 'brands', 'topic', 'format', 'plan', 'service'],
};

export type LinkVerdict = { ok: true; warning?: string } | { ok: false; error: string };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Whether an internal href ('/trial#after', '/blog/some-slug', '/faq/is-the-trial-free') points at a real page. `blogSlugs` is every post that
 * exists or is planned.
 */
export function checkInternalHref(href: string, blogSlugs: ReadonlySet<string>): LinkVerdict {
  const m = /^(\/[^?#]*)(\?[^#]*)?(#.*)?$/.exec(href);
  if (!m) return { ok: false, error: `not an internal path: ${href}` };
  const path = m[1] as string;
  const hash = m[3]?.slice(1);
  if (path.startsWith('/admin')) return { ok: false, error: 'never link the admin' };
  // A regex, not the plain string: copy-lint fails on the media path written out anywhere in src but lib/content.ts.
  if (/^\/media\//.test(path)) return { ok: false, error: 'never link a media file from a post (use a video block)' };
  if (path !== '/' && path.endsWith('/')) return { ok: false, error: `drop the trailing slash: ${href}` };

  if ((STATIC_ROUTES as readonly string[]).includes(path)) {
    const query = m[2] ? [...new URLSearchParams(m[2]).keys()] : [];
    const unknown = query.filter((k) => !(ROUTE_QUERIES[path] ?? []).includes(k));
    if (unknown.length) return { ok: false, error: `${path} does not read ?${unknown.join(', ?')}` };
    if (path === '/contact-us') return { ok: true, warning: 'use /contact (the canonical address) instead of /contact-us' };
    if (hash && !(ROUTE_ANCHORS[path] ?? []).includes(hash)) return { ok: true, warning: `#${hash} is not a known section of ${path}` };
    return { ok: true };
  }
  const blog = /^\/blog\/(.+)$/.exec(path);
  if (blog) {
    const slug = blog[1] as string;
    if (!SLUG.test(slug)) return { ok: false, error: `bad blog slug: ${slug}` };
    return blogSlugs.has(slug) ? { ok: true } : { ok: false, error: `no post or planned post with slug "${slug}"` };
  }
  const faq = /^\/faq\/(.+)$/.exec(path);
  if (faq) return FAQ_SLUGS.includes(faq[1] as string) ? { ok: true } : { ok: false, error: `no FAQ answer with slug "${faq[1]}"` };
  return { ok: false, error: `no such page: ${path}` };
}
