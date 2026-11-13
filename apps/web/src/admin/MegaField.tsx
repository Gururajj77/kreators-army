// Owner: A4 Admin. The MEGA link field (admin brief 5.4 with V2-SPEC 4.2): a one-line textarea that grows for a pasted embed code. A paste checks at
// once, typing 600 ms after the last key (M1). The line under it says what MEGA and the file's header said: ready with resolution, bitrate, size and
// length and "Use as title"; heavy or too heavy with the 720p guidance; one line per warning (HEVC and other codecs warn but never block publishing); link problems; MEGA problems
// with Retry; a duplicate with a way to open it; and a key still in the old MEGA_LINKS secret.
import { formatBytes, gradeLabel, megaWarnings, parseMegaLink, resolutionLabel, type AdminMega, type MegaInspect, type MegaMeta } from '@kreators/shared';
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { AdminApiError, adminApi } from './api';
import { clock } from './bits';

export type MegaCheck =
  | { kind: 'empty' }
  | { kind: 'saved' }
  | { kind: 'problem'; message: string }
  | { kind: 'checking' }
  | { kind: 'done'; inspect: MegaInspect }
  | { kind: 'error'; message: string };

const PARSE_MESSAGES: Record<string, string> = {
  'not-mega': "That isn't a MEGA file link.",
  'bad-link': "That isn't a MEGA file link.",
  'no-key': 'This link has no key. Copy it again from MEGA with the key included.',
  'bad-key': "This link's key doesn't open the file.",
  folder: "That's a folder. Use Import links to add every video in it.",
};

export const HELP =
  "Paste the file's share link, including the part after #. It stays on the server; the site only ever shows its own stream address.";
export const GUIDANCE = 'MEGA streams the file exactly as uploaded. Upload a 720p H.264 MP4 (about 2.5 to 5 Mbps). A 50-second video should be 15 to 30 MB.';

const TRANSIENT = new Set(['busy', 'over-quota', 'upstream']);

function GradeLine({ meta, grade, playable = true }: { meta: MegaMeta | null; grade: 'ready' | 'heavy' | 'too-heavy' | 'unknown'; playable?: boolean }) {
  // A file browsers cannot play is never "Ready to stream": the facts stay, the green goes.
  const text = playable ? gradeLabel(grade, meta) : gradeLabel(grade, meta).replace(/^Ready to stream\. /, '');
  const len = clock(meta?.durationMs);
  return (
    <p className="adm-mega-line" data-tone={grade === 'ready' && playable ? 'green' : grade === 'unknown' ? 'grey' : 'amber'} data-grade={grade}>
      <span className="adm-dot" aria-hidden />
      <span>
        {text}
        {len && grade !== 'unknown' ? ` ${len}` : ''}
      </span>
    </p>
  );
}

function Warnings({ list, grade }: { list: { code: string; message: string }[]; grade: string }) {
  const shown = list.filter((w) => !(w.code === 'no-header-info' && grade === 'unknown'));
  if (!shown.length) return null;
  return (
    <ul className="adm-mega-warnings">
      {shown.map((w) => (
        <li key={w.code} data-code={w.code} data-tone={w.code === 'hevc' || w.code === 'video-codec' ? 'strong' : undefined}>
          {w.message}
        </li>
      ))}
    </ul>
  );
}

export function MegaField({
  id,
  value,
  onChange,
  savedUrl,
  saved,
  videoId,
  hasFile,
  check,
  onCheck,
  serverError,
  onUseTitle,
  onAdopt,
  onRecheck,
  busy,
  onOpenDuplicate,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  /** The canonical link saved on this entry (null for a new video or a key still in the secret). */
  savedUrl: string | null;
  saved: AdminMega | null;
  videoId: string | null;
  hasFile: boolean;
  check: MegaCheck;
  onCheck: (c: MegaCheck) => void;
  serverError?: ReactNode;
  onUseTitle: (title: string) => void;
  onAdopt: () => void;
  onRecheck: () => void;
  busy?: 'adopt' | 'recheck' | null;
  onOpenDuplicate: (id: string, inBin: boolean) => void;
  describedBy?: string;
}) {
  const box = useRef<HTMLTextAreaElement>(null);
  const timer = useRef(0);
  const pasted = useRef(false);
  const seq = useRef(0);
  const abort = useRef<AbortController | null>(null);

  const run = useCallback(
    (raw: string, refresh = false) => {
      window.clearTimeout(timer.current);
      abort.current?.abort();
      const v = raw.trim();
      if (!v) return onCheck({ kind: 'empty' });
      if (savedUrl && v === savedUrl && !refresh) return onCheck({ kind: 'saved' });
      const parsed = parseMegaLink(v);
      if (!parsed.ok) return onCheck({ kind: 'problem', message: PARSE_MESSAGES[parsed.problem] ?? PARSE_MESSAGES['not-mega']! });
      if (parsed.link.kind === 'folder') return onCheck({ kind: 'problem', message: PARSE_MESSAGES.folder! });
      const my = ++seq.current;
      const ac = new AbortController();
      abort.current = ac;
      onCheck({ kind: 'checking' });
      adminApi
        .inspect(v, { refresh, videoId: videoId ?? undefined }, ac.signal)
        .then((inspect) => {
          if (seq.current === my) onCheck({ kind: 'done', inspect });
        })
        .catch((e: unknown) => {
          if (ac.signal.aborted || seq.current !== my) return;
          onCheck({ kind: 'error', message: e instanceof AdminApiError ? e.message : "Couldn't check the link. Try again." });
        });
    },
    [onCheck, savedUrl, videoId],
  );

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      abort.current?.abort();
    },
    [],
  );

  // One line that grows for an embed code (field-sizing where supported, the scroll height elsewhere).
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || CSS.supports?.('field-sizing', 'content')) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight + 2, 180)}px`;
  }, [value]);

  let status: ReactNode = null;
  const retry = (label = 'Retry') => (
    <button type="button" className="adm-link-btn" onClick={() => run(value, true)}>
      <RefreshCw className="size-3.5" aria-hidden /> {label}
    </button>
  );

  if (check.kind === 'empty') {
    status = <p className="adm-help">{hasFile ? 'No MEGA link yet: the site plays the bundled file.' : savedUrl ? 'Saving removes the MEGA link from this video.' : HELP}</p>;
  } else if (check.kind === 'checking') {
    status = (
      <div className="adm-mega-checking">
        <p className="adm-mega-line" data-tone="grey">
          Checking the file on MEGA…
        </p>
        <span className="adm-bar-indet" aria-hidden>
          <span />
        </span>
      </div>
    );
  } else if (check.kind === 'problem' || check.kind === 'error') {
    status = (
      <p className="adm-mega-line" data-tone="amber" data-problem>
        <span>{check.message}</span> {check.kind === 'error' && retry()}
      </p>
    );
  } else if (check.kind === 'saved' && saved) {
    if (saved.keyIn === 'secret') {
      status = (
        <p className="adm-mega-line" data-tone="amber" data-legacy>
          <span>This video's key is still in the old MEGA_LINKS secret.</span>{' '}
          <button type="button" className="adm-link-btn" data-intent="positive" onClick={onAdopt} disabled={busy === 'adopt'}>
            {busy === 'adopt' ? 'Moving…' : 'Move it into the library'}
          </button>
        </p>
      );
    } else if (saved.error && (!saved.meta || ['not-found', 'removed', 'blocked', 'bad-key', 'not-video'].includes(saved.error))) {
      status = (
        <p className="adm-mega-line" data-tone="amber" data-problem>
          <span>{TRANSIENT.has(saved.error) ? "Couldn't reach MEGA." : PARSE_MESSAGES[saved.error] ?? 'MEGA refused this file.'}</span>{' '}
          <button type="button" className="adm-link-btn" onClick={onRecheck} disabled={busy === 'recheck'}>
            <RefreshCw className="size-3.5" aria-hidden /> {busy === 'recheck' ? 'Checking…' : 'Check again'}
          </button>
        </p>
      );
    } else {
      status = (
        <>
          <GradeLine meta={saved.meta} grade={saved.grade} playable={saved.playable} />
          <p className="adm-mega-file">
            {saved.meta?.name && <span>{saved.meta.name}</span>}
            <button type="button" className="adm-link-btn" onClick={onRecheck} disabled={busy === 'recheck'}>
              <RefreshCw className="size-3.5" aria-hidden /> {busy === 'recheck' ? 'Checking…' : 'Check again'}
            </button>
          </p>
          <Warnings list={megaWarnings(saved.meta)} grade={saved.grade} />
        </>
      );
    }
  } else if (check.kind === 'done') {
    const ins = check.inspect;
    if (!ins.ok) {
      status = (
        <p className="adm-mega-line" data-tone="amber" data-problem={ins.problem}>
          <span>{ins.message}</span> {TRANSIENT.has(ins.problem) && retry()}
        </p>
      );
    } else {
      const res = resolutionLabel(ins.meta.width, ins.meta.height);
      status = (
        <>
          <GradeLine meta={ins.meta} grade={ins.grade} playable={ins.playable} />
          <p className="adm-mega-file">
            <span>
              {ins.meta.name ?? 'This file'}
              {ins.meta.size ? ` · ${formatBytes(ins.meta.size)}` : ''}
            </span>
            {ins.suggestedTitle && (
              <button type="button" className="adm-link-btn" onClick={() => onUseTitle(ins.suggestedTitle)}>
                Use as title
              </button>
            )}
          </p>
          <Warnings list={ins.warnings} grade={ins.grade} />
          {(ins.grade === 'heavy' || ins.grade === 'too-heavy') && res && <p className="adm-help">Preview may buffer: this file is {res}.</p>}
          {ins.duplicate && (
            <p className="adm-mega-line" data-tone="amber" data-duplicate>
              <span>
                {ins.duplicate.inBin ? 'In the bin' : 'Already in the library'}: {ins.duplicate.title}.
              </span>{' '}
              <button type="button" className="adm-link-btn" onClick={() => onOpenDuplicate(ins.duplicate!.id, ins.duplicate!.inBin)}>
                {ins.duplicate.inBin ? 'Restore it' : 'Open it'}
              </button>
            </p>
          )}
        </>
      );
    }
  }

  return (
    <div className="adm-field adm-mega">
      <label className="adm-label" htmlFor={id}>
        MEGA link (main stream)
      </label>
      <textarea
        ref={box}
        id={id}
        className="field adm-mega-input"
        name="mega"
        rows={1}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder="https://mega.nz/file/…#…  or the embed code"
        value={value}
        aria-describedby={`${id}-status ${describedBy ?? ''}`}
        aria-invalid={check.kind === 'problem' || (check.kind === 'done' && !check.inspect.ok) || !!serverError || undefined}
        onPaste={() => {
          pasted.current = true;
        }}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v);
          window.clearTimeout(timer.current);
          if (pasted.current) {
            pasted.current = false;
            run(v);
          } else timer.current = window.setTimeout(() => run(v), 600);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            run(value);
          }
        }}
      />
      <div id={`${id}-status`} className="adm-mega-status" aria-live="polite">
        {status}
      </div>
      {serverError && (
        <p className="adm-error" role="alert">
          {serverError}
        </p>
      )}
      <p className="adm-help adm-guidance">{GUIDANCE}</p>
    </div>
  );
}
