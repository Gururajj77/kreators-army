// The thirteen widgets of FORMAT.md section 6. Each renders all of its text as static HTML (the build's prerender: every question and answer, every
// slide, both sides, every outcome and path), makes no network call, keeps any state in localStorage under ka:blog:<slug>:<widget id>, works by
// keyboard and screen reader, and adds no inline script. The live page renders the same parts with their behaviour.

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { runCalculator } from '../formula';
import type {
  BeforeAfterProps,
  CalculatorProps,
  ChecklistProps,
  DecisionTreeProps,
  FlipCardsProps,
  PickerProps,
  PollProps,
  QuestionBuilderProps,
  QuizProps,
  RevealProps,
  ScoreCardProps,
  SlidesProps,
  TimelineProps,
  WidgetBlock,
  WidgetName,
} from '../types';
import { motionAllowed, useLive, useStored } from './context';
import { CopyButton, Inline } from './Inline';

const KIND: Record<WidgetName, string> = {
  quiz: 'Quiz',
  checklist: 'Checklist',
  questionBuilder: 'Question builder',
  reveal: 'Tap to reveal',
  slides: 'Slides',
  calculator: 'Calculator',
  beforeAfter: 'Before and after',
  timeline: 'Timeline',
  poll: 'Quick poll',
  flipCards: 'Flip cards',
  scoreCard: 'Scorecard',
  picker: 'Picker',
  decisionTree: 'Decision guide',
};

function Frame({ id, kind, title, intro, label, children }: { id: string; kind: WidgetName; title?: string; intro?: string; label?: string; children: ReactNode }) {
  return (
    <div className="bw" data-widget={kind} id={id} role="group" aria-labelledby={title ? `${id}-title` : undefined} aria-label={title ? undefined : (label ?? KIND[kind])}>
      <p className="bw-kind">{KIND[kind]}</p>
      {title && (
        <p className="bw-title" id={`${id}-title`}>
          {title}
        </p>
      )}
      {intro && (
        <p className="bw-intro">
          <Inline text={intro} />
        </p>
      )}
      {children}
    </div>
  );
}

function ResetButton({ onClick, children = 'Start again' }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button type="button" className="bw-textbtn" onClick={onClick}>
      <RotateCcw className="size-4" aria-hidden />
      {children}
    </button>
  );
}

const isNumOrNullArray = (n: number) => (v: unknown): v is (number | null)[] => Array.isArray(v) && v.length === n && v.every((x) => x === null || (typeof x === 'number' && Number.isInteger(x)));
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

/** The last band whose `min` the value reaches; the first band when none does. */
function bandFor<B extends { min: number }>(bands: readonly B[], value: number): B | undefined {
  let out = bands[0];
  for (const b of bands) if (b.min <= value) out = b;
  return out;
}

// ---------- quiz ----------

function Quiz({ id, p }: { id: string; p: QuizProps }) {
  const live = useLive();
  const [picks, setPicks] = useState<(number | null)[]>(() => p.questions.map(() => null));
  const answered = picks.filter((x) => x !== null).length;
  const done = answered === p.questions.length;
  const total = picks.reduce<number>((s, x, qi) => s + (x === null ? 0 : (p.questions[qi]?.options[x]?.points ?? 0)), 0);
  const max = p.questions.reduce((s, q) => s + Math.max(...q.options.map((o) => o.points)), 0);
  const band = bandFor(p.results, total);

  return (
    <Frame id={id} kind="quiz" title={p.title} intro={p.intro}>
      <ol className="bw-qs">
        {p.questions.map((q, qi) => {
          const picked = picks[qi] ?? null;
          const why = picked === null ? undefined : q.options[picked]?.why;
          return (
            <li key={qi} className="bw-q">
              <fieldset>
                <legend className="bw-q-text">
                  <span className="bw-q-n">
                    {qi + 1} of {p.questions.length}
                  </span>
                  {q.q}
                </legend>
                <div className="bw-options">
                  {q.options.map((o, oi) => (
                    <label key={oi} className="bw-option" data-picked={picked === oi ? '' : undefined}>
                      <input
                        type="radio"
                        name={`${id}-q${qi}`}
                        checked={live ? picked === oi : undefined}
                        onChange={live ? () => setPicks(picks.map((x, i) => (i === qi ? oi : x))) : undefined}
                        readOnly={!live}
                      />
                      <span>{o.text}</span>
                    </label>
                  ))}
                </div>
                {live ? (
                  why && (
                    <p className="bw-why">
                      <Inline text={why} />
                    </p>
                  )
                ) : (
                  q.options.some((o) => o.why) && (
                    <ul className="bw-whys">
                      {q.options.map((o, oi) =>
                        o.why ? (
                          <li key={oi}>
                            <strong>{o.text}:</strong> <Inline text={o.why} />
                          </li>
                        ) : null,
                      )}
                    </ul>
                  )
                )}
                {q.explain && (!live || picked !== null) && (
                  <p className="bw-explain">
                    <Inline text={q.explain} />
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      <div className="bw-result" aria-live="polite">
        {live ? (
          done && band ? (
            <>
              <p className="bw-score">
                {total} of {max} points
              </p>
              <p className="bw-result-title">{band.title}</p>
              <p>
                <Inline text={band.text} />
              </p>
              <ResetButton onClick={() => setPicks(p.questions.map(() => null))} />
            </>
          ) : (
            <p className="bw-hint">
              {answered} of {p.questions.length} answered. Your result shows when you have answered them all.
            </p>
          )
        ) : (
          <ul className="bw-bands">
            {p.results.map((r, i) => (
              <li key={i}>
                <strong>
                  {r.min} points or more: {r.title}.
                </strong>{' '}
                <Inline text={r.text} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Frame>
  );
}

// ---------- checklist ----------

function Checklist({ id, p }: { id: string; p: ChecklistProps }) {
  const live = useLive();
  const [ticked, setTicked] = useStored<string[]>(id, [], isStringArray);
  const on = new Set(ticked);
  const count = p.items.filter((i) => on.has(i.id)).length;
  const all = count === p.items.length;
  return (
    <Frame id={id} kind="checklist" title={p.title} intro={p.intro}>
      <ul className="bw-checks">
        {p.items.map((item) => (
          <li key={item.id}>
            <label className="bw-check">
              <input
                type="checkbox"
                checked={live ? on.has(item.id) : undefined}
                readOnly={!live}
                onChange={live ? () => setTicked(on.has(item.id) ? ticked.filter((x) => x !== item.id) : [...ticked, item.id]) : undefined}
              />
              <span className="bw-check-text">
                <Inline text={item.text} />
                {item.detail && (
                  <span className="bw-check-detail">
                    <Inline text={item.detail} />
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {live ? (
        <div className="bw-foot">
          <p className="bw-hint" aria-live="polite">
            {all && p.done ? <Inline text={p.done} /> : `${count} of ${p.items.length} done. Ticks are saved on this device only.`}
          </p>
          {count > 0 && <ResetButton onClick={() => setTicked([])}>Clear the ticks</ResetButton>}
        </div>
      ) : (
        p.done && (
          <p className="bw-hint">
            <Inline text={p.done} />
          </p>
        )
      )}
    </Frame>
  );
}

// ---------- questionBuilder ----------

const PLACEHOLDER = /\{([a-z0-9]+(?:-[a-z0-9]+)*)\}/g;

function QuestionBuilder({ id, p }: { id: string; p: QuestionBuilderProps }) {
  const live = useLive();
  const empty = useMemo(() => Object.fromEntries(p.fields.map((f) => [f.id, ''])), [p.fields]);
  const [values, setValues] = useStored<Record<string, string>>(id, empty, (v): v is Record<string, string> => !!v && typeof v === 'object' && !Array.isArray(v));
  const value = (fieldId: string) => (live ? values[fieldId]?.trim() : '') || p.fields.find((f) => f.id === fieldId)?.example || fieldId;
  const fill = (t: string) => t.replace(PLACEHOLDER, (_, f: string) => value(f));
  const parts = (t: string) => {
    const out: ReactNode[] = [];
    let last = 0;
    for (const m of t.matchAll(PLACEHOLDER)) {
      out.push(t.slice(last, m.index));
      out.push(
        <span key={m.index} className="bw-slot">
          {value(m[1] as string)}
        </span>,
      );
      last = (m.index ?? 0) + m[0].length;
    }
    out.push(t.slice(last));
    return out;
  };
  const groups: { name?: string; items: QuestionBuilderProps['templates'] }[] = [];
  for (const t of p.templates) {
    const g = groups.find((x) => x.name === t.group);
    if (g) g.items.push(t);
    else groups.push({ name: t.group, items: [t] });
  }
  const allText = groups.map((g) => [g.name, ...g.items.map((t) => fill(t.text))].filter(Boolean).join('\n')).join('\n\n');

  return (
    <Frame id={id} kind="questionBuilder" title={p.title} intro={p.intro}>
      <div className="bw-fields">
        {p.fields.map((f) => (
          <label key={f.id} className="bw-field">
            <span className="bw-field-label">{f.label}</span>
            <input
              type="text"
              className="field"
              placeholder={f.placeholder}
              value={live ? (values[f.id] ?? '') : undefined}
              readOnly={!live}
              onChange={live ? (e) => setValues({ ...values, [f.id]: e.target.value }) : undefined}
              autoComplete="off"
            />
          </label>
        ))}
      </div>
      <div className="bw-lines-wrap" aria-live="off">
        {groups.map((g, gi) => (
          <div key={gi} className="bw-lines-group">
            {g.name && <p className="bw-group">{g.name}</p>}
            <ol className="bw-lines">
              {g.items.map((t, ti) => (
                <li key={ti} className="bw-line">
                  <span className="bw-line-text">
                    {parts(t.text)}
                    {t.mechanism && <span className="bw-tag">{t.mechanism}</span>}
                  </span>
                  {live && <CopyButton text={fill(t.text)} label={`Copy: ${fill(t.text)}`} />}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      {live && (
        <div className="bw-foot">
          <CopyButton text={allText} label="Copy every line" visible="Copy all" />
          {Object.values(values).some((v) => v.trim()) && <ResetButton onClick={() => setValues(empty)}>Clear the fields</ResetButton>}
        </div>
      )}
      {p.note && (
        <p className="bw-note">
          <Inline text={p.note} />
        </p>
      )}
    </Frame>
  );
}

// ---------- reveal ----------

function Reveal({ id, p }: { id: string; p: RevealProps }) {
  const live = useLive();
  const [open, setOpen] = useState<boolean[]>(() => p.items.map(() => false));
  const first = p.firstLabel ?? 'First answer';
  const second = p.secondLabel ?? 'After the follow-up';
  return (
    <Frame id={id} kind="reveal" title={p.title} label="The first answer and the second">
      <ol className="bw-reveals">
        {p.items.map((item, i) => {
          const shown = !live || open[i];
          return (
            <li key={i} className="bw-reveal">
              <p className="bw-reveal-q">{item.question}</p>
              <div className="bw-reveal-a" data-which="first">
                <p className="bw-reveal-label">{first}</p>
                <p>
                  <Inline text={item.first} />
                </p>
              </div>
              <div className="bw-reveal-a" data-which="second" id={`${id}-${i}-second`} hidden={!shown}>
                <p className="bw-reveal-label">{second}</p>
                <p>
                  <Inline text={item.second} />
                </p>
                {item.note && (
                  <p className="bw-note">
                    <Inline text={item.note} />
                  </p>
                )}
              </div>
              {live && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm bw-reveal-btn"
                  aria-expanded={open[i] ?? false}
                  aria-controls={`${id}-${i}-second`}
                  onClick={() => setOpen(open.map((x, j) => (j === i ? !x : x)))}
                >
                  {open[i] ? 'Hide' : 'Show'} the second answer
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}

// ---------- slides ----------

function Slides({ id, p }: { id: string; p: SlidesProps }) {
  const live = useLive();
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const n = p.slides.length;

  useEffect(() => {
    const el = track.current;
    if (!el || !live) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const w = el.clientWidth || 1;
      setAt(Math.max(0, Math.min(n - 1, Math.round(el.scrollLeft / w))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [live, n]);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const to = Math.max(0, Math.min(n - 1, i));
    el.scrollTo({ left: to * el.clientWidth, behavior: motionAllowed() ? 'smooth' : 'auto' });
    setAt(to);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') go(at + 1);
    else if (e.key === 'ArrowLeft') go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(n - 1);
    else return;
    e.preventDefault();
  };

  return (
    <Frame id={id} kind="slides" title={p.title}>
      <div
        ref={track}
        className="bw-slides"
        tabIndex={live ? 0 : undefined}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${p.title}: use the arrow keys to move between slides`}
        onKeyDown={live ? onKey : undefined}
      >
        <ol className="bw-slides-list">
          {p.slides.map((s, i) => (
            <li key={i} className="bw-slide" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`} data-first={i === 0 ? '' : undefined}>
              <p className="bw-slide-n" aria-hidden>
                {i + 1}/{n}
              </p>
              <p className="bw-slide-heading">{s.heading}</p>
              {s.text && (
                <p className="bw-slide-text">
                  <Inline text={s.text} />
                </p>
              )}
              {s.points && s.points.length > 0 && (
                <ul className="bw-slide-points">
                  {s.points.map((pt, j) => (
                    <li key={j}>
                      <Inline text={pt} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
      {live && (
        <div className="bw-slides-nav">
          <button type="button" className="bw-round" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous slide">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <div className="bw-dots" aria-hidden>
            {p.slides.map((_, i) => (
              <span key={i} data-on={i === at ? '' : undefined} />
            ))}
          </div>
          <p className="bw-slides-pos" aria-live="polite">
            Slide {at + 1} of {n}
          </p>
          <button type="button" className="bw-round" onClick={() => go(at + 1)} disabled={at === n - 1} aria-label="Next slide">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      )}
    </Frame>
  );
}

// ---------- calculator ----------

function formatOut(v: number, o: CalculatorProps['outputs'][number]): string {
  if (!Number.isFinite(v)) return '–';
  const d = o.decimals ?? 0;
  const num = v.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (o.format === 'inr') return `₹${num}`;
  if (o.format === 'percent') return `${num}%`;
  return num;
}

function Calculator({ id, p }: { id: string; p: CalculatorProps }) {
  const live = useLive();
  const defaults = useMemo(() => Object.fromEntries(p.inputs.map((i) => [i.key, i.default])), [p.inputs]);
  const [stored, setStored] = useStored<Record<string, number>>(id, defaults, (v): v is Record<string, number> => !!v && typeof v === 'object' && !Array.isArray(v));
  // What the reader is typing, kept as text so an empty box or a half-typed number is allowed; the sums use the last valid value.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const values: Record<string, number> = {};
  for (const i of p.inputs) {
    const v = live ? stored[i.key] : i.default;
    values[i.key] = typeof v === 'number' && Number.isFinite(v) ? Math.min(i.max, Math.max(i.min, v)) : i.default;
  }
  const out = runCalculator(p.inputs, p.outputs, values);
  const set = (key: string, raw: string) => {
    setDraft({ ...draft, [key]: raw });
    const n = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(n)) setStored({ ...values, [key]: n });
  };

  return (
    <Frame id={id} kind="calculator" title={p.title} intro={p.intro}>
      <div className="bw-calc-in">
        {p.inputs.map((i) => {
          const labelId = `${id}-${i.key}-label`;
          const v = values[i.key] ?? i.default;
          return (
            <div key={i.key} className="bw-calc-field">
              <span className="bw-field-label" id={labelId}>
                {i.label}
                {i.unit && <span className="bw-unit"> ({i.unit})</span>}
              </span>
              <div className="bw-calc-row">
                <input
                  type="range"
                  min={i.min}
                  max={i.max}
                  step={i.step}
                  value={v}
                  aria-labelledby={labelId}
                  readOnly={!live}
                  disabled={!live}
                  onChange={live ? (e) => set(i.key, e.target.value) : undefined}
                />
                <input
                  type="number"
                  className="field bw-num"
                  min={i.min}
                  max={i.max}
                  step={i.step}
                  value={live ? (draft[i.key] ?? String(v)) : v}
                  aria-labelledby={labelId}
                  inputMode="decimal"
                  readOnly={!live}
                  onChange={live ? (e) => set(i.key, e.target.value) : undefined}
                  onBlur={live ? () => setDraft({ ...draft, [i.key]: String(v) }) : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>
      <dl className="bw-calc-out" aria-live="polite">
        {p.outputs.map((o) => (
          <div key={o.key}>
            <dt>{o.label}</dt>
            <dd>
              {formatOut(out[o.key] ?? Number.NaN, o)}
              {o.unit && Number.isFinite(out[o.key]) && <span className="bw-unit"> {o.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
      {!live && <p className="bw-hint">Worked out with the starting values above. Change them on the page to use your own.</p>}
      <p className="bw-disclaimer">{p.disclaimer}</p>
      {live && p.inputs.some((i) => values[i.key] !== i.default) && (
        <div className="bw-foot">
          <ResetButton
            onClick={() => {
              setStored(defaults);
              setDraft({});
            }}
          >
            Back to the starting values
          </ResetButton>
        </div>
      )}
    </Frame>
  );
}

// ---------- beforeAfter ----------

function BeforeAfter({ id, p }: { id: string; p: BeforeAfterProps }) {
  const live = useLive();
  const [side, setSide] = useState<'before' | 'after'>('before');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const sides = [
    { key: 'before' as const, s: p.before },
    { key: 'after' as const, s: p.after },
  ];
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 'before' : e.key === 'End' ? 'after' : side === 'before' ? 'after' : 'before';
    setSide(next);
    tabs.current[next === 'before' ? 0 : 1]?.focus();
  };
  return (
    <Frame id={id} kind="beforeAfter" title={p.title} label={`${p.before.label} and ${p.after.label}`}>
      {live && (
        <div className="bw-ba-tabs" role="tablist" aria-label={p.title ?? 'Before and after'} onKeyDown={onKey}>
          {sides.map(({ key, s }, i) => (
            <button
              key={key}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${key}`}
              aria-selected={side === key}
              aria-controls={`${id}-panel-${key}`}
              tabIndex={side === key ? 0 : -1}
              className="bw-ba-tab"
              data-on={side === key ? '' : undefined}
              onClick={() => setSide(key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div className="bw-ba-panels" data-live={live ? '' : undefined}>
        {sides.map(({ key, s }) => (
          <div
            key={key}
            className="bw-ba-panel"
            data-side={key}
            id={`${id}-panel-${key}`}
            role={live ? 'tabpanel' : undefined}
            aria-labelledby={live ? `${id}-tab-${key}` : undefined}
            hidden={live && side !== key}
          >
            {!live && <p className="bw-reveal-label">{s.label}</p>}
            <p className="bw-ba-text">
              <Inline text={s.text} />
            </p>
            {s.points && s.points.length > 0 && (
              <ul className="bw-ba-points">
                {s.points.map((pt, i) => (
                  <li key={i}>
                    <Inline text={pt} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {p.note && (
        <p className="bw-note">
          <Inline text={p.note} />
        </p>
      )}
    </Frame>
  );
}

// ---------- timeline ----------

function Timeline({ id, p }: { id: string; p: TimelineProps }) {
  return (
    <Frame id={id} kind="timeline" title={p.title} intro={p.intro}>
      <ol className="bw-tl">
        {p.items.map((it, i) => (
          <li key={i} className="bw-tl-item">
            <p className="bw-tl-when">{it.when}</p>
            <div className="bw-tl-body">
              <p className="bw-tl-title">{it.title}</p>
              <p>
                <Inline text={it.text} />
              </p>
              {it.tasks && it.tasks.length > 0 && (
                <ul className="read-list">
                  {it.tasks.map((t, j) => (
                    <li key={j}>
                      <Inline text={t} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

// ---------- poll ----------

function Poll({ id, p }: { id: string; p: PollProps }) {
  const live = useLive();
  const [pick, setPick] = useStored<number | null>(id, null, (v): v is number | null => v === null || (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < p.options.length));
  return (
    <Frame id={id} kind="poll" label={p.question}>
      <fieldset className="bw-poll">
        <legend className="bw-title">{p.question}</legend>
        <div className="bw-options">
          {p.options.map((o, i) => (
            <label key={i} className="bw-option" data-picked={live && pick === i ? '' : undefined}>
              <input type="radio" name={`${id}-poll`} checked={live ? pick === i : undefined} readOnly={!live} onChange={live ? () => setPick(i) : undefined} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="bw-result" aria-live="polite">
        {live ? (
          pick !== null && (
            <>
              {p.after && (
                <p>
                  <Inline text={p.after} />
                </p>
              )}
              <div className="bw-foot">
                <p className="bw-hint">Your pick stays on this device. Nothing is sent or counted.</p>
                <ResetButton onClick={() => setPick(null)}>Change my pick</ResetButton>
              </div>
            </>
          )
        ) : (
          p.after && (
            <p>
              <Inline text={p.after} />
            </p>
          )
        )}
      </div>
    </Frame>
  );
}

// ---------- flipCards ----------

function FlipCards({ id, p }: { id: string; p: FlipCardsProps }) {
  const live = useLive();
  const [flipped, setFlipped] = useState<boolean[]>(() => p.cards.map(() => false));
  const flip = (i: number) => setFlipped(flipped.map((x, j) => (j === i ? !x : x)));
  return (
    <Frame id={id} kind="flipCards" title={p.title} label="Flip cards">
      {live && <p className="bw-hint">Tap a card to turn it over.</p>}
      <ul className="bw-flips" data-live={live ? '' : undefined}>
        {p.cards.map((c, i) => {
          const f = live && flipped[i];
          return (
            <li key={i} className="bw-flip" data-flipped={f ? '' : undefined}>
              <div className="bw-flip-face" data-face="front" inert={live && f ? true : undefined}>
                {c.tag && <span className="bw-tag">{c.tag}</span>}
                {live ? (
                  <button type="button" className="bw-flip-btn" aria-expanded={false} aria-controls={`${id}-${i}-back`} onClick={() => flip(i)}>
                    {c.front}
                  </button>
                ) : (
                  <p className="bw-flip-front">{c.front}</p>
                )}
              </div>
              <div className="bw-flip-face" data-face="back" id={`${id}-${i}-back`} inert={live && !f ? true : undefined}>
                <p>
                  <Inline text={c.back} />
                </p>
                {live && (
                  <button type="button" className="bw-textbtn" aria-expanded onClick={() => flip(i)}>
                    <RotateCcw className="size-4" aria-hidden />
                    Turn back
                    <span className="sr-only">: {c.front}</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

// ---------- scoreCard ----------

function ScoreCard({ id, p }: { id: string; p: ScoreCardProps }) {
  const live = useLive();
  const n = p.criteria.length;
  const [ratings, setRatings] = useStored<(number | null)[]>(id, p.criteria.map(() => null), isNumOrNullArray(n));
  const steps: number[] = [];
  for (let v = p.scale.min; v <= p.scale.max; v++) steps.push(v);
  const rated = ratings.filter((x) => x !== null).length;
  let got = 0;
  let span = 0;
  p.criteria.forEach((c, i) => {
    const w = c.weight ?? 1;
    got += w * ((ratings[i] ?? p.scale.min) - p.scale.min);
    span += w * (p.scale.max - p.scale.min);
  });
  const score = span > 0 ? Math.round((got / span) * 100) : 0;
  const band = bandFor(p.bands, score);

  return (
    <Frame id={id} kind="scoreCard" title={p.title} intro={p.intro}>
      <p className="bw-hint">
        {p.scale.min} is {p.scale.lowLabel.toLowerCase()}, {p.scale.max} is {p.scale.highLabel.toLowerCase()}.
      </p>
      <ol className="bw-scores">
        {p.criteria.map((c, ci) => (
          <li key={c.id}>
            <fieldset className="bw-scale">
              <legend>
                <span className="bw-scale-label">{c.label}</span>
                {(c.weight ?? 1) > 1 && <span className="bw-tag">Counts {c.weight === 2 ? 'double' : `${c.weight} times`}</span>}
                {c.help && (
                  <span className="bw-scale-help">
                    <Inline text={c.help} />
                  </span>
                )}
              </legend>
              <div className="bw-scale-row">
                {steps.map((v) => (
                  <label key={v} className="bw-scale-opt" data-picked={live && ratings[ci] === v ? '' : undefined}>
                    <input
                      type="radio"
                      name={`${id}-${c.id}`}
                      checked={live ? ratings[ci] === v : undefined}
                      readOnly={!live}
                      onChange={live ? () => setRatings(ratings.map((x, j) => (j === ci ? v : x))) : undefined}
                    />
                    <span aria-hidden>{v}</span>
                    <span className="sr-only">
                      {v}
                      {v === p.scale.min ? ` (${p.scale.lowLabel})` : v === p.scale.max ? ` (${p.scale.highLabel})` : ''}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="bw-result" aria-live="polite">
        {live ? (
          rated === n && band ? (
            <>
              <p className="bw-score">{score}%</p>
              <p className="bw-result-title">{band.title}</p>
              <p>
                <Inline text={band.text} />
              </p>
              <ResetButton onClick={() => setRatings(p.criteria.map(() => null))}>Clear the scores</ResetButton>
            </>
          ) : (
            <p className="bw-hint">
              {rated} of {n} rated. Your score shows when you have rated them all. Scores are saved on this device only.
            </p>
          )
        ) : (
          <ul className="bw-bands">
            {p.bands.map((b, i) => (
              <li key={i}>
                <strong>
                  {b.min}% or more: {b.title}.
                </strong>{' '}
                <Inline text={b.text} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Frame>
  );
}

// ---------- picker ----------

function Outcome({ o }: { o: PickerProps['outcomes'][number] }) {
  return (
    <>
      <p className="bw-result-title">{o.title}</p>
      <p>
        <Inline text={o.text} />
      </p>
      {o.reasons && o.reasons.length > 0 && (
        <ul className="read-list">
          {o.reasons.map((r, i) => (
            <li key={i}>
              <Inline text={r} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Picker({ id, p }: { id: string; p: PickerProps }) {
  const live = useLive();
  const [picks, setPicks] = useState<(number | null)[]>(() => p.questions.map(() => null));
  const done = picks.every((x) => x !== null);
  const tally = new Map<string, number>();
  picks.forEach((x, qi) => {
    if (x === null) return;
    for (const o of p.questions[qi]?.options[x]?.outcomes ?? []) tally.set(o, (tally.get(o) ?? 0) + 1);
  });
  let best = p.outcomes[0];
  for (const o of p.outcomes) if ((tally.get(o.id) ?? 0) > (tally.get(best?.id ?? '') ?? 0)) best = o;

  return (
    <Frame id={id} kind="picker" title={p.title} intro={p.intro}>
      <ol className="bw-qs">
        {p.questions.map((q, qi) => (
          <li key={qi} className="bw-q">
            <fieldset>
              <legend className="bw-q-text">{q.q}</legend>
              <div className="bw-options">
                {q.options.map((o, oi) => (
                  <label key={oi} className="bw-option" data-picked={live && picks[qi] === oi ? '' : undefined}>
                    <input
                      type="radio"
                      name={`${id}-q${qi}`}
                      checked={live ? picks[qi] === oi : undefined}
                      readOnly={!live}
                      onChange={live ? () => setPicks(picks.map((x, i) => (i === qi ? oi : x))) : undefined}
                    />
                    <span>{o.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="bw-result" aria-live="polite">
        {live ? (
          done && best ? (
            <>
              <p className="bw-kind">Our suggestion</p>
              <Outcome o={best} />
              <ResetButton onClick={() => setPicks(p.questions.map(() => null))} />
            </>
          ) : (
            <p className="bw-hint">Answer {p.questions.length === 1 ? 'the question' : `all ${p.questions.length} questions`} to see a suggestion.</p>
          )
        ) : (
          <ul className="bw-outcomes">
            {p.outcomes.map((o) => (
              <li key={o.id}>
                <Outcome o={o} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Frame>
  );
}

// ---------- decisionTree ----------

type TreeNode = DecisionTreeProps['nodes'][number];
type TreeEnd = DecisionTreeProps['ends'][number];

/** Every path as nested lists. A node reached a second time links back to where it is written out. */
function TreeList({ id, p }: { id: string; p: DecisionTreeProps }) {
  const nodes = new Map(p.nodes.map((n) => [n.id, n]));
  const ends = new Map(p.ends.map((e) => [e.id, e]));
  const written = new Set<string>();
  const target = (next: string, depth: number): ReactNode => {
    const end = ends.get(next);
    if (end)
      return (
        <span className="bw-tree-end-inline" data-tone={end.tone}>
          <strong>{end.title}.</strong> <Inline text={end.text} />
        </span>
      );
    const node = nodes.get(next);
    if (!node) return null;
    if (written.has(node.id) || depth > 40) return <a href={`#${id}-n-${node.id}`}>See “{node.q}” above</a>;
    return <ul className="bw-tree-list">{nodeItem(node, depth + 1)}</ul>;
  };
  const nodeItem = (node: TreeNode, depth: number): ReactNode => {
    written.add(node.id);
    return (
      <li id={`${id}-n-${node.id}`}>
        <p className="bw-tree-q">{node.q}</p>
        {node.help && (
          <p className="bw-tree-help">
            <Inline text={node.help} />
          </p>
        )}
        <ul className="bw-tree-opts">
          {node.options.map((o, i) => (
            <li key={i}>
              <span className="bw-tree-if">{o.text}:</span> {target(o.next, depth)}
            </li>
          ))}
        </ul>
      </li>
    );
  };
  const start = nodes.get(p.start);
  return start ? <ul className="bw-tree-list bw-tree-root">{nodeItem(start, 0)}</ul> : null;
}

function DecisionTree({ id, p }: { id: string; p: DecisionTreeProps }) {
  const live = useLive();
  const [path, setPath] = useState<{ node: string; choice: number }[]>([]);
  const here = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const nodes = useMemo(() => new Map(p.nodes.map((n) => [n.id, n])), [p.nodes]);
  const ends = useMemo(() => new Map(p.ends.map((e) => [e.id, e])), [p.ends]);
  const last = path[path.length - 1];
  const currentId = last ? (nodes.get(last.node)?.options[last.choice]?.next ?? p.start) : p.start;
  const node: TreeNode | undefined = nodes.get(currentId);
  const end: TreeEnd | undefined = ends.get(currentId);

  // Focus follows the walk, so a keyboard or screen reader user lands on the next question or the answer.
  useEffect(() => {
    if (moved.current) here.current?.focus({ preventScroll: false });
  }, [currentId]);
  const go = (next: { node: string; choice: number }[]) => {
    moved.current = true;
    setPath(next);
  };

  if (!live)
    return (
      <Frame id={id} kind="decisionTree" title={p.title} intro={p.intro}>
        <TreeList id={id} p={p} />
        {p.note && (
          <p className="bw-note">
            <Inline text={p.note} />
          </p>
        )}
      </Frame>
    );

  return (
    <Frame id={id} kind="decisionTree" title={p.title} intro={p.intro}>
      {path.length > 0 && (
        <ol className="bw-trail" aria-label="Your answers so far">
          {path.map((s, i) => {
            const n = nodes.get(s.node);
            return (
              <li key={i}>
                <span>{n?.q}</span> <strong>{n?.options[s.choice]?.text}</strong>
              </li>
            );
          })}
        </ol>
      )}
      <div ref={here} className="bw-tree-now" tabIndex={-1} aria-live="polite">
        {node ? (
          <>
            <p className="bw-tree-q">{node.q}</p>
            {node.help && (
              <p className="bw-tree-help">
                <Inline text={node.help} />
              </p>
            )}
            <div className="bw-tree-choices">
              {node.options.map((o, i) => (
                <button key={i} type="button" className="btn btn-ghost btn-sm" onClick={() => go([...path, { node: node.id, choice: i }])}>
                  {o.text}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              ))}
            </div>
          </>
        ) : end ? (
          <div className="bw-tree-end" data-tone={end.tone}>
            <p className="bw-result-title">{end.title}</p>
            <p>
              <Inline text={end.text} />
            </p>
          </div>
        ) : null}
      </div>
      {path.length > 0 && (
        <div className="bw-foot">
          <button type="button" className="bw-textbtn" onClick={() => go(path.slice(0, -1))}>
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </button>
          <ResetButton onClick={() => go([])} />
        </div>
      )}
      {p.note && (
        <p className="bw-note">
          <Inline text={p.note} />
        </p>
      )}
      <details className="bw-tree-all">
        <summary>See every path</summary>
        <TreeList id={id} p={p} />
      </details>
    </Frame>
  );
}

// ---------- dispatch ----------

export function Widget({ b }: { b: WidgetBlock }) {
  switch (b.widget) {
    case 'quiz':
      return <Quiz id={b.id} p={b.props} />;
    case 'checklist':
      return <Checklist id={b.id} p={b.props} />;
    case 'questionBuilder':
      return <QuestionBuilder id={b.id} p={b.props} />;
    case 'reveal':
      return <Reveal id={b.id} p={b.props} />;
    case 'slides':
      return <Slides id={b.id} p={b.props} />;
    case 'calculator':
      return <Calculator id={b.id} p={b.props} />;
    case 'beforeAfter':
      return <BeforeAfter id={b.id} p={b.props} />;
    case 'timeline':
      return <Timeline id={b.id} p={b.props} />;
    case 'poll':
      return <Poll id={b.id} p={b.props} />;
    case 'flipCards':
      return <FlipCards id={b.id} p={b.props} />;
    case 'scoreCard':
      return <ScoreCard id={b.id} p={b.props} />;
    case 'picker':
      return <Picker id={b.id} p={b.props} />;
    case 'decisionTree':
      return <DecisionTree id={b.id} p={b.props} />;
  }
}
