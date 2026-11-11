// The blog's content format (.work/v2/blog/FORMAT.md is the human spec). Posts are plain, serialisable data: no React, no functions, no imports beyond
// `import type`, so they prerender to static HTML and lazy-load per post.
//
// Files, one pair per post, in apps/web/src/blog/posts/:
//   <slug>.meta.ts   `export default` a PostMeta. Imports nothing at runtime (the blog index loads every meta eagerly).
//   <slug>.ts        `export default` a Post whose `meta` is the default import of './<slug>.meta'.
// A file name starting with "_" (the format example) is left out of the registry.
//
// Check a post with: node .work/tools/blog/validate-post.mjs apps/web/src/blog/posts/<slug>.ts

import type { Mechanism } from '../lib/content';

// ---------- Text ----------

/**
 * Text with the blog's inline markup, parsed by ./inline.ts:
 *   **bold**   _italic_   [link text](/internal-route) or [text](https://external) or [text](#heading-id)   [^source-id] (a citation)
 * Escape a literal * _ [ ] or \ with a backslash. No nesting, no HTML, no line breaks.
 */
export type Inline = string;

/** Plain text. No markup is parsed: `**` and `[` show as typed. Headings, labels, button and card text, script lines. */
export type Plain = string;

/** kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`), unique within its post. Heading and widget ids become DOM ids, so they share one namespace per post. */
export type Id = string;

/** 'YYYY-MM-DD'. */
export type IsoDate = string;

// ---------- Fixed vocabularies (the validator reads these arrays) ----------

/** PLAN.md's four clusters. The blog index groups posts by these, with each cluster's hub first ("Start here"). */
export const BLOG_CATEGORIES = ['Understand', 'Plan', 'Shoot', 'Edit and publish'] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const CALLOUT_TONES = ['tip', 'warning', 'note'] as const;
export type CalloutTone = (typeof CALLOUT_TONES)[number];

/** How a calculator output is shown. 'inr' is for the reader's own figures only, never a Kreators.Army price or a projected result. */
export const CALC_FORMATS = ['number', 'percent', 'inr'] as const;
export type CalcFormat = (typeof CALC_FORMATS)[number];

/** A decision tree's answer: fine to go ahead, go ahead with care, or don't. */
export const DECISION_TONES = ['go', 'caution', 'stop'] as const;
export type DecisionTone = (typeof DECISION_TONES)[number];

// ---------- A library video (resolved at runtime against /api/videos by ./videoRef.ts) ----------

/**
 * A live library video, by brand and title phrase. "Waxys" + "Smell It And Guess" matches "03 Waxys - Smell It And Guess 20-04": the leading number,
 * the "Brand - " prefix and the trailing date are ignored, case, accents and punctuation are folded, and the phrase may be any run of whole words in
 * the title. Check refs against .work/v2/blog/source/live-video-titles.txt.
 */
export interface VideoRef {
  /** The library's brand, any case: 'CircleStore', 'Waxys', 'Hackdaily'. */
  brand: Plain;
  /** A run of whole words from the title ('Guess The Price', 'Blindfold Bun'), or the whole library title as listed ('39 Circlestore - Goa Vs Mobile 15-03'). */
  title: Plain;
  /** When several videos match (CircleStore has seven "Guess The Price"), the 1-based pick in library number order. Default 1. */
  nth?: number;
}

// ---------- The post ----------

export type Author =
  /** Today's default: posts are credited to the organisation. */
  | { kind: 'organization'; name: 'Kreators.Army' }
  /** A named author, once the founder names one (needs a real person, a role and a short bio). */
  | { kind: 'person'; name: Plain; role: Plain; bio: Plain; url?: string };

/** Everything the blog index, the <head>, the sitemap, RSS and llms.txt need, without loading the post body. */
export interface PostMeta {
  /** kebab-case, equal to the file name. The URL is /blog/<slug>. */
  slug: string;
  /** The H1 and the index card's title. Sentence case, at most 90 characters. */
  title: Plain;
  /** The whole <title>, used verbatim: nothing is appended. At most 60 characters; end it with " | Kreators.Army" (the site's separator) only when that still fits. */
  metaTitle: Plain;
  /** The meta description, the index card's line and the RSS summary. 140 to 160 characters. */
  description: Plain;
  /** The one search query this post is built to answer, lowercase: 'vox pop questions'. */
  primaryQuery: string;
  /** 2 to 10 related queries, lowercase. */
  secondaryQueries: string[];
  datePublished: IsoDate;
  /** Equal to or after datePublished. Bump it on any real edit. */
  dateModified: IsoDate;
  /** ceil(words / 230) over body + answer + faqs. The validator prints the number to put here. */
  readingMinutes: number;
  author: Author;
  category: BlogCategory;
  /** 1 to 6 lowercase tags. */
  tags: string[];
  /** A library video shown at the top and used for the social card's poster. Optional. */
  hero?: VideoRef;
  /** The cluster's hub: listed first in its category on the blog index, as "Start here". One per category. */
  hub?: boolean;
  /** Built and checked, but left out of the index, the sitemap, RSS and llms.txt, and served noindex. */
  draft?: boolean;
}

/**
 * (bento10) What the blog index knows of a post's body without loading it: its widget kinds (in order of first use) and its framework names. Made at
 * build time from the post file (apps/web/scripts/blogSummary.ts, via src/blog/registry.ts). Never written by hand.
 */
export interface PostSummary {
  widgets: string[];
  frameworks: string[];
}

export interface PostFaq {
  /** A real question a reader would type, ending in "?". */
  q: Plain;
  /** 30 to 90 words, answer first. Emitted as FAQPage JSON-LD (markup stripped). */
  a: Inline;
}

export interface Source {
  /** Cited in text as [^id]; referenced by stat.source, quote.source, definition.source. */
  id: Id;
  title: Plain;
  /** https://… or an internal route ('/numbers') for the site's own facts. */
  url: string;
  publisher: Plain;
  /** 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD'. Leave out when the source has no date. */
  date?: string;
  /** What the source supports, for the editor (not shown). */
  note?: Plain;
}

export interface Post {
  /** The default import of './<slug>.meta'. */
  meta: PostMeta;
  /** Answer first: 40 to 60 words that answer primaryQuery outright. Shown under the H1; the snippet search and AI tools quote. */
  answer: Inline;
  /** 3 to 7 bullets, each at most 30 words. */
  takeaways: Inline[];
  body: Block[];
  /** 3 to 10. */
  faqs: PostFaq[];
  /** Everything cited. Each one used at least once. */
  sources: Source[];
  /** 2 to 4 slugs of other posts (planned ones count). */
  related: string[];
}

// ---------- Blocks ----------

/** A paragraph is a bare string in `body`. */
export type Paragraph = Inline;

export interface H2Block {
  type: 'h2';
  id: Id;
  text: Plain;
  /** A shorter label for the table of contents. */
  toc?: Plain;
}

export interface H3Block {
  type: 'h3';
  id: Id;
  text: Plain;
}

export interface ListBlock {
  type: 'list';
  /** Numbered when true. */
  ordered?: boolean;
  items: Inline[];
}

export interface QuoteBlock {
  type: 'quote';
  text: Inline;
  /** Who said it: 'A shopper on Brigade Road, Bengaluru'. They/them for people we don't know. */
  attribution: Plain;
  /** A Source id, when the quote comes from one. */
  source?: Id;
}

export interface CalloutBlock {
  type: 'callout';
  tone: CalloutTone;
  title?: Plain;
  text: Inline;
  /** A short list under the text. */
  items?: Inline[];
}

/** A term and what it means. Emitted as DefinedTerm JSON-LD. With an id, other posts can link it (/blog/vox-pop-glossary#gravel). */
export interface DefinitionBlock {
  type: 'definition';
  id?: Id;
  term: Plain;
  text: Inline;
  source?: Id;
}

export interface TableBlock {
  type: 'table';
  /** Says what the table shows; also its accessible name. */
  caption: Plain;
  head: Plain[];
  /** Every row has head.length cells. At most 40 rows, or 200 with search. */
  rows: Inline[][];
  /** The first cell of each row is a row header. */
  rowHeaders?: boolean;
  /** A searchable bank (the 120-question list): a search box over every cell. */
  search?: boolean;
  /** With search: the 0-based column whose distinct values become filter chips ('Category'). */
  filterColumn?: number;
  /** A Copy button on each row that copies this 0-based column's plain text. */
  copyColumn?: number;
}

export interface DividerBlock {
  type: 'divider';
}

/** A spoken line, or a stage direction ('Hold up the two packs.'). */
export type ScriptLine = { speaker: Plain; text: Plain } | { direction: Plain };

/** A script or dialogue with a Copy button. Copied as "Speaker: text" lines, directions in brackets. */
export interface ScriptBlock {
  type: 'script';
  id: Id;
  title: Plain;
  /** Where and how it's shot, above the lines. */
  context?: Inline;
  lines: ScriptLine[];
}

export interface Step {
  name: Plain;
  text: Inline;
}

/** Numbered steps. With howTo: true (at most one per post) it is also emitted as HowTo JSON-LD. */
export interface StepsBlock {
  type: 'steps';
  id: Id;
  title: Plain;
  intro?: Inline;
  howTo?: boolean;
  /** ISO 8601 duration for HowTo: 'PT2H', 'P30D'. */
  totalTime?: string;
  /** What you need, for HowTo `supply`. */
  supplies?: Plain[];
  steps: Step[];
}

export interface FrameworkPart {
  /** The letter (or word) this part stands for: 'G'. */
  key: Plain;
  name: Plain;
  text: Inline;
}

/** A named framework, letter by letter. With acronym (the default when `name` is capitals), the keys spell the name. */
export interface FrameworkBlock {
  type: 'framework';
  id: Id;
  /** 'GRAVEL', 'S.T.A.C.K.', 'The question funnel'. */
  name: Plain;
  /** One line under the name. */
  tagline?: Plain;
  intro?: Inline;
  acronym?: boolean;
  parts: FrameworkPart[];
}

export interface ComparisonSide {
  label: Plain;
  items: Inline[];
}

/** Two columns side by side (one above the other on phones). Use a table when rows must line up. */
export interface ComparisonBlock {
  type: 'comparison';
  title?: Plain;
  left: ComparisonSide;
  right: ComparisonSide;
  verdict?: Inline;
}

/** One number. Consecutive stat blocks render as one row. Kreators.Army's own numbers only as on the site, with note 'Past results, not a promise.' */
export interface StatBlock {
  type: 'stat';
  /** As shown: '100M+', '3 in 5', '41%'. */
  value: Plain;
  label: Plain;
  /** A Source id. Required: no number without a source. */
  source: Id;
  note?: Plain;
}

/** A library video. When no live video matches, the caption renders alone with a link to the library, or the block renders nothing. */
export interface VideoBlock extends VideoRef {
  type: 'video';
  caption?: Inline;
}

/** The eleven mechanism chips from lib/content.ts MECHANISMS (the "eleven ways" post). At most once per post. */
export interface MechanismsBlock {
  type: 'mechanisms';
  caption?: Plain;
}

/** The site's one primary action ('Request a trial video', /contact), with an optional lead-in line. The label is fixed; never "free". */
export interface CtaBlock {
  type: 'cta';
  text?: Inline;
}

/** An interactive widget from the catalog below. Every widget renders all of its text statically too (prerender, no JS). */
export type WidgetBlock = {
  [K in WidgetName]: {
    type: 'widget';
    widget: K;
    /** DOM id and the localStorage key part. */
    id: Id;
    props: WidgetProps[K];
  };
}[WidgetName];

export type Block =
  | Paragraph
  | H2Block
  | H3Block
  | ListBlock
  | QuoteBlock
  | CalloutBlock
  | DefinitionBlock
  | TableBlock
  | DividerBlock
  | ScriptBlock
  | StepsBlock
  | FrameworkBlock
  | ComparisonBlock
  | StatBlock
  | VideoBlock
  | MechanismsBlock
  | CtaBlock
  | WidgetBlock;

/** Every object block's `type` (a bare string is a paragraph). */
export const BLOCK_TYPES = [
  'h2',
  'h3',
  'list',
  'quote',
  'callout',
  'definition',
  'table',
  'divider',
  'script',
  'steps',
  'framework',
  'comparison',
  'stat',
  'video',
  'mechanisms',
  'cta',
  'widget',
] as const satisfies readonly Exclude<Block, string>['type'][];

// ---------- The widget catalog ----------

/** Single choice per question; the points add up and pick a result. A knowledge check: 1 point for the right option, 0 for the rest. */
export interface QuizProps {
  title: Plain;
  intro?: Inline;
  /** 2 to 10. */
  questions: {
    q: Plain;
    /** 2 to 5. `why` shows when the reader picks that option. */
    options: { text: Plain; points: number; why?: Inline }[];
    /** Shown once the reader answers. */
    explain?: Inline;
  }[];
  /** Ascending `min`. The result is the last band with min <= total. The first min is the lowest possible total. */
  results: { min: number; title: Plain; text: Inline }[];
}

/** Tickable items, kept in localStorage under `ka:blog:<slug>:<widget id>` (the ticked item ids). */
export interface ChecklistProps {
  title: Plain;
  intro?: Inline;
  /** 3 to 30, ids unique within the widget. */
  items: { id: Id; text: Inline; detail?: Inline }[];
  /** Shown when every item is ticked. */
  done?: Inline;
}

/**
 * The reader types into the fields; each template's {field-id} placeholders fill in (with the field's `example` while it is empty) and the reader
 * copies the questions. Every placeholder names a field; every field is used.
 */
export interface QuestionBuilderProps {
  title: Plain;
  intro?: Inline;
  /** 1 to 4. */
  fields: { id: Id; label: Plain; placeholder: Plain; example: Plain }[];
  /** 3 to 20: 'Would you pay more for {product} if it lasted twice as long?' */
  templates: { text: Plain; group?: Plain; mechanism?: Mechanism }[];
  note?: Inline;
}

/** The two-answer pattern: the first answer shows; a tap reveals the second (after the follow-up). */
export interface RevealProps {
  title?: Plain;
  /** Default 'First answer'. */
  firstLabel?: Plain;
  /** Default 'After the follow-up'. */
  secondLabel?: Plain;
  /** 1 to 6. */
  items: { question: Plain; first: Inline; second: Inline; note?: Inline }[];
}

/** A swipeable deck (a carousel as slides). Statically, every slide in order. Each slide has text, points or both. */
export interface SlidesProps {
  title: Plain;
  /** 3 to 12. */
  slides: { heading: Plain; text?: Inline; points?: Inline[] }[];
}

/**
 * Number inputs and outputs computed from a declared formula (./formula.ts: + - * / ( ), numbers, input keys, earlier output keys, and
 * min max round floor ceil abs). Never a promise: no views, sales or returns, and the disclaimer is shown under the result.
 */
export interface CalculatorProps {
  title: Plain;
  intro?: Inline;
  /** 1 to 6. `key` is an identifier for formulas: camelCase, `^[a-z][a-zA-Z0-9]*$`. */
  inputs: {
    key: string;
    label: Plain;
    default: number;
    min: number;
    max: number;
    step: number;
    unit?: Plain;
  }[];
  /** 1 to 4. */
  outputs: {
    key: string;
    label: Plain;
    formula: string;
    format: CalcFormat;
    decimals?: number;
    unit?: Plain;
  }[];
  /** Always shown. Says the numbers are the reader's own and illustrative. */
  disclaimer: Plain;
}

export interface BeforeAfterSide {
  label: Plain;
  text: Inline;
  points?: Inline[];
}

/** A toggle between a weaker and a stronger version. Shows `before` first. */
export interface BeforeAfterProps {
  title?: Plain;
  before: BeforeAfterSide;
  after: BeforeAfterSide;
  note?: Inline;
}

/** A plan over time: a 30-day system, a shoot day, a launch week. */
export interface TimelineProps {
  title: Plain;
  intro?: Inline;
  /** 2 to 31. `when`: 'Day 1', 'Days 2 to 4', 'Week 2', '9:00'. */
  items: { when: Plain; title: Plain; text: Inline; tasks?: Inline[] }[];
}

/** Local only: the reader's pick is kept in localStorage and nothing is sent. Never shows vote counts or percentages. */
export interface PollProps {
  question: Plain;
  /** 2 to 6. */
  options: Plain[];
  /** Shown once the reader picks: the authored take, the same for every pick. */
  after?: Inline;
}

/**
 * A short decision helper: each option names the outcomes it points to; the outcome named most often wins (a tie goes to the one listed first).
 * Platform, format, stack or "which fix" pickers. Statically, every outcome with its reasons.
 */
export interface PickerProps {
  title: Plain;
  intro?: Inline;
  /** 1 to 6. */
  questions: { q: Plain; options: { text: Plain; outcomes: Id[] }[] }[];
  /** 2 to 8, ids unique within the widget. */
  outcomes: { id: Id; title: Plain; text: Inline; reasons?: Inline[] }[];
}

/**
 * A branching yes/no (or more) walk-through: "Can I film here?". Starts at `start`; each option's `next` names a node or an end. No cycles, and every
 * node and end is reachable. Statically, a nested list of every path. Never legal advice: say so in `note`.
 */
export interface DecisionTreeProps {
  title: Plain;
  intro?: Inline;
  start: Id;
  /** 1 to 30 questions. Node and end ids share one namespace within the widget. */
  nodes: {
    id: Id;
    q: Plain;
    help?: Inline;
    options: { text: Plain; next: Id }[];
  }[];
  /** 2 to 20 answers. */
  ends: { id: Id; title: Plain; text: Inline; tone: DecisionTone }[];
  note?: Inline;
}

/** Cards that flip on tap: a term, a question or a myth on the front. */
export interface FlipCardsProps {
  title?: Plain;
  /** 2 to 12. */
  cards: { front: Plain; back: Inline; tag?: Plain }[];
}

/**
 * The reader rates their own vox pop on each criterion. Score % = sum(weight × (rating − min)) / sum(weight × (max − min)) × 100. The band is the last
 * with min <= score; the first band's min is 0.
 */
export interface ScoreCardProps {
  title: Plain;
  intro?: Inline;
  scale: { min: number; max: number; lowLabel: Plain; highLabel: Plain };
  /** 3 to 12. Weight defaults to 1. */
  criteria: { id: Id; label: Plain; help?: Inline; weight?: number }[];
  /** Ascending min, 0 to 100. */
  bands: { min: number; title: Plain; text: Inline }[];
}

export interface WidgetProps {
  quiz: QuizProps;
  checklist: ChecklistProps;
  questionBuilder: QuestionBuilderProps;
  reveal: RevealProps;
  slides: SlidesProps;
  calculator: CalculatorProps;
  beforeAfter: BeforeAfterProps;
  timeline: TimelineProps;
  poll: PollProps;
  flipCards: FlipCardsProps;
  scoreCard: ScoreCardProps;
  picker: PickerProps;
  decisionTree: DecisionTreeProps;
}

export type WidgetName = keyof WidgetProps;

export const WIDGET_NAMES = [
  'quiz',
  'checklist',
  'questionBuilder',
  'reveal',
  'slides',
  'calculator',
  'beforeAfter',
  'timeline',
  'poll',
  'flipCards',
  'scoreCard',
  'picker',
  'decisionTree',
] as const satisfies readonly WidgetName[];

/** Compile-time proof that WIDGET_NAMES and BLOCK_TYPES list every member. */
type MissingWidget = Exclude<WidgetName, (typeof WIDGET_NAMES)[number]>;
type MissingBlock = Exclude<Exclude<Block, string>['type'], (typeof BLOCK_TYPES)[number]>;
export const CATALOG_COMPLETE: [MissingWidget, MissingBlock] extends [never, never] ? true : false = true;

// ---------- The registry (built by the renderer, documented here so writers never edit an index) ----------

/** The localStorage key a widget keeps its state under. */
export const widgetStorageKey = (slug: string, widgetId: string) => `ka:blog:${slug}:${widgetId}`;
