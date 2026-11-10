import { Check, ChevronsLeftRight, X } from 'lucide-react';
import { useMotionValueEvent, useSpring } from 'motion/react';
import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { Character, type CastId, type CharacterHandle } from '../../cast';
import { HeroCopy, PrimaryCta, Reveal, RollNumber, SectionHead, Segment, Seo, whenSeen } from '../../components/ui';
import { IMPACT, PLANS, SITE, STEPS, TEAM } from '../../lib/content';
import { motionOk, useMotionOk, useRunning } from '../../lib/motionOk';
import { spring } from '../../lib/spring';

// ---------- Scripted vs Vox pop: one stage, two worlds, a divider you can drag. ----------

const SCRIPTED = ['Feels scripted', 'Reads as an ad', 'Gets scrolled past'];
const VOXPOP = ['Real people, real reactions', 'Feels like a conversation', 'Stops the scroll'];

/** The real reels on the vox pop side. The middle one, cut in half by the divider at rest, is the one that comes alive. */
const REACTIONS = [
  { src: '/media/circlestore-1.jpg', position: '50% 62%' },
  { src: '/media/fyndflow.jpg', position: '50% 72%', video: '/media/fyndflow.mp4' },
  { src: '/media/circlestore-3.jpg', position: '50% 60%' },
];

type Stop = 'scripted' | 'both' | 'voxpop';

const PHONE_QUERY = '(max-width: 734px)';
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function subscribePhone(onChange: () => void) {
  const mq = matchMedia(PHONE_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

const useIsPhone = () => useSyncExternalStore(subscribePhone, () => matchMedia(PHONE_QUERY).matches);

/** How far from the stage's edge the divider stops, so the handle is always there to grab and a sliver of the other side stays in view. */
const edgeOf = (width: number) => (width < 735 ? 24 : 40) / width;

const nameOf = (v: number) => (v < 0.12 ? 'Scripted content only' : v > 0.88 ? 'Vox pop only' : v < 0.42 ? 'More scripted content than vox pop' : v > 0.58 ? 'More vox pop than scripted content' : 'Half scripted content, half vox pop');

/** Three stills of the same nothing: a product on a plain ground, a line of copy, a button. Drawn, because no real client's work belongs on this side. */
function AdPanel({ kind }: { kind: 0 | 1 | 2 }) {
  return (
    <div className="vs-ad">
      <span className="vs-ad-tag">Sponsored</span>
      <span className="vs-ad-product" data-kind={kind} />
      <span className="vs-ad-lines">
        <i />
        <i />
      </span>
      <span className="vs-ad-btn">Shop now</span>
    </div>
  );
}

function Compare() {
  const phone = useIsPhone();
  const ok = useMotionOk();
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const bolu = useRef<CharacterHandle>(null);
  const running = useRunning(stageRef);

  // On a phone the two worlds cannot sit side by side, so it opens on Scripted and wipes across once: the argument, made by moving. Still, it opens on the answer.
  const [start] = useState(() => (matchMedia(PHONE_QUERY).matches ? (motionOk() ? 0.08 : 0.92) : 0.5));
  const pos = useSpring(start, spring.smooth);
  const [segment, setSegment] = useState<Stop>(start > 0.75 ? 'voxpop' : start < 0.25 ? 'scripted' : 'both');
  // The reel only plays once someone has asked to see this side. It is a real download, so nothing fetches it on arrival.
  const [asked, setAsked] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const touched = useRef(false);
  const drag = useRef<{ id: number; left: number; width: number } | null>(null);
  const lastSide = useRef<Stop>(segment);

  const paint = (value: number) => {
    const v = clamp01(value);
    // Transform only: the mask slides one way and its contents slide back, so the edge moves and the picture does not.
    const shift = (1 - v) * 100;
    if (maskRef.current) maskRef.current.style.transform = `translate3d(${shift}%,0,0)`;
    if (innerRef.current) innerRef.current.style.transform = `translate3d(${-shift}%,0,0)`;
    if (dividerRef.current) dividerRef.current.style.transform = `translate3d(${shift}%,0,0)`;
    const range = rangeRef.current;
    if (range) {
      const next = String(Math.round(v * 100));
      if (range.value !== next) range.value = next;
      const text = nameOf(v);
      if (range.getAttribute('aria-valuetext') !== text) range.setAttribute('aria-valuetext', text);
    }
  };
  useMotionValueEvent(pos, 'change', paint);
  // Painted once by hand so the stage is right before the first spring frame, and again if the page is reopened with a value already set.
  useEffect(() => paint(pos.get()), [pos]);

  const width = () => stageRef.current?.clientWidth ?? 1260;
  const edge = () => edgeOf(width());
  const nearest = (v: number): Stop => (phone ? (v < 0.5 ? 'scripted' : 'voxpop') : v < 0.33 ? 'scripted' : v > 0.67 ? 'voxpop' : 'both');
  const go = (v: number) => {
    if (motionOk()) pos.set(v);
    else pos.jump(v);
  };

  // One reaction per crossing: only when the choice actually changes side, and only for a person's own move.
  const reactTo = (next: Stop) => {
    if (next === lastSide.current) return;
    lastSide.current = next;
    if (next === 'voxpop') bolu.current?.play('hop', { small: true, source: 'tap' });
  };

  const choose = (next: Stop) => {
    touched.current = true;
    setAsked((a) => a || next === 'voxpop');
    setSegment(next);
    reactTo(next);
    const e = edge();
    go(next === 'scripted' ? e : next === 'voxpop' ? 1 - e : 0.5);
  };

  // Arrival: one small move that says "this moves", then nothing.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let timer = 0;
    const stop = whenSeen(el, () => {
      timer = window.setTimeout(() => {
        bolu.current?.setExpression('celebrating', { hold: 1800 });
        if (!motionOk() || touched.current) return;
        if (matchMedia(PHONE_QUERY).matches) {
          pos.set(1 - edge());
          setSegment('voxpop');
          lastSide.current = 'voxpop';
        } else {
          pos.set(0.56);
          timer = window.setTimeout(() => {
            if (!touched.current) pos.set(0.5);
          }, 420);
        }
      }, 450);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
    // Runs once for the stage; pos is stable and edge reads the live width.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  // Crossing the phone breakpoint with "Both" selected: Both does not exist on a phone.
  useEffect(() => {
    if (phone && segment === 'both') choose(pos.get() < 0.5 ? 'scripted' : 'voxpop');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const valueAt = (clientX: number, d: { left: number; width: number }) => {
    const e = edgeOf(d.width);
    return Math.max(e, Math.min(1 - e, 1 - (clientX - d.left) / d.width));
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = { id: e.pointerId, left: rect.left, width: rect.width };
    e.currentTarget.setPointerCapture(e.pointerId);
    touched.current = true;
    e.currentTarget.dataset.drag = '';
    // A mouse press lands the divider where you pressed. A finger waits for movement, so a thumb that is scrolling the page does nothing.
    if (e.pointerType === 'mouse') {
      const v = valueAt(e.clientX, drag.current);
      go(v);
      settle(v);
    }
  };

  const settle = (v: number) => {
    const next = nearest(v);
    setSegment(next);
    setAsked((a) => a || next === 'voxpop');
    reactTo(next);
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const v = valueAt(e.clientX, d);
    pos.jump(v);
    settle(v);
  };

  const onEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    delete e.currentTarget.dataset.drag;
    if (e.type === 'pointercancel') return;
    // Near a resting place it settles there, so the three stops feel like detents.
    const v = pos.get();
    const inset = edgeOf(d.width);
    const snap = Math.abs(v - 0.5) < 0.06 && !phone ? 0.5 : v < inset + 0.12 ? inset : v > 1 - inset - 0.12 ? 1 - inset : null;
    if (snap !== null) go(snap);
  };

  const onRange = (e: ChangeEvent<HTMLInputElement>) => {
    touched.current = true;
    const inset = edge();
    const v = Math.max(inset, Math.min(1 - inset, Number(e.target.value) / 100));
    go(v);
    settle(v);
  };

  // Not on a phone, where this frame is not shown, and not for someone who has asked to save data.
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  const playing = asked && !phone && !saveData && segment === 'voxpop' && ok && running;
  const [mounted, setMounted] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (playing) setMounted(true);
    const el = video.current;
    if (!el) return;
    if (playing) void el.play().catch(() => undefined);
    else el.pause();
  }, [playing]);

  const options = phone
    ? ([
        { value: 'scripted', label: 'Scripted' },
        { value: 'voxpop', label: 'Vox pop' },
      ] as const)
    : ([
        { value: 'scripted', label: 'Scripted' },
        { value: 'both', label: 'Both' },
        { value: 'voxpop', label: 'Vox pop' },
      ] as const);

  return (
    <div className="vs">
      <h2 className="sr-only">Scripted content compared with vox pop</h2>
      <Segment label="Choose what to compare" options={[...options]} value={segment} onChange={choose} className="vs-segment" />
      <div ref={stageRef} className="vs-stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onEnd} onPointerCancel={onEnd}>
        {/* Scripted: the layer underneath. */}
        <div className="vs-world" data-world="scripted">
          <div className="vs-frames" aria-hidden>
            <AdPanel kind={0} />
            <AdPanel kind={1} />
            <AdPanel kind={2} />
          </div>
          <span className="vs-fade" aria-hidden />
          <div className="vs-copy">
            <div className="vs-copy-head">
              <h3 className="vs-title">Scripted content</h3>
              <Character who="tiko" size={88} expression="sleepy" track={false} className="vs-cast" />
            </div>
            <ul className="vs-list">
              {SCRIPTED.map((x) => (
                <li key={x}>
                  <span className="vs-mark" aria-hidden>
                    <X className="size-4" strokeWidth={2.5} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Vox pop: a window over the stage. The mask slides, its contents counter-slide. */}
        <div ref={maskRef} className="vs-mask">
          <div ref={innerRef} className="vs-world" data-world="voxpop">
            <div className="vs-frames" aria-hidden>
              {REACTIONS.map((r) => (
                <div key={r.src} className="vs-photo">
                  <img src={r.src} alt="" loading="lazy" draggable={false} style={{ objectPosition: r.position }} />
                  {r.video && mounted && <video ref={video} src={r.video} data-ready={videoReady ? '' : undefined} muted loop autoPlay playsInline preload="none" tabIndex={-1} style={{ objectPosition: r.position }} onCanPlay={() => setVideoReady(true)} />}
                </div>
              ))}
            </div>
            <span className="scrim vs-scrim" aria-hidden />
            <div className="vs-copy">
              <div className="vs-copy-head">
                <h3 className="vs-title">Vox pop by {SITE.name}</h3>
                <Character ref={bolu} who="bolu" size={88} onDark className="vs-cast" />
              </div>
              <ul className="vs-list">
                {VOXPOP.map((x) => (
                  <li key={x}>
                    <span className="vs-mark" aria-hidden>
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div ref={dividerRef} className="vs-divider">
          <span className="vs-line" aria-hidden />
          <input ref={rangeRef} type="range" className="vs-range" min={0} max={100} step={5} defaultValue={Math.round(start * 100)} aria-label="Compare scripted content and vox pop. Higher shows more vox pop." aria-valuetext={nameOf(start)} onChange={onRange} />
          <span className="vs-knob" aria-hidden>
            <ChevronsLeftRight className="size-5" />
          </span>
        </div>
      </div>
      <p className="vs-hint small text-muted" aria-hidden>
        Drag across to compare
      </p>
    </div>
  );
}

// ---------- The process: one line, five stations, nobody hands off to a stranger. ----------

const STEP_CAST: CastId[] = ['sochu', 'bolu', 'tiko', 'gola', 'sochu'];

function Timeline() {
  return (
    <Reveal className="wk-line">
      <span className="wk-rail" aria-hidden>
        <span className="wk-rail-fill" />
      </span>
      <ol className="wk-steps">
        {STEPS.map((s, i) => (
          <li key={s.name} className="wk-step" style={{ '--i': i } as CSSProperties}>
            <span className="wk-step-cast">
              <Character who={STEP_CAST[i] ?? 'sochu'} size={56} still />
            </span>
            <span className="wk-step-dot" aria-hidden />
            <div className="wk-step-text">
              <p className="caption wk-step-no">Step {i + 1}</p>
              <h3 className="h4">{s.name}</h3>
              <p className="small text-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

// ---------- The page ----------

export default function WhyKreators() {
  const startup = PLANS[0];
  return (
    <>
      <Seo title="Why Kreators" description="Most UGC feels scripted. Kreators.Army takes the conversation to the street and captures real reactions around your product." />

      <section className="wk-top">
        <div className="ground" aria-hidden />
        <div className="wrap wk-top-in">
          <HeroCopy
            eyebrow="Why Kreators"
            titleClass="display"
            title={
              <>
                We take it to the <span className="g-word">street</span>
              </>
            }
            lead="Most influencer and UGC videos today feel scripted. So, we do the opposite."
          />
          <Compare />
        </div>
      </section>

      <section className="section wk-case">
        <div className="wrap wk-case-in">
          <SectionHead center={false} title="Not another editing agency" lead="We take the conversation to the street and capture real reactions around your product category." />
          <Reveal className="wk-case-side">
            <dl className="wk-figures">
              {IMPACT.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>
                    <RollNumber value={s.end} suffix={s.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
            <PrimaryCta />
          </Reveal>
        </div>
      </section>

      <section className="band-alt section wk-process">
        <div className="wrap">
          <SectionHead center={false} title="One team, from question to post" lead="Our team handles the entire process, so you receive complete videos ready to publish." />
        </div>
        <div className="wrap">
          <Timeline />
        </div>
        <div className="wrap wk-team">
          {TEAM.map((s) => (
            <p key={s.label} className="wk-team-item">
              <b>
                {s.end}
                {s.suffix}
              </b>{' '}
              {s.label.toLowerCase()}
            </p>
          ))}
        </div>
      </section>

      {/* The page's one ask is the case's, beside the figures. What is included closes the page with no button of its own, so the footer asks once (R35). */}
      <section className="section">
        <div className="wrap wk-inc">
          <div className="wk-inc-head">
            <SectionHead center={false} title="What is included" lead="Even the startup plan comes with the people and the production." />
          </div>
          <ul className="wk-inc-list">
            {startup?.items.map((item, i) => (
              <Reveal as="li" key={item} i={i}>
                <span className="wk-inc-mark" aria-hidden>
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {item}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
