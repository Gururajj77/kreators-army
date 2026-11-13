// Owner: A4 Admin. The lock screen (admin brief 5.2 with V2-SPEC 4.2: no speech bubble; Sochu reacts by expression only) and the passkey form the
// session sheet reuses. States: idle, checking, wrong (with tries left when 3 or fewer), too many (a live mm:ss countdown, field and button disabled),
// admin off (the command to set the secret), offline, and success (Sochu nods, then a 250 ms crossfade).
import type { AdminSession } from '@kreators/shared';
import { Eye, EyeOff, LockOpen } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Character, type CharacterHandle, type Expression } from '../cast';
import { Seo } from '../components/ui';
import { motionOk } from '../lib/motionOk';
import { unlock } from './api';

export type PassState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'wrong'; triesLeft: number | null; n: number }
  | { kind: 'too-many'; until: number }
  | { kind: 'off' }
  | { kind: 'offline' }
  | { kind: 'error'; message: string }
  | { kind: 'success' };

function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** The passkey field, show/hide, the message line and Unlock. A hidden username lets password managers save the passkey. */
export function PasskeyForm({
  onUnlocked,
  onState,
  initial,
  autoFocus = true,
  submitLabel = 'Unlock',
  className,
}: {
  onUnlocked: (session: AdminSession) => void;
  onState?: (s: PassState) => void;
  initial?: PassState;
  autoFocus?: boolean;
  submitLabel?: string;
  className?: string;
}) {
  const id = useId();
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [state, setState] = useState<PassState>(initial ?? { kind: 'idle' });
  const [now, setNow] = useState(() => Date.now());
  const field = useRef<HTMLInputElement>(null);
  const tries = useRef(0);

  const update = (s: PassState) => {
    setState(s);
    onState?.(s);
  };

  // The countdown ticks once a second while locked out, then the field opens again.
  useEffect(() => {
    if (state.kind !== 'too-many') return;
    const t = window.setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= state.until) {
        update({ kind: 'idle' });
        window.setTimeout(() => field.current?.focus(), 0);
      }
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const locked = state.kind === 'too-many';
  const busy = state.kind === 'checking' || state.kind === 'success';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || locked) return;
    if (!value.trim()) {
      field.current?.focus();
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      update({ kind: 'offline' });
      return;
    }
    update({ kind: 'checking' });
    const r = await unlock(value);
    if (r.ok) {
      setValue('');
      update({ kind: 'success' });
      onUnlocked(r.session);
      return;
    }
    if (r.code === 'wrong-passkey') {
      tries.current++;
      update({ kind: 'wrong', triesLeft: r.triesLeft, n: tries.current });
      field.current?.select();
    } else if (r.code === 'too-many') {
      setNow(Date.now());
      update({ kind: 'too-many', until: Date.now() + r.retryAfter * 1000 });
    } else if (r.code === 'admin-off') update({ kind: 'off' });
    else if (r.code === 'offline' || r.code === 'network') update({ kind: 'offline' });
    else update({ kind: 'error', message: r.message });
    window.setTimeout(() => field.current?.focus(), 0);
  }

  const msgId = `${id}-msg`;
  let message: ReactNode = null;
  if (state.kind === 'wrong') {
    message = (
      <>
        That passkey didn't work.
        {state.triesLeft !== null && state.triesLeft <= 3 && (
          <>
            {' '}
            {state.triesLeft === 0
              ? 'Too many tries. Wait a few minutes and try again.'
              : state.triesLeft === 1
                ? '1 try left before a short wait.'
                : `${state.triesLeft} tries left before a short wait.`}
          </>
        )}
      </>
    );
  } else if (state.kind === 'too-many') {
    message = (
      <>
        Too many tries. Wait a few minutes and try again.{' '}
        <span className="adm-countdown" role="timer" aria-live="off">
          {mmss(state.until - now)}
        </span>
      </>
    );
  } else if (state.kind === 'off') {
    message = (
      <>
        The passkey isn't set up on the server yet. <code className="adm-code">pnpm cf:secret ADMIN_KEY</code>
      </>
    );
  } else if (state.kind === 'offline') message = "You're offline. Connect and try again.";
  else if (state.kind === 'error') message = state.message;

  return (
    <form className={`adm-pass ${className ?? ''}`} onSubmit={submit} noValidate>
      {/* For password managers: the passkey is saved against this name. Off-screen, never display:none. */}
      <input className="sr-trap" type="text" name="username" autoComplete="username" value="Kreators.Army admin" readOnly tabIndex={-1} aria-hidden />
      <label className="adm-label" htmlFor={`${id}-key`}>
        Passkey
      </label>
      <div className="adm-pass-row">
        <input
          ref={field}
          id={`${id}-key`}
          className="field adm-pass-field"
          type={show ? 'text' : 'password'}
          name="passkey"
          autoComplete="current-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={locked}
          aria-invalid={state.kind === 'wrong' || undefined}
          aria-describedby={message ? msgId : undefined}
          autoFocus={autoFocus}
        />
        <button type="button" className="btn btn-sm adm-pass-show" aria-pressed={show} onClick={() => setShow((s) => !s)} disabled={locked}>
          {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          <span>{show ? 'Hide' : 'Show'}</span>
        </button>
      </div>
      <p id={msgId} className="adm-pass-msg" role={message ? 'alert' : undefined} data-tone={state.kind === 'off' || state.kind === 'offline' ? 'info' : 'error'}>
        {message}
      </p>
      <button type="submit" className="btn btn-ink adm-unlock" data-intent="positive" data-fill="" disabled={busy || locked} aria-busy={state.kind === 'checking' || undefined}>
        {state.kind === 'checking' ? (
          'Checking…'
        ) : (
          <>
            <LockOpen className="size-4" aria-hidden />
            {submitLabel}
          </>
        )}
      </button>
    </form>
  );
}

const EXPRESSION: Record<PassState['kind'], Expression> = {
  idle: 'idle',
  checking: 'thinking',
  wrong: 'confused',
  'too-many': 'sleepy',
  off: 'confused',
  offline: 'idle',
  error: 'confused',
  success: 'happy',
};

/** The whole lock screen. `state` starts as 'off' or 'offline' when the session check already said so. */
export function LockScreen({ onUnlocked, initial }: { onUnlocked: (session: AdminSession) => void; initial?: PassState }) {
  const sochu = useRef<CharacterHandle>(null);
  const [state, setState] = useState<PassState>(initial ?? { kind: 'idle' });
  const [leaving, setLeaving] = useState(false);

  const onState = (s: PassState) => {
    setState(s);
    if (s.kind === 'wrong') sochu.current?.play('shrug', { force: true });
    if (s.kind === 'success') sochu.current?.play('nod', { force: true });
  };

  const done = (session: AdminSession) => {
    // Sochu nods, then the lock screen fades out over 250 ms and the requested screen fades in.
    if (!motionOk()) {
      onUnlocked(session);
      return;
    }
    window.setTimeout(() => setLeaving(true), 520);
    window.setTimeout(() => onUnlocked(session), 520 + 250);
  };

  return (
    <main id="main" className="adm-lock" data-leaving={leaving ? '' : undefined}>
      <Seo title="Enter the passkey · Library admin" description="Library admin" noindex />
      <div className="adm-lock-card">
        <div className="adm-lock-cast">
          <Character ref={sochu} who="sochu" size={120} prop expression={EXPRESSION[state.kind]} />
        </div>
        <p className="adm-lock-eyebrow">Library admin</p>
        <h1 className="adm-lock-title">Enter the passkey</h1>
        <PasskeyForm onUnlocked={done} onState={onState} initial={initial} />
        <p className="adm-lock-foot">This page is for the Kreators.Army team.</p>
      </div>
    </main>
  );
}
