import { useEffect, useId, useImperativeHandle, useInsertionEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import { castById, type CastId } from '../lib/content';
import { BODY_COLOR, FlatBody, RestFace, insertCoreDefs } from './rest';
import type { Actor, CastAction, LookTarget, PlayOptions } from './director';
import type { LiveProps } from './live';
import type { Expression, InternalExpression } from './rig';

// The shell of a character: the plate image, the rest face and the reserved box. This part costs almost nothing and is complete at first paint.
// The rig (director, poses, live face, props) is a separate chunk, loaded once after the first idle moment and shared by every character.

export type { CastId } from '../lib/content';
export type { Expression } from './rig';
export type { CastAction, LookTarget, PlayOptions } from './director';

export interface CharacterProps {
  who: CastId;
  /** The character's width in px (a number) or any CSS length, such as 'clamp(56px, 8.5vw, 128px)'. The box is 13:12, with the feet on its bottom edge. */
  size?: number | string;
  /** One of nine. Other than `idle`, it applies once the rig has loaded. Default `idle`. */
  expression?: Expression;
  /** True gives the character its job prop. 'parcel' is the retail parcel. Hidden below 80 px. Default false. */
  prop?: boolean | 'parcel';
  /** Pupils and face follow the pointer. Default true. Pointer tracking only runs on fine pointers, and never while animations are paused. */
  track?: boolean;
  /** Takes hover and tap with no tab stop: squash on press and the signature move on release. Default false, with pointer-events none. */
  interactive?: boolean;
  /** Show a name and role chip on hover. Needs `interactive`. */
  chip?: boolean;
  /** Stand 30% below a clipped edge and rise into view from 62% once, on entering the viewport. The parent must clip with `overflow: clip`. */
  peek?: boolean;
  /** Paint the rest pose only: no rig, nothing moves, no JavaScript beyond this shell. */
  still?: boolean;
  /** Flat logo fill and face with no shading. Automatic at 32 px and under. */
  flat?: boolean;
  /** Pop up from behind the ground on mount, CSS only, after this many ms. Skipped under data-still. */
  intro?: number;
  /** Treat the background as dark whatever the theme, for the contact-shadow colour. Automatic inside `.band-dark`, `footer`, and in the dark theme. */
  onDark?: boolean;
  /** Decorative by default (aria-hidden). Give a label to make it an image with a name instead. */
  label?: string;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<CharacterHandle>;
  /** Rendered inside the character's box, after the figure: a speech bubble (CastBubble) sits here, above the head. */
  children?: ReactNode;
}

export interface CharacterHandle {
  /** Play a one-shot: `hop`, `wave`, `signature`, `peek`, `nod` or `shrug`. Reactions go one at a time, with per-character cool-downs. */
  play: (action: CastAction, options?: PlayOptions) => void;
  /** Eyes and face turn to an element's centre or a viewport point for `ms` (default 1200). Null lets go. */
  lookAt: (target: LookTarget, ms?: number) => void;
  /** Change expression. Null returns to the `expression` prop. `hold` returns after that many ms. 'open' is eyes-only: Bolu and Sochu rest on drawn lines, and need real eyes to glance. */
  setExpression: (name: InternalExpression | null, options?: { hold?: number }) => void;
  /** Close or open the eyes, keeping the expression. */
  closeEyes: (closed: boolean) => void;
  /** Press squash for a parent button. */
  press: (down: boolean) => void;
  /** The character's `.k-char` element, once mounted. Speech bubbles and performances share the one-speaker token under it. */
  el: () => HTMLElement | null;
}

type Rig = typeof import('./live');

let rig: Rig | null = null;
let rigLoad: Promise<Rig> | null = null;

export const loadRig = () => {
  rigLoad ??= import('./live').then((m) => (rig = m));
  return rigLoad;
};

const afterIdle = (fn: () => void) => {
  if (rig) fn();
  else if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 1500 });
  else setTimeout(fn, 200);
};

const handleActors = new WeakMap<CharacterHandle, () => Actor | null>();

function hash(text: string) {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 9973;
  return h;
}

/** A character. See `v1-notes/cast.md` for how to use it. */
export function Character({
  who,
  size = 150,
  expression = 'idle',
  prop = false,
  track = true,
  interactive = false,
  chip = false,
  peek = false,
  still = false,
  flat,
  intro,
  onDark,
  label,
  className,
  style,
  ref,
  children,
}: CharacterProps) {
  const actor = useRef<Actor | null>(null);
  const box = useRef<HTMLSpanElement>(null);
  const queue = useRef<((a: Actor, r: Rig) => void)[]>([]);
  const [live, setLive] = useState<Rig | null>(rig);
  const phase = hash(useId() + who);
  const isFlat = flat || (typeof size === 'number' && size <= 32);

  useInsertionEffect(insertCoreDefs, []);

  useEffect(() => {
    if (still || live) return;
    let on = true;
    afterIdle(() => {
      void loadRig()
        .then((r) => {
          if (on) setLive(r);
        })
        .catch(() => {
          // the rest pose is already complete; a lost chunk costs nothing
        });
    });
    return () => {
      on = false;
    };
  }, [still, live]);

  const handle = useMemo<CharacterHandle>(() => {
    const send = (fn: (a: Actor, r: Rig) => void) => {
      if (actor.current && rig) fn(actor.current, rig);
      else if (queue.current.length < 12) queue.current.push(fn);
    };
    const h: CharacterHandle = {
      play: (action, options) => send((a, r) => r.perform(a, action, options)),
      lookAt: (target, ms) => send((a) => a.lookAt(target, ms)),
      setExpression: (name, options) => send((a) => a.setExpression(name, options?.hold)),
      closeEyes: (closed) => send((a) => a.closeEyes(closed)),
      press: (down) => send((a) => a.setPressed(down)),
      el: () => box.current,
    };
    handleActors.set(h, () => actor.current);
    return h;
  }, []);

  useImperativeHandle(ref, () => handle, [handle]);

  const onActor = (a: Actor | null) => {
    actor.current = a;
    if (a && rig) {
      const pending = queue.current.splice(0);
      for (const fn of pending) fn(a, rig);
    }
  };

  const Live = live && !still ? live.LiveFace : null;
  const name = chip ? castById(who) : null;

  const cssVars = {
    '--k-size': typeof size === 'number' ? `${size}px` : size,
    '--k-color': BODY_COLOR[who],
    '--k-phase': `${(-(phase % 2000) / 1000).toFixed(2)}s`,
    ...(intro !== undefined ? { '--k-intro-delay': `${intro}ms` } : null),
    ...style,
  } as CSSProperties;

  return (
    <span
      ref={box}
      className={className ? `k-char ${className}` : 'k-char'}
      style={cssVars}
      data-who={who}
      data-lod={isFlat ? 'flat' : undefined}
      data-peek={peek ? '' : undefined}
      data-interactive={interactive ? '' : undefined}
      data-intro={intro !== undefined ? '' : undefined}
      data-dark={onDark ? '' : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {!isFlat && <span className="k-floor" />}
      <span className="k-stage">
        <span className="k-breath">
          {isFlat ? <FlatBody who={who} /> : <img className="k-body" src={`/cast/${who}.svg`} alt="" width={480} height={480} decoding="async" draggable={false} />}
          {Live ? <Live who={who} expression={expression} prop={prop} track={track} peek={peek} interactive={interactive} onActor={onActor} /> : <RestFace who={who} gloss={!isFlat} />}
        </span>
      </span>
      {name && (
        <span className="k-chip">
          <b>{name.name}</b> {name.role}
        </span>
      )}
      {children}
    </span>
  );
}

/** One group moment, such as the footer's hop cascade or the form's cheer: everyone plays in turn, `stagger` ms apart. Waits for the rig if needed. */
export function cascade(handles: (CharacterHandle | null | undefined)[], action: CastAction, options: PlayOptions & { stagger?: number } = {}) {
  void loadRig().then((r) => {
    const actors = handles.map((h) => (h ? (handleActors.get(h)?.() ?? null) : null)).filter((a): a is Actor => a !== null);
    if (actors.length) r.ensemble(actors, action, options.stagger ?? 110, options);
  });
}

/** Every character on screen looks at the same place. */
export function castLookAt(target: LookTarget, ms?: number) {
  void loadRig().then((r) => r.castLook(target, ms));
}

export type { LiveProps };
