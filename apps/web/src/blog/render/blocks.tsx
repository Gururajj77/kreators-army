// Every block of FORMAT.md section 5. Static first: each block's whole text is in the markup in both modes; the live page only adds behaviour (a
// table's search and filters, copy buttons). Ids are the authored ones, never slugified from text, because links depend on them.

import { ArrowRight, Play, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MechanismArt } from '../../components/demos/art';
import { MECHANISMS, PRIMARY_ACTION } from '../../lib/content';
import { plainInline } from '../inline';
import type {
  Block,
  CalloutBlock,
  ComparisonBlock,
  DefinitionBlock,
  FrameworkBlock,
  QuoteBlock,
  ScriptBlock,
  StatBlock,
  StepsBlock,
  TableBlock,
  VideoBlock,
} from '../types';
import { useBlog, useLive } from './context';
import { CopyButton, Inline, durationWords } from './Inline';
import { Widget } from './widgets';

const TONE_LABEL: Record<CalloutBlock['tone'], string> = { tip: 'Tip', warning: 'Watch out', note: 'Note' };
const CHIP_TONES = ['sochu', 'bolu', 'tiko', 'gola'] as const;

/** The site's one primary action, as PrimaryCta draws it (a plain link here; the live page routes the click). */
export function PrimaryAction({ className }: { className?: string }) {
  return (
    <a href={PRIMARY_ACTION.to} className={`btn btn-accent btn-disc ${className ?? ''}`}>
      <span className="label-roll">
        <span>{PRIMARY_ACTION.label}</span>
        <span aria-hidden>{PRIMARY_ACTION.label}</span>
      </span>
      <span className="arrow-disc" data-kind="go" aria-hidden>
        <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
          <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

function Quote({ b }: { b: QuoteBlock }) {
  const { cites } = useBlog();
  return (
    <figure className="bp-quote">
      <blockquote>
        <p>
          <Inline text={b.text} />
        </p>
      </blockquote>
      <figcaption>
        {b.attribution}
        {b.source && cites.has(b.source) && <Inline text={`[^${b.source}]`} />}
      </figcaption>
    </figure>
  );
}

function Callout({ b }: { b: CalloutBlock }) {
  return (
    <aside className="bp-callout" data-tone={b.tone} aria-label={b.title ?? TONE_LABEL[b.tone]}>
      <p className="bp-callout-title">{b.title ?? TONE_LABEL[b.tone]}</p>
      <p>
        <Inline text={b.text} />
      </p>
      {b.items && b.items.length > 0 && (
        <ul className="read-list">
          {b.items.map((item, i) => (
            <li key={i}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function Definition({ b }: { b: DefinitionBlock }) {
  return (
    <dl className="bp-def" id={b.id}>
      <dt>
        <dfn>{b.term}</dfn>
      </dt>
      <dd>
        <Inline text={b.text} />
        {b.source && <Inline text={`[^${b.source}]`} />}
      </dd>
    </dl>
  );
}

// ---------- Tables ----------

const fold = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase();

function Table({ b, index }: { b: TableBlock; index: number }) {
  const live = useLive();
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<string | null>(null);
  const plainRows = useMemo(() => b.rows.map((r) => r.map((c) => plainInline(c))), [b.rows]);
  const chips = useMemo(() => {
    if (b.filterColumn === undefined) return [];
    const seen: string[] = [];
    for (const r of plainRows) {
      const v = r[b.filterColumn];
      if (v && !seen.includes(v)) seen.push(v);
    }
    return seen;
  }, [plainRows, b.filterColumn]);
  const words = fold(query).split(/\s+/).filter(Boolean);
  const shown = b.rows
    .map((row, i) => ({ row, i }))
    .filter(({ i }) => {
      const cells = plainRows[i] ?? [];
      if (chip !== null && b.filterColumn !== undefined && cells[b.filterColumn] !== chip) return false;
      if (!words.length) return true;
      const hay = fold(cells.join(' '));
      return words.every((w) => hay.includes(w));
    });
  const baseId = `table-${index}`;
  const tools = Boolean(b.search) && live;
  const copy = b.copyColumn !== undefined && live;

  return (
    <figure className="bp-table" data-search={b.search ? '' : undefined} data-cols={b.head.length}>
      {tools && (
        <div className="bp-table-tools">
          <label className="bp-table-search">
            <Search className="size-4" aria-hidden />
            <span className="sr-only">Search {b.caption}</span>
            <input type="search" className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-controls={baseId} />
          </label>
          {chips.length > 1 && (
            <div className="chip-rail bp-chips" data-mode="multi" data-size="sm" data-wrap="" role="group" aria-label={`Filter by ${b.head[b.filterColumn ?? 0] ?? 'type'}`}>
              {[null, ...chips].map((c) => (
                <button key={c ?? '__all'} type="button" className="chip-opt" aria-pressed={chip === c} data-on={chip === c ? '' : undefined} onClick={() => setChip(c)}>
                  <span className="chip-label">{c ?? 'All'}</span>
                </button>
              ))}
            </div>
          )}
          <p className="bp-table-count small" aria-live="polite">
            {shown.length === b.rows.length ? `${b.rows.length} rows` : `${shown.length} of ${b.rows.length} rows`}
          </p>
        </div>
      )}
      <div className="bp-table-scroll">
        <table id={baseId}>
          <caption>{b.caption}</caption>
          <thead>
            <tr>
              {b.head.map((h, i) => (
                <th key={i} scope="col">
                  {h}
                </th>
              ))}
              {copy && (
                <th scope="col">
                  <span className="sr-only">Copy</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {shown.map(({ row, i }) => (
              <tr key={i}>
                {row.map((cell, c) =>
                  c === 0 && b.rowHeaders ? (
                    <th key={c} scope="row" data-label={b.head[c]}>
                      <Inline text={cell} />
                    </th>
                  ) : (
                    <td key={c} data-label={b.head[c]}>
                      <Inline text={cell} />
                    </td>
                  ),
                )}
                {copy && (
                  <td className="bp-table-copy">
                    <CopyButton text={plainRows[i]?.[b.copyColumn ?? 0] ?? ''} label={`Copy: ${plainRows[i]?.[b.copyColumn ?? 0] ?? ''}`} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {tools && shown.length === 0 && (
          <p className="bp-table-empty small">
            Nothing matches.{' '}
            <button
              type="button"
              className="bp-textbtn"
              onClick={() => {
                setQuery('');
                setChip(null);
              }}
            >
              Clear the search
            </button>
          </p>
        )}
      </div>
    </figure>
  );
}

// ---------- Script, steps, framework, comparison ----------

const scriptText = (b: ScriptBlock) =>
  [b.title, ...b.lines.map((l) => ('direction' in l ? `[${l.direction}]` : `${l.speaker}: ${l.text}`))].join('\n');

function Script({ b }: { b: ScriptBlock }) {
  const live = useLive();
  return (
    <figure className="bp-script" id={b.id}>
      <figcaption className="bp-script-head">
        <span className="bp-kind">Script</span>
        <span className="bp-script-title">{b.title}</span>
        {live && <CopyButton text={scriptText(b)} label={`Copy the script: ${b.title}`} />}
      </figcaption>
      {b.context && (
        <p className="bp-script-context">
          <Inline text={b.context} />
        </p>
      )}
      <ol className="bp-script-lines">
        {b.lines.map((l, i) =>
          'direction' in l ? (
            <li key={i} className="bp-line" data-kind="direction">
              <em>{l.direction}</em>
            </li>
          ) : (
            <li key={i} className="bp-line" data-kind="speech">
              <span className="bp-speaker">{l.speaker}</span>
              <span className="bp-said">{l.text}</span>
            </li>
          ),
        )}
      </ol>
    </figure>
  );
}

function Steps({ b }: { b: StepsBlock }) {
  const time = durationWords(b.totalTime);
  return (
    <div className="bp-steps" id={b.id} role="group" aria-labelledby={`${b.id}-title`}>
      <p className="bp-kind">Step by step{time ? ` · about ${time}` : ''}</p>
      <p className="bp-block-title" id={`${b.id}-title`}>
        {b.title}
      </p>
      {b.intro && (
        <p>
          <Inline text={b.intro} />
        </p>
      )}
      {b.supplies && b.supplies.length > 0 && (
        <p className="bp-supplies small">
          <strong>You need:</strong> {b.supplies.join(', ')}
        </p>
      )}
      <ol className="bp-steps-list">
        {b.steps.map((s, i) => (
          <li key={i}>
            <span className="bp-step-n" aria-hidden>
              {i + 1}
            </span>
            <div>
              <p className="bp-step-name">{s.name}</p>
              <p>
                <Inline text={s.text} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Framework({ b }: { b: FrameworkBlock }) {
  return (
    <div className="bp-fw" id={b.id} role="group" aria-labelledby={`${b.id}-title`}>
      <p className="bp-kind">Framework</p>
      <p className="bp-fw-name" id={`${b.id}-title`}>
        {b.name}
      </p>
      {b.tagline && <p className="bp-fw-tagline">{b.tagline}</p>}
      {b.intro && (
        <p>
          <Inline text={b.intro} />
        </p>
      )}
      <ol className="bp-fw-parts">
        {b.parts.map((p, i) => (
          <li key={i}>
            <span className="bp-fw-key">{p.key}</span>
            <div>
              <p className="bp-fw-part">{p.name}</p>
              <p>
                <Inline text={p.text} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Comparison({ b }: { b: ComparisonBlock }) {
  return (
    <div className="bp-compare" role="group" aria-label={b.title ?? `${b.left.label} and ${b.right.label}`}>
      {b.title && <p className="bp-block-title">{b.title}</p>}
      <div className="bp-compare-cols">
        {[b.left, b.right].map((side, i) => (
          <div key={i} className="bp-compare-col" data-side={i ? 'right' : 'left'}>
            <p className="bp-compare-label">{side.label}</p>
            <ul>
              {side.items.map((item, j) => (
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {b.verdict && (
        <p className="bp-verdict">
          <Inline text={b.verdict} />
        </p>
      )}
    </div>
  );
}

function Stats({ stats }: { stats: StatBlock[] }) {
  return (
    <div className="bp-stats" data-count={stats.length}>
      {stats.map((s, i) => (
        <div key={i} className="bp-stat">
          <p className="bp-stat-value">{s.value}</p>
          <p className="bp-stat-label">
            {s.label}
            <Inline text={`[^${s.source}]`} />
          </p>
          {s.note && <p className="bp-stat-note">{s.note}</p>}
        </div>
      ))}
    </div>
  );
}

// ---------- Video and mechanisms ----------

/** The build's library video: no live data at build time, so the caption and a way to the library. The live page draws the real tile. */
function StaticVideo({ b }: { b: VideoBlock }) {
  return (
    <figure className="bp-video" data-state="static">
      <a className="bp-video-frame" href={`/video-library?q=${encodeURIComponent(b.brand)}`}>
        <span className="bp-video-play" aria-hidden>
          <Play className="size-5" />
        </span>
        <span className="bp-video-name">
          {b.brand}: {b.title}
        </span>
        <span className="sr-only">Watch it in the video library</span>
      </a>
      {b.caption && (
        <figcaption>
          <Inline text={b.caption} />
        </figcaption>
      )}
    </figure>
  );
}

function Mechanisms({ caption }: { caption?: string }) {
  const { mechanisms } = useBlog();
  if (mechanisms) return <>{mechanisms(caption)}</>;
  return (
    <figure className="bp-mechs">
      <ul className="read-mechs" aria-label={caption ?? 'The eleven mechanisms'}>
        {MECHANISMS.map((m, i) => (
          <li key={m} className="mech-chip" data-tone={CHIP_TONES[i % CHIP_TONES.length]}>
            <span className="mech-frame" aria-hidden>
              <MechanismArt name={m} />
            </span>
            <span className="mech-name">{m}</span>
          </li>
        ))}
      </ul>
      {caption && <figcaption className="small">{caption}</figcaption>}
    </figure>
  );
}

function MidCta({ text }: { text?: string }) {
  return (
    <aside className="bp-cta" aria-label={PRIMARY_ACTION.label}>
      {text && (
        <p>
          <Inline text={text} />
        </p>
      )}
      <div className="bp-cta-actions">
        <PrimaryAction />
        <a href="/video-library" className="bp-cta-more">
          Or browse the video library
          <ArrowRight className="size-4" aria-hidden />
        </a>
      </div>
    </aside>
  );
}

// ---------- One block ----------

function BlockView({ b, index }: { b: Exclude<Block, StatBlock>; index: number }) {
  const { video } = useBlog();
  if (typeof b === 'string')
    return (
      <p>
        <Inline text={b} />
      </p>
    );
  switch (b.type) {
    case 'h2':
      return (
        <h2 id={b.id} className="bp-h2">
          {b.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 id={b.id} className="bp-h3">
          {b.text}
        </h3>
      );
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul';
      return (
        <Tag className={b.ordered ? 'read-list read-list-ordered' : 'read-list'}>
          {b.items.map((item, i) => (
            <li key={i}>
              <Inline text={item} />
            </li>
          ))}
        </Tag>
      );
    }
    case 'quote':
      return <Quote b={b} />;
    case 'callout':
      return <Callout b={b} />;
    case 'definition':
      return <Definition b={b} />;
    case 'table':
      return <Table b={b} index={index} />;
    case 'divider':
      return <hr className="bp-divider" />;
    case 'script':
      return <Script b={b} />;
    case 'steps':
      return <Steps b={b} />;
    case 'framework':
      return <Framework b={b} />;
    case 'comparison':
      return <Comparison b={b} />;
    case 'video':
      return video ? <>{video(b)}</> : <StaticVideo b={b} />;
    case 'mechanisms':
      return <Mechanisms caption={b.caption} />;
    case 'cta':
      return <MidCta text={b.text} />;
    case 'widget':
      return <Widget b={b} />;
  }
}

const isStat = (b: Block | undefined): b is StatBlock => typeof b === 'object' && b !== null && b.type === 'stat';

/** A post body. Consecutive stat blocks render as one row. */
export function Blocks({ blocks }: { blocks: readonly Block[] }) {
  const out = [];
  for (let i = 0; i < blocks.length; ) {
    const b = blocks[i];
    if (isStat(b)) {
      const run: StatBlock[] = [];
      const start = i;
      while (isStat(blocks[i])) run.push(blocks[i++] as StatBlock);
      out.push(<Stats key={start} stats={run} />);
      continue;
    }
    if (b !== undefined) out.push(<BlockView key={i} b={b} index={i} />);
    i++;
  }
  return <>{out}</>;
}
