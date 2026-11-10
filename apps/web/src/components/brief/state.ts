import {
  BRIEF_LIMITS,
  INTEGRATION_LABELS,
  MUST_HAVE_LABELS,
  OBJECTIVE_LABELS,
  PACKAGE_LABELS,
  emptyBrief,
  isHttpUrl,
  type Integration,
  type MustHave,
  type Objective,
  type PackageChoice,
  type TrialBrief,
} from '@kreators/shared';
import type { FormatSlug } from '../../lib/content';

// Owner: A6 Pages B. The guided trial brief's state (content §5, V2-SPEC 5.6): what the URL asked for, the answers, how they survive a reload
// (sessionStorage 'kreators-brief', every call in try/catch; the form works without it), and how they become the TrialBrief the API validates.

export type Mode = 'trial' | 'question';
/** 1 to 5, then 6 = the review. */
export type Step = 1 | 2 | 3 | 4 | 5 | 6;
export const REVIEW: Step = 6;

/** The calculator's pill: "{n} videos (from the calculator)". */
export const CALC = 'calc';
export type PackagePick = Exclude<PackageChoice, ''> | typeof CALC | '';

export interface Draft {
  name: string;
  email: string;
  phone: string;
  brand: string;
  site: string;
  agency: boolean;
  pkg: PackagePick;
  objective: Objective;
  objectiveOther: string;
  integration: Integration;
  integrationOther: string;
  mustHaves: MustHave[];
  mustHavesOther: string;
  viewerResponse: string;
  /** Reference links as typed; one field shows at first, up to five. */
  refs: string[];
  guide: string;
  /** "Anything else we should know?" in trial mode, "Your question" in question mode. */
  message: string;
}

export const emptyDraft = (): Draft => ({
  name: '',
  email: '',
  phone: '',
  brand: '',
  site: '',
  agency: false,
  pkg: '',
  objective: '',
  objectiveOther: '',
  integration: '',
  integrationOther: '',
  mustHaves: [],
  mustHavesOther: '',
  viewerResponse: '',
  refs: [''],
  guide: '',
  message: '',
});

// ---------- What the URL asked for ----------

export interface Intent {
  pkg?: Exclude<PackageChoice, '' | 'unsure'>;
  /** From the calculator. */
  videos?: number;
  brands?: number;
  format?: FormatSlug;
  /** A v1 ?service= that named a platform. */
  platform?: string;
  question?: boolean;
}

const FORMAT_NAME: Record<FormatSlug, string> = { founders: 'Founders', events: 'Events', retail: 'Retail' };
const FORMATS = Object.keys(FORMAT_NAME) as FormatSlug[];

/** v1's ?service= values (platforms by slug, old and new names) to today's platform names. */
const PLATFORM_BY_SLUG: Record<string, string> = {
  'instagram-reels': 'Instagram Reels',
  'youtube-shorts': 'YouTube Shorts',
  'facebook-reels': 'Facebook Reels',
  'snapchat-spotlight': 'Snapchat Spotlight',
  'snapchat-spotlights': 'Snapchat Spotlight',
  tiktok: 'TikTok',
  'tiktok-clips': 'TikTok',
};

const slugOf = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const whole = (raw: string | null, max: number): number | undefined => {
  if (!raw || !/^\d{1,4}$/.test(raw.trim())) return undefined;
  const n = Number(raw);
  return n >= 1 && n <= max ? n : undefined;
};

/**
 * ?package=5|10|20|more, ?videos=n, ?brands=n, ?format=founders|events|retail, ?topic=question, and v1's ?plan=startups|d2c (packages 5 and 10) and
 * ?service=<platform or format>. Anything else is ignored. Videos and brands keep within the brief's own limits, so the form never sends what the API refuses.
 */
export function parseIntent(params: URLSearchParams): Intent {
  const it: Intent = {};
  const pkg = params.get('package');
  const plan = params.get('plan');
  if (pkg === '5' || pkg === '10' || pkg === '20' || pkg === 'more') it.pkg = pkg;
  else if (plan === 'startups') it.pkg = '5';
  else if (plan === 'd2c') it.pkg = '10';
  const videos = whole(params.get('videos'), BRIEF_LIMITS.videos);
  if (videos) it.videos = videos;
  const brands = whole(params.get('brands'), BRIEF_LIMITS.brands);
  if (brands) it.brands = brands;
  const format = params.get('format');
  if (format && (FORMATS as string[]).includes(format)) it.format = format as FormatSlug;
  const service = slugOf(params.get('service') ?? '');
  if (service) {
    if ((FORMATS as string[]).includes(service)) it.format ??= service as FormatSlug;
    else if (service === 'startups' && !it.pkg) it.pkg = '5';
    else if (service === 'd2c' && !it.pkg) it.pkg = '10';
    else if (PLATFORM_BY_SLUG[service]) it.platform = PLATFORM_BY_SLUG[service];
  }
  if (params.get('topic') === 'question') it.question = true;
  return it;
}

/** A fingerprint of the intent, so a reload does not undo a choice the visitor changed after arriving (the URL still says what it said). */
export const intentKey = (it: Intent) => JSON.stringify([it.pkg, it.videos, it.brands, it.format, it.platform]);

/** The pill an intent selects. */
export const pillFor = (it: Intent): PackagePick => (it.videos ? CALC : (it.pkg ?? ''));

export const calcLabel = (videos: number) => `${videos} videos (from the calculator)`;

/** The package slug stored in the brief for the calculator's number: a package when it is one, 'more' above 20. */
const packageForVideos = (n: number): PackageChoice => (n === 5 ? '5' : n === 10 ? '10' : n === 20 ? '20' : n > 20 ? 'more' : '');

// ---------- Storage ----------

const KEY = 'kreators-brief';

export interface Saved {
  v: 1;
  mode: Mode;
  step: Step;
  /** The furthest step reached, so Edit from the review can come back. */
  reached: Step;
  draft: Draft;
  intent: string;
}

export function load(): Saved | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Saved>;
    if (s.v !== 1 || !s.draft || typeof s.draft !== 'object') return null;
    const draft = { ...emptyDraft(), ...s.draft };
    if (!Array.isArray(draft.refs) || draft.refs.length === 0) draft.refs = [''];
    draft.refs = draft.refs.slice(0, BRIEF_LIMITS.referenceLinks).map((r) => (typeof r === 'string' ? r : ''));
    if (!Array.isArray(draft.mustHaves)) draft.mustHaves = [];
    const step = (Number(s.step) >= 1 && Number(s.step) <= 6 ? Number(s.step) : 1) as Step;
    const reached = (Number(s.reached) >= step && Number(s.reached) <= 6 ? Number(s.reached) : step) as Step;
    return { v: 1, mode: s.mode === 'question' ? 'question' : 'trial', step, reached, draft, intent: typeof s.intent === 'string' ? s.intent : '' };
  } catch {
    return null;
  }
}

export function save(s: Saved) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Private mode or storage off: the form still works, it just won't survive a reload.
  }
}

export function clear() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

// ---------- Checks ----------

/** The same test the API uses. */
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const nameError = (v: string) => (v.trim() ? '' : 'Please add your name so we know who to reply to.');
export const emailError = (v: string) => {
  const t = v.trim();
  if (!t) return 'Please add your email so we can reply.';
  return EMAIL.test(t) ? '' : 'That email looks incomplete. It should look like name@brand.com.';
};
export const brandError = (v: string) => (v.trim() ? '' : 'Please add the brand this trial is for.');
export const LINK_ERROR = "That link doesn't look complete. It should start with https://";
export const linkError = (v: string) => (!v.trim() || isHttpUrl(v.trim()) ? '' : LINK_ERROR);

// ---------- To the API ----------

/** The package label the lead's `service` column carries: "10 videos", "25 videos (from the calculator)", then the format or platform it came from. */
export function serviceLabel(draft: Draft, intent: Intent): string {
  const pill = draft.pkg === CALC && intent.videos ? calcLabel(intent.videos) : draft.pkg && draft.pkg !== CALC ? PACKAGE_LABELS[draft.pkg] : '';
  return [pill, intent.format ? FORMAT_NAME[intent.format] : '', intent.platform ?? ''].filter(Boolean).join(' · ').slice(0, 60);
}

/** The TrialBrief (v: 1) for the answers; the caller checks it with shared validateBrief before sending. */
export function toBrief(draft: Draft, intent: Intent): TrialBrief {
  const b = emptyBrief();
  const calc = draft.pkg === CALC && intent.videos;
  b.website = draft.site.trim();
  b.isAgency = draft.agency;
  b.package = calc ? packageForVideos(intent.videos!) : draft.pkg === CALC ? '' : draft.pkg;
  b.videos = calc ? intent.videos! : null;
  b.brands = intent.brands ?? null;
  b.objective = draft.objective;
  b.objectiveOther = draft.objective === 'other' ? draft.objectiveOther.trim() : '';
  b.integration = draft.integration;
  b.integrationOther = draft.integration === 'other' ? draft.integrationOther.trim() : '';
  b.mustHaves = [...draft.mustHaves];
  b.mustHavesOther = draft.mustHaves.includes('other') ? draft.mustHavesOther.trim() : '';
  b.viewerResponse = draft.viewerResponse.trim();
  b.referenceLinks = draft.refs.map((r) => r.trim()).filter(Boolean);
  b.brandGuideUrl = draft.guide.trim();
  return b;
}

/** Which step holds a brief field, for a validation answer. */
export const stepOfField = (field: keyof TrialBrief): Step =>
  field === 'objective' || field === 'objectiveOther'
    ? 2
    : field === 'integration' || field === 'integrationOther'
      ? 3
      : field === 'mustHaves' || field === 'mustHavesOther' || field === 'viewerResponse'
        ? 4
        : field === 'referenceLinks' || field === 'brandGuideUrl'
          ? 5
          : 1;

/** Which brief steps have an answer, for the review's "Not yet." lines. */
export const answered = {
  2: (d: Draft) => Boolean(d.objective),
  3: (d: Draft) => Boolean(d.integration),
  4: (d: Draft) => d.mustHaves.length > 0 || Boolean(d.viewerResponse.trim()),
  5: (d: Draft) => d.refs.some((r) => r.trim()) || Boolean(d.guide.trim()) || Boolean(d.message.trim()),
};

export const objectiveText = (d: Draft) =>
  d.objective ? `${OBJECTIVE_LABELS[d.objective]}${d.objective === 'other' && d.objectiveOther.trim() ? `: ${d.objectiveOther.trim()}` : ''}` : '';
export const integrationText = (d: Draft) =>
  d.integration ? `${INTEGRATION_LABELS[d.integration]}${d.integration === 'other' && d.integrationOther.trim() ? `: ${d.integrationOther.trim()}` : ''}` : '';
export const mustHavesText = (d: Draft) =>
  d.mustHaves.map((m) => (m === 'other' && d.mustHavesOther.trim() ? `${MUST_HAVE_LABELS[m]}: ${d.mustHavesOther.trim()}` : MUST_HAVE_LABELS[m])).join(', ');

/** The answers as plain lines, for the email fallback when sending fails. */
export function summary(mode: Mode, draft: Draft, intent: Intent): string {
  const lines: string[] = [];
  const add = (label: string, value: string) => {
    if (value.trim()) lines.push(`${label}: ${value.trim()}`);
  };
  add('Full name', draft.name);
  add('Email address', draft.email);
  add('Phone or WhatsApp', draft.phone);
  if (mode === 'question') {
    if (draft.message.trim()) lines.push('', draft.message.trim());
    return lines.join('\n');
  }
  add('Brand name', draft.brand);
  add('Website or Instagram', draft.site);
  if (draft.agency) lines.push("I'm an agency briefing for a client brand");
  add("Package you're considering", serviceLabel(draft, intent));
  add('What are these videos mainly for?', objectiveText(draft));
  add('How prominently should the brand appear?', integrationText(draft));
  add('What must every video include?', mustHavesText(draft));
  add('After watching, what should people think, feel or do?', draft.viewerResponse);
  const refs = draft.refs.map((r) => r.trim()).filter(Boolean);
  if (refs.length) lines.push('3 to 5 videos that show the direction you want:', ...refs);
  add('Brand guide', draft.guide);
  add('Anything else we should know?', draft.message);
  return lines.join('\n');
}
