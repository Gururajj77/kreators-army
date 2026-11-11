import { useEffect, type RefObject } from 'react';
import { useNavigate } from 'react-router';
import { entryBySlug } from '../../blog/registry';

// The blog draws plain <a href> links (blog/render, so the build can render them in Node). On the live page a click on an internal link becomes a
// route change, as a <Link> would, and pointing at or focusing a post card starts loading that post.

const FILE = /\.[a-z0-9]+$/i;

export function useBlogLinks(ref: RefObject<HTMLElement | null>) {
  const navigate = useNavigate();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || !el.contains(a) || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') ?? '';
      if (!href.startsWith('/') || href.startsWith('//')) return;
      const path = href.split(/[?#]/)[0] ?? '';
      // Files (the feed, a sitemap) and the admin are the browser's to open.
      if (FILE.test(path) || path.startsWith('/admin')) return;
      e.preventDefault();
      navigate(href);
    };
    const warm = (e: Event) => {
      const card = (e.target as Element | null)?.closest?.('[data-slug]');
      const slug = card?.getAttribute('data-slug');
      if (slug) void entryBySlug(slug)?.load().catch(() => undefined);
    };
    el.addEventListener('click', onClick);
    el.addEventListener('pointerover', warm, { passive: true });
    el.addEventListener('focusin', warm);
    return () => {
      el.removeEventListener('click', onClick);
      el.removeEventListener('pointerover', warm);
      el.removeEventListener('focusin', warm);
    };
  }, [navigate, ref]);
}
