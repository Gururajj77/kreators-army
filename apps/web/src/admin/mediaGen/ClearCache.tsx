// (admin10) "Clear unused cache…", at the foot of the Thumbnails & previews panel (most of what it frees is thumbnails and clips, and the panel
// opens from the Videos screen and from the header chip on every admin screen). It opens a confirm that lists, from a dry run, what would go:
//  - on the server (GET /storage/unused, then POST /storage/clear): thumbnails and previews of videos in the Bin or of videos that are gone,
//    old MEGA link checks no video uses, ended admin sign-ins (never this one) and old passkey tries;
//  - in this browser: Cache Storage the current service worker doesn't use (old precaches and runtime caches from earlier builds; the current
//    precache and its 'pages' cache stay), and the MEGA bridge's decrypted pieces held in memory.
// Never the admin session, the saved settings (pause, MEGA's wait: localStorage) or anything a live video shows. Cloudflare's edge copies and
// the old Worker stream's cached pieces cannot be listed from here, so no number is shown for them.
import { formatBytes, type StorageGroup, type StorageReport } from '@kreators/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { AdminApiError, adminFetch } from '../api';
import { Modal } from '../bits';
import { bridgeMemory, dropBridgeChunks } from './megaSource';

interface BrowserCaches {
  /** Cache Storage names this site's service worker no longer uses. */
  names: string[];
  /** Their size, summed over their entries; null when it can't be measured. */
  bytes: number | null;
  /** Everything this browser stores for the site (navigator.storage.estimate), for context. */
  usage: number | null;
  /** The MEGA bridge's decrypted pieces in memory. */
  bridge: number;
}

/** The caches the current service worker uses: its precache (workbox, scope '/') and the 'pages' runtime cache (vite.config.ts). */
function inUse(name: string): boolean {
  return name === 'pages' || name.startsWith(`workbox-precache-v2-${location.origin}/`);
}

async function measureBrowser(): Promise<BrowserCaches> {
  const out: BrowserCaches = { names: [], bytes: null, usage: null, bridge: bridgeMemory() };
  try {
    const est = await navigator.storage?.estimate?.();
    out.usage = typeof est?.usage === 'number' ? est.usage : null;
  } catch {
    /* not measurable here */
  }
  if (typeof caches === 'undefined') return out;
  try {
    out.names = (await caches.keys()).filter((n) => !inUse(n));
    let total = 0;
    let measured = true;
    for (const name of out.names) {
      const c = await caches.open(name);
      const reqs = await c.keys();
      if (reqs.length > 400) {
        measured = false;
        continue;
      }
      for (const r of reqs) {
        const res = await c.match(r);
        if (!res || res.type === 'opaque') {
          measured = false;
          continue;
        }
        const len = Number(res.headers.get('Content-Length'));
        total += Number.isFinite(len) && len > 0 ? len : (await res.blob()).size;
      }
    }
    out.bytes = measured ? total : total || null;
  } catch {
    /* Cache Storage blocked (a private window): nothing to list */
  }
  return out;
}

async function clearBrowser(names: string[]): Promise<{ caches: number; bridge: number }> {
  let n = 0;
  if (typeof caches !== 'undefined') {
    for (const name of names) {
      // Asked again by name: a cache the worker started using meanwhile is kept.
      if (inUse(name)) continue;
      try {
        if (await caches.delete(name)) n++;
      } catch {
        /* blocked: leave it */
      }
    }
  }
  return { caches: n, bridge: dropBridgeChunks() };
}

const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`;
const media = (g: StorageReport['groups'][StorageGroup]) => `${plural(g.posters ?? 0, 'thumbnail')}, ${plural(g.previews ?? 0, 'preview')}`;

const GROUPS: { key: StorageGroup; label: string; detail?: (g: StorageReport['groups'][StorageGroup]) => string }[] = [
  {
    key: 'binMedia',
    label: 'Thumbnails and previews of videos in the Bin',
    detail: (g) => `${media(g)}${g.videos ? ` · ${plural(g.videos, 'video')}` : ''}`,
  },
  { key: 'orphanMedia', label: 'Thumbnails and previews of videos deleted for good', detail: media },
  { key: 'megaChecks', label: 'Old MEGA link checks no video uses (over an hour old)' },
  { key: 'sessions', label: 'Admin sign-ins that have ended (never this one)' },
  { key: 'attempts', label: 'Old passkey tries (past every lockout window)' },
];

const size = (b: number | null | undefined) => (b ? formatBytes(b) : b === 0 ? '0 KB' : '');

/** The dialog, rendered by the panel next to its own Modal (like "Regenerate all…"), so it never stacks inside it. */
export function ClearCacheDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const titleId = useId();
  const [report, setReport] = useState<StorageReport | null>(null);
  const [browser, setBrowser] = useState<BrowserCaches | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [freed, setFreed] = useState<{ server: StorageReport; caches: number; cacheBytes: number | null; bridge: number } | null>(null);

  useEffect(() => {
    let live = true;
    adminFetch<StorageReport>('/storage/unused', { quiet: true })
      .then((r) => live && setReport(r))
      .catch((e: unknown) => live && setError(e instanceof AdminApiError ? e.message : "Couldn't check what is unused."));
    void measureBrowser().then((b) => live && setBrowser(b));
    return () => {
      live = false;
    };
  }, []);

  const browserCount = (browser?.names.length ?? 0) + (browser?.bridge ? 1 : 0);
  const nothing = !!report && !!browser && report.total.count === 0 && browserCount === 0;

  const clear = async () => {
    setBusy(true);
    setError(null);
    try {
      const server = await adminFetch<StorageReport>('/storage/clear', { method: 'POST', quiet: true });
      const b = await clearBrowser(browser?.names ?? []);
      setFreed({ server, caches: b.caches, cacheBytes: b.caches ? (browser?.bytes ?? null) : 0, bridge: b.bridge });
      // The lists show the binned videos without their thumbnails now; a restored one then shows as missing, so the maker remakes it.
      if (server.groups.binMedia.count || server.groups.orphanMedia.count) {
        await qc.invalidateQueries({ queryKey: ['admin', 'videos'] });
        await qc.invalidateQueries({ queryKey: ['admin', 'video'] });
      }
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Couldn't clear it. Nothing was removed on the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={() => !busy && onClose()} labelledBy={titleId} className="adm-confirm mg-clear">
      <div className="adm-confirm-in" data-clear-dialog>
        <h2 id={titleId} className="adm-confirm-title">
          {freed ? 'Unused cache cleared' : 'Clear unused cache?'}
        </h2>
        {!freed && (
          <>
            <p className="adm-confirm-body">This removes only what nothing on the site uses. Here is what would go:</p>
            {!report && !error && (
              <p className="mg-clear-loading" aria-busy="true">
                Checking…
              </p>
            )}
            {report && (
              <ul className="mg-clear-list" data-clear-groups>
                {GROUPS.map(({ key, label, detail }) => {
                  const g = report.groups[key];
                  return (
                    <li key={key} data-group={key} data-empty={g.count ? undefined : ''}>
                      <span className="mg-clear-label">
                        {label}
                        {detail && g.count > 0 && <span className="mg-clear-detail">{detail(g)}</span>}
                      </span>
                      <span className="mg-clear-num">
                        {g.count ? g.count.toLocaleString('en-IN') : 'None'}
                        {g.count > 0 && g.bytes !== null && <span className="mg-clear-size">{size(g.bytes)}</span>}
                      </span>
                    </li>
                  );
                })}
                <li data-group="browser" data-empty={browser && !browser.names.length ? '' : undefined}>
                  <span className="mg-clear-label">
                    Old copies of the site saved in this browser
                    {browser && browser.names.length > 0 && <span className="mg-clear-detail">{browser.names.length === 1 ? '1 cache from an earlier version' : `${browser.names.length} caches from earlier versions`}</span>}
                  </span>
                  <span className="mg-clear-num">
                    {!browser ? '…' : browser.names.length ? browser.names.length : 'None'}
                    {browser && browser.names.length > 0 && browser.bytes !== null && <span className="mg-clear-size">{size(browser.bytes)}</span>}
                  </span>
                </li>
                <li data-group="bridge" data-empty={browser && !browser.bridge ? '' : undefined}>
                  <span className="mg-clear-label">MEGA video pieces held in this tab’s memory</span>
                  <span className="mg-clear-num">{!browser ? '…' : browser.bridge ? size(browser.bridge) : 'None'}</span>
                </li>
              </ul>
            )}
            {report && report.groups.binMedia.count > 0 && (
              <p className="mg-note" data-tone="amber">
                Videos in the Bin will need their thumbnail and preview made again if you restore them (that happens by itself, as for any video missing them).
              </p>
            )}
            <p className="mg-clear-keep">
              Never touched: every video outside the Bin with its thumbnail and preview, every enquiry (unfinished ones too), this sign-in, and your settings in this browser.
            </p>
            <p className="mg-clear-fine">
              Old copies held by Cloudflare’s edge, and old video pieces cached by the removed Worker stream, can’t be listed from here. They expire on their own.
              {browser?.usage ? ` This browser stores ${formatBytes(browser.usage)} for the site in all.` : ''}
            </p>
          </>
        )}
        {freed && (
          <div className="mg-clear-done" role="status" data-clear-freed>
            <p>
              Freed {formatBytes(freed.server.total.bytes + (freed.cacheBytes ?? 0) + freed.bridge)}
              {freed.cacheBytes === null && freed.caches ? ' plus the old site copies (their size couldn’t be measured)' : ''}.
            </p>
            <ul className="mg-clear-list">
              {GROUPS.filter(({ key }) => freed.server.groups[key].count > 0).map(({ key, label }) => (
                <li key={key}>
                  <span className="mg-clear-label">{label}</span>
                  <span className="mg-clear-num">
                    {freed.server.groups[key].count.toLocaleString('en-IN')}
                    {freed.server.groups[key].bytes ? <span className="mg-clear-size">{size(freed.server.groups[key].bytes)}</span> : null}
                  </span>
                </li>
              ))}
              {freed.caches > 0 && (
                <li>
                  <span className="mg-clear-label">Old copies of the site in this browser</span>
                  <span className="mg-clear-num">{freed.caches}</span>
                </li>
              )}
              {freed.bridge > 0 && (
                <li>
                  <span className="mg-clear-label">MEGA video pieces in memory</span>
                  <span className="mg-clear-num">{size(freed.bridge)}</span>
                </li>
              )}
            </ul>
            {freed.server.total.count === 0 && !freed.caches && !freed.bridge && <p>Nothing needed clearing.</p>}
          </div>
        )}
        {error && (
          <p className="adm-error" role="alert">
            {error}
          </p>
        )}
        <div className="adm-confirm-actions">
          {freed ? (
            <button type="button" className="btn btn-sm btn-ink" onClick={onClose} autoFocus>
              Done
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-sm btn-ghost" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="btn btn-sm btn-accent" onClick={() => void clear()} disabled={busy || !report || nothing} data-clear-confirm>
                {busy ? 'Clearing…' : nothing ? 'Nothing to clear' : 'Clear'}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
