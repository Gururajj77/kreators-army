// Owner: A4 Admin. Bulk import (admin brief 5.5): three steps, Add links → Review → Done. The founder pastes the list or drops the file (.txt, .csv, .tsv,
// .json; an .xlsx gets the "save as CSV" message); the browser's own parse says at once what it found, then the server reads it (I1), expands folders and
// finds duplicates, and every MEGA row is checked three at a time. Nothing goes live: every video comes in as a draft, and a whole import can be undone.
import { IMPORT_LIMITS, parseImport, type AdminVideo, type AdminVideoList } from '@kreators/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Download, FileUp, ListChecks, Wand2 } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { Link } from 'react-router';
import { Character } from '../cast';
import { ChipRail } from '../components/tabs';
import { withArrows } from '../components/TextArrow';
import { Seo } from '../components/ui';
import { keys } from './api';
import { attachQueryClient, enqueue, stop as stopMedia, useMediaGen } from './mediaGen/runner';
import { ConfirmDialog, EmptyState } from './bits';
import {
  bindQueryClient,
  commitTicked,
  countsLine,
  fileNamesAsTitles,
  isImportable,
  pair,
  readLinks,
  reset,
  retryAllBusy,
  selectAllReady,
  setText,
  TEMPLATE_CSV,
  undoImport,
  useImport,
  type UIRow,
} from './importStore';
import { ImportSkeleton, ImportTable } from './ImportTable';
import { toast } from './Toasts';

const STEPS = ['Add links', 'Review', 'Done'] as const;
const SHEET_EXT = /\.(xlsx|xlsm|xls|numbers|ods)$/i;
const TEXT_EXT = /\.(txt|csv|tsv|json|text|md)$/i;
const FORMAT_WORDS: Record<string, string> = { line: 'one video per line', block: 'a title, then its links', table: 'a spreadsheet', json: 'JSON', rows: 'rows' };

export function ImportScreen() {
  const qc = useQueryClient();
  const step = useImport((s) => s.step);
  useEffect(() => bindQueryClient(qc), [qc]);
  const at = STEPS.indexOf(step === 'add' ? 'Add links' : step === 'review' ? 'Review' : 'Done');
  return (
    <section className="adm-screen adm-import" aria-labelledby="adm-import-title">
      <Seo title="Import links · Library admin" description="Library admin" noindex />
      <div className="adm-head">
        <h1 id="adm-import-title" className="adm-title">
          Import links
        </h1>
        <ol className="adm-steps" aria-label="Steps">
          {STEPS.map((label, i) => (
            <li key={label} data-state={i < at ? 'done' : i === at ? 'now' : 'next'} aria-current={i === at ? 'step' : undefined}>
              <span className="adm-step-n" aria-hidden>
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
      </div>
      {step === 'add' && <AddStep />}
      {step === 'review' && <ReviewStep />}
      {step === 'done' && <DoneStep />}
    </section>
  );
}

// ---------- Step 1: Add links ----------

function liveSummary(text: string): string | null {
  if (!text.trim() || text.length > 300_000) return null;
  try {
    const p = parseImport(text);
    if (!p.rows.length) return 'No MEGA, Instagram or YouTube links yet.';
    const mega = p.rows.filter((r) => r.mega && r.status !== 'folder').length;
    const folders = p.rows.filter((r) => r.status === 'folder').length;
    const social = p.rows.filter((r) => r.status === 'needs-mega').length;
    const parts = [`${mega} MEGA ${mega === 1 ? 'link' : 'links'}`];
    if (folders) parts.push(`${folders} ${folders === 1 ? 'folder' : 'folders'} (opened when read)`);
    if (social) parts.push(`${social} with only Instagram or YouTube`);
    return `Found ${parts.join(', ')}. Read as ${FORMAT_WORDS[p.format] ?? p.format}.`;
  } catch {
    return null;
  }
}

function AddStep() {
  const text = useImport((s) => s.text);
  const fileName = useImport((s) => s.fileName);
  const readError = useImport((s) => s.readError);
  const reading = useImport((s) => s.reading);
  const [drag, setDrag] = useState(false);
  const [fileMsg, setFileMsg] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const deferred = useDeferredValue(text);
  const summary = useMemo(() => liveSummary(deferred), [deferred]);

  const onFile = async (file: File | undefined | null) => {
    if (!file) return;
    setFileMsg(null);
    if (SHEET_EXT.test(file.name)) {
      setFileMsg('Save the sheet as CSV first (File → Download → CSV), then choose that file.');
      return;
    }
    if (!TEXT_EXT.test(file.name) && file.type && !/^text\/|json|csv/.test(file.type)) {
      setFileMsg('Choose a .txt, .csv, .tsv or .json file.');
      return;
    }
    if (file.size > 1_200_000) {
      setFileMsg('That file is too large to import at once (at most 1,000,000 characters). Split it in two.');
      return;
    }
    try {
      const content = await file.text();
      if (content.length > IMPORT_LIMITS.chars) {
        setFileMsg('That file is too large to import at once (at most 1,000,000 characters). Split it in two.');
        return;
      }
      setText(content, file.name);
    } catch {
      setFileMsg("Couldn't read that file.");
    }
  };

  const template = () => {
    const url = URL.createObjectURL(new Blob([`﻿${TEMPLATE_CSV}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kreators-import-template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void onFile(f);
    else {
      const t = e.dataTransfer.getData('text/plain');
      if (t) setText(text ? `${text}\n${t}` : t, fileName);
    }
  };

  return (
    <div className="adm-add">
      <p className="adm-intro">
        Paste the list, or choose the file. MEGA file and folder links, embed codes, Instagram and YouTube links, one video per line or a spreadsheet with columns.
        Nothing goes live: every video comes in as a draft.
      </p>
      <div
        className="adm-drop"
        data-drag={drag ? '' : undefined}
        data-empty={text ? undefined : ''}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <label htmlFor="adm-import-text" className="sr-only">
          The links
        </label>
        <textarea
          id="adm-import-text"
          className="adm-import-text"
          rows={12}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={text}
          onChange={(e) => setText(e.target.value, e.target.value ? fileName : null)}
          aria-describedby="adm-import-summary"
        />
        {!text && (
          <div className="adm-drop-empty" aria-hidden>
            <Character who="tiko" size={96} prop track={false} />
            <p className="adm-drop-title">Drop your links here.</p>
            <p className="adm-drop-sub">Or paste them. Each line can hold a MEGA link with its Instagram and YouTube links.</p>
          </div>
        )}
        <p className="adm-drop-hint" aria-hidden>
          or drop a file here
        </p>
      </div>
      <div className="adm-add-tools">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => input.current?.click()}>
          <FileUp className="size-4" aria-hidden /> Choose a file
        </button>
        <span className="adm-help">.txt .csv .tsv .json</span>
        <span className="adm-dot-sep" aria-hidden>
          ·
        </span>
        <button type="button" className="adm-link-btn" onClick={template}>
          <Download className="size-3.5" aria-hidden /> Download a template (CSV)
        </button>
        <input
          ref={input}
          type="file"
          accept=".txt,.csv,.tsv,.json,.xlsx,.xls,text/plain,text/csv,application/json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <span className="adm-grow" />
        <button type="button" className="btn btn-accent adm-read-btn" onClick={() => void readLinks()} disabled={!text.trim() || reading}>
          {reading ? 'Reading…' : 'Read the links'}
        </button>
      </div>
      <div id="adm-import-summary" className="adm-add-status" aria-live="polite">
        {fileName && text && (
          <p className="adm-help">
            From <b>{fileName}</b>.{' '}
            <button type="button" className="adm-link-btn" onClick={() => setText('', null)}>
              Clear
            </button>
          </p>
        )}
        {summary && <p className="adm-live-summary">{summary}</p>}
      </div>
      {(fileMsg || readError) && (
        <p className="adm-error" role="alert">
          {withArrows(fileMsg ?? readError)}
        </p>
      )}
    </div>
  );
}

// ---------- Step 2: Review ----------

type Show = 'all' | 'ticked' | 'look';
const LOOK = new Set(['no-key', 'busy', 'duplicate', 'needs-mega', 'unplayable', 'unreachable', 'invalid', 'not-video', 'heavy', 'too-heavy', 'unknown-quality', 'duplicate-in-file', 'folder-limit']);

function ReviewStep() {
  const reading = useImport((s) => s.reading);
  const draftCount = useImport((s) => s.draftCount);
  const rows = useImport((s) => s.rows);
  const ignored = useImport((s) => s.ignored);
  const pairable = useImport((s) => s.pairable);
  const checkTotal = useImport((s) => s.checkTotal);
  const checkDone = useImport((s) => s.checkDone);
  const committing = useImport((s) => s.committing);
  const commitError = useImport((s) => s.commitError);
  const format = useImport((s) => s.format);
  const fileName = useImport((s) => s.fileName);
  const [show, setShow] = useState<Show>('all');

  if (reading) {
    return (
      <div className="adm-review">
        <p className="adm-counts" aria-live="polite">
          Reading {draftCount ? `${draftCount} ${draftCount === 1 ? 'link' : 'links'}` : 'the links'}
          {fileName ? ` from ${fileName}` : ''}… folders are opened and every link is matched against the library.
        </p>
        <ImportSkeleton count={draftCount} />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="adm-review">
        <EmptyState who="tiko" size={96} title="No video links in that.">
          <p className="adm-help">The file had no MEGA, Instagram or YouTube links the site can use.</p>
          <button type="button" className="btn btn-sm btn-ink" onClick={() => reset(true)}>
            Back to the links
          </button>
        </EmptyState>
        <Ignored list={ignored} />
      </div>
    );
  }

  const ticked = rows.filter(isImportable).length;
  const waiting = rows.some((r) => r.selected && (r.status === 'checking' || r.inFlight));
  const busy = rows.filter((r) => r.status === 'busy').length;
  const ready = rows.filter((r) => r.status === 'ready').length;
  const named = rows.filter((r) => r.check?.ok && r.check.suggestedTitle && r.titleFrom !== 'file-name').length;
  const looks = rows.filter((r) => LOOK.has(r.status)).length;
  const visible = show === 'all' ? rows : show === 'ticked' ? rows.filter((r) => r.selected) : rows.filter((r) => LOOK.has(r.status));
  const checking = checkTotal > 0 && checkDone < checkTotal;

  return (
    <div className="adm-review">
      <div className="adm-review-head">
        <p className="adm-counts" aria-live="polite">
          {countsLine(rows)}
          {format && <span className="adm-format"> · read as {FORMAT_WORDS[format] ?? format}</span>}
        </p>
        {checking && (
          <div className="adm-progress" role="progressbar" aria-label="Checking the MEGA links" aria-valuemin={0} aria-valuemax={checkTotal} aria-valuenow={checkDone}>
            <span className="adm-progress-text">
              Checking {checkDone + 1 > checkTotal ? checkTotal : checkDone + 1} of {checkTotal}…
            </span>
            <span className="adm-progress-bar" aria-hidden>
              <span style={{ transform: `scaleX(${checkTotal ? checkDone / checkTotal : 0})` }} />
            </span>
          </div>
        )}
      </div>

      <div className="adm-bulk">
        <button type="button" className="btn btn-sm btn-ghost" onClick={selectAllReady} disabled={!ready}>
          <ListChecks className="size-4" aria-hidden /> Select all ready
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={fileNamesAsTitles} disabled={!named}>
          <Wand2 className="size-4" aria-hidden /> Use file names as titles
        </button>
        {(['instagram', 'youtube'] as const).map((k) =>
          pairable[k] ? (
            <button key={k} type="button" className="btn btn-sm btn-ghost" onClick={() => pair(k)}>
              Pair the {pairable[k]} {k === 'instagram' ? 'Instagram' : 'YouTube'} links with the {pairable[k]} MEGA links in order
            </button>
          ) : null,
        )}
        {busy > 1 && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={retryAllBusy}>
            Retry all busy ({busy})
          </button>
        )}
        <span className="adm-grow" />
        <ChipRail
          mode="radio"
          size="sm"
          label="Show rows"
          value={show}
          onChange={setShow}
          options={[
            { value: 'all', label: 'All', count: rows.length },
            { value: 'ticked', label: 'Ticked', count: rows.filter((r) => r.selected).length },
            { value: 'look', label: 'Needs a look', count: looks },
          ]}
        />
      </div>

      {visible.length ? <ImportTable rows={visible} all={rows} /> : <p className="adm-state-title adm-state">Nothing here.</p>}

      <Ignored list={ignored} />

      <div className="adm-import-bar">
        <div className="adm-import-bar-in">
          {committing ? (
            <div className="adm-progress" role="progressbar" aria-label="Importing" aria-valuemin={0} aria-valuemax={committing.total} aria-valuenow={committing.done}>
              <span className="adm-progress-text">
                Importing {Math.min(committing.total, committing.done + Math.min(IMPORT_LIMITS.commitRows, committing.total - committing.done))} of {committing.total}…
              </span>
              <span className="adm-progress-bar" aria-hidden>
                <span style={{ transform: `scaleX(${committing.done / committing.total})` }} />
              </span>
            </div>
          ) : (
            <p className="adm-help">
              {waiting ? 'Waiting for the checks to finish…' : ticked ? `${ticked} ticked. Each comes in as a draft.` : 'Tick the videos to import.'}{' '}
              <button type="button" className="adm-link-btn" onClick={() => reset(true)}>
                Start over
              </button>
            </p>
          )}
          {commitError && (
            <p className="adm-error" role="alert">
              {commitError}
            </p>
          )}
          <button type="button" className="btn btn-accent" onClick={() => void commitTicked()} disabled={!ticked || waiting || !!committing} data-import-btn>
            {committing ? 'Importing…' : `Import ${ticked} as drafts`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Ignored({ list }: { list: { line: number; link: string; reason: string }[] }) {
  if (!list.length) return null;
  return (
    <details className="adm-ignored">
      <summary>Ignored lines ({list.length})</summary>
      <ul>
        {list.map((x, i) => (
          <li key={`${x.line}-${i}`}>
            <span className="adm-ignored-line">Line {x.line}</span> <code className="adm-code">{x.link.length > 80 ? `${x.link.slice(0, 77)}…` : x.link}</code>: {x.reason}
          </li>
        ))}
      </ul>
    </details>
  );
}

// ---------- Step 3: Done ----------

/** (pv) Imports whose drafts were already queued for thumbnails and previews (once per import, even if this step mounts again). */
const mediaQueued = new Set<string>();

function DoneStep() {
  const qc = useQueryClient();
  const result = useImport((s) => s.result);
  const rows = useImport((s) => s.rows);
  const importId = useImport((s) => s.importId);
  const jobs = useMediaGen((s) => s.jobs);
  const undone = useImport((s) => s.undone);
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [undoing, setUndoing] = useState(false);

  // (pv) Right after an import, its new drafts get a thumbnail and a hover preview, made in this browser one at a time (admin/mediaGen).
  useEffect(() => {
    if (!result || undone || !result.created.length || !importId || mediaQueued.has(importId)) return;
    mediaQueued.add(importId);
    attachQueryClient(qc);
    const list = qc.getQueryData<AdminVideoList>(keys.videos(false))?.videos ?? [];
    enqueue(result.created.map((v) => list.find((x) => x.id === v.id) ?? v).filter((v) => !v.deletedAt));
  }, [result, undone, importId, qc]);
  const createdIds = useMemo(() => new Set(result?.created.map((v) => v.id) ?? []), [result]);
  const mine = jobs.filter((j) => createdIds.has(j.id));

  if (!result) return null;

  const created = result.created.length;
  const updated = result.updated.length;
  const reasons = skippedReasons(rows, result);
  const skipped = reasons.reduce((n, [c]) => n + c, 0);

  const undo = async () => {
    setUndoing(true);
    stopMedia();
    const ok = await undoImport();
    setUndoing(false);
    setConfirmUndo(false);
    if (!ok) toast("Couldn't undo the import. Try again.", { tone: 'error' });
  };

  return (
    <div className="adm-done">
      <div className="adm-done-card" role="status">
        <h2 className="adm-done-title">
          {created} {created === 1 ? 'draft' : 'drafts'} added. They stay hidden from the site until you publish them.
        </h2>
        {updated > 0 && (
          <p>
            {updated} {updated === 1 ? 'video already in the library got its' : 'videos already in the library got their'} Instagram or YouTube links.
          </p>
        )}
        {skipped > 0 && (
          <details className="adm-skipped">
            <summary>
              {skipped} skipped: {reasons.map(([c, r]) => `${c} ${r}`).join(', ')}. <span className="adm-link-btn">Show skipped</span>
            </summary>
            <ul>
              {result.skipped.map((s) => (
                <li key={s.rowId}>
                  Row {rows.find((r) => r.rowId === s.rowId)?.line ?? s.rowId}: {s.message}
                </li>
              ))}
              {rows
                .filter((r) => !isImportable(r) && !result.skipped.some((s) => s.rowId === r.rowId))
                .map((r) => (
                  <li key={r.rowId}>
                    Row {r.line ?? r.rowId}: {r.title || r.fileName || r.instagram || r.youtube || 'a link'} ({describe(r)})
                  </li>
                ))}
            </ul>
          </details>
        )}
        {undone && (
          <p className="adm-done-undone">
            Moved {undone.binned} {undone.binned === 1 ? 'draft' : 'drafts'} to the bin.
            {undone.kept ? ` ${undone.kept} published ${undone.kept === 1 ? 'one was' : 'ones were'} kept.` : ''}
          </p>
        )}
        <div className="adm-done-actions">
          <Link to={`/admin/videos?import=${encodeURIComponent(importId ?? '')}`} className="btn btn-sm btn-ink">
            Review the drafts
          </Link>
          {!undone && created > 0 && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirmUndo(true)}>
              Undo this import
            </button>
          )}
          <button type="button" className="adm-link-btn" onClick={() => reset()}>
            Import more links
          </button>
        </div>
        {mine.length > 0 && (
          <p className="adm-posters-line" aria-live="polite" data-mediagen-import>
            {(() => {
              const done = mine.filter((j) => j.status === 'done').length;
              const failed = mine.filter((j) => j.status === 'failed').length;
              const going = mine.some((j) => j.status === 'queued' || j.status === 'running');
              return `Thumbnails and previews: ${done} of ${mine.length} made${failed ? `, ${failed} failed` : ''}${going ? '. Keep this tab open.' : '.'}`;
            })()}{' '}
            <Link to="/admin/videos" className="adm-link-btn">
              See them in Videos
            </Link>
          </p>
        )}
      </div>
      {confirmUndo && (
        <ConfirmDialog
          title={`Move these ${created} drafts to the bin?`}
          body="Videos you have published since stay where they are. The bin keeps the rest for 30 days."
          confirmLabel="Move to the bin"
          danger
          busy={undoing}
          onConfirm={() => void undo()}
          onCancel={() => setConfirmUndo(false)}
        />
      )}
    </div>
  );
}

function describe(r: UIRow): string {
  if (r.status === 'duplicate') return r.duplicate?.inBin ? 'in the bin' : 'already in the library';
  if (r.status === 'duplicate-in-file') return 'repeated in the file';
  if (r.status === 'unreachable') return "MEGA couldn't find it";
  if (r.status === 'not-video') return 'not a video';
  if (r.status === 'invalid' || r.status === 'no-key') return 'link not usable';
  if (r.status === 'folder-limit') return 'over the folder limit';
  return 'left unticked';
}

/** "2 already in the library, 1 MEGA couldn't find": every row that did not come in, grouped. */
function skippedReasons(rows: UIRow[], result: { skipped: { rowId: string; reason: string }[] }): [number, string][] {
  const groups = new Map<string, number>();
  const add = (k: string) => groups.set(k, (groups.get(k) ?? 0) + 1);
  for (const s of result.skipped) add(s.reason === 'duplicate' ? 'already in the library' : s.reason === 'mega-unusable' ? "MEGA couldn't find" : 'not usable');
  for (const r of rows) {
    if (isImportable(r) || result.skipped.some((s) => s.rowId === r.rowId)) continue;
    const d = describe(r);
    add(d === "MEGA couldn't find it" ? "MEGA couldn't find" : d);
  }
  return [...groups.entries()].map(([k, c]) => [c, k]);
}
