import { describe, expect, it } from 'vitest';
import { cleanText, parseViews, titleFromFileName } from './text.ts';

describe('cleanText', () => {
  it('strips controls, bidi overrides and the BOM; keeps ZWJ emoji', () => {
    expect(cleanText('﻿  Hot\u0007 takes‮⁦ on  Valentine\'s\n')).toBe("Hot takes on Valentine's");
    expect(cleanText('👩‍💻 desk')).toBe('👩‍💻 desk');
    expect(cleanText('é')).toBe('é');
  });
  it('multiline keeps newlines, at most one blank line', () => {
    expect(cleanText('a  b\r\n\r\n\r\n\r\nc \n d', { multiline: true })).toBe('a b\n\nc\nd');
  });
});

describe('parseViews', () => {
  it.each([
    ['1.2M', 1_200_000],
    ['120K', 120_000],
    ['1,20,000', 120_000],
    ['1.5 lakh', 150_000],
    ['2 cr', 20_000_000],
    ['11000000', 11_000_000],
    ['12 views', 12],
    ['60k', 60_000],
    [42, 42],
  ])('%s -> %d', (input, n) => {
    expect(parseViews(input)).toBe(n);
  });
  it('blank is null, nonsense is undefined', () => {
    expect(parseViews('')).toBeNull();
    expect(parseViews(null)).toBeNull();
    expect(parseViews('lots')).toBeUndefined();
    expect(parseViews(-3)).toBeUndefined();
    expect(parseViews('1e30')).toBeUndefined();
  });
});

describe('titleFromFileName', () => {
  it.each([
    ['bad second hand buying experience.mov', 'Bad second hand buying experience'],
    ['CIRCLESTORE_GOA_TRIP_FINAL_v2_1080p.mp4', 'Circlestore goa trip'],
    ['Rode Show - Bangalore (1).mov', 'Rode Show - Bangalore'],
    ['Interview.Export.H264.4K.mp4', 'Interview'],
    ['', ''],
  ])('%s -> %s', (name, title) => {
    expect(titleFromFileName(name)).toBe(title);
  });
});

import { parseUploadDate } from './text.ts';
import { describe as d2, expect as e2, it as i2 } from 'vitest';

d2('parseUploadDate', () => {
  i2('reads the common ways to write a day', () => {
    for (const s of ['2026-11-10', '10/11/2026', '10-11-2026', '10.11.2026', '10 Nov 2026', '10th November 2026', 'Nov 10, 2026', ' 2026/11/10 ']) e2(parseUploadDate(s)).toBe('2026-11-10');
  });
  i2('blank is null; nonsense, impossible days and old years are undefined', () => {
    e2(parseUploadDate('')).toBeNull();
    e2(parseUploadDate(null)).toBeNull();
    for (const s of ['soon', '31/02/2026', '2026-13-01', '1999-01-01', '10/11/26']) e2(parseUploadDate(s)).toBeUndefined();
  });
  i2('the import reads an Upload date column', async () => {
    const { parseImport } = await import('./importLinks.ts');
    const r = parseImport('Title,MEGA link,Upload date\nHello,https://mega.nz/file/NmU3lZjR#gPK2sRN8W0g0c69iQkFL4jsnt5dSZziHM9YjZMhEXxw,05/11/2026\nBad,https://mega.nz/file/AbCdEfGh#gPK2sRN8W0g0c69iQkFL4jsnt5dSZziHM9YjZMhEXxw,soon');
    e2(r.rows.map((x) => x.uploadDate)).toEqual(['2026-11-05', null]);
    e2(r.rows[1]!.notes.join(' ')).toMatch(/not a date/);
  });
});
