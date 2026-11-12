import { m } from 'motion/react';
import type { Video } from '@kreators/shared';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation, useMatches } from 'react-router';
import { Character, cascade, castLookAt, loadRig, type CastId, type CharacterHandle } from '../cast';
import { CLOSING, FOOTER_CAST_ORDER, FOOTER_GROUPS, OWN_ACTION_ROUTES, SITE, SOCIALS, callPhone, whatsappHref, whatsappPhone, type FormatSlug } from '../lib/content';
import { useMotionOk, useRunning } from '../lib/motionOk';
import { previewSource } from './frames';
import { useVideos } from '../lib/queries';
import { shuffleForLoad } from '../lib/videoFind';
import { spring } from '../lib/spring';
import { useStill } from '../lib/store';
import { Street } from './street';
import { CardRing } from './ring';
import { Cta, PrimaryCta, Reveal, whenSeen } from './ui';
import { WORDMARK } from './wordmark';

/** The word is cropped here, in viewBox units: below the baseline, partway down the tail of the y, which dives behind the ground band. */
const WORD_FLOOR = 900;

/**
 * Where each character stands, in the wordmark's own units: x is the centre of the letter, y the top of its ink. The word is mixed case, so a single cap line
 * would leave most of the cast standing on air. Tiko has the K and Bolu the peak of the A, both at the cap line. Sochu has the t, just below it. Gola, the ball, rests between the arms of the y.
 */
const STANCE: Record<CastId, { x: number; y: number }> = {
  tiko: { x: 379, y: 0 },
  sochu: { x: 2887, y: 70 },
  bolu: { x: 5785, y: 0 },
  gola: { x: 8180, y: 272 },
};

/** Character width everywhere in the footer: 56 px on a phone, 128 px on a big screen. */
const CAST_SIZE = 'var(--ft-cast)';

const GLANCE_MS = 1800;

/** The parent brand, named above the contacts. */
const PARENT = { name: 'Kreators.App', url: 'https://kreators.app' } as const;

const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;

/** Three brand marks in one weight: lucide has no brand icons, so these are drawn here. All on a 24 px grid. */
const SOCIAL_ICON: Record<string, ReactNode> = {
  Instagram: (
    <>
      <path
        fillRule="evenodd"
        d="M7.6 2h8.8A5.6 5.6 0 0 1 22 7.6v8.8a5.6 5.6 0 0 1-5.6 5.6H7.6A5.6 5.6 0 0 1 2 16.4V7.6A5.6 5.6 0 0 1 7.6 2Zm0 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Z"
      />
      <path fillRule="evenodd" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      <circle cx="17.4" cy="6.6" r="1.25" />
    </>
  ),
  LinkedIn: (
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45Z" />
  ),
  X: <path d="M17.75 2.5h3.07l-6.71 7.67L22 21.5h-6.18l-4.84-6.33-5.54 6.33H2.37l7.18-8.21L2 2.5h6.34l4.38 5.79 5.03-5.79Zm-1.08 17.2h1.7L7.4 4.2H5.57l11.1 15.5Z" />,
};

// ---------- The CTA's ring (library-slider-cta-spec §3; round 13: interactive, as the library's) ----------
// The site's own posters turning slowly behind the ask. Like the library's ring: a fine pointer zooms the card under it where it stands (its
// neighbours slide apart) and plays its stored clip, the keyboard walks the cards (one Tab stop, Left/Right/Home/End), a touch drags it sideways
// (vertical swipes stay the page's), and a press opens that video in the library's player (/video-library?v=<id>, its deep link). Under Pause
// animations or reduced motion it is the library's flat row of the same cards.

/** Fewer posters than this: no ring, the band is words and buttons. */
const RING_MIN_POSTERS = 4;
const RING_MAX = 12;

/** The ring's base slot count: 12, or twice the posters when there are fewer than 6, so on a narrow stage a poster shows twice (its two copies
 *  half a turn apart) instead of three times across the wall. A wide stage needs more slots for its edge cards to show whole, so the ring
 *  (fitSlots) adds whole rounds of posters: each copy stays exactly one round of posters from the next. */
function ringFill(posters: number): number {
  return Math.min(RING_MAX, posters * 2);
}

/** Videos with a poster, in this page load's random order (r18: each load shows other reels), dealt round the brands so neighbours differ. Up to
 *  RING_MAX. */
function ringPosters(videos: Video[]): Video[] {
  const sorted = shuffleForLoad(videos.filter((v) => v.posterUrl), 'footer-ring');
  const groups = new Map<string, Video[]>();
  for (const v of sorted) {
    const list = groups.get(v.brand);
    if (list) list.push(v);
    else groups.set(v.brand, [v]);
  }
  const out: Video[] = [];
  while (out.length < RING_MAX && groups.size > 0) {
    for (const [brand, list] of groups) {
      const v = list.shift();
      if (v) out.push(v);
      if (list.length === 0) groups.delete(brand);
      if (out.length >= RING_MAX) break;
    }
  }
  return out;
}

/** The video's page in the library: the library opens its player from ?v=. */
const watchHref = (v: Video) => `/video-library?v=${encodeURIComponent(v.id)}`;

function FooterRingCards() {
  const { data, isError } = useVideos();
  const cards = useMemo(() => ringPosters(data ?? []), [data]);
  if (isError || (data && cards.length < RING_MIN_POSTERS)) return <span data-ring-empty hidden />;
  if (!data) return null;
  return (
    <CardRing
      className="ft-ring"
      items={cards}
      itemKey={(v) => v.id}
      label="Videos from the library"
      interactive
      minCards={ringFill(cards.length)}
      clipOf={(v) => v.previewUrl}
      streamOf={(v) => {
        const source = previewSource(v);
        return source && !source.clip ? source.src : null;
      }}
      // Eager, not lazy: a slot behind the ring's camera projects to no box at all, so the browser's lazy loader never starts its poster until the
      // card swings round to the front, and it arrives there as an empty grey card. The ring itself mounts only near the screen (FooterRing), so
      // eager costs nothing up front; low priority keeps the posters behind anything the page itself needs.
      renderCard={(v, { tabIndex, clip }) => (
        // A link (it goes somewhere), so Space is added: in a toolbar a button's Space is expected.
        <Link
          to={watchHref(v)}
          className="cring-card ft-ring-card"
          tabIndex={tabIndex}
          aria-label={`${v.brand}: ${v.title}`}
          draggable={false}
          onKeyDown={(e) => {
            if (e.key !== ' ') return;
            e.preventDefault();
            e.currentTarget.click();
          }}
        >
          <img src={v.posterUrl ?? undefined} alt="" loading="eager" fetchPriority="low" decoding="async" draggable={false} />
          {clip}
          <span className="ft-ring-scrim" aria-hidden />
          <span className="ft-ring-name" aria-hidden>
            {v.brand}
          </span>
        </Link>
      )}
    />
  );
}

/** The ring's place in the band. The videos are asked for only once the band is within 1200 px of the screen; until they arrive the place keeps its height. */
function FooterRing() {
  const ok = useMotionOk();
  const slot = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = slot.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    // A page's own content arrives in a lazy chunk; until it has, the footer sits near the top and would look near. So the watch starts a moment
    // after the load.
    let io: IntersectionObserver | null = null;
    let timer = 0;
    const watch = () => {
      io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), { rootMargin: '1200px 0px' });
      io.observe(el);
    };
    const arm = () => {
      timer = window.setTimeout(watch, 1200);
    };
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    return () => {
      window.removeEventListener('load', arm);
      window.clearTimeout(timer);
      io?.disconnect();
    };
  }, [near, ok]);
  return (
    <div ref={slot} className="ft-ring-slot" data-flat={ok ? undefined : ''}>
      {near && <FooterRingCards />}
    </div>
  );
}

/** How far the glass's colour leans toward a fine pointer at the band's edge (px). */
const GLASS_LEAN = 48;

/**
 * The band's fractal (reeded) glass, after kreators.app's closing card (.work/v2/ref/fractal-glass-spec.md §2.b): a field of colour drifting
 * sideways behind fixed upright flutes, so the streaks shimmer. A sibling of the band's content, painted under all of it (footer.css), never a
 * parent of the ring. All CSS; the drift runs only while the band is on screen and the tab is visible, and a fine pointer leans the colour toward
 * itself (no React state: one custom property, eased by a CSS transition). Under still, neither.
 */
function FooterGlass() {
  const ref = useRef<HTMLDivElement>(null);
  const ok = useMotionOk();
  const running = useRunning(ref);
  useEffect(() => {
    const glass = ref.current;
    const band = glass?.parentElement;
    if (!ok || !glass || !band) return;
    // Pointer events arrive at most once a frame, and the write only touches the glass's own subtree.
    const lean = (x: number) => glass.style.setProperty('--lean', `${Math.round((x - 0.5) * 2 * GLASS_LEAN)}px`);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = band.getBoundingClientRect();
      lean(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    };
    const onLeave = () => lean(0.5);
    band.addEventListener('pointermove', onMove, { passive: true });
    band.addEventListener('pointerleave', onLeave);
    return () => {
      band.removeEventListener('pointermove', onMove);
      band.removeEventListener('pointerleave', onLeave);
      glass.style.removeProperty('--lean');
    };
  }, [ok]);
  return (
    <div ref={ref} className="ft-glass" aria-hidden data-run={ok && running ? 'true' : undefined}>
      <div className="ft-glass-lean">
        <div className="ft-glass-field" />
      </div>
      <div className="ft-glass-ribs" />
      <div className="ft-glass-shine" />
      <div className="ft-glass-scrim" />
    </div>
  );
}

/** Pause animations: the one switch for everything that moves on its own. If the device already asks for reduced motion, the switch cannot turn motion back on and says so. */
function PauseSwitch() {
  const { still, locked, toggle } = useStill();
  return (
    <button type="button" role="switch" aria-checked={still} disabled={locked} onClick={toggle} className="ft-pause" title={locked ? 'Your device is set to reduce motion' : undefined}>
      <span className="ft-pause-track" aria-hidden>
        {/* The knob squashes at mid-travel (M5f): scaleX 1.12 and back, on the same spring as its slide. */}
        <m.span className="ft-pause-thumb" initial={false} animate={{ x: still ? 14 : 0, scaleX: [1, 1.12, 1] }} transition={{ x: spring.snappy, scaleX: { duration: 0.26, ease: 'easeOut' } }} />
      </span>
      {locked ? 'Animations off on this device' : 'Pause animations'}
    </button>
  );
}

export function Footer() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const path = pathname.replace(/\/+$/, '') || '/';
  const legal = path.startsWith('/legal/');
  // The catch-all route is the only one with a splat param.
  const missing = matches[matches.length - 1]?.params['*'] !== undefined;
  // One ending asks once: not on the pages that have their own action, and not where there is nothing to ask about.
  const asks = !legal && !missing && !OWN_ACTION_ROUTES.includes(path);

  const cast = useRef<Partial<Record<CastId, CharacterHandle | null>>>({});
  const stage = useRef<HTMLDivElement>(null);
  const phone = whatsappPhone();
  // On a format page the message names the format (content §6.3, V2-SPEC 5.8 "WhatsApp links pass the format").
  const format = path === '/founders' || path === '/events' || path === '/retail' ? path.slice(1) as FormatSlug : undefined;
  const wa = whatsappHref(format);
  // "Managed and owned by BrandingBum, Bengaluru.", with the owner's name as a link.
  const operator = SITE.operatorLine.split(SITE.owner.name) as [string, string?];

  // Arrival: one hop cascade, left to right, each time a page reaches its footer. Legal pages stand still.
  useEffect(() => {
    const el = stage.current;
    // Observing a character rather than the whole stage: on a phone the word is too short to clear the shared observer's bottom margin.
    const first = el?.querySelector('.ft-char');
    if (!el || !first || legal) return;
    let frame = 0;
    const stop = whenSeen(first, () => {
      void loadRig().then(() => {
        // The hop needs all four live faces, which mount a moment after the rig arrives. The rest pose is already complete, so waiting costs nothing.
        const started = performance.now();
        const go = () => {
          if (el.querySelectorAll('.k-char[data-run]').length >= FOOTER_CAST_ORDER.length) {
            cascade(FOOTER_CAST_ORDER.map((id) => cast.current[id]), 'hop', { stagger: 110, small: true });
          } else if (performance.now() - started < 4000) {
            frame = requestAnimationFrame(go);
          }
        };
        frame = requestAnimationFrame(go);
      });
    });
    return () => {
      stop();
      cancelAnimationFrame(frame);
    };
  }, [pathname, legal]);

  // Bolu and Sochu rest with drawn eyes, which cannot look anywhere, so for a glance they open them. 'open' is the rig's own pose: eyes only, nothing else moves.
  const opensEyes = (who: CastId) => !legal && (who === 'bolu' || who === 'sochu');
  const glance = (who: CastId, group: HTMLElement) => {
    const actor = cast.current[who];
    actor?.lookAt(group, GLANCE_MS);
    if (opensEyes(who)) actor?.setExpression('open', { hold: GLANCE_MS });
  };
  const letGo = (who: CastId) => {
    const actor = cast.current[who];
    actor?.lookAt(null);
    if (opensEyes(who)) actor?.setExpression(null);
  };
  const lookAtAction = (el: HTMLElement) => castLookAt(el, 1200);
  const wink = () => {
    if (!legal) cast.current.gola?.setExpression('wink', { hold: 900 });
  };

  return (
    <footer className="ft band-dark">
      {asks && (
        <section className="ft-band-cta" aria-labelledby="ft-cta-title">
          <FooterGlass />
          <Reveal variant="rise" className="wrap ft-cta-copy">
            <p className="eyebrow ft-eyebrow">
              <span className="ft-eyebrow-dot" aria-hidden />
              {CLOSING.eyebrow}
            </p>
            <h2 id="ft-cta-title" className="h2-sm ft-title">
              {CLOSING.title.replace('vox pop', 'vox\u00a0pop')}
            </h2>
            <p className="ft-copy">{CLOSING.body}</p>
          </Reveal>
          {/* The library opens with its own ring, so its footer has none. */}
          {path !== '/video-library' && <FooterRing />}
          <div className="wrap ft-actions-row">
            <div className="ft-actions" onPointerEnter={(e) => e.pointerType === 'mouse' && lookAtAction(e.currentTarget)}>
              <PrimaryCta chrome />
              {path !== '/video-library' && (
                <Cta to="/video-library" kind="ghost" arrow>
                  {CLOSING.secondary}
                </Cta>
              )}
            </div>
          </div>
        </section>
      )}
      {/* The landscape (round 11): one box from just under the band's buttons to the colour bar, the city rising behind the reach block and the
          links, the skyline and its train at the base, behind the wordmark. */}
      <div className="ft-land">
        {/* The far city, the middle distance and the skyline (water tanks, the tower, the metro). Its train crosses once a page view, when its track first shows. */}
        <Street variant="skyline" cue={pathname} className="ft-skyline" />
        <div className="ft-body wrap">
          <div className="ft-top">
            <div className="ft-lead">
              <div className="ft-reach">
                {/* The parent brand first (round 13): its mark and "Part of Kreators.App", one link to it. */}
                <a className="ft-link ft-parent" href={PARENT.url} target="_blank" rel="noopener">
                  <img className="ft-parent-logo" src="/logos/kreators-app.svg" alt="" width={22} height={22} decoding="async" />
                  Part of {PARENT.name}
                </a>
                <ul className="ft-contacts">
                  <li>
                    <a className="ft-link ft-mail" href={`mailto:${SITE.email}`}>
                      {SITE.email}
                    </a>
                  </li>
                  {wa && phone ? (
                    // The one number takes both: shown once, as "WhatsApp / Call +91 …".
                    <li>
                      <a className="ft-link" href={wa} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                      {' / '}
                      <a className="ft-link" href={`tel:${phone.tel}`}>
                        Call {phone.display}
                      </a>
                    </li>
                  ) : (
                    // No WhatsApp line: the one number, as a phone.
                    callPhone() && (
                      <li>
                        <a className="ft-link" href={`tel:${callPhone()!.tel}`}>
                          Call {callPhone()!.display}
                        </a>
                      </li>
                    )
                  )}
                </ul>
                <ul className="ft-socials" onPointerEnter={(e) => e.pointerType === 'mouse' && wink()} onFocus={wink}>
                  {SOCIALS.map((s, i) => (
                    <li key={s.label}>
                      <a className="ft-social" href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} data-who={FOOTER_CAST_ORDER[i]}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden focusable="false">
                          {SOCIAL_ICON[s.label]}
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="ft-city">{SITE.city}</p>
              </div>
            </div>

            <nav className="ft-nav" aria-label="Footer">
              {FOOTER_GROUPS.map((group, i) => {
                const who = FOOTER_CAST_ORDER[i] as CastId;
                return (
                  <div
                    key={group.label}
                    className="ft-group"
                    data-who={who}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && glance(who, e.currentTarget)}
                    onPointerLeave={(e) => e.pointerType === 'mouse' && letGo(who)}
                    onFocus={(e) => glance(who, e.currentTarget)}
                    onBlur={() => letGo(who)}
                  >
                    <h2 className="ft-group-title">{group.label}</h2>
                    <ul>
                      {group.links.map(([label, to]) => (
                        <li key={to}>
                          <Link className="ft-link" to={to}>
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="ft-bar">
            <p className="ft-legal">
              © {new Date().getFullYear()} {SITE.name}. {operator[0]}
              <a className="ft-owner" href={SITE.owner.url} target="_blank" rel="noreferrer">
                {SITE.owner.name}
              </a>
              {operator[1]}
            </p>
            <div className="ft-bar-end">
              <Link className="ft-link" to="/legal/privacy">
                Privacy
              </Link>
              <Link className="ft-link" to="/legal/terms">
                Terms
              </Link>
              <PauseSwitch />
            </div>
          </div>
        </div>

        <div className="ft-stage" ref={stage}>
          <div className="ft-pools" aria-hidden>
            {FOOTER_CAST_ORDER.map((who) => (
              <span key={who} className="ft-pool" data-who={who} />
            ))}
          </div>

          <div className="ft-word-box" style={{ aspectRatio: `${WORDMARK.width} / ${WORD_FLOOR}` }}>
            <Link className="ft-mark" to="/" aria-label={`${SITE.name}, back to the home page`}>
              <span className="ft-mark-ring" aria-hidden />
              <svg className="ft-word" viewBox={WORDMARK.viewBox} aria-hidden focusable="false">
                <defs>
                  <path id="ft-word-path" d={WORDMARK.d} />
                  {/* The four quarters of the word, each in its character's colour, breaking in the gaps between letters so no letter is split. */}
                  <linearGradient id="ft-word-four" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={WORDMARK.width} y2="0">
                    <stop offset={1958 / WORDMARK.width} stopColor="#6d61fe" />
                    <stop offset={1958 / WORDMARK.width} stopColor="#fbd43f" />
                    <stop offset={4397 / WORDMARK.width} stopColor="#fbd43f" />
                    <stop offset={4397 / WORDMARK.width} stopColor="#47c349" />
                    <stop offset={6229 / WORDMARK.width} stopColor="#47c349" />
                    <stop offset={6229 / WORDMARK.width} stopColor="#ff8d3a" />
                  </linearGradient>
                </defs>
                {/* Round 13: clean letterforms, no flutes. Faint at rest, full strength lit. */}
                {['rest', 'lit'].map((k) => (
                  <use key={k} className={`ft-word-${k}`} href="#ft-word-path" fill="url(#ft-word-four)" />
                ))}
              </svg>
            </Link>

            <div className="ft-cast">
              {FOOTER_CAST_ORDER.map((who) => (
                <span key={who} className="ft-char" style={{ '--x': pct(STANCE[who].x, WORDMARK.width), '--y': pct(STANCE[who].y, WORD_FLOOR) } as CSSProperties}>
                  <Character
                    ref={(h) => {
                      cast.current[who] = h;
                    }}
                    who={who}
                    size={CAST_SIZE}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="ft-band" aria-hidden>
            {FOOTER_CAST_ORDER.map((who) => (
              <span key={who} className="ft-seg" data-who={who} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
