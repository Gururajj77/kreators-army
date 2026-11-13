// What search engines and answer engines read from the blog without running JavaScript: each page's <head> (title, description, canonical, Open
// Graph, Twitter, article dates), its JSON-LD data blocks (BlogPosting, BreadcrumbList, FAQPage, HowTo, DefinedTermSet; Blog on the index), and the
// site-wide sitemap.xml, /blog/rss.xml and /llms.txt. Pure functions: the build's prerender (./prerender.tsx) calls them in Node.
//
// JSON-LD goes in <script type="application/ld+json"> data blocks, which the CSP does not treat as script. Every tag the prerender adds to <head>
// carries data-pre="<path>", so the live app's Seo (components/ui.tsx) can tell them apart and drop them when the visitor moves to another page.

import { ADD_ON, CLOSING, FAQS, PACKAGES, PRIMARY_ACTION, RESULTS_NOTE, SITE, SOCIALS } from '../lib/content';
import { plainInline } from './inline';
import { postWords } from './measure';
import { STATIC_ROUTES } from './routes';
import type { Post, PostMeta, StepsBlock } from './types';
import { BLOG_DESCRIPTION } from './render/IndexView';
import { ENTITY_LINE, minutesOf } from './render/PostView';

export const SITE_ORIGIN = 'https://kreators.army';
const ORG_ID = `${SITE_ORIGIN}/#organization`;
const BLOG_ID = `${SITE_ORIGIN}/blog#blog`;
export const BLOG_NAME = 'Kreators.Army blog';

export const postUrl = (slug: string) => `${SITE_ORIGIN}/blog/${slug}`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** JSON for a <script> data block: "<" escaped, so no string can close the element. */
const json = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

/** The publisher, as every page names it. */
export function organization() {
  const instagram = SOCIALS.find((s) => s.label === 'Instagram')?.url;
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: `${SITE_ORIGIN}/`,
    logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/icon-512.png`, width: 512, height: 512 },
    description: ENTITY_LINE,
    email: SITE.email,
    address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', addressCountry: 'IN' },
    parentOrganization: { '@type': 'Organization', name: SITE.owner.name, url: SITE.owner.url },
    ...(instagram ? { sameAs: [instagram] } : {}),
  };
}

function author(meta: PostMeta) {
  if (meta.author.kind === 'person')
    return { '@type': 'Person', name: meta.author.name, jobTitle: meta.author.role, description: meta.author.bio, ...(meta.author.url ? { url: meta.author.url } : {}), worksFor: { '@id': ORG_ID } };
  return { '@type': 'Organization', '@id': ORG_ID, name: SITE.name, url: `${SITE_ORIGIN}/` };
}

const absolute = (url: string) => (/^https?:\/\//.test(url) ? url : `${SITE_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`);

function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

/** The JSON-LD graph for one post. `image` is the absolute social image. */
export function postJsonLd(post: Post, image: string): object {
  const { meta } = post;
  const url = postUrl(meta.slug);
  const words = postWords(post).total;
  const keywords = [...new Set([meta.primaryQuery, ...meta.secondaryQueries, ...meta.tags].filter(Boolean))];
  const graph: object[] = [
    organization(),
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: meta.title,
      description: meta.description,
      ...(post.answer ? { abstract: plainInline(post.answer) } : {}),
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      ...(meta.datePublished ? { datePublished: meta.datePublished } : {}),
      ...(meta.dateModified ? { dateModified: meta.dateModified } : {}),
      author: author(meta),
      publisher: { '@id': ORG_ID },
      image: { '@type': 'ImageObject', url: image },
      inLanguage: 'en-IN',
      articleSection: meta.category,
      ...(keywords.length ? { keywords: keywords.join(', ') } : {}),
      wordCount: words,
      timeRequired: `PT${minutesOf(post)}M`,
      isPartOf: { '@type': 'Blog', '@id': BLOG_ID, name: BLOG_NAME },
      ...(post.sources.length
        ? {
            citation: post.sources.map((s) => ({
              '@type': 'CreativeWork',
              name: s.title,
              url: absolute(s.url),
              publisher: { '@type': 'Organization', name: s.publisher },
              ...(s.date ? { datePublished: s.date } : {}),
            })),
          }
        : {}),
    },
    breadcrumbs([
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Blog', url: `${SITE_ORIGIN}/blog` },
      { name: meta.title, url },
    ]),
  ];

  if (post.faqs.length)
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: post.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plainInline(f.a) } })),
    });

  const howTo = post.body.find((b): b is StepsBlock => typeof b !== 'string' && b.type === 'steps' && Boolean(b.howTo));
  if (howTo)
    graph.push({
      '@type': 'HowTo',
      '@id': `${url}#${howTo.id}`,
      name: howTo.title,
      ...(howTo.intro ? { description: plainInline(howTo.intro) } : {}),
      ...(howTo.totalTime ? { totalTime: howTo.totalTime } : {}),
      ...(howTo.supplies?.length ? { supply: howTo.supplies.map((s) => ({ '@type': 'HowToSupply', name: s })) } : {}),
      step: howTo.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: plainInline(s.text), url: `${url}#${howTo.id}` })),
    });

  const terms = post.body.flatMap((b) => (typeof b !== 'string' && b.type === 'definition' ? [b] : []));
  if (terms.length)
    graph.push({
      '@type': 'DefinedTermSet',
      '@id': `${url}#terms`,
      name: `Terms in "${meta.title}"`,
      hasDefinedTerm: terms.map((t) => ({
        '@type': 'DefinedTerm',
        name: t.term,
        description: plainInline(t.text),
        ...(t.id ? { url: `${url}#${t.id}` } : {}),
        inDefinedTermSet: `${url}#terms`,
      })),
    });

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** The index's graph: the Blog with its posts, and the breadcrumb. */
export function blogJsonLd(metas: readonly PostMeta[]): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(),
      {
        '@type': 'Blog',
        '@id': BLOG_ID,
        name: BLOG_NAME,
        description: BLOG_DESCRIPTION,
        url: `${SITE_ORIGIN}/blog`,
        inLanguage: 'en-IN',
        publisher: { '@id': ORG_ID },
        blogPost: metas.map((m) => ({
          '@type': 'BlogPosting',
          headline: m.title,
          description: m.description,
          url: postUrl(m.slug),
          ...(m.datePublished ? { datePublished: m.datePublished } : {}),
          ...(m.dateModified ? { dateModified: m.dateModified } : {}),
          articleSection: m.category,
        })),
      },
      breadcrumbs([
        { name: 'Home', url: `${SITE_ORIGIN}/` },
        { name: 'Blog', url: `${SITE_ORIGIN}/blog` },
      ]),
    ],
  };
}

export interface HeadInput {
  /** The page's path, '/blog' or '/blog/<slug>'. */
  path: string;
  title: string;
  description: string;
  type: 'website' | 'article';
  image: string;
  jsonLd: object;
  noindex?: boolean;
  article?: { published?: string; modified?: string; section: string; tags: string[] };
}

/** The tags the prerender puts in <head>, each marked data-pre="<path>". */
export function headTags(h: HeadInput): string {
  const pre = `data-pre="${esc(h.path)}"`;
  const url = `${SITE_ORIGIN}${h.path}`;
  const meta = (attr: 'name' | 'property', key: string, content: string) => `<meta ${attr}="${key}" content="${esc(content)}" ${pre} />`;
  const tags = [
    `<link rel="canonical" href="${esc(url)}" ${pre} />`,
    h.noindex ? `<meta name="robots" content="noindex,nofollow" ${pre} />` : '',
    meta('property', 'og:type', h.type),
    meta('property', 'og:site_name', SITE.name),
    meta('property', 'og:locale', 'en_IN'),
    meta('property', 'og:title', h.title),
    meta('property', 'og:description', h.description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', h.image),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', h.title),
    meta('name', 'twitter:description', h.description),
    meta('name', 'twitter:image', h.image),
    h.article?.published ? meta('property', 'article:published_time', h.article.published) : '',
    h.article?.modified ? meta('property', 'article:modified_time', h.article.modified) : '',
    h.article ? meta('property', 'article:section', h.article.section) : '',
    ...(h.article?.tags ?? []).map((t) => meta('property', 'article:tag', t)),
    `<link rel="alternate" type="application/rss+xml" title="${esc(BLOG_NAME)}" href="/blog/rss.xml" ${pre} />`,
    `<script type="application/ld+json" ${pre}>${json(h.jsonLd)}</script>`,
  ];
  return tags.filter(Boolean).join('\n    ');
}

// ---------- sitemap.xml ----------

/** The public pages (App.tsx), without /contact-us (an alias of /contact), plus every FAQ answer and every published post. */
export function sitemapXml(metas: readonly PostMeta[]): string {
  const latest = metas.map((m) => m.dateModified).filter(Boolean).sort().pop();
  const urls: { loc: string; lastmod?: string }[] = [
    ...STATIC_ROUTES.filter((r) => r !== '/contact-us').map((r) => ({ loc: `${SITE_ORIGIN}${r === '/' ? '/' : r}`, lastmod: r === '/blog' ? latest : undefined })),
    ...FAQS.map((f) => ({ loc: `${SITE_ORIGIN}/faq/${f.slug}` })),
    ...metas.map((m) => ({ loc: postUrl(m.slug), lastmod: m.dateModified || undefined })),
  ];
  const body = urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// ---------- RSS ----------

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-11-11' as an RFC 822 date at midnight in Bengaluru. */
function rfc822(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const day = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  return `${DAYS[day]}, ${String(d).padStart(2, '0')} ${MON[mo - 1]} ${y} 00:00:00 +0530`;
}

/** The feed, newest first. Dates come from the posts, so the same posts always give the same file. */
export function rssXml(metas: readonly PostMeta[]): string {
  const sorted = [...metas].sort((a, b) => (b.datePublished || '0').localeCompare(a.datePublished || '0'));
  const latest = metas.map((m) => m.dateModified || m.datePublished).filter(Boolean).sort().pop();
  const items = sorted
    .map((m) => {
      const date = m.datePublished ? rfc822(m.datePublished) : null;
      return [
        '    <item>',
        `      <title>${esc(m.title)}</title>`,
        `      <link>${postUrl(m.slug)}</link>`,
        `      <guid isPermaLink="true">${postUrl(m.slug)}</guid>`,
        date ? `      <pubDate>${date}</pubDate>` : '',
        `      <description>${esc(m.description)}</description>`,
        `      <category>${esc(m.category)}</category>`,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
  const built = latest ? rfc822(latest) : null;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${esc(BLOG_NAME)}</title>`,
    `    <link>${SITE_ORIGIN}/blog</link>`,
    `    <description>${esc(BLOG_DESCRIPTION)}</description>`,
    '    <language>en-in</language>',
    built ? `    <lastBuildDate>${built}</lastBuildDate>` : '',
    `    <atom:link href="${SITE_ORIGIN}/blog/rss.xml" rel="self" type="application/rss+xml" />`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ]
    .filter((l) => l !== '')
    .join('\n')
    .concat('\n');
}

// ---------- llms.txt ----------

/** Indian digit grouping: 150000 → '1,50,000'. */
function inr(n: number): string {
  const s = String(Math.round(n));
  if (s.length <= 3) return `₹${s}`;
  const last = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${last}`;
}

/** /llms.txt (llmstxt.org): who Kreators.Army is, the facts the site states, the main pages and every published post with its one-line summary. */
export function llmsTxt(metas: readonly PostMeta[]): string {
  const page = (path: string, name: string, line: string) => `- [${name}](${SITE_ORIGIN}${path}): ${line}`;
  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${ENTITY_LINE} ${SITE.operatorLine}`,
    '',
    'Kreators.Army makes street interview (vox pop) videos for D2C brands, cut for Instagram Reels, YouTube Shorts and other short-form feeds. A host takes one question to the street, real people answer on camera, and the best reactions are edited into short videos.',
    '',
    '## Facts',
    '',
    ...PACKAGES.map((p) => `- ${p.name}: ${inr(p.fee)} (${inr(p.perVideo)} a video), for one brand.`),
    `- Beyond ${ADD_ON.after} videos: blocks of ${ADD_ON.blockOf} at ${inr(ADD_ON.fee)} a block (${inr(ADD_ON.perVideo)} a video).`,
    '- Fees exclude applicable taxes, including GST where applicable. Packages are fully prepaid, and usage rights for the final videos transfer on full payment.',
    `- The trial: ${CLOSING.body}`,
    '- Turnaround: a trial usually takes 7 to 14 days, and a paid batch usually takes 14 to 21 days. Exact delivery dates are confirmed in the pilot agreement.',
    `- Results: ${RESULTS_NOTE.long}`,
    `- Contact: ${SITE.email}, or "${PRIMARY_ACTION.label}" at ${SITE_ORIGIN}${PRIMARY_ACTION.to}.`,
    '',
    '## Pages',
    '',
    page('/how-we-work', 'How we work', 'how a vox pop is planned, shot and edited.'),
    page('/pricing', 'Pricing', 'the packages and what every package includes.'),
    page('/trial', 'The trial', 'how the trial works and what happens after it.'),
    page('/video-library', 'Video library', 'the videos made so far.'),
    page('/why-voxpop', 'Why vox pop', 'why real reactions hold attention.'),
    page('/faq', 'FAQ', 'answers about price, the trial, revisions, payment and usage.'),
    page('/contact', 'Contact', 'request a trial video.'),
    '',
    '## Blog',
    '',
    ...metas.map((m) => `- [${m.title}](${postUrl(m.slug)}): ${m.description}`),
    '',
    '## Optional',
    '',
    `- [Blog feed](${SITE_ORIGIN}/blog/rss.xml): every post, newest first.`,
    `- [Sitemap](${SITE_ORIGIN}/sitemap.xml): every public page.`,
    '',
  ];
  return lines.join('\n');
}
