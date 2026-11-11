// Words and reading time, the same for the validator and the renderer. Words count over body + answer + faqs (every visible string in the body,
// widgets and tables included), markup removed.

import { plainInline } from './inline';
import type { Block, Post, WidgetBlock } from './types';

export const WORDS_PER_MINUTE = 230;

/** Whitespace-separated runs that hold a letter or a digit. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

const p = plainInline;

function widgetText(w: WidgetBlock): string[] {
  switch (w.widget) {
    case 'quiz':
      return [
        w.props.title,
        p(w.props.intro ?? ''),
        ...w.props.questions.flatMap((q) => [q.q, ...q.options.flatMap((o) => [o.text, p(o.why ?? '')]), p(q.explain ?? '')]),
        ...w.props.results.flatMap((r) => [r.title, p(r.text)]),
      ];
    case 'checklist':
      return [w.props.title, p(w.props.intro ?? ''), ...w.props.items.flatMap((i) => [p(i.text), p(i.detail ?? '')]), p(w.props.done ?? '')];
    case 'questionBuilder':
      return [w.props.title, p(w.props.intro ?? ''), ...w.props.fields.flatMap((f) => [f.label, f.example]), ...w.props.templates.map((t) => t.text), p(w.props.note ?? '')];
    case 'reveal':
      return [w.props.title ?? '', ...w.props.items.flatMap((i) => [i.question, p(i.first), p(i.second), p(i.note ?? '')])];
    case 'slides':
      return [w.props.title, ...w.props.slides.flatMap((s) => [s.heading, p(s.text ?? ''), ...(s.points ?? []).map(p)])];
    case 'calculator':
      return [w.props.title, p(w.props.intro ?? ''), ...w.props.inputs.map((i) => i.label), ...w.props.outputs.map((o) => o.label), w.props.disclaimer];
    case 'beforeAfter':
      return [w.props.title ?? '', ...[w.props.before, w.props.after].flatMap((s) => [s.label, p(s.text), ...(s.points ?? []).map(p)]), p(w.props.note ?? '')];
    case 'timeline':
      return [w.props.title, p(w.props.intro ?? ''), ...w.props.items.flatMap((i) => [i.when, i.title, p(i.text), ...(i.tasks ?? []).map(p)])];
    case 'poll':
      return [w.props.question, ...w.props.options, p(w.props.after ?? '')];
    case 'flipCards':
      return [w.props.title ?? '', ...w.props.cards.flatMap((c) => [c.front, p(c.back)])];
    case 'scoreCard':
      return [w.props.title, p(w.props.intro ?? ''), ...w.props.criteria.flatMap((c) => [c.label, p(c.help ?? '')]), ...w.props.bands.flatMap((b) => [b.title, p(b.text)])];
    case 'picker':
      return [w.props.title, p(w.props.intro ?? ''), ...w.props.questions.flatMap((q) => [q.q, ...q.options.map((o) => o.text)]), ...w.props.outcomes.flatMap((o) => [o.title, p(o.text), ...(o.reasons ?? []).map(p)])];
    case 'decisionTree':
      return [w.props.title, p(w.props.intro ?? ''), ...w.props.nodes.flatMap((n) => [n.q, p(n.help ?? ''), ...n.options.map((o) => o.text)]), ...w.props.ends.flatMap((e) => [e.title, p(e.text)]), p(w.props.note ?? '')];
  }
}

/** Every visible string of a block, markup removed. */
export function blockText(b: Block): string[] {
  if (typeof b === 'string') return [p(b)];
  switch (b.type) {
    case 'h2':
    case 'h3':
      return [b.text];
    case 'list':
      return b.items.map(p);
    case 'quote':
      return [p(b.text), b.attribution];
    case 'callout':
      return [b.title ?? '', p(b.text), ...(b.items ?? []).map(p)];
    case 'definition':
      return [b.term, p(b.text)];
    case 'table':
      return [b.caption, ...b.head, ...b.rows.flat().map(p)];
    case 'divider':
      return [];
    case 'script':
      return [b.title, p(b.context ?? ''), ...b.lines.map((l) => ('direction' in l ? l.direction : `${l.speaker}: ${l.text}`))];
    case 'steps':
      return [b.title, p(b.intro ?? ''), ...(b.supplies ?? []), ...b.steps.flatMap((s) => [s.name, p(s.text)])];
    case 'framework':
      return [b.name, b.tagline ?? '', p(b.intro ?? ''), ...b.parts.flatMap((x) => [x.name, p(x.text)])];
    case 'comparison':
      return [b.title ?? '', ...[b.left, b.right].flatMap((s) => [s.label, ...s.items.map(p)]), p(b.verdict ?? '')];
    case 'stat':
      return [b.value, b.label, b.note ?? ''];
    case 'video':
      return [p(b.caption ?? '')];
    case 'mechanisms':
      return [b.caption ?? ''];
    case 'cta':
      return [p(b.text ?? '')];
    case 'widget':
      return widgetText(b);
  }
}

export interface PostWords {
  body: number;
  answer: number;
  faqs: number;
  total: number;
}

export function postWords(post: Pick<Post, 'body' | 'answer' | 'faqs'>): PostWords {
  const body = countWords(post.body.flatMap(blockText).join(' '));
  const answer = countWords(p(post.answer));
  const faqs = countWords(post.faqs.map((f) => `${f.q} ${p(f.a)}`).join(' '));
  return { body, answer, faqs, total: body + answer + faqs };
}

export const readingMinutes = (words: number) => Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
