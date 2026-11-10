import { describe, expect, it } from 'vitest';
import { briefLabel, emptyBrief, MUST_HAVE_OPTIONS, OBJECTIVE_OPTIONS, PACKAGE_OPTIONS, validateBrief } from './brief.ts';

describe('brief options', () => {
  it('lists the labels in the form order, without the unanswered value', () => {
    expect(PACKAGE_OPTIONS.map((o) => o.label)).toEqual(['5 videos', '10 videos', '20 videos', 'More than 20', 'Not sure yet']);
    expect(OBJECTIVE_OPTIONS.map((o) => o.value)).toEqual(['organic', 'organic_awareness', 'paid', 'other']);
    expect(MUST_HAVE_OPTIONS).toHaveLength(9);
    expect(briefLabel('integration', 'creator_holding')).toBe('Creator holding the product');
    expect(briefLabel('objective', '')).toBe('');
  });
});

describe('validateBrief', () => {
  it('fills missing fields and cleans text', () => {
    const r = validateBrief({ v: 1, website: '  brand.com‮ ', objective: 'paid', mustHaves: ['logo', 'cta', 'logo'], referenceLinks: ['https://www.instagram.com/reel/x/', ''] });
    expect(r).toEqual({ ok: true, brief: { ...emptyBrief(), website: 'brand.com', objective: 'paid', mustHaves: ['logo', 'cta'], referenceLinks: ['https://www.instagram.com/reel/x/'] } });
  });
  it('accepts a full brief', () => {
    const full = { ...emptyBrief(), isAgency: true, package: '10', videos: 25, brands: 2, objective: 'other', objectiveOther: 'Launch', integration: 'subtle', mustHaves: ['product_shots'], viewerResponse: 'Buy it\n\nnow', brandGuideUrl: 'https://drive.google.com/x' };
    expect(validateBrief(full)).toEqual({ ok: true, brief: full });
  });
  it.each([
    [{ objective: 'viral' }, 'objective'],
    [{ package: '15' }, 'package'],
    [{ integration: 3 }, 'integration'],
    [{ mustHaves: ['logo', 'dance'] }, 'mustHaves'],
    [{ mustHaves: 'logo' }, 'mustHaves'],
    [{ videos: 0 }, 'videos'],
    [{ videos: 1001 }, 'videos'],
    [{ brands: 11 }, 'brands'],
    [{ brands: 1.5 }, 'brands'],
    [{ website: 'x'.repeat(301) }, 'website'],
    [{ viewerResponse: 'x'.repeat(1001) }, 'viewerResponse'],
    [{ referenceLinks: ['javascript:alert(1)'] }, 'referenceLinks'],
    [{ referenceLinks: ['https://a.example', 'https://b.example', 'https://c.example', 'https://d.example', 'https://e.example', 'https://f.example'] }, 'referenceLinks'],
    [{ brandGuideUrl: 'ftp://x.example/guide.pdf' }, 'brandGuideUrl'],
    [{ isAgency: 'yes' }, 'isAgency'],
    [{ v: 2 }, 'v'],
  ])('%j is refused at %s', (input, field) => {
    const r = validateBrief(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.field).toBe(field);
  });
  it('refuses something that is not an object', () => {
    expect(validateBrief(null).ok).toBe(false);
    expect(validateBrief([]).ok).toBe(false);
  });
});
