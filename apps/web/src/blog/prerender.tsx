// The blog's build-time render (FORMAT.md section 9, "static first"). The web build's blogPrerender plugin (apps/web/scripts/blogPrerender.ts) loads
// this module in Node through Vite's SSR loader after the client build, and writes what it returns into dist:
//
//   blog/<slug>.html   every post (drafts too, served noindex), the full article inside #root
//   blog.html          the index
//   blog/rss.xml, sitemap.xml, llms.txt
//
// The Worker's static assets serve /blog/<slug> from blog/<slug>.html and /blog from blog.html with a 200 (html_handling "auto-trailing-slash"),
// and /blog/ redirects to /blog. When the app's script runs, createRoot replaces #root; until the page's own chunk arrives the layout shows this same
// markup (site/Layout.tsx), so the words never blink out.
//
// A post that would make a broken page fails the build here, with every problem listed (./check.ts).

import { renderToStaticMarkup } from 'react-dom/server';
import { checkPost } from './check';
import { ALL_ENTRIES, ENTRIES, LIVE_SLUGS, REGISTRY_ERRORS, REGISTRY_WARNINGS, nextEntry, relatedEntries } from './registry';
import { BLOG_DESCRIPTION, BLOG_TITLE, IndexView, StaticTools } from './render/IndexView';
import { PostView } from './render/PostView';
import { SITE_ORIGIN, blogJsonLd, headTags, llmsTxt, postJsonLd, rssXml, sitemapXml } from './seo';
import type { Post } from './types';

export interface PrerenderInput {
  /** The built dist/index.html. */
  template: string;
  /** Stylesheets the blog's page chunks load (their CSS is not in the first download), linked so the static page is styled at once. */
  css: { index: string[]; post: string[] };
  /** Scripts worth fetching early: the page chunk and its imports, and each post's own chunk by slug. */
  preload: {
    index: string[];
    post: string[];
    bodies: Record<string, string[]>;
  };
}

export interface PrerenderOutput {
  /** Paths relative to dist. */
  files: { path: string; content: string }[];
  posts: number;
  /** Posts left out because they are still being written. */
  warnings: string[];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A function replacer throughout: page text may hold "$&" or "$1", which a string replacement would expand. */
function replaceOnce(html: string, re: RegExp, by: (...m: string[]) => string, what: string): string {
  if (!re.test(html)) throw new Error(`blog prerender: the built index.html has no ${what}; the template changed, so update src/blog/prerender.tsx`);
  return html.replace(re, by);
}

/** The built index.html with this page's title, description, head tags, early fetches and article. */
function page(
  template: string,
  p: {
    path: string;
    title: string;
    description: string;
    head: string;
    css: string[];
    preload: string[];
    body: string;
  },
): string {
  let html = template;
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, () => `<title>${esc(p.title)}</title>`, '<title>');
  html = replaceOnce(
    html,
    /(<meta name="description" content=")[^"]*(")/,
    (_, a = '', b = '') => `${a}${esc(p.description)}${b}`,
    'meta description',
  );
  // The site-wide Open Graph tags give way to the page's own (marked data-pre, in p.head).
  html = html.replace(/\s*<meta property="og:[^"]+" content="[^"]*"\s*\/?>/g, '');
  const links = [
    ...p.css.map((href) => `<link rel="stylesheet" crossorigin href="${esc(href)}">`),
    ...p.preload.map((href) => `<link rel="modulepreload" crossorigin href="${esc(href)}">`),
  ];
  html = replaceOnce(html, /<\/head>/, () => `  ${[p.head, ...links].join('\n    ')}\n  </head>`, '</head>');
  html = replaceOnce(
    html,
    /<div id="root"><\/div>/,
    () => `<div id="root"><main id="main" tabindex="-1" data-prerendered="${esc(p.path)}"><div>${p.body}</div></main></div>`,
    '<div id="root"></div>',
  );
  return html;
}

const uniq = (list: string[]) => [...new Set(list)];

export async function prerenderBlog(input: PrerenderInput): Promise<PrerenderOutput> {
  const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(input.template)?.[1];
  if (!ogImage) throw new Error('blog prerender: the built index.html has no og:image to use as the social image');
  const image = /^https?:/.test(ogImage) ? ogImage : `${SITE_ORIGIN}${ogImage}`;

  // Every post loads and passes the build's check, or nothing is written.
  const errors = [...REGISTRY_ERRORS];
  const posts = new Map<string, Post>();
  for (const e of ALL_ENTRIES) {
    try {
      const post = await e.load();
      if (!e.legacy) errors.push(...checkPost(post, e.slug));
      posts.set(e.slug, post);
    } catch (err) {
      errors.push(`${e.slug}: could not load (${(err as Error).message})`);
    }
  }
  if (errors.length) throw new Error(`blog prerender: ${errors.length} problem(s) would ship a broken page:\n  - ${errors.join('\n  - ')}`);

  const files: PrerenderOutput['files'] = [];
  const metas = ENTRIES.map((e) => e.meta);
  const summaries = new Map(ALL_ENTRIES.map((e) => [e.slug, e.summary]));

  for (const e of ALL_ENTRIES) {
    const post = posts.get(e.slug) as Post;
    const { meta } = post;
    const path = `/blog/${e.slug}`;
    const next = nextEntry(e.slug);
    const body = renderToStaticMarkup(
      <PostView
        post={post}
        mode="static"
        liveSlugs={LIVE_SLUGS}
        related={relatedEntries(meta, post.related).map((r) => r.meta)}
        summaries={summaries}
        next={next?.meta}
      />,
    );
    const head = headTags({
      path,
      title: meta.title,
      description: meta.description,
      type: 'article',
      image,
      jsonLd: postJsonLd(post, image),
      noindex: Boolean(meta.draft),
      article: {
        published: meta.datePublished || undefined,
        modified: meta.dateModified || undefined,
        section: meta.category,
        tags: meta.tags,
      },
    });
    files.push({
      path: `blog/${e.slug}.html`,
      content: page(input.template, {
        path,
        title: meta.metaTitle,
        description: meta.description,
        head,
        css: input.css.post,
        preload: uniq([...input.preload.post, ...(input.preload.bodies[e.slug] ?? [])]),
        body,
      }),
    });
  }

  const indexBody = renderToStaticMarkup(<IndexView metas={metas} summaries={summaries} tools={<StaticTools metas={metas} />} results={null} />);
  files.push({
    path: 'blog.html',
    content: page(input.template, {
      path: '/blog',
      title: `${BLOG_TITLE} | Kreators.Army`,
      description: BLOG_DESCRIPTION,
      head: headTags({
        path: '/blog',
        title: `${BLOG_TITLE} | Kreators.Army`,
        description: BLOG_DESCRIPTION,
        type: 'website',
        image,
        jsonLd: blogJsonLd(metas),
      }),
      css: input.css.index,
      preload: input.preload.index,
      body: indexBody,
    }),
  });

  files.push({ path: 'blog/rss.xml', content: rssXml(metas) });
  files.push({ path: 'sitemap.xml', content: sitemapXml(metas) });
  files.push({ path: 'llms.txt', content: llmsTxt(metas) });
  return { files, posts: ALL_ENTRIES.length, warnings: [...REGISTRY_WARNINGS] };
}
