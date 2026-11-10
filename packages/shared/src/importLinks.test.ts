import { describe, expect, it } from 'vitest';
import type { MegaInspect } from './admin.ts';
import { extractLinks, importStatusOf, isDefaultSelected, pairInOrder, parseImport, splitDelimited, type ParsedImport } from './importLinks.ts';

// The nine layouts of the admin brief's proof (proof/import/run.mjs). Synthetic links only.
const K = (c: string) => c.repeat(43);
const FK = (c: string) => c.repeat(22);
const M = (h: string, c = 'a') => `https://mega.nz/file/${h}#${K(c)}`;

const cases: Record<string, string> = {
  'one per line, three links each': [
    `${M('AAAAAAA1')} https://www.instagram.com/reel/CxYz123abc/?igsh=MWQ1 https://youtube.com/shorts/dQw4w9WgXcQ?si=abc`,
    `${M('AAAAAAA2')}\thttps://www.instagram.com/kreators.army/reel/DeF456ghi/\thttps://youtu.be/9bZkp7q19f0`,
    `Bad buying experience - ${M('AAAAAAA3')}`,
  ].join('\n'),

  'Excel CSV export with header, BOM, sep line and a quoted embed code': [
    '﻿sep=,',
    'Title,Brand,MEGA link,Instagram,YouTube,Views,Category',
    `"Hot takes, Valentine's",BrandingBum,"<iframe width=""640"" height=""360"" frameborder=""0"" src=""https://mega.nz/embed/AAAAAAA4#${K('b')}!1a1m"" allowfullscreen allow=""autoplay;""></iframe>",https://www.instagram.com/p/GhI789jkl/,,"1,10,000",Lifestyle`,
    `,CircleStore.in,${M('AAAAAAA5')},,https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=4s,1.2M,`,
    `Top 5 turnoffs,Waxys.in,,https://www.instagram.com/reel/JkL012mno/,,70K,`,
  ].join('\r\n'),

  'Google Sheets paste (tabs), headers in another order': ['IG\tName\tMega\tviews', `https://instagram.com/reels/MnO345pqr/\tNew phone vs Goa trip\t${M('AAAAAAA6')}\t60k`].join('\n'),

  'JSON array': JSON.stringify([{ title: 'RØDE show', mega: M('AAAAAAA7'), youtube: 'https://m.youtube.com/watch?v=9bZkp7q19f0' }, { mega: `mega.nz/file/AAAAAAA8#${K('c')}` }]),

  'blocks: title, then links on their own lines': [
    'FyndFlow street interview',
    M('AAAAAAA9'),
    'https://www.instagram.com/reel/PqR678stu/',
    '',
    'https://www.instagram.com/reel/StU901vwx/',
    'Ansh Mehra meetup',
    M('AAAAAA10'),
    'https://youtu.be/kJQP7kiw5Fk',
  ].join('\n'),

  'blocks with no blank lines': ['Video one', M('AAAAAA11'), 'https://www.instagram.com/reel/AaA111bbb/', 'Video two', M('AAAAAA12'), 'https://www.instagram.com/reel/CcC222ddd/'].join('\n'),

  'folder link, legacy links, other hosts, numbering': [
    `1. https://mega.nz/folder/FFFFFFF1#${FK('f')}`,
    `2) https://mega.nz/folder/FFFFFFF2#${FK('g')}/file/NNNNNNN1`,
    `- https://mega.nz/#!AAAAAA13!${K('d')}`,
    `• https://www.mega.io/embed/AAAAAA14#${K('e')}`,
    'https://drive.google.com/file/d/xyz/view',
    'https://www.instagram.com/kreators.army/',
  ].join('\n'),

  'problems: no key, key sent separately, bad key, duplicate': [
    'https://mega.nz/file/AAAAAA15',
    `https://mega.nz/file/AAAAAA16 key: ${K('h')}`,
    'https://mega.nz/file/AAAAAA17#tooShort',
    `${M('AAAAAAA1')} https://www.instagram.com/reel/ZzZ999yyy/`,
    'https://www.instagram.com/reel/YyY888xxx/',
    `again: https://mega.nz/file/AAAAAA16#${K('h')}`,
  ].join('\n'),

  'two lists, one after the other': [M('AAAAAA18'), M('AAAAAA19'), M('AAAAAA20'), '', 'https://www.instagram.com/reel/Aaa111aaa/', 'https://www.instagram.com/reel/Bbb222bbb/', 'https://www.instagram.com/reel/Ccc333ccc/'].join('\n'),
};

/** The same one-line summary as proof/import/run.mjs, so the expectations below are its run-output.txt. */
function summary(r: ParsedImport): string[] {
  const lines = [`[format: ${r.format}]`];
  for (const row of r.rows) {
    const status = row.status === 'ok' || row.status === 'folder' ? (row.status === 'folder' ? 'folder' : 'ok') : row.status;
    const megaBit = row.megaKind && row.status !== 'invalid' ? `${row.megaKind}:${row.handle ?? row.mega?.split('/folder/')[1]?.slice(0, 8) ?? '-'}` : 'no MEGA';
    const bits = [
      row.rowId,
      `line ${row.line}`,
      status,
      row.status === 'no-key' ? `${row.megaKind}:-` : megaBit,
      row.instagram ? `IG ${row.instagram.replace('https://www.instagram.com', '')}` : '',
      row.youtube ? `YT ${row.youtube.replace('https://www.youtube.com', '')}` : '',
      row.title ? `title "${row.title}"` : '',
      row.brand ? `brand "${row.brand}"` : '',
      row.views ? `views ${row.views}` : '',
      row.duplicateOf ? `dup of ${row.duplicateOf}` : '',
      row.notes.length ? `notes: ${row.notes.join('; ')}` : '',
    ].filter(Boolean);
    lines.push(bits.join(' | '));
  }
  for (const ig of r.ignored) lines.push(`ignored line ${ig.line}: ${ig.link} (${ig.reason})`);
  if (Object.keys(r.pairable).length) lines.push(`pairable in order: ${JSON.stringify(r.pairable)}`);
  return lines;
}

const expected: Record<string, string[]> = {
  'one per line, three links each': [
    '[format: line]',
    'r1 | line 1 | ok | file:AAAAAAA1 | IG /reel/CxYz123abc/ | YT /shorts/dQw4w9WgXcQ',
    'r2 | line 2 | ok | file:AAAAAAA2 | IG /reel/DeF456ghi/ | YT /watch?v=9bZkp7q19f0',
    'r3 | line 3 | ok | file:AAAAAAA3 | title "Bad buying experience"',
  ],
  'Excel CSV export with header, BOM, sep line and a quoted embed code': [
    '[format: table]',
    `r1 | line 2 | ok | file:AAAAAAA4 | IG /p/GhI789jkl/ | title "Hot takes, Valentine's" | brand "BrandingBum" | views 110000`,
    'r2 | line 3 | ok | file:AAAAAAA5 | YT /watch?v=dQw4w9WgXcQ | brand "CircleStore.in" | views 1200000',
    'r3 | line 4 | needs-mega | no MEGA | IG /reel/JkL012mno/ | title "Top 5 turnoffs" | brand "Waxys.in" | views 70000',
  ],
  'Google Sheets paste (tabs), headers in another order': ['[format: table]', 'r1 | line 2 | ok | file:AAAAAAA6 | IG /reel/MnO345pqr/ | title "New phone vs Goa trip" | views 60000'],
  'JSON array': ['[format: json]', 'r1 | line 2 | ok | file:AAAAAAA7 | YT /watch?v=9bZkp7q19f0 | title "RØDE show"', 'r2 | line 3 | ok | file:AAAAAAA8'],
  'blocks: title, then links on their own lines': [
    '[format: block]',
    'r1 | line 2 | ok | file:AAAAAAA9 | IG /reel/PqR678stu/ | title "FyndFlow street interview"',
    'r2 | line 7 | ok | file:AAAAAA10 | IG /reel/StU901vwx/ | YT /watch?v=kJQP7kiw5Fk | title "Ansh Mehra meetup"',
  ],
  'blocks with no blank lines': ['[format: block]', 'r1 | line 2 | ok | file:AAAAAA11 | IG /reel/AaA111bbb/ | title "Video one"', 'r2 | line 5 | ok | file:AAAAAA12 | IG /reel/CcC222ddd/ | title "Video two"'],
  'folder link, legacy links, other hosts, numbering': [
    '[format: line]',
    'r1 | line 1 | folder | folder:FFFFFFF1',
    'r2 | line 2 | ok | folder-file:NNNNNNN1',
    'r3 | line 3 | ok | file:AAAAAA13',
    'r4 | line 4 | ok | file:AAAAAA14',
    'ignored line 5: https://drive.google.com/file/d/xyz/view (not MEGA, Instagram or YouTube (drive.google.com))',
    'ignored line 6: https://www.instagram.com/kreators.army/ (Instagram link that is not a post or reel)',
  ],
  'problems: no key, key sent separately, bad key, duplicate': [
    '[format: line]',
    'r1 | line 1 | no-key | file:-',
    'r2 | line 2 | ok | file:AAAAAA16',
    'r3 | line 3 | invalid | no MEGA',
    'r4 | line 4 | ok | file:AAAAAAA1 | IG /reel/ZzZ999yyy/',
    'r5 | line 5 | needs-mega | no MEGA | IG /reel/YyY888xxx/',
    'r6 | line 6 | duplicate-in-file | file:AAAAAA16 | title "again" | dup of r2',
  ],
  'two lists, one after the other': [
    '[format: block]',
    'r1 | line 1 | ok | file:AAAAAA18',
    'r2 | line 2 | ok | file:AAAAAA19',
    'r3 | line 3 | ok | file:AAAAAA20',
    'r4 | line 5 | needs-mega | no MEGA | IG /reel/Aaa111aaa/',
    'r5 | line 6 | needs-mega | no MEGA | IG /reel/Bbb222bbb/',
    'r6 | line 7 | needs-mega | no MEGA | IG /reel/Ccc333ccc/',
    'pairable in order: {"instagram":3}',
  ],
};

describe('parseImport: the nine layouts (same results as the proof)', () => {
  it.each(Object.keys(cases))('%s', (name) => {
    expect(summary(parseImport(cases[name]!))).toEqual(expected[name]);
  });

  it('marks where a title came from, keeps canonical links and leaves no key in a keyless row', () => {
    const r = parseImport(cases['problems: no key, key sent separately, bad key, duplicate']!);
    expect(r.rows[0]).toMatchObject({ status: 'no-key', mega: 'https://mega.nz/file/AAAAAA15', handle: null, megaKind: 'file' });
    expect(r.rows[1]).toMatchObject({ mega: `https://mega.nz/file/AAAAAA16#${K('h')}`, handle: 'AAAAAA16', titleFrom: 'none' });
    expect(r.rows[5]).toMatchObject({ title: 'again', titleFrom: 'text' });
    const t = parseImport(cases['Excel CSV export with header, BOM, sep line and a quoted embed code']!);
    expect(t.rows[0]).toMatchObject({ titleFrom: 'column', category: 'Lifestyle', mega: `https://mega.nz/file/AAAAAAA4#${K('b')}` });
  });
});

describe('parseImport: real-file shapes', () => {
  it('links joined by commas with no spaces are separate links', () => {
    const r = parseImport(`Goa trip,${M('AAAAAA21')},https://www.instagram.com/reel/GoA111aaa/,https://youtu.be/9bZkp7q19f0`);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0]).toMatchObject({ handle: 'AAAAAA21', instagram: 'https://www.instagram.com/reel/GoA111aaa/', youtube: 'https://www.youtube.com/watch?v=9bZkp7q19f0', title: 'Goa trip' });
  });

  it('a keyless folder-file link joins a 22-character key on its line', () => {
    const r = parseImport(`https://mega.nz/folder/FFFFFFF2#/file/NNNNNNN1 key ${FK('g')}`);
    expect(r.rows[0]).toMatchObject({ status: 'ok', megaKind: 'folder-file', handle: 'NNNNNNN1', mega: `https://mega.nz/folder/FFFFFFF2#${FK('g')}/file/NNNNNNN1` });
  });

  it('aspect words and odd views', () => {
    const r = parseImport(['title,mega,views,orientation', `A,${M('AAAAAA22')},lots,16:9`, `B,${M('AAAAAA23')},1.5 lakh,Portrait`].join('\n'));
    expect(r.rows.map((x) => [x.views, x.aspect])).toEqual([
      [0, 'landscape'],
      [150000, 'vertical'],
    ]);
    expect(r.rows[0]!.notes).toEqual(['views "lots" is not a number; left at 0']);
  });

  it('several MEGA links on one line become rows; unmatched social links become notes', () => {
    const r = parseImport(`${M('AAAAAA24')} ${M('AAAAAA25')} https://www.instagram.com/reel/OnE111aaa/`);
    expect(r.rows.map((x) => x.handle)).toEqual(['AAAAAA24', 'AAAAAA25']);
    expect(r.rows[0]!.notes[0]).toMatch(/could not tell which video/);
  });

  it('an empty file has no rows', () => {
    expect(parseImport('').rows).toEqual([]);
    expect(parseImport('\n\n').rows).toEqual([]);
  });
});

describe('pairInOrder', () => {
  it('pairs the N Instagram links with the N MEGA links in order', () => {
    const r = parseImport(cases['two lists, one after the other']!);
    const paired = pairInOrder(r.rows, 'instagram');
    expect(paired.map((x) => [x.handle, x.instagram])).toEqual([
      ['AAAAAA18', 'https://www.instagram.com/reel/Aaa111aaa/'],
      ['AAAAAA19', 'https://www.instagram.com/reel/Bbb222bbb/'],
      ['AAAAAA20', 'https://www.instagram.com/reel/Ccc333ccc/'],
    ]);
    expect(pairInOrder(r.rows, 'youtube')).toBe(r.rows);
  });
});

describe('helpers', () => {
  it('extractLinks keeps the text around the links', () => {
    expect(extractLinks(`1. Street interview - mega: ${M('AAAAAA26')}`)).toEqual({ urls: [M('AAAAAA26')], rest: 'Street interview' });
  });
  it('splitDelimited follows RFC 4180', () => {
    expect(splitDelimited('a,"b,""c""",d\n"x\ny",z', ',')).toEqual([
      ['a', 'b,"c"', 'd'],
      ['x\ny', 'z'],
    ]);
  });
});

describe('importStatusOf and the default selection (admin brief 3.5, V2-SPEC 2.8)', () => {
  const ok = (over: Partial<Extract<MegaInspect, { ok: true }>>): MegaInspect =>
    ({ ok: true, grade: 'ready', playable: true, ...over }) as MegaInspect;
  it.each([
    [ok({}), 'ready', true],
    [ok({ grade: 'heavy' }), 'heavy', true],
    [ok({ grade: 'too-heavy' }), 'too-heavy', true],
    [ok({ grade: 'unknown' }), 'unknown-quality', true],
    [ok({ grade: 'too-heavy', playable: false }), 'unplayable', true],
    [{ ok: false, problem: 'busy', message: '' } as MegaInspect, 'busy', false],
    [{ ok: false, problem: 'over-quota', message: '' } as MegaInspect, 'busy', false],
    [{ ok: false, problem: 'not-found', message: '' } as MegaInspect, 'unreachable', false],
    [{ ok: false, problem: 'bad-key', message: '' } as MegaInspect, 'unreachable', false],
    [{ ok: false, problem: 'not-video', message: '' } as MegaInspect, 'not-video', false],
    [{ ok: false, problem: 'no-key', message: '' } as MegaInspect, 'no-key', false],
  ] as const)('%#: %s', (check, status, ticked) => {
    expect(importStatusOf(check)).toBe(status);
    expect(isDefaultSelected(importStatusOf(check))).toBe(ticked);
  });
});
