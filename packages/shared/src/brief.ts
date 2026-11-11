/**
 * The guided trial brief on /contact (content 5.2, admin brief 2.6): the option slugs, their display labels, and the one
 * validator the form, the API and the admin inbox share. An unknown slug is an error, never silently dropped.
 */
import { cleanText } from './text.ts';

export const PACKAGE_CHOICES = ['', '5', '10', '20', 'more', 'unsure'] as const;
export const OBJECTIVES = ['', 'organic', 'organic_awareness', 'paid', 'other'] as const;
export const INTEGRATIONS = ['', 'minimal', 'subtle', 'product_throughout', 'intro_outro', 'creator_holding', 'other'] as const;
export const MUST_HAVES = ['product_shots', 'logo', 'brand_mention', 'cta', 'people_trying', 'intro_hook', 'closing_statement', 'disclaimer', 'other'] as const;

export type PackageChoice = (typeof PACKAGE_CHOICES)[number];
export type Objective = (typeof OBJECTIVES)[number];
export type Integration = (typeof INTEGRATIONS)[number];
export type MustHave = (typeof MUST_HAVES)[number];

/** Display labels, verbatim from content 5.2, in the order the form shows them. '' means "not answered" and has no label. */
export const PACKAGE_LABELS: Record<Exclude<PackageChoice, ''>, string> = {
  '5': '5 videos',
  '10': '10 videos',
  '20': '20 videos',
  more: 'More than 20',
  unsure: 'Not sure yet',
};
export const OBJECTIVE_LABELS: Record<Exclude<Objective, ''>, string> = {
  organic: 'Organic content (value or entertainment first)',
  organic_awareness: 'Organic content with subtle brand awareness',
  paid: 'Paid ads or performance marketing',
  other: 'Something else',
};
export const INTEGRATION_LABELS: Record<Exclude<Integration, ''>, string> = {
  minimal: 'Minimal (story first)',
  subtle: 'Subtle branding throughout',
  product_throughout: 'Product visible throughout',
  intro_outro: 'Product only in the intro or outro',
  creator_holding: 'Creator holding the product',
  other: 'Something else',
};
export const MUST_HAVE_LABELS: Record<MustHave, string> = {
  product_shots: 'Product shots',
  logo: 'Logo visible',
  brand_mention: 'Brand mention',
  cta: 'Call to action',
  people_trying: 'People trying the product',
  intro_hook: 'Intro hook',
  closing_statement: 'Closing statement',
  disclaimer: 'Disclaimer',
  other: 'Something else',
};

export interface BriefOption<T extends string> {
  value: T;
  label: string;
}
const options = <T extends string>(labels: Record<T, string>): BriefOption<T>[] => (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));

/** The choices as the form lists them, without the '' (unanswered) value. */
export const PACKAGE_OPTIONS = /* @__PURE__ */ options(PACKAGE_LABELS);
export const OBJECTIVE_OPTIONS = /* @__PURE__ */ options(OBJECTIVE_LABELS);
export const INTEGRATION_OPTIONS = /* @__PURE__ */ options(INTEGRATION_LABELS);
export const MUST_HAVE_OPTIONS = /* @__PURE__ */ options(MUST_HAVE_LABELS);

/** Stored as JSON in leads.brief, with v: 1. */
export interface TrialBrief {
  v: 1;
  /** At most 300 characters, free text ("brand.com or @brand"). */
  website: string;
  isAgency: boolean;
  package: PackageChoice;
  /** 1 to 1000, from ?videos= (the calculator). */
  videos: number | null;
  /** 1 to 10, from ?brands=. */
  brands: number | null;
  objective: Objective;
  /** At most 200 characters. */
  objectiveOther: string;
  integration: Integration;
  integrationOther: string;
  /** Unique. */
  mustHaves: MustHave[];
  mustHavesOther: string;
  /** At most 1000 characters. */
  viewerResponse: string;
  /** At most 5, each an http(s) URL of at most 500 characters. */
  referenceLinks: string[];
  /** '' or an http(s) URL of at most 500 characters. */
  brandGuideUrl: string;
}

export function emptyBrief(): TrialBrief {
  return {
    v: 1,
    website: '',
    isAgency: false,
    package: '',
    videos: null,
    brands: null,
    objective: '',
    objectiveOther: '',
    integration: '',
    integrationOther: '',
    mustHaves: [],
    mustHavesOther: '',
    viewerResponse: '',
    referenceLinks: [],
    brandGuideUrl: '',
  };
}

export const BRIEF_LIMITS = { website: 300, other: 200, viewerResponse: 1000, referenceLinks: 5, url: 500, videos: 1000, brands: 10 } as const;

export type BriefValidation = { ok: true; brief: TrialBrief } | { ok: false; field: keyof TrialBrief; error: string };

/** True for an http(s) address that `new URL()` accepts, at most 500 characters. */
export function isHttpUrl(value: string, max: number = BRIEF_LIMITS.url): boolean {
  if (!value || value.length > max) return false;
  try {
    const u = new URL(value);
    return (u.protocol === 'https:' || u.protocol === 'http:') && !!u.hostname;
  } catch {
    return false;
  }
}

/**
 * Checks and cleans a brief (from the form or a request body). Missing fields take their empty value; a wrong type, an
 * unknown slug, a text over its limit or a link that is not http(s) is an error naming the field.
 */
export function validateBrief(input: unknown): BriefValidation {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, field: 'v', error: 'The brief must be an object.' };
  const b = input as Record<string, unknown>;
  const out = emptyBrief();
  const fail = (field: keyof TrialBrief, error: string): BriefValidation => ({ ok: false, field, error });

  if (b.v !== undefined && b.v !== 1) return fail('v', 'Unknown brief version.');

  const text = (field: 'website' | 'objectiveOther' | 'integrationOther' | 'mustHavesOther' | 'viewerResponse', max: number, multiline = false): string | BriefValidation => {
    const value = b[field];
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string') return fail(field, 'Must be text.');
    const clean = cleanText(value, { multiline });
    if (clean.length > max) return fail(field, `At most ${max} characters.`);
    return clean;
  };
  const slug = <T extends string>(field: 'package' | 'objective' | 'integration', allowed: readonly T[]): T | BriefValidation => {
    const value = b[field];
    if (value === undefined || value === null) return '' as T;
    if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) return fail(field, 'Not one of the options.');
    return value as T;
  };
  const count = (field: 'videos' | 'brands', max: number): number | null | BriefValidation => {
    const value = b[field];
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > max) return fail(field, `A whole number from 1 to ${max}.`);
    return value;
  };
  const isFail = (x: unknown): x is BriefValidation => typeof x === 'object' && x !== null && 'ok' in x;

  for (const [field, max, multiline] of [
    ['website', BRIEF_LIMITS.website, false],
    ['objectiveOther', BRIEF_LIMITS.other, false],
    ['integrationOther', BRIEF_LIMITS.other, false],
    ['mustHavesOther', BRIEF_LIMITS.other, false],
    ['viewerResponse', BRIEF_LIMITS.viewerResponse, true],
  ] as const) {
    const r = text(field, max, multiline);
    if (isFail(r)) return r;
    out[field] = r;
  }

  const pkg = slug('package', PACKAGE_CHOICES);
  if (isFail(pkg)) return pkg;
  out.package = pkg;
  const objective = slug('objective', OBJECTIVES);
  if (isFail(objective)) return objective;
  out.objective = objective;
  const integration = slug('integration', INTEGRATIONS);
  if (isFail(integration)) return integration;
  out.integration = integration;

  const videos = count('videos', BRIEF_LIMITS.videos);
  if (isFail(videos)) return videos;
  out.videos = videos;
  const brands = count('brands', BRIEF_LIMITS.brands);
  if (isFail(brands)) return brands;
  out.brands = brands;

  if (b.isAgency !== undefined && b.isAgency !== null && typeof b.isAgency !== 'boolean') return fail('isAgency', 'Must be true or false.');
  out.isAgency = b.isAgency === true;

  if (b.mustHaves !== undefined && b.mustHaves !== null) {
    if (!Array.isArray(b.mustHaves)) return fail('mustHaves', 'Must be a list.');
    for (const m of b.mustHaves) if (typeof m !== 'string' || !(MUST_HAVES as readonly string[]).includes(m)) return fail('mustHaves', 'Not one of the options.');
    out.mustHaves = MUST_HAVES.filter((m) => (b.mustHaves as string[]).includes(m));
  }

  if (b.referenceLinks !== undefined && b.referenceLinks !== null) {
    if (!Array.isArray(b.referenceLinks)) return fail('referenceLinks', 'Must be a list.');
    const links = (b.referenceLinks as unknown[]).map((l) => (typeof l === 'string' ? l.trim() : l)).filter((l) => l !== '');
    if (links.length > BRIEF_LIMITS.referenceLinks) return fail('referenceLinks', `At most ${BRIEF_LIMITS.referenceLinks} links.`);
    for (const l of links) if (typeof l !== 'string' || !isHttpUrl(l)) return fail('referenceLinks', "That link doesn't look complete. It should start with https://");
    out.referenceLinks = links as string[];
  }

  if (b.brandGuideUrl !== undefined && b.brandGuideUrl !== null && b.brandGuideUrl !== '') {
    if (typeof b.brandGuideUrl !== 'string' || !isHttpUrl(b.brandGuideUrl.trim())) return fail('brandGuideUrl', "That link doesn't look complete. It should start with https://");
    out.brandGuideUrl = b.brandGuideUrl.trim();
  }
  return { ok: true, brief: out };
}

/** (form7) The guided brief's step titles, for the form and the inbox's "Stopped at step N: <title>". 6 is the review. */
export const BRIEF_STEP_TITLES: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'You and your brand',
  2: 'The objective',
  3: 'Brand integration',
  4: 'Must-haves and the response',
  5: 'References and brand guide',
  6: 'Check your brief',
};

/** The email test the form and the API share. */
export const LEAD_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** (form7) A phone number someone could call: digits with optional +, spaces, dots, dashes and brackets, 7 to 15 digits, at most 40 characters. */
export function isPhone(value: string): boolean {
  const v = value.trim();
  if (!v || v.length > 40 || !/^\+?[\d\s().-]+$/.test(v)) return false;
  const digits = v.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15;
}

/** (form7) A form session's draft id: 16 to 64 URL-safe characters (the form makes a random UUID). */
export const DRAFT_ID = /^[A-Za-z0-9_-]{16,64}$/;

/** The label of a stored slug, for the inbox and the CSV ('' gives ''). */
export function briefLabel(field: 'package' | 'objective' | 'integration' | 'mustHave', slug: string): string {
  const table: Record<string, string> =
    field === 'package' ? PACKAGE_LABELS : field === 'objective' ? OBJECTIVE_LABELS : field === 'integration' ? INTEGRATION_LABELS : MUST_HAVE_LABELS;
  return table[slug] ?? '';
}
