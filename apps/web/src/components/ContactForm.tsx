import type { LeadInput } from '@kreators/shared';
import { useMutation } from '@tanstack/react-query';
import { CircleAlert } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FocusEvent, type FormEvent, type RefObject } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Character, cascade, castLookAt, type CharacterHandle } from '../cast';
import { ApiError, api } from '../lib/api';
import { FORMATS, PLANS, PRIMARY_ACTION, SERVICES, SITE, STEPS } from '../lib/content';
import { motionOk } from '../lib/motionOk';
import { Cta } from './ui';

// The form is the page: the three of them stand on it, watch what you do and react once at a time. Everything they do is decoration:
// the labels, error text and status lines carry the meaning on their own.

type TextField = 'name' | 'email' | 'phone' | 'message';
type Errors = Partial<Record<'name' | 'email', string>>;
type Control = HTMLInputElement | HTMLTextAreaElement;

const EMPTY: Record<TextField, string> = { name: '', email: '', phone: '', message: '' };

/** The same test the API uses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const nameError = (v: string) => (v.trim() ? '' : 'Please add your name so we know who to reply to.');
const emailError = (v: string) => {
  const t = v.trim();
  if (!t) return 'Please add your email so we can reply.';
  return EMAIL.test(t) ? '' : 'That email looks incomplete. It should look like name@brand.com.';
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** What the URL says they came for: a plan, a platform or a format, as its display name. */
function intentOf(params: URLSearchParams): { option: string; isExtra: boolean } | null {
  const raw = (params.get('plan') ?? params.get('service') ?? '').trim().toLowerCase();
  if (!raw) return null;
  const plan = PLANS.find((p) => p.slug === raw);
  if (plan) return { option: plan.name, isExtra: true };
  const platform = SERVICES.find((s) => slug(s.name) === raw || s.name.toLowerCase() === raw);
  if (platform) return { option: platform.name, isExtra: false };
  if (Object.keys(FORMATS).includes(raw)) return { option: raw.charAt(0).toUpperCase() + raw.slice(1), isExtra: true };
  return null;
}

let measure: CanvasRenderingContext2D | null = null;

/** Where the caret is on screen. An email input reports no selection, so its caret is taken to be at the end. */
function caretPoint(el: Control): { x: number; y: number } {
  const box = el.getBoundingClientRect();
  const css = getComputedStyle(el);
  const left = parseFloat(css.paddingLeft);
  const right = parseFloat(css.paddingRight);
  const inner = Math.max(1, box.width - left - right);
  const before = el.value.slice(0, el.selectionEnd ?? el.value.length);
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

/** The site's only confetti: the logo's four shapes, one burst from behind the cast. Positions are worked out from the index, so every visit is the same 24 pieces. */
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
  const [phone, setPhone] = useState(() => matchMedia('(max-width: 734px)').matches);
  useEffect(() => {
    const mq = matchMedia('(max-width: 734px)');
    const onChange = () => setPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return phone;
}

export function ContactForm() {
  const [params] = useSearchParams();
  const intent = intentOf(params);
  const [values, setValues] = useState(EMPTY);
  const [service, setService] = useState(intent?.option ?? '');
  const [extraOption, setExtraOption] = useState(intent?.isExtra ? intent.option : '');
  const [errors, setErrors] = useState<Errors>({});
  const [confetti, setConfetti] = useState(false);
  const send = useMutation({ mutationFn: api.contact });
  const sent = send.isSuccess;
  const phone = useIsPhone();

  const sochu = useRef<CharacterHandle>(null);
  const bolu = useRef<CharacterHandle>(null);
  const tiko = useRef<CharacterHandle>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Once a field has been told off, it re-checks as you type and clears the moment it is right. Until then, nothing nags while you are typing.
  const shown = useRef({ name: false, email: false });
  const emailWasValid = useRef(false);
  const messageMilestone = useRef(0);

  // Arriving with a different plan, while already on the page.
  const intentKey = intent?.option ?? '';
  const seenIntent = useRef(intentKey);
  useEffect(() => {
    if (!intentKey || intentKey === seenIntent.current) return;
    seenIntent.current = intentKey;
    setService(intentKey);
    if (intent?.isExtra) setExtraOption(intentKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentKey]);

  // Bolu says hello once.
  useEffect(() => {
    const id = window.setTimeout(() => bolu.current?.play('wave'), 650);
    return () => window.clearTimeout(id);
  }, []);

  // A failed send: they look at the message, concerned, never cross. The visitor did nothing wrong.
  const failed = send.isError;
  useEffect(() => {
    if (!failed) return;
    const line = alertRef.current;
    for (const r of [sochu, tiko]) {
      r.current?.setExpression('confused', { hold: 1800 });
      if (line) r.current?.lookAt(line, 1800);
    }
  }, [failed]);

  // Sent: focus moves to the thanks in the commit that shows it, never before. The form goes inert in that same commit and drops the focus it held, and a
  // frame scheduled from onSuccess can run before React has rendered the thanks (it did whenever the cast was asleep), which left focus on <body>.
  useLayoutEffect(() => {
    if (!sent) return;
    // On a phone the button that was just pressed is far below the cast: bring the moment to where the eyes need to be.
    const root = rootRef.current;
    if (root && root.getBoundingClientRect().top < 0) root.scrollIntoView({ behavior: 'instant', block: 'start' });
    doneRef.current?.focus({ preventScroll: true });
  }, [sent]);

  const options = extraOption ? [extraOption, ...SERVICES.map((s) => s.name)] : SERVICES.map((s) => s.name);

  // Bolu rests with drawn eyes, which cannot look anywhere, so for the glance it opens them ('open' is the rig's own pose: eyes only), as in the footer.
  const glanceAt = (el: Element) => {
    tiko.current?.lookAt(el, 1200);
    bolu.current?.lookAt(el, 1200);
    bolu.current?.setExpression('open', { hold: 1200 });
  };

  const followCaret = (el: Control) => tiko.current?.lookAt(caretPoint(el), 700);

  const onFocus = (e: FocusEvent<Control>) => glanceAt(e.currentTarget);
  const onBlurName = (e: FocusEvent<HTMLInputElement>) => {
    if (e.currentTarget.value) check('name', e.currentTarget.value);
  };
  const onBlurEmail = (e: FocusEvent<HTMLInputElement>) => {
    if (e.currentTarget.value) check('email', e.currentTarget.value);
  };

  const check = (field: 'name' | 'email', value: string) => {
    const error = field === 'name' ? nameError(value) : emailError(value);
    shown.current[field] = true;
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const set = (field: TextField) => (e: ChangeEvent<Control>) => {
    const { value } = e.currentTarget;
    setValues((v) => ({ ...v, [field]: value }));
    if ((field === 'name' || field === 'email') && shown.current[field]) check(field, value);
    if (field === 'email') {
      const valid = EMAIL.test(value.trim());
      if (valid && !emailWasValid.current) (sochu.current ?? bolu.current)?.play('nod');
      emailWasValid.current = valid;
    }
    if (field === 'message') {
      const n = value.trim().length;
      if (n >= 40 && messageMilestone.current < 1) {
        messageMilestone.current = 1;
        bolu.current?.setExpression('happy', { hold: 1500 });
      } else if (n >= 140 && messageMilestone.current < 2) {
        messageMilestone.current = 2;
        bolu.current?.play('hop', { small: true });
      }
    }
    if (field !== 'phone') followCaret(e.currentTarget);
  };

  const onSelect = (e: { currentTarget: Control }) => {
    if (document.activeElement === e.currentTarget) followCaret(e.currentTarget);
  };

  // The phone field: Tiko shuts its eyes and turns away. We are not staring at your number.
  const onPhoneFocus = () => {
    tiko.current?.closeEyes(true);
    tiko.current?.lookAt({ x: window.innerWidth + 400, y: -300 }, 60_000);
    bolu.current?.lookAt(document.getElementById('c-phone'), 1200);
  };
  const openEyes = () => {
    tiko.current?.closeEyes(false);
    tiko.current?.lookAt(null);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (send.isPending) return;
    const found: Errors = { name: nameError(values.name) || undefined, email: emailError(values.email) || undefined };
    shown.current = { name: true, email: true };
    setErrors(found);

    const firstBad: RefObject<HTMLInputElement | null> | null = found.name ? nameRef : found.email ? emailRef : null;
    if (firstBad?.current) {
      firstBad.current.focus();
      castLookAt(firstBad.current, 1600);
      tiko.current?.setExpression('confused', { hold: 1500 });
      return;
    }

    openEyes();
    const lead: LeadInput = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      service,
      message: values.message.trim(),
      // Read straight from the DOM, with no listener on it: a bot that sets the value without firing events is still caught.
      company: trapRef.current?.value ?? '',
    };
    sochu.current?.setExpression('thinking');
    send.mutate(lead, {
      onError: () => sochu.current?.setExpression(null),
      onSuccess: () => {
        const crew = [sochu.current, bolu.current, tiko.current];
        for (const c of crew) c?.setExpression('celebrating', { hold: 2600 });
        cascade(crew, 'hop', { stagger: 110, force: true });
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

  const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent('Free trial video')}&body=${encodeURIComponent(
    [values.message, '', values.name, values.phone, service].filter((line, i) => line || i === 1).join('\n'),
  )}`;

  const label = (text: string, optional?: boolean) => (
    <span className="cf-label">
      {text}
      {optional && <span className="cf-opt">Optional</span>}
    </span>
  );

  const fieldError = (id: string, message?: string) => (
    <p id={id} className="cf-err" aria-live="polite">
      {message && (
        <>
          <CircleAlert className="size-4 flex-none" aria-hidden />
          <span>{message}</span>
        </>
      )}
    </p>
  );

  return (
    <div ref={rootRef} className="cf" data-state={sent ? 'done' : 'open'}>
      <div className="cf-cast">
        {!phone && <Character ref={sochu} who="sochu" size="var(--cf-k)" expression={sent ? 'happy' : 'idle'} />}
        <Character ref={bolu} who="bolu" size="var(--cf-k)" expression={sent ? 'happy' : 'idle'} />
        <Character ref={tiko} who="tiko" size="calc(var(--cf-k) * 1.07)" expression={sent ? 'happy' : 'idle'} />
      </div>

      <div className="cf-card">
        <form onSubmit={submit} noValidate className="cf-form" inert={sent}>
          <div className="cf-grid">
            <div className="cf-field cf-span">
              <label htmlFor="c-name">{label('Full name')}</label>
              <input
                ref={nameRef}
                id="c-name"
                name="name"
                className="field cf-input"
                required
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'c-name-error' : undefined}
                value={values.name}
                onChange={set('name')}
                onSelect={onSelect}
                onFocus={onFocus}
                onBlur={onBlurName}
              />
              {fieldError('c-name-error', errors.name)}
            </div>

            <div className="cf-field">
              <label htmlFor="c-email">{label('Email address')}</label>
              <input
                ref={emailRef}
                id="c-email"
                name="email"
                type="email"
                className="field cf-input"
                required
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'c-email-error' : undefined}
                value={values.email}
                onChange={set('email')}
                onSelect={onSelect}
                onFocus={onFocus}
                onBlur={onBlurEmail}
              />
              {fieldError('c-email-error', errors.email)}
            </div>

            <div className="cf-field">
              <label htmlFor="c-phone">{label('Phone or WhatsApp', true)}</label>
              <input id="c-phone" name="phone" type="tel" className="field cf-input" autoComplete="tel" value={values.phone} onChange={set('phone')} onFocus={onPhoneFocus} onBlur={openEyes} />
            </div>

            <fieldset className="cf-field cf-span cf-pills">
              <legend>{label('What do you need?', true)}</legend>
              {/* The value the lead carries. The pills below are how it is chosen. */}
              <input id="c-service" type="hidden" name="service" value={service} />
              <div className="cf-pill-row">
                {options.map((option) => (
                  <label key={option} className="cf-pill">
                    <input
                      type="radio"
                      name="c-service-choice"
                      value={option}
                      checked={service === option}
                      onChange={() => setService(option)}
                      onClick={() => {
                        if (service === option) setService('');
                      }}
                      onKeyDown={(e) => {
                        // A browser ignores Space on a radio that is already on, so clearing it by keyboard takes this.
                        if (e.key === ' ' && service === option) {
                          e.preventDefault();
                          setService('');
                        }
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="cf-field cf-span">
              <label htmlFor="c-message">{label('Tell us about your product', true)}</label>
              <textarea id="c-message" name="message" className="field cf-input cf-area" rows={3} value={values.message} onChange={set('message')} onSelect={onSelect} onFocus={onFocus} />
            </div>
          </div>

          {/* The honeypot. Off-screen, never display:none, and nothing listens to it. */}
          <div className="sr-trap" aria-hidden>
            <label>
              Company
              <input ref={trapRef} id="cf-hp" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>

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

          {/* aria-disabled, not disabled: a disabled button drops the keyboard focus it holds, and submit() already ignores a second press while sending. */}
          <button type="submit" className="btn btn-accent btn-lg cf-submit" aria-disabled={send.isPending || undefined}>
            {send.isPending ? 'Sending…' : PRIMARY_ACTION.label}
          </button>

          <p className="cf-fine small">
            We use what you send only to reply to you and to discuss your project. <Link to="/legal/privacy">Privacy</Link>
          </p>
        </form>

        <div role="status" className="cf-done-wrap">
          {sent && (
            <div className="cf-done">
              <h2 ref={doneRef} tabIndex={-1} className="h2-sm">
                Thanks, we have your message
              </h2>
              <p className="lead">{STEPS[0]?.body}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Cta to="/video-library" kind="ghost" arrow>
                  Browse video library
                </Cta>
              </div>
              <p className="m-0 small text-muted">
                You can also reach us at{' '}
                <a href={`mailto:${SITE.email}`} className="cf-link">
                  {SITE.email}
                </a>
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
