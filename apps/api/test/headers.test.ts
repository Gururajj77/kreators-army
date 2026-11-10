import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CSP, NOINDEX, PAGE_HEADERS } from '../src/headers';

const HEADERS_FILE = path.resolve(__dirname, '../../web/public/_headers');

describe('CSP (V2-SPEC 2.13 item 8, 2.15)', () => {
  const text = fs.readFileSync(HEADERS_FILE, 'utf8');
  const fileCsp = /^\s*Content-Security-Policy:\s*(.+)$/m.exec(text)?.[1]?.trim();

  it('headers.ts and public/_headers carry the same CSP', () => {
    expect(fileCsp).toBe(CSP);
    expect(PAGE_HEADERS['Content-Security-Policy']).toBe(CSP);
  });

  it('frame-src adds https://mega.nz and nothing else changed from v1', () => {
    const frame = CSP.split('; ').find((d) => d.startsWith('frame-src '));
    expect(frame).toBe('frame-src https://www.youtube-nocookie.com https://*.wave.video https://mega.nz');
    const v1 = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https:; media-src 'self'; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://*.wave.video; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
    expect(CSP).toBe(v1.replace('https://*.wave.video;', 'https://*.wave.video https://mega.nz;'));
  });

  it('every other page header in _headers matches headers.ts', () => {
    for (const [k, v] of Object.entries(PAGE_HEADERS)) expect(text, k).toContain(`${k}: ${v}`);
    expect(NOINDEX).toBe('noindex, nofollow, noarchive');
  });
});
