/**
 * Text that people type (titles, brands, lead fields, notes) before it is stored. Strips control characters, bidi
 * overrides and the BOM, so a title cannot visually reverse itself; ZWJ and ZWNJ stay (emoji). Admin brief 4.8.
 */
export function cleanText(value: string, { multiline = false }: { multiline?: boolean } = {}): string {
  let s = String(value ?? '')
    .normalize('NFC')
    // C0/C1 controls except tab and newline, bidi embeddings, overrides, isolates and marks, BOM.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F‎‏‪-‮⁦-⁩﻿]/g, '');
  s = multiline ? s.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n') : s.replace(/\s+/g, ' ');
  return s.trim();
}

const VIEW_UNITS: Record<string, number> = { k: 1e3, m: 1e6, l: 1e5, lakh: 1e5, lakhs: 1e5, lac: 1e5, cr: 1e7, crore: 1e7, crores: 1e7 };

/**
 * A view count as people write it: "1.2M", "120K", "1,20,000", "1.5 lakh", "2 cr", "11000000", "12 views".
 * Returns null for a blank value and undefined for something that is not a number.
 */
export function parseViews(value: unknown): number | null | undefined {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
  const s = String(value).trim().toLowerCase().replace(/views?$/, '').trim();
  if (!s) return null;
  const m = /^(\d+(?:[.,]\d+)*)\s*(k|m|l|lakhs?|lac|cr|crores?)?$/.exec(s);
  if (!m) return undefined;
  const unit = m[2] ? VIEW_UNITS[m[2]]! : 1;
  const num = unit === 1 ? Number(m[1]!.replace(/[.,]/g, '')) : Number(m[1]!.replace(/,/g, ''));
  if (!Number.isFinite(num)) return undefined;
  const out = Math.round(num * unit);
  return Number.isSafeInteger(out) ? out : undefined;
}

/**
 * A title suggested from a file name: "bad second hand buying experience.mov" -> "Bad second hand buying experience".
 * Drops the extension, turns _ and . into spaces, removes export words (final, export(ed), v2, copy, 720p, 4k, uhd, h264,
 * h265, hevc, prores) and a trailing "(1)", and sentence-cases an all-lower or all-upper name.
 */
export function titleFromFileName(name: string | null | undefined): string {
  if (!name) return '';
  let t = name.replace(/\.(mov|mp4|m4v|mkv|webm|avi|mts)$/i, '');
  t = t.replace(/_+/g, ' ').replace(/\.+/g, ' ');
  t = t.replace(/\b(final|export(ed)?|v\d{1,2}|copy|\d{3,4}p|4k|uhd|h\s?26[45]|hevc|prores)\b/gi, ' ');
  t = t.replace(/\(\d+\)\s*$/, '').replace(/\s{2,}/g, ' ').trim().replace(/^[-–\s]+|[-–\s]+$/g, '');
  if (t === t.toLowerCase() || t === t.toUpperCase()) t = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  return cleanText(t).slice(0, 140);
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * An upload date as a spreadsheet or a person writes it, to 'YYYY-MM-DD'. Accepts 2026-11-10, 10/11/2026 and 10-11-2026 (day first, as in India),
 * 10 Nov 2026 and Nov 10, 2026. Blank is null; anything else (or a day that does not exist, or before 2000) is undefined.
 */
export function parseUploadDate(value: unknown): string | null | undefined {
  if (value == null) return null;
  const s = String(value).trim().replace(/\s+/g, ' ');
  if (!s) return null;
  let y: number, m: number, d: number;
  let x: RegExpExecArray | null;
  if ((x = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(s))) [y, m, d] = [+x[1]!, +x[2]!, +x[3]!];
  else if ((x = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(s))) [d, m, y] = [+x[1]!, +x[2]!, +x[3]!];
  else if ((x = /^(\d{1,2})(?:st|nd|rd|th)? ([a-z]{3})[a-z]*,? (\d{4})$/i.exec(s))) [d, m, y] = [+x[1]!, MONTHS.indexOf(x[2]!.toLowerCase()) + 1, +x[3]!];
  else if ((x = /^([a-z]{3})[a-z]* (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})$/i.exec(s))) [m, d, y] = [MONTHS.indexOf(x[1]!.toLowerCase()) + 1, +x[2]!, +x[3]!];
  else return undefined;
  if (y < 2000 || m < 1 || m > 12 || d < 1) return undefined;
  const iso = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10) === iso ? iso : undefined;
}

/** True when a 'YYYY-MM-DD' day is after tomorrow (the API refuses those; 36 h of slack covers every time zone). */
export function isFutureDay(iso: string, now = Date.now()): boolean {
  return Date.parse(`${iso}T00:00:00Z`) > now + 36 * 3600 * 1000;
}
