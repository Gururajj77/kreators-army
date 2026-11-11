import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ENTRIES } from '../../blog/registry';
import { BLOG_DESCRIPTION, IndexView, TOOLS_LINE, TOOLS_TITLE, filterPosts, isFiltering, tagList, type BlogFilter } from '../../blog/render/IndexView';
import { categorySlug } from '../../blog/render/PostView';
import { BLOG_CATEGORIES } from '../../blog/types';
import { ChipRail } from '../../components/tabs';
import { Seo } from '../../components/ui';
import '../../styles/blog.css';
import { useBlogLinks } from './blogLinks';
import { TileVideo, useHeroVideos } from './blogTileMedia';

// The blog index (blog/render/IndexView.tsx, the same markup the build prerenders) with search across titles and descriptions, the four clusters as
// filters and a topic (tag) filter, all kept in the address (?q=, ?category=, ?tag=) so a filtered list can be shared.

const ALL = 'all';

export default function Blog() {
  const box = useRef<HTMLDivElement>(null);
  useBlogLinks(box);
  const [params, setParams] = useSearchParams();
  const metas = useMemo(() => ENTRIES.map((e) => e.meta), []);
  const summaries = useMemo(() => new Map(ENTRIES.map((e) => [e.slug, e.summary])), []);
  const heroes = useHeroVideos();
  const tags = useMemo(() => tagList(metas), [metas]);

  // The filters live in this page's state, so typing and clicking never wait on the address (a route change lands a moment later); the address
  // follows them, replaced, never pushed. An address this page did not write (a link to /blog?category=… while the index is open) is read back in.
  const read = (p: URLSearchParams): BlogFilter => {
    const tag = p.get('tag');
    return {
      q: p.get('q') ?? '',
      category: BLOG_CATEGORIES.find((c) => categorySlug(c) === p.get('category')) ?? null,
      tag: tag && tags.includes(tag) ? tag : null,
    };
  };
  const [filter, setFilter] = useState<BlogFilter>(() => read(params));
  const search = params.toString();
  const written = useRef(new Set([search]));
  useEffect(() => {
    if (written.current.has(search)) return;
    written.current = new Set([search]);
    setFilter(read(new URLSearchParams(search)));
    // `read` depends only on the tag list, which is fixed for the page's life.
  }, [search]);
  const results = isFiltering(filter) ? filterPosts(metas, filter) : null;

  const update = (next: Partial<BlogFilter>) => {
    const f = { ...filter, ...next };
    setFilter(f);
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.category) p.set('category', categorySlug(f.category));
    if (f.tag) p.set('tag', f.tag);
    written.current.add(p.toString());
    setParams(p, { replace: true, preventScrollReset: true });
  };
  const clear = () => update({ q: '', category: null, tag: null });

  const tools = (
    <div className="bi-controls">
      <p className="bb-tools-title">{TOOLS_TITLE}</p>
      <p className="bb-tools-line">{TOOLS_LINE}</p>
      <div className="bi-row" role="search">
        <label className="bi-search">
          <Search className="size-4" aria-hidden />
          <span className="sr-only">Search the blog</span>
          <input
            type="search"
            className="field"
            value={filter.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search the blog"
            autoComplete="off"
          />
        </label>
        {tags.length > 0 && (
          <label className="bi-topic">
            <span className="sr-only">Topic</span>
            <select className="field" value={filter.tag ?? ''} onChange={(e) => update({ tag: e.target.value || null })}>
              <option value="">All topics</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <ChipRail
        mode="radio"
        label="Clusters"
        size="sm"
        wrap
        options={[
          { value: ALL, label: 'All', count: metas.length },
          ...BLOG_CATEGORIES.filter((c) => metas.some((m) => m.category === c)).map((c) => ({
            value: categorySlug(c),
            label: c,
            count: metas.filter((m) => m.category === c).length,
          })),
        ]}
        value={filter.category ? categorySlug(filter.category) : ALL}
        onChange={(v) =>
          update({
            category: BLOG_CATEGORIES.find((c) => categorySlug(c) === v) ?? null,
          })
        }
      />
      <p className="bi-count small" aria-live="polite">
        {results ? `${results.length} of ${metas.length} guides` : `${metas.length} guides`}
        {results && (
          <button type="button" className="bw-textbtn" onClick={clear}>
            <X className="size-4" aria-hidden />
            Clear
          </button>
        )}
      </p>
    </div>
  );

  return (
    <div ref={box}>
      <Seo title="Blog" description={BLOG_DESCRIPTION} canonical="/blog" />
      <IndexView
        metas={metas}
        summaries={summaries}
        tools={tools}
        media={(m) => <TileVideo video={heroes.find(m)} />}
        results={results}
        empty={
          <>
            <p className="bb-empty-title">No guides match that yet.</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
              Clear the search and filters
            </button>
          </>
        }
      />
    </div>
  );
}
