import { m } from 'motion/react';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation, useMatches } from 'react-router';
import { Character, cascade, castLookAt, loadRig, type CastId, type CharacterHandle } from '../cast';
import { CLOSING, FOOTER_CAST_ORDER, FOOTER_GROUPS, OWN_ACTION_ROUTES, SITE, SOCIALS } from '../lib/content';
import { spring } from '../lib/spring';
import { useStill } from '../lib/store';
import { Cta, PrimaryCta, whenSeen } from './ui';
import { WORDMARK } from './wordmark';

/** The word is cropped here, in viewBox units: below the baseline, partway down the tail of the y, which dives behind the ground band. */
const WORD_FLOOR = 900;

/**
 * Where each character stands, in the wordmark's own units: x is the centre of the letter, y the top of its ink. The word is mixed case, so a single cap line
 * would leave most of the cast standing on air. Tiko has the K and Bolu the peak of the A, both at the cap line. Sochu has the t, just below it. Gola, the ball, rests between the arms of the y.
 */
const STANCE: Record<CastId, { x: number; y: number }> = {
  tiko: { x: 373, y: 0 },
  sochu: { x: 2860, y: 30 },
  bolu: { x: 5722, y: 0 },
  gola: { x: 8204, y: 256 },
};

/** Character width everywhere in the footer: 56 px on a phone, 128 px on a big screen. */
const CAST_SIZE = 'var(--ft-cast)';

const GLANCE_MS = 1800;

const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;

/** Four brand marks in one weight: lucide has no brand icons, so these are drawn here. All on a 24 px grid. */
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
  TikTok: (
    <path d="M12.74 2h3.1c.17 1.6.74 2.74 1.74 3.57.82.68 1.86 1.12 3.2 1.24v3.13a8.5 8.5 0 0 1-4.78-1.47l-.03 6.84a6.4 6.4 0 0 1-1.92 4.73A6.5 6.5 0 0 1 9.32 22a6.38 6.38 0 0 1-4.64-1.97A6.47 6.47 0 0 1 2.9 15.2c.13-1.66.86-3.2 2.1-4.33A6.34 6.34 0 0 1 9.4 9.2c.5 0 .98.05 1.44.16l-.02 3.17a3.4 3.4 0 0 0-1.42-.3 3.3 3.3 0 0 0-3.32 3.1c-.06.96.26 1.84.9 2.5.62.65 1.46 1 2.36 1 .9.01 1.74-.34 2.37-.97.62-.62.97-1.46.97-2.36L12.74 2Z" />
  ),
};

/** Pause animations: the one switch for everything that moves on its own. If the device already asks for reduced motion, the switch cannot turn motion back on and says so. */
function PauseSwitch() {
  const { still, locked, toggle } = useStill();
  return (
    <button type="button" role="switch" aria-checked={still} disabled={locked} onClick={toggle} className="ft-pause" title={locked ? 'Your device is set to reduce motion' : undefined}>
      <span className="ft-pause-track" aria-hidden>
        <m.span className="ft-pause-thumb" initial={false} animate={{ x: still ? 14 : 0 }} transition={spring.snappy} />
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
      <div className="ft-body wrap">
        <div className="ft-top">
          <div className="ft-lead">
            {asks && (
              <div className="ft-ask">
                <h2 className="h2-sm ft-title">{CLOSING.title.replace('vox pop', 'vox\u00a0pop')}</h2>
                <div className="ft-actions" onPointerEnter={(e) => e.pointerType === 'mouse' && lookAtAction(e.currentTarget)}>
                  <PrimaryCta chrome />
                  {path !== '/video-library' && (
                    <Cta to="/video-library" kind="ghost" arrow>
                      Browse video library
                    </Cta>
                  )}
                </div>
              </div>
            )}
            <div className="ft-reach">
              <a className="ft-link ft-mail" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
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
            © {new Date().getFullYear()} {SITE.name}. Managed &amp; owned by{' '}
            <a className="ft-owner" href={SITE.owner.url} target="_blank" rel="noreferrer">
              {SITE.owner.name}
            </a>
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
                  <stop offset={1932 / WORDMARK.width} stopColor="#6d61fe" />
                  <stop offset={1932 / WORDMARK.width} stopColor="#fbd43f" />
                  <stop offset={4347 / WORDMARK.width} stopColor="#fbd43f" />
                  <stop offset={4347 / WORDMARK.width} stopColor="#47c349" />
                  <stop offset={6171 / WORDMARK.width} stopColor="#47c349" />
                  <stop offset={6171 / WORDMARK.width} stopColor="#ff8d3a" />
                </linearGradient>
              </defs>
              <use href="#ft-word-path" className="ft-word-rest" />
              <use href="#ft-word-path" className="ft-word-lit" fill="url(#ft-word-four)" />
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
    </footer>
  );
}
