// The build's own check of each post, run by the prerender before it writes a page: what would break the page (an unknown block or widget, a
// missing field, a dangling link, citation or decision-tree branch, a formula that does not parse, a bad date) fails the build with the post and
// the problem named. The full editorial check (word counts, style, copy rules, claims) is the validator's: .work/tools/blog/validate-post.mjs.

import { parseFormula } from './formula';
import { inlineCites, inlineLinks, parseInline } from './inline';
import { BLOCK_TYPES, BLOG_CATEGORIES, WIDGET_NAMES, type Block, type Post, type WidgetBlock } from './types';

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
/** Ids the page itself uses (PostView, FORMAT.md section 5): never a block's. */
const RESERVED = new Set(['top', 'answer', 'takeaways', 'contents', 'toc', 'faq', 'faqs', 'sources', 'related', 'main', 'content', 'root', 'author', 'post-title', 'takeaways-h', 'faq-h', 'sources-h', 'related-h', 'post-end-h']);
const RESERVED_PATTERN = /^(faq-\d+|source-.+|table-\d+)$/;

const validDate = (s: unknown) => typeof s === 'string' && DATE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);

/** Every problem that would break the page; empty when the post can be rendered. */
export function checkPost(post: Post, slug: string): string[] {
  const errors: string[] = [];
  const fail = (m: string) => errors.push(`${slug}: ${m}`);
  if (!post || typeof post !== 'object') return [`${slug}: the file does not default-export a post`];
  const m = post.meta;
  if (!m || typeof m !== 'object') return [`${slug}: post.meta is missing`];
  if (m.slug !== slug) fail(`meta.slug "${m.slug}" must equal the file name`);
  for (const k of ['title', 'metaTitle', 'description'] as const) if (typeof m[k] !== 'string' || !m[k].trim()) fail(`meta.${k} is missing`);
  if (!(BLOG_CATEGORIES as readonly string[]).includes(m.category)) fail(`meta.category "${m.category}" is not one of ${BLOG_CATEGORIES.join(', ')}`);
  if (!validDate(m.datePublished)) fail(`meta.datePublished "${m.datePublished}" is not a YYYY-MM-DD date`);
  if (!validDate(m.dateModified)) fail(`meta.dateModified "${m.dateModified}" is not a YYYY-MM-DD date`);
  if (!Array.isArray(m.tags)) fail('meta.tags is not a list');
  if (!m.author || (m.author.kind !== 'organization' && m.author.kind !== 'person')) fail('meta.author is missing');
  if (typeof post.answer !== 'string' || !post.answer.trim()) fail('answer is missing');
  for (const k of ['takeaways', 'body', 'faqs', 'sources', 'related'] as const) if (!Array.isArray(post[k])) fail(`${k} is not a list`);
  if (errors.length) return errors;

  // Ids: kebab-case, unique, not the page's own.
  const ids = new Set<string>();
  const addId = (id: unknown, where: string) => {
    if (typeof id !== 'string' || !ID.test(id)) return fail(`${where}: id "${String(id)}" is not kebab-case`);
    if (RESERVED.has(id) || RESERVED_PATTERN.test(id)) return fail(`${where}: id "${id}" is reserved for the page`);
    if (ids.has(id)) return fail(`${where}: id "${id}" is used twice`);
    ids.add(id);
  };
  const inline = (text: unknown, where: string) => {
    if (typeof text !== 'string') return fail(`${where}: expected text`);
    for (const e of parseInline(text).errors) fail(`${where}: ${e}`);
  };

  post.body.forEach((b: Block, i) => {
    const where = `body[${i}]`;
    if (typeof b === 'string') return inline(b, where);
    if (!b || typeof b !== 'object' || !(BLOCK_TYPES as readonly string[]).includes((b as { type?: string }).type ?? '')) return fail(`${where}: unknown block type "${String((b as { type?: unknown })?.type)}"`);
    switch (b.type) {
      case 'h2':
      case 'h3':
        addId(b.id, where);
        if (!b.text) fail(`${where}: heading text is missing`);
        break;
      case 'list':
        if (!Array.isArray(b.items)) fail(`${where}: list items missing`);
        else b.items.forEach((t, j) => inline(t, `${where}.items[${j}]`));
        break;
      case 'definition':
        if (b.id !== undefined) addId(b.id, where);
        break;
      case 'table':
        if (!Array.isArray(b.head) || !Array.isArray(b.rows)) fail(`${where}: table head or rows missing`);
        else b.rows.forEach((r, j) => Array.isArray(r) && r.length === b.head.length ? r.forEach((c, k) => inline(c, `${where}.rows[${j}][${k}]`)) : fail(`${where}: row ${j} has ${Array.isArray(r) ? r.length : 0} cells, the head has ${b.head.length}`));
        break;
      case 'script':
      case 'steps':
      case 'framework':
        addId(b.id, where);
        break;
      case 'video':
        if (!b.brand || !b.title) fail(`${where}: a video needs brand and title`);
        break;
      case 'widget':
        addId(b.id, where);
        checkWidget(b, where, fail);
        break;
      default:
        break;
    }
  });

  inline(post.answer, 'answer');
  post.takeaways.forEach((t, i) => inline(t, `takeaways[${i}]`));
  post.faqs.forEach((f, i) => {
    if (!f || typeof f.q !== 'string' || typeof f.a !== 'string') return fail(`faqs[${i}]: needs q and a`);
    inline(f.a, `faqs[${i}].a`);
  });

  // Citations and in-page links resolve.
  const sources = new Set(post.sources.map((s) => s?.id));
  const strings: { text: string; key?: string }[] = [];
  const walk = (v: unknown, key?: string): void => {
    if (typeof v === 'string') strings.push({ text: v, key });
    else if (Array.isArray(v)) for (const x of v) walk(x);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  walk([post.answer, post.takeaways, post.body, post.faqs]);
  const pageIds = new Set([...ids, 'answer', 'takeaways', 'faq', 'sources', 'author', ...post.faqs.map((_, i) => `faq-${i + 1}`)]);
  for (const { text, key } of strings) {
    if (key === 'source') {
      if (!sources.has(text)) fail(`source "${text}" is not in sources`);
      continue;
    }
    if (!text.includes('[')) continue;
    for (const id of inlineCites(text)) if (!sources.has(id)) fail(`[^${id}] is not in sources`);
    for (const { href } of inlineLinks(text)) {
      if (href.startsWith('#') && !pageIds.has(href.slice(1))) fail(`link to #${href.slice(1)}, which is not on the page`);
      const blog = /^\/blog\/([^?#]+)/.exec(href);
      if (blog && blog[1] === slug) fail(`links to itself (${href}); link the section with #id instead`);
    }
  }
  for (const s of post.sources) if (!s || typeof s.url !== 'string' || !/^(https:\/\/|\/)/.test(s.url)) fail(`source "${s?.id}" needs an https:// or /route url`);
  if (m.hero && (!m.hero.brand || !m.hero.title)) fail('meta.hero needs brand and title');
  return errors;
}

function checkWidget(b: WidgetBlock, where: string, fail: (m: string) => void) {
  if (!(WIDGET_NAMES as readonly string[]).includes(b.widget)) return fail(`${where}: unknown widget "${b.widget}"`);
  if (!b.props || typeof b.props !== 'object') return fail(`${where}: widget props missing`);
  const w = `${where} (${b.widget} ${b.id})`;
  switch (b.widget) {
    case 'quiz':
      if (!b.props.questions?.length || !b.props.results?.length) fail(`${w}: needs questions and results`);
      break;
    case 'slides':
      if (!b.props.slides?.length) fail(`${w}: needs slides`);
      break;
    case 'calculator': {
      const known = new Set(b.props.inputs?.map((i) => i.key) ?? []);
      for (const o of b.props.outputs ?? []) {
        const f = parseFormula(o.formula);
        if (!f.ok) fail(`${w}: output "${o.key}" formula does not parse (${f.error})`);
        else for (const k of f.keys) if (!known.has(k)) fail(`${w}: output "${o.key}" uses "${k}", which is not an input or an earlier output`);
        known.add(o.key);
      }
      if (!b.props.disclaimer) fail(`${w}: needs a disclaimer`);
      break;
    }
    case 'picker': {
      const outs = new Set(b.props.outcomes?.map((o) => o.id) ?? []);
      for (const q of b.props.questions ?? []) for (const o of q.options ?? []) for (const id of o.outcomes ?? []) if (!outs.has(id)) fail(`${w}: outcome "${id}" does not exist`);
      if (!outs.size) fail(`${w}: needs outcomes`);
      break;
    }
    case 'decisionTree': {
      const nodes = new Set(b.props.nodes?.map((n) => n.id) ?? []);
      const ends = new Set(b.props.ends?.map((e) => e.id) ?? []);
      if (!nodes.has(b.props.start)) fail(`${w}: start "${b.props.start}" is not a node`);
      for (const n of b.props.nodes ?? []) for (const o of n.options ?? []) if (!nodes.has(o.next) && !ends.has(o.next)) fail(`${w}: "${n.id}" goes to "${o.next}", which is neither a node nor an end`);
      break;
    }
    case 'scoreCard':
      if (!(b.props.scale?.max > b.props.scale?.min)) fail(`${w}: scale max must be above min`);
      if (!b.props.bands?.length || !b.props.criteria?.length) fail(`${w}: needs criteria and bands`);
      break;
    default:
      break;
  }
}
