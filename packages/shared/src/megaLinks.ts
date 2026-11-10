/**
 * MEGA links in every form MEGA hands out (admin brief 3.2), parsed into a handle and key without any network call. Used by
 * the admin's MEGA field, the bulk import, the API (which stores only the canonical form) and the stream's legacy secret.
 *
 *   https://mega.nz/file/<h8>#<k43>                    file          (also /embed/<h8>#<k43>!flags, /#!<h8>!<k43>, /embed#!<h8>!<k43>)
 *   https://mega.nz/folder/<fh8>#<fk22>/file/<nh8>     folder-file   (also /#F!<fh8>!<fk22>!<nh8>)
 *   https://mega.nz/folder/<fh8>#<fk22>[/folder/<s8>]  folder        (also /#F!<fh8>!<fk22>); bulk import only
 *
 * Hosts mega.nz, mega.co.nz, mega.io and mega.app, with or without www. and with or without the scheme. A whole <iframe>
 * embed code is accepted (HTML entities decoded). MEGA's trailing "!flags" after a key (embed codes add "!1a1m") are dropped.
 */

export type MegaLinkProblem = 'not-mega' | 'no-key' | 'bad-key' | 'bad-link';

export type ParsedMegaLink =
  | { kind: 'file'; handle: string; key43: string }
  | { kind: 'folder-file'; folderHandle: string; folderKey22: string; nodeHandle: string }
  | { kind: 'folder'; folderHandle: string; folderKey22: string; subfolder?: string };

export type MegaLinkResult =
  | { ok: true; link: ParsedMegaLink }
  | {
      ok: false;
      problem: MegaLinkProblem;
      /** For 'no-key': what the link points at, so a key sent separately can be joined to it. */
      kind?: ParsedMegaLink['kind'];
      /** For 'no-key': the file handle (file) or the folder handle (folder, folder-file). */
      handle?: string;
      /** For a folder-file 'no-key': the file's node handle. */
      nodeHandle?: string;
    };

const MEGA_HOSTS = /* @__PURE__ */ new Set(['mega.nz', 'mega.co.nz', 'mega.io', 'mega.app']);
const H8 = /^[\w-]{8}$/;
const K43 = /^[\w-]{43}$/;
const K22 = /^[\w-]{22}$/;

/** A MEGA address inside any text: with or without a scheme or www. Commas, pipes and quotes end it (list separators). */
const MEGA_IN_TEXT = /(?<![\w.-])(?:https?:\/\/)?(?:www\.)?mega\.(?:nz|co\.nz|io|app)\/[^\s"'<>,;|`]*/gi;

export function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]{1,6});/gi, (_, h: string) => String.fromCodePoint(Math.min(parseInt(h, 16), 0x10ffff)))
    .replace(/&#(\d{1,7});/g, (_, d: string) => String.fromCodePoint(Math.min(Number(d), 0x10ffff)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** The base64url run at the start of a hash part, without "!flags" or anything after it. */
const keyPart = (s: string | undefined) => /^[\w-]*/.exec(s ?? '')![0];

function fileOf(handle: string, key: string): MegaLinkResult {
  if (!H8.test(handle)) return { ok: false, problem: 'bad-link' };
  if (!key) return { ok: false, problem: 'no-key', kind: 'file', handle };
  if (!K43.test(key)) return { ok: false, problem: 'bad-key' };
  return { ok: true, link: { kind: 'file', handle, key43: key } };
}

function folderOf(folderHandle: string, folderKey: string, rest: string): MegaLinkResult {
  if (!H8.test(folderHandle)) return { ok: false, problem: 'bad-link' };
  const file = /^file\/([\w-]+)/.exec(rest);
  const sub = /^folder\/([\w-]+)/.exec(rest);
  if ((file && !H8.test(file[1]!)) || (sub && !H8.test(sub[1]!))) return { ok: false, problem: 'bad-link' };
  if (!folderKey) {
    return file
      ? { ok: false, problem: 'no-key', kind: 'folder-file', handle: folderHandle, nodeHandle: file[1]! }
      : { ok: false, problem: 'no-key', kind: 'folder', handle: folderHandle };
  }
  if (!K22.test(folderKey)) return { ok: false, problem: 'bad-key' };
  if (file) return { ok: true, link: { kind: 'folder-file', folderHandle, folderKey22: folderKey, nodeHandle: file[1]! } };
  return { ok: true, link: { kind: 'folder', folderHandle, folderKey22: folderKey, ...(sub ? { subfolder: sub[1]! } : {}) } };
}

/** Parses one MEGA address (already isolated from its surrounding text). Not a MEGA host: 'not-mega'. */
export function parseMegaUrl(raw: string): MegaLinkResult {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { ok: false, problem: 'not-mega' };
  }
  if (!MEGA_HOSTS.has(url.hostname.toLowerCase().replace(/^www\./, ''))) return { ok: false, problem: 'not-mega' };
  const path = url.pathname.replace(/\/+$/, '');
  let hash = url.hash.replace(/^#/, '');
  try {
    hash = decodeURIComponent(hash);
  } catch {
    // keep the raw hash; a broken escape simply fails the key check
  }
  let m: RegExpExecArray | null;
  if ((m = /^\/(?:file|embed)\/([^/]+)$/.exec(path))) return fileOf(m[1]!, keyPart(hash));
  if ((m = /^\/folder\/([^/]+)$/.exec(path))) {
    const slash = hash.indexOf('/');
    return folderOf(m[1]!, keyPart(slash < 0 ? hash : hash.slice(0, slash)), slash < 0 ? '' : hash.slice(slash + 1));
  }
  if ((path === '' || path === '/embed') && hash.startsWith('!')) {
    const [, h, k] = hash.split('!');
    return fileOf(h ?? '', keyPart(k));
  }
  if (path === '' && hash.startsWith('F!')) {
    const [, fh, fk, nh] = hash.split('!');
    return folderOf(fh ?? '', keyPart(fk), nh ? `file/${keyPart(nh)}` : '');
  }
  return { ok: false, problem: 'bad-link' };
}

/**
 * Finds the first MEGA link in what someone pasted: a bare link, an embed URL or a whole <iframe> embed code, with text
 * around it or not. No MEGA address at all: 'not-mega'.
 */
export function parseMegaLink(input: string): MegaLinkResult {
  const text = decodeHtmlEntities(String(input ?? '')).trim();
  const found = text.match(MEGA_IN_TEXT);
  if (!found) return { ok: false, problem: 'not-mega' };
  return parseMegaUrl(found[0]);
}

/** The one spelling stored in D1, whatever was pasted. */
export function canonicalMegaLink(link: ParsedMegaLink): string {
  if (link.kind === 'file') return `https://mega.nz/file/${link.handle}#${link.key43}`;
  const base = `https://mega.nz/folder/${link.folderHandle}#${link.folderKey22}`;
  if (link.kind === 'folder-file') return `${base}/file/${link.nodeHandle}`;
  return link.subfolder ? `${base}/folder/${link.subfolder}` : base;
}

/** The handle a library row stores for a link (`videos.mega_handle`): the file's own handle, or its node handle in a folder. */
export function megaStreamHandle(link: ParsedMegaLink): string | null {
  if (link.kind === 'file') return link.handle;
  if (link.kind === 'folder-file') return link.nodeHandle;
  return null;
}

/**
 * Joins a key sent separately to a link without one (the import's inline "Paste the key" field). Returns the canonical
 * link, or the problem with the joined result. A link that already has a key is returned as parsed.
 */
export function joinMegaKey(keylessLink: string, key: string): MegaLinkResult {
  const parsed = parseMegaLink(keylessLink);
  if (parsed.ok || parsed.problem !== 'no-key' || !parsed.handle) return parsed;
  const k = keyPart(String(key ?? '').trim().replace(/^#/, ''));
  if (parsed.kind === 'file') return fileOf(parsed.handle, k);
  if (parsed.kind === 'folder-file' && parsed.nodeHandle) return folderOf(parsed.handle, k, `file/${parsed.nodeHandle}`);
  return folderOf(parsed.handle, k, '');
}

export type FoundMegaLink = { raw: string; line: number } & MegaLinkResult;

/** Every MEGA link in a pasted list or file, in order, each parsed, with its 1-based line. A link found twice is kept once. */
export function findMegaLinks(text: string): FoundMegaLink[] {
  const out: FoundMegaLink[] = [];
  const seen = new Set<string>();
  decodeHtmlEntities(String(text ?? ''))
    .split(/\r?\n/)
    .forEach((lineText, i) => {
      for (const raw of lineText.match(MEGA_IN_TEXT) ?? []) {
        const r = parseMegaUrl(raw);
        const id = r.ok ? canonicalMegaLink(r.link) : raw;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({ raw, line: i + 1, ...r });
      }
    });
  return out;
}
