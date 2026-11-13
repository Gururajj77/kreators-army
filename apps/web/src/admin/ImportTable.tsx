// Owner: A4 Admin. The import's review table (admin brief 5.5 step 2): a plain table of native controls in DOM order (arrow keys are never hijacked, every
// action is a real button). Each row: tick, number, status, editable title and brand, the MEGA file with its quality, posted-on links, views, category
// and a notes popover. Rows that need a decision get a second line that explains it and holds its action: the key field, Skip or "Add the links to it",
// Retry, or why it cannot come in. Folder files sit under a group row that collapses. Up to 500 rows render without virtualisation.
import { formatBytes, gradeLabel, resolutionLabel } from '@kreators/shared';
import { Check, ChevronDown, ChevronRight, Folder, Info, RefreshCw } from 'lucide-react';
import { Fragment, useId, type ReactNode } from 'react';
import { InstagramGlyph, YouTubeGlyph } from '../components/frames';
import { TextArrow } from '../components/TextArrow';
import { StatusChip, usePopover } from './bits';
import { STATUS_LABEL, STATUS_TONE, applyKey, canTick, editRow, retryRow, rowNumber, toggleFolder, toggleRow, useImport, type UIRow } from './importStore';

function Quality({ row }: { row: UIRow }) {
  if (!row.check?.ok) return null;
  const m = row.check.meta;
  const res = resolutionLabel(m.width, m.height);
  if (!res || !m.bitrate) return <StatusChip tone="grey">Size unknown</StatusChip>;
  const heavy = row.check.grade === 'heavy' || row.check.grade === 'too-heavy';
  return (
    <StatusChip tone={row.check.grade === 'ready' ? 'green' : heavy ? 'amber' : 'grey'} title={gradeLabel(row.check.grade, m)}>
      {res} · {(m.bitrate / 1e6).toFixed(1)} Mbps{heavy ? ' ⚠' : ''}
    </StatusChip>
  );
}

function Notes({ row, n }: { row: UIRow; n: string }) {
  const { pop, anchor, toggle } = usePopover('end');
  const id = useId();
  const lines = [...row.notes, ...(row.check?.ok ? row.check.warnings.filter((w) => w.code !== 'no-header-info').map((w) => w.message) : [])];
  if (!lines.length) return null;
  return (
    <>
      <button ref={anchor} type="button" className="btn adm-icon-btn adm-note-btn" aria-label={`Notes for row ${n}`} aria-expanded={false} aria-controls={id} onClick={toggle}>
        <Info className="size-4" aria-hidden />
        <span className="adm-note-count" aria-hidden>
          {lines.length}
        </span>
      </button>
      <div ref={pop} id={id} popover="auto" className="adm-pop adm-notes" role="dialog" aria-label={`Notes for row ${n}`}>
        <ul>
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** The second line of a row: what the status means and what can be done about it. */
function Detail({ row, numberOf }: { row: UIRow; numberOf: (rowId: string) => string }) {
  const keyId = useId();
  let body: ReactNode = null;
  switch (row.status) {
    case 'heavy':
    case 'too-heavy':
      body = row.check?.ok ? <span>{gradeLabel(row.check.grade, row.check.meta)} It comes in as a draft, so you can set the brand and poster meanwhile.</span> : null;
      break;
    case 'unknown-quality':
      body = <span>Couldn't read the video's size and length. It may still play.</span>;
      break;
    case 'unplayable':
      body = (
        <span>
          {row.check?.ok ? row.check.warnings.find((w) => w.code === 'hevc' || w.code === 'video-codec')?.message ?? "Browsers can't play this file." : "Browsers can't play this file."} It still
          imports, publishes and streams; an H.264 export plays in every browser.
        </span>
      );
      break;
    case 'busy':
      body = (
        <>
          <span>{row.check && !row.check.ok ? row.check.message : 'MEGA is busy.'}</span>
          <button type="button" className="adm-link-btn" onClick={() => retryRow(row.rowId)}>
            <RefreshCw className="size-3.5" aria-hidden /> Retry
          </button>
        </>
      );
      break;
    case 'unreachable':
      body = <span>{row.check && !row.check.ok ? row.check.message : 'MEGA could not open this file.'} Check the link on MEGA.</span>;
      break;
    case 'not-video':
      body = <span>{row.notes.find((x) => /file\. The site plays/.test(x)) ?? "This file isn't an MP4 or MOV video."}</span>;
      break;
    case 'invalid':
      body = <span>{row.check && !row.check.ok ? row.check.message : "That isn't a MEGA file link, or it is cut short."}</span>;
      break;
    case 'no-key':
      body = (
        <form
          className="adm-key-form"
          onSubmit={(e) => {
            e.preventDefault();
            void applyKey(row.rowId);
          }}
        >
          <label htmlFor={keyId}>This link has no key. Paste the key (the part after #):</label>
          <input
            id={keyId}
            className="adm-cell adm-key-input"
            value={row.keyDraft}
            spellCheck={false}
            autoCapitalize="off"
            onChange={(e) => editRow(row.rowId, { keyDraft: e.target.value })}
            aria-invalid={!!row.keyError || undefined}
            aria-describedby={row.keyError ? `${keyId}-err` : undefined}
          />
          <button type="submit" className="btn btn-sm btn-ink" data-intent="positive" data-fill="" disabled={!row.keyDraft.trim()}>
            Use key
          </button>
          {row.keyError && (
            <span id={`${keyId}-err`} className="adm-error-text" role="alert">
              {row.keyError}
            </span>
          )}
        </form>
      );
      break;
    case 'duplicate':
      body = (
        <>
          <span>
            {row.duplicate?.inBin ? 'In the bin' : 'Already in the library'}: “{row.duplicate?.title}”.
          </span>
          {row.duplicate?.canFillLinks ? (
            <label className="adm-dup-choice">
              <span className="sr-only">For row {numberOf(row.rowId)}</span>
              <select className="adm-cell adm-select" value={row.dupAction} onChange={(e) => editRow(row.rowId, { dupAction: e.target.value as 'skip' | 'fill' })}>
                <option value="skip">Skip</option>
                <option value="fill">Add the links to it</option>
              </select>
            </label>
          ) : (
            <span className="adm-muted">Skipped.</span>
          )}
        </>
      );
      break;
    case 'duplicate-in-file':
      body = <span>Same as row {row.duplicateOfRow ? numberOf(row.duplicateOfRow) : 'above'}.</span>;
      break;
    case 'needs-mega':
      body = <span>Instagram or YouTube only. Tick it to add a draft that can't go live until it has a MEGA link.</span>;
      break;
    case 'folder-limit':
      body = <span>Import at most five folders at a time.</span>;
      break;
    default:
      body = null;
  }
  if (!body) return null;
  return (
    <tr className="adm-irow-detail" data-status={row.status}>
      <td aria-hidden />
      <td colSpan={9}>
        <div className="adm-irow-why">{body}</div>
      </td>
    </tr>
  );
}

function Row({ row, n, order, numberOf }: { row: UIRow; n: string; order: string[]; numberOf: (rowId: string) => string }) {
  const tickable = canTick(row);
  const name = row.title.trim() || row.fileName || `row ${n}`;
  const megaCell = row.fileName ? (
    <>
      <span className="adm-ifile" title={row.fileName}>
        {row.fileName}
      </span>
      <span className="adm-imeta">
        {row.size ? <span>{formatBytes(row.size)}</span> : null}
        <Quality row={row} />
      </span>
    </>
  ) : row.mega ? (
    <span className="adm-muted">{row.status === 'checking' ? 'Checking the file…' : row.status === 'no-key' ? 'Key missing' : `MEGA file ${row.handle ?? ''}`}</span>
  ) : (
    <span className="adm-muted">No MEGA link</span>
  );
  return (
    <tr className="adm-irow" data-status={row.status} data-selected={row.selected ? '' : undefined} data-row={row.rowId}>
      <td className="adm-ic-tick">
        <label className="adm-tick">
          <input
            type="checkbox"
            checked={row.selected && tickable}
            disabled={!tickable}
            aria-label={`Import ${name}`}
            title={tickable ? undefined : STATUS_LABEL[row.status]}
            onChange={() => undefined}
            onClick={(e) => toggleRow(row.rowId, e.currentTarget.checked, e.shiftKey, order)}
          />
          <span className="adm-tick-box" aria-hidden>
            <Check className="size-3.5" />
          </span>
        </label>
      </td>
      <td className="adm-ic-n">{n}</td>
      <td className="adm-ic-status">
        <StatusChip tone={STATUS_TONE[row.status]} className="adm-istatus" title={row.status === 'duplicate' && row.duplicate?.inBin ? 'In the bin' : undefined}>
          {row.status === 'checking' && <span className="adm-spin adm-spin-sm" aria-hidden />}
          {row.status === 'duplicate' && row.duplicate?.inBin ? 'In the bin' : STATUS_LABEL[row.status]}
        </StatusChip>
      </td>
      <td className="adm-ic-title">
        <input
          className="adm-cell"
          value={row.title}
          maxLength={140}
          placeholder={row.check?.ok && row.check.suggestedTitle ? row.check.suggestedTitle : 'Untitled video'}
          aria-label={`Title, row ${n}`}
          onChange={(e) => editRow(row.rowId, { title: e.target.value })}
        />
        {row.titleFrom === 'file-name' && <span className="adm-cell-hint">from the file name</span>}
      </td>
      <td className="adm-ic-brand">
        <input className="adm-cell" value={row.brand} maxLength={60} placeholder="Add brand" aria-label={`Brand, row ${n}`} onChange={(e) => editRow(row.rowId, { brand: e.target.value })} />
      </td>
      <td className="adm-ic-mega">{megaCell}</td>
      <td className="adm-ic-posted">
        {row.instagram && (
          <a className="adm-glyph" href={row.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram link, row ${n}`} title={row.instagram}>
            <InstagramGlyph className="size-4" /><TextArrow glyph="↗" bare />
          </a>
        )}
        {row.youtube && (
          <a className="adm-glyph" href={row.youtube} target="_blank" rel="noopener noreferrer" aria-label={`YouTube link, row ${n}`} title={row.youtube}>
            <YouTubeGlyph className="size-4" /><TextArrow glyph="↗" bare />
          </a>
        )}
      </td>
      <td className="adm-ic-views">
        <input className="adm-cell" inputMode="numeric" value={row.viewsText} placeholder="0" aria-label={`Views, row ${n}`} onChange={(e) => editRow(row.rowId, { viewsText: e.target.value })} />
      </td>
      <td className="adm-ic-date">
        <input className="adm-cell" type="date" min="2000-01-01" value={row.uploadDateText} aria-label={`Upload date, row ${n}`} onChange={(e) => editRow(row.rowId, { uploadDateText: e.target.value })} />
      </td>
      <td className="adm-ic-cat">
        <input className="adm-cell" value={row.category ?? ''} maxLength={40} placeholder="Category" aria-label={`Category, row ${n}`} onChange={(e) => editRow(row.rowId, { category: e.target.value })} />
      </td>
      <td className="adm-ic-notes">
        <Notes row={row} n={n} />
      </td>
    </tr>
  );
}

function otherFiles(group: UIRow[]): string {
  const n = group.filter((x) => x.status === 'not-video').length;
  return n ? `, ${n} other ${n === 1 ? 'file' : 'files'}` : '';
}

export function ImportTable({ rows, all }: { rows: UIRow[]; all: UIRow[] }) {
  const collapsed = useImport((s) => s.collapsed);
  const order = rows.map((r) => r.rowId);
  const numbers = new Map(all.map((r, i) => [r.rowId, rowNumber(all, i)]));
  const numberOf = (rowId: string) => numbers.get(rowId) ?? '?';
  const groupKey = (r: UIRow) => (r.folder ? `${r.folder.handle}:${r.line}` : '');

  return (
    <div className="adm-itable-wrap">
      <table className="adm-itable">
        <caption className="sr-only">The videos found in the links. Tick the ones to import; each comes in as a draft.</caption>
        <thead>
          <tr>
            <th scope="col" className="adm-ic-tick">
              <span className="sr-only">Import</span>
            </th>
            <th scope="col" className="adm-ic-n">
              #
            </th>
            <th scope="col">Status</th>
            <th scope="col">Title</th>
            <th scope="col">Brand</th>
            <th scope="col">MEGA file</th>
            <th scope="col">Posted on</th>
            <th scope="col">Views</th>
            <th scope="col">Upload date</th>
            <th scope="col">Category</th>
            <th scope="col">
              <span className="sr-only">Notes</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const key = groupKey(r);
            const first = !!key && (i === 0 || groupKey(rows[i - 1]!) !== key);
            const hidden = !!key && collapsed[key];
            const inGroup = key ? rows.filter((x) => groupKey(x) === key) : [];
            return (
              <Fragment key={r.rowId}>
                {first && (
                  <tr className="adm-irow-folder">
                    <td colSpan={10}>
                      <button type="button" className="adm-folder-btn" aria-expanded={!hidden} onClick={() => toggleFolder(key)}>
                        {hidden ? <ChevronRight className="size-4" aria-hidden /> : <ChevronDown className="size-4" aria-hidden />}
                        <Folder className="size-4" aria-hidden />
                        <span>
                          Folder: {r.folder?.name ?? 'MEGA folder'} · {inGroup.filter((x) => x.status !== 'not-video').length}{' '}
                          {inGroup.filter((x) => x.status !== 'not-video').length === 1 ? 'video' : 'videos'}
                          {otherFiles(inGroup)}
                        </span>
                      </button>
                    </td>
                  </tr>
                )}
                {!hidden && (
                  <>
                    <Row row={r} n={numberOf(r.rowId)} order={order} numberOf={numberOf} />
                    <Detail row={r} numberOf={numberOf} />
                  </>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Rows shaped like the table while the server reads the links. */
export function ImportSkeleton({ count }: { count: number }) {
  return (
    <div className="adm-itable-wrap" aria-busy="true">
      <table className="adm-itable adm-itable-skel">
        <tbody>
          {Array.from({ length: Math.max(3, Math.min(count, 10)) }, (_, i) => (
            <tr key={i} className="adm-irow">
              <td className="adm-ic-tick">
                <span className="skeleton adm-skel-box" />
              </td>
              <td className="adm-ic-n">{i + 1}</td>
              <td>
                <span className="skeleton adm-skel-chip" />
              </td>
              <td colSpan={3}>
                <span className="skeleton adm-skel-line" />
              </td>
              <td colSpan={4}>
                <span className="skeleton adm-skel-line adm-skel-short" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
