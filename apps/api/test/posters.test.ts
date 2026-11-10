import { describe, expect, it } from 'vitest';
import { posterSha, sniffImage } from '../src/posters';

const bytes = (...xs: (number | string)[]) => new Uint8Array(xs.flatMap((x) => (typeof x === 'string' ? [...x].map((c) => c.charCodeAt(0)) : [x])));

describe('poster magic bytes (admin brief 4.5)', () => {
  it('JPEG, PNG and WebP pass by their first bytes, whatever was declared', () => {
    expect(sniffImage(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 'JFIF'))).toBe('image/jpeg');
    expect(sniffImage(bytes(0x89, 'PNG', 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 'IHDR'))).toBe('image/png');
    expect(sniffImage(bytes('RIFF', 0x24, 0, 0, 0, 'WEBPVP8 '))).toBe('image/webp');
  });

  it.each([
    ['SVG', bytes('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')],
    ['GIF', bytes('GIF89a', 1, 0, 1, 0)],
    ['HTML', bytes('<!doctype html><script>alert(1)</script>')],
    ['RIFF but not WebP', bytes('RIFF', 0, 0, 0, 0, 'WAVEfmt ')],
    ['a PNG signature cut short', bytes(0x89, 'PNG')],
    ['nothing', bytes()],
  ])('%s is refused', (_, b) => {
    expect(sniffImage(b)).toBeNull();
  });

  it('the version in the address is the first 16 hex characters of SHA-256', async () => {
    expect(await posterSha(bytes('abc'))).toBe('ba7816bf8f01cfea');
  });
});
