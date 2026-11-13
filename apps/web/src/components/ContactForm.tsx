import { INTEGRATION_OPTIONS, MUST_HAVE_OPTIONS, OBJECTIVE_OPTIONS, PACKAGE_OPTIONS, validateBrief, type LeadInput, type MustHave } from '@kreators/shared';
import { useMutation } from '@tanstack/react-query';
import { CircleAlert } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FocusEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Character, cascade, castLookAt, type CastId, type CharacterHandle, type Expression } from '../cast';
import { ApiError, api } from '../lib/api';
import { CAST_LINES, PRIMARY_ACTION, SITE, callPhone, type CastLineKey } from '../lib/content';
import { motionOk, useMotionOk } from '../lib/motionOk';
import { spring } from '../lib/spring';
import { ChoiceCards, Field, FieldError, GuideDisclosure, Label, OtherField, StepDots, type Control } from './brief/fields';
import {
  CALC,
  REVIEW,
  answered,
  brandError,
  calcLabel,
  canSaveDraft,
  clear,
  draftBody,
  emailError,
  emptyDraft,
  integrationText,
  intentKey,
  linkError,
  load,
  loadDraftMeta,
  mustHavesText,
  nameError,
  newDraftId,
  objectiveText,
  parseIntent,
  pillFor,
  save,
  saveDraftMeta,
  serviceLabel,
  stepOfField,
  summary,
  toBrief,
  EMAIL,
  LINK_ERROR,
  STEP_TITLES,
  type Draft,
  type DraftMeta,
  type Intent,
  type Mode,
  type PackagePick,
  type Step,
} from './brief/state';
import { CastBubble, useCastLine, type CastLine } from './chat';
import { ChipRail, Segment } from './tabs';
import { ActionLit, Cta } from './ui';

// The guided trial brief (content §5, V2-SPEC 5.6, visual §1.5 and §2.5). Plan a trial: five short steps and a review, only step 1 required, answers kept
// in sessionStorage until sent, and (form7, save16) saved to the API as they go once step 1 has an email or phone: every button press, each
// choice, a field left, and leaving the page. Ask a question: step 1's contact fields and the question. The cast stands on the form's top edge and says its lines from
// content §9.2 on their triggers, one at a time, once each. Everything the cast does is decoration: labels, errors and status lines carry the meaning.

const STEP_TITLE = STEP_TITLES;

/** (form7) The one line that says answers are saved as they go. */
const SAVING_NOTE = "Once you add an email or phone number, we save your answers as you go, even if you don't finish.";

/** Who speaks when a step is shown (content §9.2), and the line. */
const STEP_LINE: Record<Step, CastLineKey> = {
  1: 'contact.step1',
  2: 'contact.step2',
  3: 'contact.step3',
  4: 'contact.step4',
  5: 'contact.step5',
  6: 'contact.review',
};

const MAX_REFS = 5;
/** (save16) The pause before a chip, card or tick (or a field left) is saved, so quick choices are one save; and after typing a valid email or phone. */
const CHOICE_MS = 600;
const TYPE_MS = 1000;
/** The inputs whose blur saves. */
const TEXT_TYPES = new Set(['text', 'email', 'tel', 'url', 'search']);
const NOT_YET = 'Not yet. You can share this before the shoot.';

type Errors = Partial<Record<'name' | 'email' | 'brand', string>>;

let measure: CanvasRenderingContext2D | null = null;

/** Where the caret is on screen. An email input reports no selection, so its caret is taken to be at the end. */
function caretPoint(el: Control): { x: number; y: number } {
  const box = el.getBoundingClientRect();
  const css = getComputedStyle(el);
  const left = parseFloat(css.paddingLeft);
  const right = parseFloat(css.paddingRight);
  const inner = Math.max(1, box.width - left - right);
  let before = el.value;
  try {
    before = el.value.slice(0, el.selectionEnd ?? el.value.length);
  } catch {
    // email inputs throw on selectionEnd in some browsers
  }
  measure ??= document.createElement('canvas').getContext('2d');
  const widthOf = (text: string) => {
    if (!measure) return text.length * 8;
    measure.font = `${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
    return measure.measureText(text).width;
  };
  if (el instanceof HTMLTextAreaElement) {
    const line = parseFloat(css.lineHeight) || 24;
    let rows = 0;
    let last = 0;
    for (const part of before.split('\n')) {
      const w = widthOf(part);
      rows += Math.floor(w / inner) + 1;
      last = w % inner;
    }
    const y = box.top + parseFloat(css.paddingTop) + (rows - 0.5) * line - el.scrollTop;
    return { x: box.left + left + last, y: Math.min(box.bottom - 8, Math.max(box.top + 8, y)) };
  }
  return { x: Math.min(box.right - right, box.left + left + widthOf(before) - el.scrollLeft), y: box.top + box.height / 2 };
}

/** The site's only confetti: the logo's four shapes, one burst from behind the cast. Positions come from the index, so every visit is the same 24 pieces. */
const SHAPES = ['square', 'triangle', 'circle', 'flower'] as const;
const SHAPE_COLOUR = { square: 'var(--c-green)', triangle: 'var(--c-purple)', circle: 'var(--c-orange)', flower: 'var(--c-yellow)' };

function confettiBits() {
  return Array.from({ length: 24 }, (_, i) => {
    const turn = (i * 137.508 * Math.PI) / 180;
    const spread = 0.36 + ((i * 7) % 24) / 37;
    const shape = SHAPES[i % SHAPES.length] ?? 'square';
    return {
      key: i,
      shape,
      style: {
        '--c': SHAPE_COLOUR[shape],
        '--s': `${9 + ((i * 5) % 6)}px`,
        '--x': `${Math.round(Math.cos(turn) * spread * 340)}px`,
        '--y': `${-Math.round(44 + Math.abs(Math.sin(turn)) * spread * 150)}px`,
        '--fall': `${Math.round(300 + ((i * 11) % 7) * 46)}px`,
        '--r': `${(i % 2 ? 1 : -1) * (220 + ((i * 13) % 9) * 40)}deg`,
        '--d': `${(i * 3) % 90}ms`,
      } as CSSProperties,
    };
  });
}

function useIsPhone() {
  const [phone, setPhone] = useState(() => typeof matchMedia === 'function' && matchMedia('(max-width: 734px)').matches);
  useEffect(() => {
    const mq = matchMedia('(max-width: 734px)');
    const onChange = () => setPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return phone;
}

/** A character's bubble: shows the line on screen when it is this character's, and keeps the last words while it fades. */
function BubbleFor({ who, cast, side }: { who: CastId; cast: CastLine; side: 'start' | 'center' | 'end' }) {
  const key = cast.shown && CAST_LINES[cast.shown].who === who ? cast.shown : null;
  const last = useRef('');
  if (key) last.current = CAST_LINES[key].line;
  return <CastBubble who={who} line={last.current} show={Boolean(key)} side={side} />;
}

/** The first state: what sessionStorage kept, with the URL's intent on top when it is new. */
function initialState(params: URLSearchParams) {
  const intent = parseIntent(params);
  const key = intentKey(intent);
  const saved = load();
  let draft: Draft = saved?.draft ?? emptyDraft();
  if (draft.pkg === CALC && !intent.videos) draft = { ...draft, pkg: '' };
  if (!saved || saved.intent !== key) {
    const pill = pillFor(intent);
    if (pill) draft = { ...draft, pkg: pill };
  }
  const mode: Mode = intent.question ? 'question' : (saved?.mode ?? 'trial');
  return { intent, key, draft, mode, step: saved?.step ?? (1 as Step), reached: saved?.reached ?? (1 as Step) };
}

/** The mode the page opens in: the URL's ?topic=question, else what the visitor had chosen in this tab. */
export function initialMode(params: URLSearchParams): Mode {
  return params.get('topic') === 'question' ? 'question' : (load()?.mode ?? 'trial');
}

export function ContactForm({ onMode }: { onMode?: (mode: Mode) => void }) {
  const [params] = useSearchParams();
  const [init] = useState(() => initialState(params));
  const [intent, setIntent] = useState<Intent>(init.intent);
  const [mode, setModeState] = useState<Mode>(init.mode);
  const [step, setStep] = useState<Step>(init.step);
  const [reached, setReached] = useState<Step>(init.reached);
  const [draft, setDraft] = useState<Draft>(init.draft);
  const [errors, setErrors] = useState<Errors>({});
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});
  const [confetti, setConfetti] = useState(false);
  const send = useMutation({ mutationFn: api.contact });
  const sent = send.isSuccess;
  const phone = useIsPhone();
  const ok = useMotionOk();
  const cast = useCastLine();

  const crew = useRef<Partial<Record<CastId, CharacterHandle | null>>>({});
  const trapRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusStep = useRef(false);
  const dir = useRef(1);
  const shown = useRef({ name: false, email: false, brand: false });
  const emailWasValid = useRef(EMAIL.test(init.draft.email.trim()));
  const appliedIntent = useRef(init.key);

  const trial = mode === 'trial';
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // The visitor's answers survive a reload until they are sent (content §5.2). Never after sending: the thanks is the end.
  useEffect(() => {
    if (sent) return;
    save({ v: 1, mode, step, reached, draft, intent: appliedIntent.current });
  }, [mode, step, reached, draft, sent]);

  useEffect(() => onMode?.(mode), [mode, onMode]);

  // ---------- Saved as they go (form7) ----------

  const draftMeta = useRef<DraftMeta | null>(null);
  draftMeta.current ??= loadDraftMeta();
  const live = useRef({ mode, step, reached, draft, intent, sent });
  live.current = { mode, step, reached, draft, intent, sent };

  // (save16) Every button in the form saves: Back, Next, Skip, the review's Edit, the mode switch and "Add another link" at once; a chip,
  // card or tick after CHOICE_MS, so a run of quick choices is one save; a text field when it loses focus, and the email or phone once it
  // is valid and typing pauses. All of them share one timer, and a click sends at once and cancels whatever was waiting.
  const timer = useRef(0);
  /** What the save on its way carries, so the same answers are not sent twice at once. */
  const inFlight = useRef<string | null>(null);
  /** A save asked for while one is on its way: sent when that one is answered, so the server always gets them in order. */
  const queued = useRef<{ at: Step; upTo: Step } | null>(null);
  const seq = useRef(0);
  /** Too many saves (429): this session stops saving. Sending the form still works. */
  const stopped = useRef(false);

  /** Sends the answers so far when there is a way to reach the visitor and something changed since the last save. Silent either way. */
  const saveProgress = useCallback(function run(at: Step, upTo: Step, how: 'fetch' | 'beacon') {
    window.clearTimeout(timer.current);
    const s = live.current;
    if (s.sent || stopped.current || !canSaveDraft(s.draft)) return;
    const meta = draftMeta.current ?? { id: newDraftId(), sent: '' };
    if (!draftMeta.current) {
      draftMeta.current = meta;
      saveDraftMeta(meta);
    }
    const body = draftBody(s.mode, s.draft, s.intent, at, upTo, meta.id, trapRef.current?.value ?? '');
    // Which step it was saved from is not a change on its own: leaving from the step Next just saved sends nothing.
    const sig = JSON.stringify({ ...body, step: 0 });
    if (sig === meta.sent || sig === inFlight.current) return;
    const json = JSON.stringify(body);
    const mine = ++seq.current;
    const done = () => {
      // An older answer arriving after a newer save went out does not overwrite what was last sent.
      if (draftMeta.current?.id !== meta.id || mine !== seq.current) return;
      draftMeta.current = { id: meta.id, sent: sig };
      saveDraftMeta(draftMeta.current);
    };
    if (how === 'beacon' && typeof navigator.sendBeacon === 'function') {
      try {
        if (navigator.sendBeacon('/api/contact/draft', json)) return done();
      } catch {
        // Falls through to fetch.
      }
    }
    if (how === 'fetch' && inFlight.current !== null) {
      --seq.current;
      const q = queued.current;
      queued.current = { at, upTo: q && q.upTo > upTo ? q.upTo : upTo };
      return;
    }
    inFlight.current = sig;
    void fetch('/api/contact/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: json, keepalive: json.length < 60_000 })
      .then((r) => {
        if (r.ok) done();
        else if (r.status === 429) stopped.current = true;
      })
      .catch(() => undefined)
      .finally(() => {
        if (inFlight.current === sig) inFlight.current = null;
        const q = queued.current;
        queued.current = null;
        if (q) run(q.at, q.upTo, 'fetch');
      });
  }, []);

  /** Saves after a pause; a later call (or a click's save) replaces it. */
  const saveSoon = useCallback(
    (ms: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => saveProgress(live.current.step, live.current.reached, 'fetch'), ms);
    },
    [saveProgress],
  );
  /** A click's save: now, from the step they are on. */
  const saveNow = (at: Step = live.current.step, upTo: Step = live.current.reached) => saveProgress(at, upTo, 'fetch');

  // Leaving with unsaved changes: closing the tab, switching away on a phone (pagehide does not always fire there), or another page of the site.
  useEffect(() => {
    const away = () => saveProgress(live.current.step, live.current.reached, 'beacon');
    const onHidden = () => {
      if (document.visibilityState === 'hidden') away();
    };
    window.addEventListener('pagehide', away);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('pagehide', away);
      document.removeEventListener('visibilitychange', onHidden);
      away();
    };
  }, [saveProgress]);

  // Arriving with a different intent while already on the page (a link in the footer or the nav).
  const urlIntent = parseIntent(params);
  const urlKey = intentKey(urlIntent);
  useEffect(() => {
    if (urlKey === appliedIntent.current) return;
    appliedIntent.current = urlKey;
    setIntent(urlIntent);
    const pill = pillFor(urlIntent);
    setDraft((d) => ({ ...d, pkg: pill || (d.pkg === CALC ? '' : d.pkg) }));
    if (urlIntent.question) setModeState('question');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  // ---------- The cast ----------

  const lineOf = (key: CastLineKey) => CAST_LINES[key].who as CastId;
  /** Says a line if its speaker is standing on the form right now. */
  const say = (key: CastLineKey, expression?: Expression | null) => {
    const by = crew.current[lineOf(key)];
    if (!by?.el()) return;
    void cast.say(key, expression === undefined ? { by } : { by, expression });
  };

  const speaker: CastId = mode === 'question' ? 'bolu' : lineOf(STEP_LINE[step]);
  // Desktop: Sochu, Bolu and Tiko, and Gola at the right end for steps 4 and 5. Phones: the step's speaker and Tiko, who watches every field.
  const gola = trial && (step === 4 || step === 5);
  const line: CastId[] = phone ? [speaker === 'tiko' ? 'bolu' : speaker, 'tiko'] : ['sochu', 'bolu', 'tiko'];

  // Each step (and question mode) is announced once by its speaker, a moment after it appears: after the page's first paint on arrival, after the
  // panel swap later (and after Gola's pop for step 4).
  const announced = useRef(false);
  useEffect(() => {
    if (sent) return;
    const key = mode === 'question' ? 'contact.question' : STEP_LINE[step];
    const delay = !announced.current ? 900 : key === 'contact.step4' ? 640 : 420;
    // A new step's line takes over from the last one still showing, rather than waiting behind it and giving up.
    if (announced.current) cast.hide();
    announced.current = true;
    const t = window.setTimeout(() => say(key), delay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step, sent]);

  // A failed send: they look at the message, concerned, never cross. The visitor did nothing wrong.
  const failed = send.isError;
  useEffect(() => {
    if (!failed) return;
    const msg = alertRef.current;
    for (const who of ['sochu', 'tiko'] as const) {
      const c = crew.current[who];
      c?.setExpression('confused', { hold: 1800 });
      if (msg) c?.lookAt(msg, 1800);
    }
  }, [failed]);

  // Sent: focus moves to the thanks in the commit that shows it.
  useLayoutEffect(() => {
    if (!sent) return;
    const root = rootRef.current;
    if (root && root.getBoundingClientRect().top < 0) root.scrollIntoView({ behavior: 'instant', block: 'start' });
    doneRef.current?.focus({ preventScroll: true });
  }, [sent]);

  // A new step: focus its heading so keyboards and screen readers start there; bring the form's top into view if it has scrolled away.
  useLayoutEffect(() => {
    if (!focusStep.current) return;
    focusStep.current = false;
    const t = window.setTimeout(
      () => {
        const root = rootRef.current;
        if (root && root.getBoundingClientRect().top < 0) root.scrollIntoView({ behavior: 'instant', block: 'start' });
        headingRef.current?.focus({ preventScroll: true });
      },
      ok ? 140 : 0,
    );
    return () => window.clearTimeout(t);
  }, [step, mode, ok]);

  const glanceAt = (el: Element) => {
    crew.current.tiko?.lookAt(el, 1200);
    const bolu = crew.current.bolu;
    bolu?.lookAt(el, 1200);
    bolu?.setExpression('open', { hold: 1200 });
  };
  const followCaret = (el: Control) => crew.current.tiko?.lookAt(caretPoint(el), 700);
  const onFocus = (e: FocusEvent<Control>) => glanceAt(e.currentTarget);
  const onSelect = (e: { currentTarget: Control }) => {
    if (document.activeElement === e.currentTarget) followCaret(e.currentTarget);
  };

  // The phone field: Tiko shuts its eyes and turns away. We are not staring at your number.
  const onPhoneFocus = () => {
    const tiko = crew.current.tiko;
    tiko?.closeEyes(true);
    tiko?.lookAt({ x: window.innerWidth + 400, y: -300 }, 60_000);
    crew.current.bolu?.lookAt(document.getElementById('c-phone'), 1200);
    say('contact.phone', null);
  };
  const openEyes = () => {
    const tiko = crew.current.tiko;
    tiko?.closeEyes(false);
    tiko?.lookAt(null);
  };

  // ---------- Fields ----------

  const check = (field: keyof Errors, value: string) => {
    const error = field === 'name' ? nameError(value) : field === 'email' ? emailError(value) : brandError(value);
    shown.current[field] = true;
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const text =
    (
      field: 'name' | 'email' | 'phone' | 'brand' | 'site' | 'message' | 'viewerResponse' | 'guide' | 'objectiveOther' | 'integrationOther' | 'mustHavesOther',
    ) =>
    (e: ChangeEvent<Control>) => {
      const { value } = e.currentTarget;
      set(field, value);
      if ((field === 'name' || field === 'email' || field === 'brand') && shown.current[field]) check(field, value);
      if (field === 'email') {
        const valid = EMAIL.test(value.trim());
        if (valid && !emailWasValid.current) {
          (crew.current.sochu ?? crew.current.bolu)?.play('nod');
          say('contact.email', 'happy');
        }
        emailWasValid.current = valid;
      }
      // Once there is a way to reach them, the email or phone is saved when typing pauses: closing the tab next loses nothing.
      if ((field === 'email' || field === 'phone') && canSaveDraft({ ...live.current.draft, [field]: value })) saveSoon(TYPE_MS);
      if (field === 'guide' && linkErrors.guide) setLinkErrors((l) => ({ ...l, guide: linkError(value) }));
      if (field !== 'phone') followCaret(e.currentTarget);
    };

  const blurCheck = (field: keyof Errors) => (e: FocusEvent<Control>) => {
    if (e.currentTarget.value) check(field, e.currentTarget.value);
  };

  const setRef = (i: number, value: string) => {
    setDraft((d) => ({ ...d, refs: d.refs.map((r, k) => (k === i ? value : r)) }));
    if (linkErrors[`ref${i}`]) setLinkErrors((l) => ({ ...l, [`ref${i}`]: linkError(value) }));
  };
  const addRef = () => {
    if (draft.refs.length >= MAX_REFS) return;
    saveNow();
    const next = draft.refs.length + 1;
    set('refs', [...draft.refs, '']);
    window.setTimeout(() => document.getElementById(`c-ref-${next - 1}`)?.focus(), 0);
    if (next === MAX_REFS) say('contact.fiveRefs');
  };

  const step1Errors = (): Errors => ({
    name: nameError(draft.name) || undefined,
    email: emailError(draft.email) || undefined,
    brand: trial ? brandError(draft.brand) || undefined : undefined,
  });

  const step5Errors = () => {
    const out: Record<string, string> = {};
    draft.refs.forEach((r, i) => {
      const e = linkError(r);
      if (e) out[`ref${i}`] = e;
    });
    const g = linkError(draft.guide);
    if (g) out.guide = g;
    return out;
  };

  /** Shows the errors, moves focus to the first, and lets Tiko say so. */
  const complain = (firstId: string | null) => {
    const el = firstId ? document.getElementById(firstId) : null;
    if (el) {
      el.focus();
      castLookAt(el, 1600);
    }
    crew.current.tiko?.setExpression('confused', { hold: 1500 });
    say('contact.error', null);
  };

  const checkStep1 = () => {
    const found = step1Errors();
    shown.current = { name: true, email: true, brand: trial };
    setErrors(found);
    const first = found.name ? 'c-name' : found.email ? 'c-email' : found.brand ? 'c-brand' : null;
    if (first) complain(first);
    return !first;
  };

  const checkStep5 = () => {
    const found = step5Errors();
    setLinkErrors(found);
    const keys = Object.keys(found);
    if (!keys.length) return true;
    const first = keys[0]!;
    complain(first === 'guide' ? 'c-guide' : `c-ref-${first.slice(3)}`);
    return false;
  };

  // ---------- Steps ----------

  /** Every move between steps (Next, Skip, Back, the review's Edit) saves the answers first (form7, save16): from the step they are on,
   *  with the furthest step reached, which going back never lowers. */
  const goTo = (s: Step) => {
    const upTo = s > reached ? s : reached;
    saveNow(step, upTo);
    dir.current = s > step ? 1 : -1;
    focusStep.current = true;
    setStep(s);
    setReached(upTo);
  };
  const forward = () => {
    if (step >= REVIEW) return;
    goTo((step + 1) as Step);
  };
  const next = () => {
    // A step that stops them still saves what they have so far.
    if ((step === 1 && !checkStep1()) || (step === 5 && !checkStep5())) return saveNow();
    forward();
  };
  const back = () => {
    if (step > 1) goTo((step - 1) as Step);
  };
  const skip = forward;

  /** A chip, card or tick: saved once the choosing pauses. */
  const choose = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    set(k, v);
    saveSoon(CHOICE_MS);
  };

  /** A text field losing focus saves after a short pause (a click on a button that saves replaces it). */
  const onFormBlur = (e: FocusEvent<HTMLFormElement>) => {
    const t = e.target;
    if (t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && TEXT_TYPES.has(t.type) && t !== trapRef.current)) saveSoon(CHOICE_MS);
  };

  const setMode = (m: Mode) => {
    if (m === mode) return;
    // What they had in the mode they are leaving, from the step they were on.
    saveNow();
    dir.current = m === 'question' ? 1 : -1;
    focusStep.current = false;
    setErrors({});
    setModeState(m);
  };

  // ---------- Send ----------

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (send.isPending) return;
    // Enter in a step's field moves on, as Next would.
    if (trial && step < REVIEW) {
      next();
      return;
    }
    const found = step1Errors();
    if (found.name || found.email || found.brand) {
      setErrors(found);
      shown.current = { name: true, email: true, brand: trial };
      if (trial) goTo(1);
      else {
        complain(found.name ? 'c-name' : 'c-email');
        saveNow();
      }
      return;
    }

    openEyes();
    const base = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      message: draft.message.trim(),
      // Read straight from the DOM, with no listener on it: a bot that sets the value without firing events is still caught.
      company: trapRef.current?.value ?? '',
      // The saved partial lead this send completes (form7).
      ...(draftMeta.current ? { draftId: draftMeta.current.id } : {}),
    };
    let lead: LeadInput;
    if (trial) {
      const checked = validateBrief(toBrief(draft, intent));
      if (!checked.ok) {
        const s = stepOfField(checked.field);
        if (s === 5) setLinkErrors(checked.field === 'brandGuideUrl' ? { guide: LINK_ERROR } : step5Errors());
        goTo(s);
        return;
      }
      lead = { kind: 'trial', ...base, brand: draft.brand.trim(), service: serviceLabel(draft, intent), brief: checked.brief };
    } else {
      lead = { kind: 'question', ...base, service: '' };
    }
    crew.current.sochu?.setExpression('thinking');
    // The send carries every answer and completes the saved draft: a save still waiting is not needed.
    window.clearTimeout(timer.current);
    send.mutate(lead, {
      onError: () => crew.current.sochu?.setExpression(null),
      onSuccess: () => {
        clear();
        draftMeta.current = null;
        const all = (['sochu', 'bolu', 'tiko', 'gola'] as const).map((w) => crew.current[w] ?? null);
        for (const c of all) c?.setExpression('celebrating', { hold: 2600 });
        cascade(all, 'hop', { stagger: 110, force: true });
        window.setTimeout(() => say('contact.success'), 500);
        if (motionOk()) {
          setConfetti(true);
          window.setTimeout(() => setConfetti(false), 1300);
        }
      },
    });
  };

  const errorLead = (() => {
    const err = send.error;
    if (err instanceof ApiError && err.status < 500 && !err.message.startsWith('Request failed')) return err.message;
    return 'We could not send that.';
  })();
  // Too many sends from this connection: retrying fails for up to an hour, so the email is the only way on.
  const limited = send.error instanceof ApiError && send.error.status === 429;
  const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent(trial ? 'Trial video request' : 'Question for Kreators.Army')}&body=${encodeURIComponent(summary(mode, draft, intent))}`;
  const call = callPhone();

  // ---------- Pieces ----------

  const nameField = (
    <Field
      id="c-name"
      label="Full name"
      required
      autoComplete="name"
      value={draft.name}
      error={errors.name}
      onChange={text('name')}
      onFocus={onFocus}
      onBlur={blurCheck('name')}
      onSelect={onSelect}
      className="cf-span"
    />
  );
  const emailField = (
    <Field
      id="c-email"
      label="Email address"
      type="email"
      required
      autoComplete="email"
      inputMode="email"
      value={draft.email}
      error={errors.email}
      onChange={text('email')}
      onFocus={onFocus}
      onBlur={blurCheck('email')}
      onSelect={onSelect}
    />
  );
  const phoneField = (
    <Field
      id="c-phone"
      label="Phone or WhatsApp"
      optional
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={draft.phone}
      onChange={text('phone')}
      onFocus={onPhoneFocus}
      onBlur={openEyes}
    />
  );

  const pills = [
    ...(intent.videos ? [{ value: CALC as PackagePick, label: calcLabel(intent.videos) }] : []),
    ...PACKAGE_OPTIONS.map((o) => ({ value: o.value as PackagePick, label: o.label })),
  ];

  const stepBody = (s: Step): ReactNode => {
    switch (s) {
      case 1:
        return (
          <div className="cf-grid">
            {nameField}
            {emailField}
            {phoneField}
            <Field
              id="c-brand"
              label="Brand name"
              required
              autoComplete="organization"
              value={draft.brand}
              error={errors.brand}
              onChange={text('brand')}
              onFocus={onFocus}
              onBlur={blurCheck('brand')}
              onSelect={onSelect}
            />
            <Field
              id="c-site"
              label="Website or Instagram"
              optional
              placeholder="brand.com or @brand"
              autoComplete="url"
              maxLength={300}
              value={draft.site}
              onChange={text('site')}
              onFocus={onFocus}
              onSelect={onSelect}
            />
            <div className="cf-field cf-span bf-agency">
              <label className="bf-check" htmlFor="c-agency">
                <input
                  id="c-agency"
                  name="agency"
                  type="checkbox"
                  checked={draft.agency}
                  onChange={(e) => {
                    const on = e.currentTarget.checked;
                    choose('agency', on);
                    if (on) say('contact.agency');
                  }}
                  aria-describedby={draft.agency ? 'c-agency-help' : undefined}
                />
                <span className="bf-check-box" aria-hidden>
                  <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
                    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>I'm an agency briefing for a client brand</span>
              </label>
              {draft.agency && (
                <p id="c-agency-help" className="cf-help bf-agency-help">
                  Each brand needs its own package, including for agencies.
                </p>
              )}
            </div>
            <div className="cf-field cf-span cf-pills" role="group" aria-labelledby="c-service-label">
              <span id="c-service-label">
                <Label optional>Package you're considering</Label>
              </span>
              {/* The value the lead carries. The pills are how it is chosen; choosing the chosen one again clears it. */}
              <input id="c-service" type="hidden" name="service" value={serviceLabel(draft, intent)} />
              <ChipRail
                mode="radio"
                label="Package you're considering"
                wrap
                options={pills}
                value={draft.pkg || null}
                onChange={(v) => choose('pkg', v === draft.pkg ? '' : v)}
                className="bf-pills"
              />
            </div>
            <p className="cf-help cf-span bf-saving m-0">{SAVING_NOTE}</p>
          </div>
        );
      case 2:
        return (
          <ChoiceCards
            name="c-objective"
            legend="What are these videos mainly for?"
            options={OBJECTIVE_OPTIONS}
            value={draft.objective}
            onChange={(v) => choose('objective', v)}
          >
            {draft.objective === 'other' && <OtherField id="c-objective-other" value={draft.objectiveOther} onChange={text('objectiveOther')} />}
          </ChoiceCards>
        );
      case 3:
        return (
          <ChoiceCards
            name="c-integration"
            legend="How prominently should the brand appear?"
            options={INTEGRATION_OPTIONS}
            value={draft.integration}
            onChange={(v) => choose('integration', v)}
          >
            {draft.integration === 'other' && <OtherField id="c-integration-other" value={draft.integrationOther} onChange={text('integrationOther')} />}
          </ChoiceCards>
        );
      case 4:
        return (
          <div className="bf-stack">
            <fieldset className="bf-choices">
              <legend className="bf-q">What must every video include?</legend>
              <ChipRail
                mode="multi"
                label="What must every video include?"
                wrap
                options={MUST_HAVE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={draft.mustHaves}
                onChange={(v: MustHave[]) => choose('mustHaves', v)}
                className="bf-musts"
              />
              {draft.mustHaves.includes('other') && <OtherField id="c-musts-other" value={draft.mustHavesOther} onChange={text('mustHavesOther')} />}
            </fieldset>
            <Field
              id="c-response"
              label="After watching, what should people think, feel or do?"
              multiline
              rows={3}
              maxLength={1000}
              placeholder="In your own words"
              value={draft.viewerResponse}
              onChange={text('viewerResponse')}
              onFocus={onFocus}
              onSelect={onSelect}
            />
          </div>
        );
      case 5:
        return (
          <div className="bf-stack">
            <fieldset className="bf-choices bf-refs">
              <legend className="bf-q">3 to 5 videos that show the direction you want</legend>
              {draft.refs.map((r, i) => (
                <div key={i} className="bf-ref">
                  <input
                    id={`c-ref-${i}`}
                    className="field cf-input"
                    type="url"
                    inputMode="url"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={500}
                    aria-label={`Reference link ${i + 1}`}
                    aria-invalid={linkErrors[`ref${i}`] ? true : undefined}
                    aria-describedby={linkErrors[`ref${i}`] ? `c-ref-${i}-error` : undefined}
                    value={r}
                    onChange={(e) => setRef(i, e.currentTarget.value)}
                    onBlur={(e) => {
                      // Read the value now: React clears currentTarget before the updater runs.
                      const error = linkError(e.currentTarget.value);
                      setLinkErrors((l) => ({ ...l, [`ref${i}`]: error }));
                    }}
                    onFocus={onFocus}
                  />
                  <FieldError id={`c-ref-${i}-error`} message={linkErrors[`ref${i}`]} />
                </div>
              ))}
              {draft.refs.length < MAX_REFS ? (
                <button type="button" className="bf-add" onClick={addRef}>
                  <span aria-hidden>+</span> Add another link
                </button>
              ) : (
                <p className="bf-five" role="status">
                  That's five. Perfect.
                </p>
              )}
            </fieldset>
            <div className="bf-guide-field">
              <p className="bf-q" id="c-guide-q">
                Brand guide
              </p>
              <Field
                id="c-guide"
                label="Link to your brand guide"
                type="url"
                inputMode="url"
                maxLength={500}
                help="Google Drive, Dropbox, Notion or Canva all work. Please make sure we can open it."
                value={draft.guide}
                error={linkErrors.guide}
                onChange={text('guide')}
                onBlur={(e) => {
                  const error = linkError(e.currentTarget.value);
                  setLinkErrors((l) => ({ ...l, guide: error }));
                }}
                onFocus={onFocus}
              />
              {/* D7: link only. "Or upload a PDF" is not rendered: there is no upload endpoint (BRAND_GUIDE_UPLOAD is false). */}
              <GuideDisclosure />
            </div>
            <Field
              id="c-message"
              label="Anything else we should know?"
              optional
              multiline
              rows={3}
              maxLength={2000}
              value={draft.message}
              onChange={text('message')}
              onFocus={onFocus}
              onSelect={onSelect}
            />
          </div>
        );
      case 6:
        return <Review draft={draft} intent={intent} onEdit={goTo} />;
    }
  };

  const panelKey = trial ? `step-${step}` : 'question';
  const panelBody = trial ? (
    <>
      {step < REVIEW ? (
        <h2 ref={headingRef} tabIndex={-1} className="bf-title">
          {STEP_TITLE[step]}
        </h2>
      ) : (
        <h2 ref={headingRef} tabIndex={-1} className="bf-title">
          Check your brief
        </h2>
      )}
      {stepBody(step)}
    </>
  ) : (
    <div className="cf-grid">
      {nameField}
      {emailField}
      {phoneField}
      <Field
        id="c-message"
        label="Your question"
        multiline
        rows={4}
        maxLength={2000}
        value={draft.message}
        onChange={text('message')}
        onFocus={onFocus}
        onSelect={onSelect}
        className="cf-span"
      />
      <p className="cf-help cf-span bf-saving m-0">{SAVING_NOTE}</p>
    </div>
  );

  const panel = ok ? (
    <AnimatePresence mode="wait" initial={false} custom={dir.current}>
      <m.div
        key={panelKey}
        className="bf-panel"
        custom={dir.current}
        variants={{
          enter: (d: number) => ({ opacity: 0, y: 8, x: d * 16 }),
          center: { opacity: 1, y: 0, x: 0, transition: spring.smooth },
          exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeOut' } },
        }}
        initial="enter"
        animate="center"
        exit="exit"
      >
        {panelBody}
      </m.div>
    </AnimatePresence>
  ) : (
    <div key={panelKey} className="bf-panel">
      {panelBody}
    </div>
  );

  const castSide = (who: CastId, i: number, n: number): 'start' | 'center' | 'end' =>
    who === 'gola' ? 'end' : i === 0 ? 'start' : i === n - 1 ? 'end' : 'center';
  // Desktop keeps a fourth slot for Gola at the right end, empty until steps 4 and 5, so nobody moves when Gola pops in.
  const order: (CastId | null)[] = phone ? line : [...line, gola ? 'gola' : null];

  return (
    <div ref={rootRef} className="cf" data-state={sent ? 'done' : 'open'} data-mode={mode} data-bubble-bounds="">
      <div className="cf-cast" data-slots={order.length}>
        {order.map((who, i) =>
          who === null ? (
            <span key="gola-slot" className="cf-k" data-who="gola" data-empty="" aria-hidden />
          ) : (
            <span key={who} className="cf-k" data-who={who}>
              <Character
                ref={(h) => {
                  crew.current[who] = h;
                }}
                who={who}
                size={who === 'tiko' ? 'calc(var(--cf-k) * 1.07)' : who === 'gola' ? 'calc(var(--cf-k) * 0.86)' : 'var(--cf-k)'}
                expression={sent ? 'happy' : 'idle'}
                intro={who === 'gola' && !phone ? 0 : undefined}
              >
                <BubbleFor who={who} cast={cast} side={castSide(who, i, order.length)} />
              </Character>
            </span>
          ),
        )}
      </div>

      <div className="cf-card">
        <form onSubmit={submit} onBlur={onFormBlur} noValidate className="cf-form" inert={sent}>
          <Segment
            className="cf-mode"
            label="Plan a trial or ask a question"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'trial', label: 'Plan a trial' },
              { value: 'question', label: 'Ask a question' },
            ]}
          />

          {trial && <StepDots step={step} />}

          <div className="bf-panels">{panel}</div>

          {/* The honeypot. Off-screen, never display:none, and nothing listens to it. */}
          <div className="sr-trap" aria-hidden>
            <label>
              Company
              <input ref={trapRef} id="cf-hp" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>

          {trial && step === REVIEW && (
            <p className="bf-note">
              Creative direction, branding and must-haves are best locked before the shoot. Changes after filming may need extra editing, revised deliverables
              or a reshoot.
            </p>
          )}

          {failed && (
            <div ref={alertRef} role="alert" className="cf-alert">
              <CircleAlert className="cf-alert-icon size-5 flex-none" aria-hidden />
              {limited ? (
                <p className="m-0">
                  <b>{errorLead}</b> Your message is still here:{' '}
                  <a href={mailto} className="cf-link">
                    email it to {SITE.email}
                  </a>
                  .
                </p>
              ) : (
                <p className="m-0">
                  <b>{errorLead}</b> Your message is still here. Try again, or email{' '}
                  <a href={mailto} className="cf-link">
                    {SITE.email}
                  </a>
                  .
                </p>
              )}
            </div>
          )}

          {/* Keys keep every button its own element. Without them React reuses step 5's "Skip for now" as the review's submit button, its type
              turns to "submit" while the click is still being handled, and the browser sends the form. */}
          {trial && step < REVIEW ? (
            <div key="nav-steps" className="bf-nav">
              {step > 1 && (
                <button key="back" type="button" className="btn btn-ghost bf-back" onClick={back}>
                  Back
                </button>
              )}
              {step > 1 && (
                <button key="skip" type="button" className="bf-skip" onClick={skip}>
                  Skip for now
                </button>
              )}
              <button key="next" type="button" className="btn btn-accent bf-next" onClick={next}>
                Next
                <ActionLit label="Next" />
              </button>
            </div>
          ) : (
            <div key="nav-send" className="bf-nav bf-nav-send">
              {trial && (
                <button key="back" type="button" className="btn btn-ghost bf-back" onClick={back}>
                  Back
                </button>
              )}
              {/* aria-disabled, not disabled: a disabled button drops the keyboard focus it holds, and submit() already ignores a second press. */}
              <button key="send" type="submit" className="btn btn-accent btn-lg cf-submit" aria-disabled={send.isPending || undefined}>
                {send.isPending ? 'Sending…' : trial ? PRIMARY_ACTION.label : 'Send question'}
                <ActionLit label={send.isPending ? 'Sending…' : trial ? PRIMARY_ACTION.label : 'Send question'} />
              </button>
            </div>
          )}

          {(!trial || step === REVIEW) && (
            <p className="cf-fine small">
              We use what you send only to reply to you, prepare your trial and discuss your project. <Link to="/legal/privacy">Privacy</Link>
            </p>
          )}
        </form>

        <div role="status" className="cf-done-wrap">
          {sent && (
            <div className="cf-done">
              <h2 ref={doneRef} tabIndex={-1} className="h2-sm">
                {trial ? 'Thanks, your brief is in' : 'Thanks, we have your question'}
              </h2>
              <p className="lead">{trial ? "Next, we'll confirm the trial's scope, number of videos and any fee in writing." : "We'll reply by email."}</p>
              <div className="cf-done-actions">
                <Cta to="/video-library" kind="ghost" arrow>
                  Browse video library
                </Cta>
                <Cta to="/how-we-work" kind="ghost" arrow>
                  How we work
                </Cta>
              </div>
              <p className="m-0 small text-muted">
                You can also reach us at{' '}
                <a href={`mailto:${SITE.email}`} className="cf-link">
                  {SITE.email}
                </a>
                {call ? (
                  <>
                    {' '}
                    or {call.whatsapp ? 'WhatsApp / call' : 'call'}{' '}
                    <a href={`tel:${call.tel}`} className="cf-link">
                      {call.display}
                    </a>
                    .
                  </>
                ) : (
                  '.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {confetti && (
        <div className="cf-confetti" aria-hidden>
          {confettiBits().map((b) => (
            <span key={b.key} className="cf-bit" data-shape={b.shape} style={b.style} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Review ----------

function ReviewBlock({ title, step, onEdit, children }: { title: string; step: Step; onEdit: (s: Step) => void; children: ReactNode }) {
  return (
    <section className="bf-rv">
      <div className="bf-rv-head">
        <h3 className="bf-rv-title">{title}</h3>
        <button type="button" className="bf-edit" onClick={() => onEdit(step)} aria-label={`Edit: ${title}`}>
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bf-rv-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Review({ draft, intent, onEdit }: { draft: Draft; intent: Intent; onEdit: (s: Step) => void }) {
  const refs = draft.refs.map((r) => r.trim()).filter(Boolean);
  const not = <p className="bf-rv-not">{NOT_YET}</p>;
  return (
    <div className="bf-review">
      <ReviewBlock title={STEP_TITLE[1]} step={1} onEdit={onEdit}>
        <dl className="bf-rv-list">
          <Row label="Full name">{draft.name.trim()}</Row>
          <Row label="Email address">{draft.email.trim()}</Row>
          {draft.phone.trim() && <Row label="Phone or WhatsApp">{draft.phone.trim()}</Row>}
          <Row label="Brand name">
            {draft.brand.trim()}
            {draft.agency && <span className="bf-rv-sub">I'm an agency briefing for a client brand</span>}
          </Row>
          {draft.site.trim() && <Row label="Website or Instagram">{draft.site.trim()}</Row>}
          {serviceLabel(draft, intent) && <Row label="Package you're considering">{serviceLabel(draft, intent)}</Row>}
        </dl>
      </ReviewBlock>
      <ReviewBlock title={STEP_TITLE[2]} step={2} onEdit={onEdit}>
        {answered[2](draft) ? <p className="bf-rv-text">{objectiveText(draft)}</p> : not}
      </ReviewBlock>
      <ReviewBlock title={STEP_TITLE[3]} step={3} onEdit={onEdit}>
        {answered[3](draft) ? <p className="bf-rv-text">{integrationText(draft)}</p> : not}
      </ReviewBlock>
      <ReviewBlock title={STEP_TITLE[4]} step={4} onEdit={onEdit}>
        {answered[4](draft) ? (
          <dl className="bf-rv-list">
            {draft.mustHaves.length > 0 && <Row label="What must every video include?">{mustHavesText(draft)}</Row>}
            {draft.viewerResponse.trim() && <Row label="After watching, what should people think, feel or do?">{draft.viewerResponse.trim()}</Row>}
          </dl>
        ) : (
          not
        )}
      </ReviewBlock>
      <ReviewBlock title={STEP_TITLE[5]} step={5} onEdit={onEdit}>
        {answered[5](draft) ? (
          <dl className="bf-rv-list">
            {refs.length > 0 && (
              <Row label="3 to 5 videos that show the direction you want">
                <ul className="bf-rv-links">
                  {refs.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </Row>
            )}
            {draft.guide.trim() && <Row label="Brand guide">{draft.guide.trim()}</Row>}
            {draft.message.trim() && <Row label="Anything else we should know?">{draft.message.trim()}</Row>}
          </dl>
        ) : (
          not
        )}
      </ReviewBlock>
    </div>
  );
}
