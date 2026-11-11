// A post page (FORMAT.md section 9): H1, the short answer, the byline, the takeaways, "In this guide" (a sticky rail with the section you are in on
// wide screens, a collapsible list on phones), the body, the FAQ, the sources, the primary action, the author, related posts and the next post.
// The same component draws the build's static HTML and the live page, so the swap between them does not move anything.

import { ArrowRight, ChevronDown } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { CLOSING, SITE } from '../../lib/content';
import { postWords, readingMinutes } from '../measure';
import type { Post, PostMeta, PostSummary, VideoBlock } from '../types';
import { BLOG_CATEGORIES } from '../types';
import { Bento, PostTile, bentoLayout, toneOf, type BentoSlot } from './bento';
import { Blocks, PrimaryAction } from './blocks';
import { BlogRenderProvider, citeNumbers, type BlogRender, type RenderMode } from './context';
import { GradientTail, PostCover } from './covers';
import { Inline, longDate } from './Inline';

export const ENTITY_LINE = 'Kreators.Army is a Bengaluru studio that makes vox pop street-interview videos for D2C brands.';

export const categorySlug = (c: string) =>
  c
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export interface TocItem {
  id: string;
  label: string;
}

/** The jump list: every h2 (its `toc` label when set), then the FAQ and the sources. */
export function tocItems(post: Post): TocItem[] {
  const items: TocItem[] = [];
  for (const b of post.body) if (typeof b !== 'string' && b.type === 'h2') items.push({ id: b.id, label: b.toc ?? b.text });
  if (post.faqs.length) items.push({ id: 'faq', label: 'Questions' });
  if (post.sources.length) items.push({ id: 'sources', label: 'Sources' });
  return items;
}

/** The minutes the byline shows: the post's own figure, else counted (the v1 posts have none). */
export const minutesOf = (post: Post) => post.meta.readingMinutes || readingMinutes(postWords(post).total);

const authorName = (m: PostMeta) => m.author.name;

function Toc({ items, active, variant }: { items: TocItem[]; active?: string | null; variant: 'rail' | 'inline' }) {
  const list = (
    <ol className="post-toc-list">
      {items.map((it) => (
        <li key={it.id}>
          <a href={`#${it.id}`} aria-current={active === it.id ? 'location' : undefined}>
            {it.label}
          </a>
        </li>
      ))}
    </ol>
  );
  if (variant === 'rail')
    return (
      <nav className="post-toc" aria-label="In this guide">
        <p className="post-toc-title">In this guide</p>
        {list}
      </nav>
    );
  return (
    <details className="post-toc-inline">
      <summary>
        <span>In this guide</span>
        <span className="post-toc-count">{items.length} sections</span>
        <ChevronDown className="size-4" aria-hidden />
      </summary>
      <nav aria-label="In this guide">{list}</nav>
    </details>
  );
}

/** A post as a card: the index, related posts. */
export function PostCard({ meta, heading = 'h3', lead, eyebrow }: { meta: PostMeta; heading?: 'h2' | 'h3'; lead?: boolean; eyebrow?: string }) {
  const H = heading;
  return (
    <a href={`/blog/${meta.slug}`} className={`plate plate-link story h-full ${lead ? 'story-lead' : ''}`} data-slug={meta.slug}>
      <PostCover slug={meta.slug} category={meta.category} className="story-cover" />
      <div className="story-body">
        <span className="eyebrow">{eyebrow ?? meta.category}</span>
        <H className={lead ? 'h2-sm' : 'h4 story-title'}>{meta.title}</H>
        <p className={lead ? 'lead' : 'story-summary'}>{meta.description}</p>
        <p className="story-meta small plate-foot">
          <span>{meta.readingMinutes ? `${meta.readingMinutes} min read` : 'Read'}</span>
          <span className="story-go">
            Read
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </p>
      </div>
    </a>
  );
}

export interface PostViewProps {
  post: Post;
  mode: RenderMode;
  /** Slugs with a page (links to others render as text). */
  liveSlugs: ReadonlySet<string>;
  related: readonly PostMeta[];
  /** (bento10) The related posts' widgets and framework names, for their tiles. */
  summaries?: ReadonlyMap<string, PostSummary>;
  /** (bento10) The live page's library video for the wide related tile. */
  tileMedia?: (meta: PostMeta) => ReactNode;
  next?: PostMeta;
  /** The live page's scrollspy: the id of the section being read. */
  active?: string | null;
  video?: (block: VideoBlock) => ReactNode;
  mechanisms?: (caption?: string) => ReactNode;
  articleRef?: Ref<HTMLElement>;
}

export function PostView({ post, mode, liveSlugs, related, summaries, tileMedia, next, active, video, mechanisms, articleRef }: PostViewProps) {
  const { meta } = post;
  const ctx: BlogRender = {
    mode,
    slug: meta.slug,
    cites: citeNumbers(post),
    sources: new Map(post.sources.map((s) => [s.id, s])),
    liveSlugs,
    video,
    mechanisms,
  };
  const toc = tocItems(post);
  const sources = [...post.sources].sort((a, b) => (ctx.cites.get(a.id) ?? 0) - (ctx.cites.get(b.id) ?? 0));
  const hero: VideoBlock | null = meta.hero ? { type: 'video', ...meta.hero } : null;
  const known = (BLOG_CATEGORIES as readonly string[]).includes(meta.category);
  const relatedSpans = bentoLayout(
    related.map((_, i): BentoSlot => ({
      size: i === 0 && related.length > 2 ? 'lead' : 'small',
    })),
  );

  return (
    <BlogRenderProvider value={ctx}>
      <article ref={articleRef} className="post" aria-labelledby="post-title" data-category={categorySlug(meta.category)}>
        <header className="post-head">
          <nav className="post-crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <a href="/blog">Blog</a>
              </li>
              {known && (
                <li>
                  <a href={`/blog?category=${categorySlug(meta.category)}`}>{meta.category}</a>
                </li>
              )}
            </ol>
          </nav>
          <h1 id="post-title" className="post-title h2-sm">
            <GradientTail text={meta.title} />
          </h1>
          {post.answer && (
            <div className="post-answer" id="answer">
              <p className="post-answer-label">Short answer</p>
              <p className="post-answer-text">
                <Inline text={post.answer} />
              </p>
            </div>
          )}
          <p className="post-byline small">
            <span>
              By <a href="#author">{authorName(meta)}</a>
            </span>
            {meta.datePublished && (
              <span>
                Published <time dateTime={meta.datePublished}>{longDate(meta.datePublished)}</time>
              </span>
            )}
            {meta.dateModified && (
              <span>
                Last updated <time dateTime={meta.dateModified}>{longDate(meta.dateModified)}</time>
              </span>
            )}
            <span>{minutesOf(post)} min read</span>
          </p>
        </header>

        <div className="post-layout" data-toc={toc.length ? '' : undefined}>
          {toc.length > 0 && (
            <aside className="post-rail">
              <Toc items={toc} active={active} variant="rail" />
            </aside>
          )}
          <div className="post-main">
            {post.takeaways.length > 0 && (
              <section className="post-takeaways" id="takeaways" aria-labelledby="takeaways-h">
                <h2 id="takeaways-h" className="post-label">
                  In brief
                </h2>
                <ul data-count={post.takeaways.length} data-odd={post.takeaways.length % 2 ? '' : undefined}>
                  {post.takeaways.map((t, i) => (
                    <li key={i}>
                      <span className="post-takeaway-n" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="post-takeaway-t">
                        <Inline text={t} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {toc.length > 1 && <Toc items={toc} active={active} variant="inline" />}
            {hero && <div className="post-hero">{video ? video(hero) : <Blocks blocks={[hero]} />}</div>}

            <div className="post-body read-prose">
              <Blocks blocks={post.body} />
            </div>

            {post.faqs.length > 0 && (
              <section className="post-faq" id="faq" aria-labelledby="faq-h">
                <h2 id="faq-h" className="bp-h2">
                  Frequently asked questions
                </h2>
                <div className="post-faq-list">
                  {post.faqs.map((f, i) => (
                    <details key={i} className="post-faq-item" id={`faq-${i + 1}`}>
                      <summary>
                        <h3 className="post-faq-q">{f.q}</h3>
                        <ChevronDown className="post-faq-chev size-5" aria-hidden />
                      </summary>
                      <div className="post-faq-a">
                        <p>
                          <Inline text={f.a} />
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {sources.length > 0 && (
              <section className="post-sources" id="sources" aria-labelledby="sources-h">
                <h2 id="sources-h" className="bp-h2">
                  Sources
                </h2>
                <ol>
                  {sources.map((s) => {
                    const external = /^https?:\/\//.test(s.url);
                    return (
                      <li key={s.id} id={`source-${s.id}`}>
                        <a href={s.url} {...(external ? { target: '_blank', rel: 'noopener' } : {})}>
                          {s.title}
                          {external && <span className="sr-only"> (opens in a new tab)</span>}
                        </a>
                        <span className="post-source-by">
                          , {s.publisher}
                          {s.date ? `, ${longDate(s.date)}` : ''}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            <section className="post-end" aria-labelledby="post-end-h">
              <div className="plate post-end-ask" data-tone="ink">
                <span className="bb-cta-glow" aria-hidden />
                <h2 id="post-end-h" className="post-end-title">
                  Want to see a vox pop made with your product?
                </h2>
                <p>{CLOSING.body}</p>
                <div className="post-end-actions">
                  <PrimaryAction />
                </div>
              </div>
              <a href="/video-library" className="plate plate-link post-end-lib">
                <span className="bb-art" data-tone={toneOf(meta.category)} aria-hidden>
                  <svg className="post-end-play" viewBox="0 0 48 48" focusable="false">
                    <circle cx="24" cy="24" r="23" fill="currentColor" opacity=".94" />
                    <path d="M20 16.5v15l12-7.5z" fill="var(--play-ink, #0e0e10)" />
                  </svg>
                  <span className="bb-flutes" />
                </span>
                <span className="post-end-lib-body">
                  <span className="post-end-lib-title">{CLOSING.secondary}</span>
                  <span className="post-end-lib-line">Finished vox pops, by brand.</span>
                </span>
                <ArrowRight className="bb-go size-5" aria-hidden />
              </a>
            </section>

            <aside className="post-author" id="author" aria-label="About the author">
              {meta.author.kind === 'person' ? (
                <div>
                  <p className="post-author-name">
                    {meta.author.url ? (
                      <a href={meta.author.url} {...(/^https?:/.test(meta.author.url) ? { target: '_blank', rel: 'noopener' } : {})}>
                        {meta.author.name}
                      </a>
                    ) : (
                      meta.author.name
                    )}
                    <span className="post-author-role">, {meta.author.role}</span>
                  </p>
                  <p>{meta.author.bio}</p>
                  <p className="post-author-org">
                    {ENTITY_LINE} {SITE.operatorLine}
                  </p>
                </div>
              ) : (
                <>
                  <img src="/icon-192.png" alt="" width={48} height={48} loading="lazy" decoding="async" />
                  <div>
                    <p className="post-author-name">Written by Kreators.Army</p>
                    <p>
                      {ENTITY_LINE} {SITE.operatorLine} <a href="/how-we-work">How we work</a>
                    </p>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <nav className="post-related" aria-labelledby="related-h">
          <h2 id="related-h" className="h3">
            Read next
          </h2>
          <Bento className="post-related-grid">
            {related.map((m, i) => {
              const size = i === 0 && related.length > 2 ? 'lead' : 'small';
              return (
                <PostTile
                  key={m.slug}
                  meta={m}
                  summary={summaries?.get(m.slug)}
                  size={size}
                  spans={relatedSpans[i]}
                  media={size === 'lead' && tileMedia ? tileMedia(m) : undefined}
                />
              );
            })}
          </Bento>
        </nav>
      )}

      {next && (
        <nav className="read-next" aria-label="Next post">
          <a href={`/blog/${next.slug}`} className="plate plate-link next-tile" data-slug={next.slug}>
            <PostCover slug={next.slug} category={next.category} className="next-cover" />
            <div className="next-body">
              <span className="eyebrow">Next post</span>
              <h2 className="h4">{next.title}</h2>
              <p className="m-0 small text-muted">{next.description}</p>
            </div>
            <ArrowRight className="next-arrow size-5" aria-hidden />
          </a>
        </nav>
      )}
    </BlogRenderProvider>
  );
}
