// Owner: A4 Admin (V2-SPEC 4, admin brief 5). The whole admin is this one lazy chunk (`admin`), outside the public Layout: no public nav, footer, cast
// bubbles or street, never prefetched and never precached. Nothing in it is imported with import(): a second lazy chunk would not be named admin-* and
// the service worker would precache it.
//
// The gate: GET /api/admin/session decides between the lock screen and the shell. Inside the shell a 401 from any call raises the session sheet
// (api.ts), so work in progress survives an expired session.
import type { AdminSession } from '@kreators/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { ChipRail } from '../components/tabs';
import { Seo } from '../components/ui';
import '../styles/admin.css';
import { AdminApiError, adminApi, enableSessionSheet, keys, useAdminUi } from './api';
import { Modal, SplitButton, Spinner, inField } from './bits';
import { EnquiriesScreen } from './EnquiriesScreen';
import { ImportScreen } from './ImportScreen';
import { LockScreen, type PassState } from './LockScreen';
import { SessionSheet } from './SessionSheet';
import { Toasts, toast } from './Toasts';
import { VideosScreen } from './VideosScreen';

export function AdminApp() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [locked, setLocked] = useState(false);
  const [fresh, setFresh] = useState(false);
  const session = useQuery({
    queryKey: keys.session,
    queryFn: adminApi.session,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const forgetData = () => qc.removeQueries({ predicate: (q) => q.queryKey[0] === 'admin' && q.queryKey[1] !== 'session' });

  const onUnlocked = (s: AdminSession) => {
    qc.setQueryData(keys.session, s);
    setLocked(false);
    setFresh(true);
    if (pathname.replace(/\/+$/, '') === '/admin') navigate('/admin/videos', { replace: true });
  };

  const lock = async (everywhere: boolean) => {
    try {
      if (everywhere) await adminApi.lockEverywhere();
      else await adminApi.lock();
    } catch (e) {
      // Lock everywhere needs a live session; if it has already ended there is nothing left to end here.
      if (!(e instanceof AdminApiError) || e.status !== 401) {
        toast(e instanceof AdminApiError ? e.message : "Couldn't lock. Try again.", { tone: 'error' });
        return;
      }
    }
    forgetData();
    setLocked(true);
  };

  if (session.isPending && !locked) {
    return (
      <main id="main" className="adm-lock" aria-busy="true">
        <Seo title="Library admin" description="Library admin" noindex />
        <h1 className="sr-only">Library admin</h1>
        <Spinner className="adm-lock-spin" />
      </main>
    );
  }

  if (locked || session.isError || !session.data) {
    const err = session.error;
    let initial: PassState | undefined;
    if (!locked && err instanceof AdminApiError) {
      if (err.code === 'admin-off') initial = { kind: 'off' };
      else if (err.code === 'offline' || err.code === 'network') initial = { kind: 'offline' };
    }
    return <LockScreen key={locked ? 'locked' : 'gate'} onUnlocked={onUnlocked} initial={initial} />;
  }

  return (
    <Shell
      session={session.data}
      fresh={fresh}
      onLock={lock}
      onSheetUnlocked={(s) => qc.setQueryData(keys.session, s)}
      onSheetLock={() => {
        forgetData();
        setLocked(true);
      }}
    />
  );
}

function Shell({
  session,
  fresh,
  onLock,
  onSheetUnlocked,
  onSheetLock,
}: {
  session: AdminSession;
  fresh: boolean;
  onLock: (everywhere: boolean) => void;
  onSheetUnlocked: (s: AdminSession) => void;
  onSheetLock: () => void;
}) {
  const navigate = useNavigate();
  const offline = useAdminUi((s) => s.offline);
  const [shortcuts, setShortcuts] = useState(false);
  const newLeads = useQuery({
    queryKey: keys.leads({ counts: true }),
    queryFn: () => adminApi.leads({ status: 'new', limit: 1 }),
    select: (d) => d.counts.new,
    staleTime: 30_000,
  });

  useEffect(() => {
    enableSessionSheet(true);
    return () => enableSessionSheet(false);
  }, []);

  // `/` focuses the search, `n` opens New video; never while typing or while a dialog is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (inField(e.target) || document.querySelector('dialog[open]')) return;
      if (e.key === '/') {
        const search = document.querySelector<HTMLInputElement>('[data-admin-search]');
        if (search) {
          e.preventDefault();
          search.focus();
          search.select();
        }
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        navigate('/admin/videos/new');
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcuts(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const count = newLeads.data ?? 0;

  return (
    <div className="adm" data-enter={fresh ? '' : undefined}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="adm-bar">
        <div className="adm-bar-in">
          <Link to="/admin/videos" className="adm-mark">
            <img src="/logo.png" alt="" width={32} height={32} />
            <span className="adm-mark-name">Library admin</span>
          </Link>
          <ChipRail
            mode="links"
            label="Admin sections"
            size="sm"
            className="adm-tabs"
            links={[
              { to: '/admin/videos', label: 'Videos' },
              { to: '/admin/import', label: 'Import' },
              { to: '/admin/enquiries', label: 'Enquiries', count: count > 0 ? count : undefined },
            ]}
          />
          <SplitButton
            className="adm-lock-btn"
            label={
              <>
                <Lock className="size-4" aria-hidden />
                <span>Lock</span>
              </>
            }
            onClick={() => onLock(false)}
            menuLabel="More ways to lock"
            items={[{ label: 'Lock everywhere', onSelect: () => onLock(true) }]}
          />
        </div>
      </header>

      <div className="adm-banners">
        {offline && (
          <p className="adm-banner" data-tone="amber" role="status">
            You're offline. Changes will fail until you reconnect.
          </p>
        )}
        {session.weakPasskey && <PasskeyBanner />}
        <LegacyBanner secretSet={session.legacySecret} />
      </div>

      <main id="main" className="adm-main" tabIndex={-1}>
        <Routes>
          <Route index element={<Navigate to="/admin/videos" replace />} />
          <Route path="videos/*" element={<VideosScreen />} />
          <Route path="import" element={<ImportScreen />} />
          <Route path="enquiries/*" element={<EnquiriesScreen />} />
          <Route path="*" element={<Navigate to="/admin/videos" replace />} />
        </Routes>
      </main>

      <footer className="adm-foot">
        <button type="button" className="adm-link-btn" onClick={() => setShortcuts(true)}>
          Keyboard shortcuts
        </button>
      </footer>

      {shortcuts && <ShortcutsDialog onClose={() => setShortcuts(false)} />}
      <SessionSheet onUnlocked={onSheetUnlocked} onLock={onSheetLock} />
      <Toasts />
    </div>
  );
}

function PasskeyBanner() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <p className="adm-banner" data-tone="quiet">
      <span>Your passkey is short. Set a longer one: four or more random words.</span>
      <button type="button" className="adm-banner-x" aria-label="Hide this note" onClick={() => setHidden(true)}>
        <X className="size-4" aria-hidden />
      </button>
    </p>
  );
}

/** The old MEGA_LINKS secret (admin brief 5.3): "Move it into the library" adopts the keys (V12); then the secret can go. */
function LegacyBanner({ secretSet }: { secretSet: boolean }) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: keys.videos(false), queryFn: () => adminApi.videos(false), staleTime: 15_000 });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ missing: string[] } | null>(null);
  const [hidden, setHidden] = useState(false);
  const n = list.data?.legacySecretCount ?? 0;

  const adopt = async () => {
    setBusy(true);
    try {
      const r = await adminApi.adoptSecret();
      setDone({ missing: r.missing });
      setHidden(false);
      await qc.invalidateQueries({ queryKey: ['admin', 'videos'] });
      await qc.invalidateQueries({ queryKey: ['admin', 'video'] });
    } catch (e) {
      toast(e instanceof AdminApiError ? e.message : "Couldn't move it. Try again.", { tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (n > 0) {
    return (
      <p className="adm-banner" data-tone="amber" data-legacy>
        <span>
          {n === 1 ? '1 video still streams from the old MEGA_LINKS secret.' : `${n} videos still stream from the old MEGA_LINKS secret.`}
        </span>
        <button type="button" className="btn btn-sm btn-ink adm-banner-action" onClick={adopt} disabled={busy}>
          {busy ? 'Moving…' : n === 1 ? 'Move it into the library' : 'Move them into the library'}
        </button>
      </p>
    );
  }
  if (done?.missing.length) {
    return (
      <p className="adm-banner" data-tone="amber">
        <span>The secret has no key for {done.missing.join(', ')}. Add the MEGA link to that video by hand.</span>
      </p>
    );
  }
  if (!hidden && secretSet && list.data) {
    return (
      <p className="adm-banner" data-tone="green" data-legacy-done>
        <span>
          {done ? 'Done. ' : ''}You can delete the secret now: <code className="adm-code">wrangler secret delete MEGA_LINKS</code>
        </span>
        <button type="button" className="adm-banner-x" aria-label="Hide this note" onClick={() => setHidden(true)}>
          <X className="size-4" aria-hidden />
        </button>
      </p>
    );
  }
  return null;
}

function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ['/', 'Search the videos'],
    ['n', 'New video'],
    ['Esc', 'Close the drawer or dialog'],
    ['Space or Enter on a handle', 'Pick up a row, then drop it'],
    ['↑ ↓ while a row is picked up', 'Move it'],
    ['Esc while a row is picked up', 'Put it back'],
    ['?', 'This list'],
  ];
  return (
    <Modal onClose={onClose} labelledBy="adm-keys-title" className="adm-confirm">
      <div className="adm-confirm-in">
        <h2 id="adm-keys-title" className="adm-confirm-title">
          Keyboard shortcuts
        </h2>
        <dl className="adm-keys">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>
                <kbd>{k}</kbd>
              </dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="adm-confirm-actions">
          <button type="button" className="btn btn-sm btn-ink" onClick={onClose} autoFocus>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
