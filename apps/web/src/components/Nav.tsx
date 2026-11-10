import { ChevronDown, Menu, X } from 'lucide-react';
import { AnimatePresence, m, useMotionValueEvent, useSpring } from 'motion/react';
import { useCallback, useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { Link, useLocation } from 'react-router';
import { NAV_GROUPS, NAV_TOP, OWN_ACTION_ROUTES, SITE } from '../lib/content';
import { motionOk, useMotionOk } from '../lib/motionOk';
import { spring } from '../lib/spring';
import { useTheme } from '../lib/store';
import { PrimaryCta, useActionInView } from './ui';
import { WORDMARK } from './wordmark';

/**
 * Gola, flat, as the theme switch. A full circle gives a true sun-to-moon change: a disc slides across it and leaves a crescent, the face tucks in, the open eye closes to a line
 * and two tiny z's drift up for a moment. The roll and the shift are spring only, gated by hand. Nothing on the mask depends on the pill's colour.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  const moves = useMotionOk();
  const transition = moves ? spring.kFace : { duration: 0 };
  const mask = `gola-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const initial = useRef(dark);
  const [naps, setNaps] = useState(0);

  useEffect(() => {
    if (dark === initial.current) return;
    initial.current = dark;
    if (dark && moves) setNaps((n) => n + 1);
  }, [dark, moves]);

  return (
    <button type="button" className="nav-icon" onClick={toggle} aria-label="Dark mode" aria-pressed={dark}>
      <svg width="28" height="28" viewBox="0 0 28 28" overflow="visible" aria-hidden focusable="false">
        <mask id={mask} maskUnits="userSpaceOnUse" x="-4" y="-4" width="36" height="36">
          <rect x="-4" y="-4" width="36" height="36" fill="#fff" />
          <m.circle cx="23.2" cy="6.7" r="11" fill="#000" initial={false} animate={{ x: dark ? 0 : 22, y: dark ? 0 : -22 }} transition={transition} />
        </mask>
        <g mask={`url(#${mask})`}>
          <m.g initial={false} animate={{ rotate: dark ? -12 : 0 }} transition={transition} style={{ transformOrigin: '14px 14px' }}>
            <circle cx="14" cy="14" r="12" fill="#ff8d3a" />
            <m.g initial={false} animate={{ x: dark ? -3.4 : 0, y: dark ? 2.9 : 0 }} transition={transition}>
              <path d="M6.9 13.4c1.1-1.5 2.9-1.5 4 0" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
              <m.circle
                cx="18.8"
                cy="12.3"
                r="1.75"
                fill="#111"
                initial={false}
                animate={{ x: dark ? -1.4 : 0, y: dark ? 0.9 : 0, scaleY: dark ? 0.2 : 1, scaleX: dark ? 1.3 : 1 }}
                transition={transition}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <path d="M9 17.4c2.4 3.4 7.6 3.4 10 0" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
            </m.g>
          </m.g>
        </g>
        {naps > 0 && (
          <m.g key={naps} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.9, 0], y: [2, 0, -1.5, -3] }} transition={{ duration: 1.6, times: [0, 0.18, 0.72, 1], ease: 'easeOut' }}>
            <path d="M21.2 8.3h2.6l-2.6 2.9h2.6" />
            <path d="M25 3.4h1.9l-1.9 2.1h1.9" />
          </m.g>
        )}
      </svg>
    </button>
  );
}

function linkActive(to: string, pathname: string, hash: string) {
  const [path, fragment] = to.split('#');
  if (fragment) return pathname === (path || '/') && hash === `#${fragment}`;
  return pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
}

type NavGroup = (typeof NAV_GROUPS)[number];

function groupOf(item: (typeof NAV_TOP)[number]): NavGroup | undefined {
  return 'group' in item ? NAV_GROUPS.find((g) => g.label === item.group) : undefined;
}

function itemActive(item: (typeof NAV_TOP)[number], pathname: string, hash: string) {
  const group = groupOf(item);
  const to = 'to' in item ? item.to : undefined;
  return (to !== undefined && linkActive(to, pathname, hash)) || Boolean(group?.links.some(([, href]) => linkActive(href, pathname, hash)));
}

const INDICATOR_RADIUS = 12;

/**
 * One highlight that slides between the links, matching the width and position of whatever it lands on. Two physics springs, so it keeps its speed
 * when you change your mind. It moves by transform only; the radius is written back so scaling does not stretch the corners.
 */
function useIndicator(container: RefObject<HTMLElement | null>) {
  const bar = useRef<HTMLLIElement>(null);
  const x = useSpring(0, spring.snappy);
  const width = useSpring(100, spring.snappy);
  const showing = useRef(false);

  const draw = useCallback(() => {
    const el = bar.current;
    if (!el) return;
    const scale = Math.max(width.get(), 1) / 100;
    el.style.transform = `translateX(${x.get()}px) scaleX(${scale})`;
    el.style.borderRadius = `${INDICATOR_RADIUS / scale}px / ${INDICATOR_RADIUS}px`;
  }, [x, width]);

  useMotionValueEvent(x, 'change', draw);
  useMotionValueEvent(width, 'change', draw);

  const go = useCallback(
    (target: HTMLElement | null | undefined) => {
      const el = bar.current;
      const box = container.current;
      if (!el || !box) return;
      if (!target) {
        delete el.dataset.show;
        showing.current = false;
        return;
      }
      const rect = target.getBoundingClientRect();
      const left = rect.left - box.getBoundingClientRect().left;
      if (showing.current && motionOk()) {
        x.set(left);
        width.set(rect.width);
      } else {
        x.jump(left);
        width.jump(rect.width);
        draw();
      }
      el.dataset.show = '';
      showing.current = true;
    },
    [container, x, width, draw],
  );

  return { bar, go };
}

const OPEN_DELAY = 300; // NN/g: feedback at once, open after a pause
const CLOSE_DELAY = 500; // and stay open until the pointer has been gone that long

/** Work, Why us, Formats, Pricing, Company, from 1024 px. */
function DesktopLinks() {
  const { pathname, hash } = useLocation();
  const list = useRef<HTMLUListElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef<number | null>(null);
  const [panelX, setPanelX] = useState(0);
  const openTimer = useRef(0);
  const closeTimer = useRef(0);
  const focusFirst = useRef(false);
  const { bar, go } = useIndicator(list);

  const restIndex = NAV_TOP.findIndex((item) => itemActive(item, pathname, hash));
  const settle = useCallback(() => go(restIndex >= 0 ? items.current[restIndex] : null), [go, restIndex]);

  const show = useCallback((index: number | null) => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    openRef.current = index;
    setOpen(index);
    if (index !== null) {
      const item = items.current[index];
      const shell = item?.closest('.nav-shell');
      if (item && shell) setPanelX(item.getBoundingClientRect().left - shell.getBoundingClientRect().left);
    }
  }, []);

  // A route change closes any menu, and the highlight goes back to where you are.
  useEffect(() => {
    show(null);
    settle();
  }, [pathname, hash, show, settle]);

  // Keep the highlight measured: fonts arriving and the pill condensing both move the links.
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const observer = new ResizeObserver(settle);
    observer.observe(el);
    void document.fonts?.ready.then(settle);
    return () => observer.disconnect();
  }, [settle]);

  useEffect(() => () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

  // Open with the keyboard, and focus lands on the first link instead of behind the rest of the nav.
  useEffect(() => {
    if (open === null || !focusFirst.current) return;
    focusFirst.current = false;
    panel.current?.querySelector('a')?.focus();
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const trigger = opener(openRef.current);
      show(null);
      trigger?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!list.current?.contains(target) && !panel.current?.contains(target)) show(null);
    };
    // Focus that moves anywhere but the open item or its panel closes it, so a menu never stays open behind the control the keyboard is on.
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !items.current[openRef.current ?? -1]?.contains(target)) show(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [open, show]);

  // The panel is drawn after the whole list, so Tab is steered by hand to read as if it sat inside its item: trigger, its links, then the next item.
  const opener = (index: number | null) => {
    const buttons = index === null ? [] : [...(items.current[index]?.querySelectorAll<HTMLElement>('button') ?? [])];
    return buttons[buttons.length - 1];
  };
  const panelLinks = () => [...(panel.current?.querySelectorAll<HTMLElement>('a[href]') ?? [])];

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || e.shiftKey || openRef.current === null || e.target !== opener(openRef.current)) return;
    const first = panelLinks()[0];
    if (!first) return;
    e.preventDefault();
    first.focus();
  };

  const onPanelKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const links = panelLinks();
    const index = openRef.current;
    const trigger = opener(index);
    if (e.shiftKey && e.target === links[0]) {
      e.preventDefault();
      trigger?.focus();
    } else if (!e.shiftKey && e.target === links[links.length - 1] && index !== null) {
      // On to whatever follows the item in the page's own order: the next item, or after the last one, the nav's actions.
      const order = [...document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(
        (el) => !panel.current?.contains(el) && el.getClientRects().length > 0,
      );
      const next = trigger ? order[order.indexOf(trigger) + 1] : undefined;
      e.preventDefault();
      show(null);
      next?.focus();
    }
  };

  const onItemEnter = (index: number, e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    go(items.current[index]);
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    const hasMenu = groupOf(NAV_TOP[index] as (typeof NAV_TOP)[number]);
    // With a menu already open, moving to the next item swaps it straight away.
    if (openRef.current !== null) show(hasMenu ? index : null);
    else if (hasMenu) openTimer.current = window.setTimeout(() => show(index), OPEN_DELAY);
  };

  const scheduleClose = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => show(null), CLOSE_DELAY);
  };

  const onListLeave = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    settle();
    scheduleClose();
  };

  const onTriggerClick = (index: number, e: React.MouseEvent) => {
    focusFirst.current = e.detail === 0;
    show(openRef.current === index ? null : index);
  };

  const openItem = open !== null ? NAV_TOP[open] : undefined;
  const openGroup = openItem ? groupOf(openItem) : undefined;

  return (
    <>
      <ul ref={list} className="nav-links" onPointerLeave={onListLeave} onKeyDown={onListKey}>
        <li ref={bar} className="nav-indicator" role="presentation" aria-hidden />
        {NAV_TOP.map((item, i) => {
          const group = groupOf(item);
          const to = 'to' in item ? item.to : undefined;
          const active = itemActive(item, pathname, hash);
          return (
            <li
              key={item.label}
              className="nav-item"
              ref={(el) => {
                items.current[i] = el;
              }}
              onPointerEnter={(e) => onItemEnter(i, e)}
            >
              {to ? (
                <Link to={to} className="nav-top" aria-current={active ? 'page' : undefined}>
                  {item.label}
                </Link>
              ) : (
                <button type="button" className="nav-top" aria-expanded={open === i} aria-controls="nav-dropdown" data-active={active || undefined} onClick={(e) => onTriggerClick(i, e)}>
                  {item.label}
                  <ChevronDown aria-hidden />
                </button>
              )}
              {to && group && (
                <button type="button" className="nav-top nav-caret" aria-label={`More in ${item.label}`} aria-expanded={open === i} aria-controls="nav-dropdown" onClick={(e) => onTriggerClick(i, e)}>
                  <ChevronDown aria-hidden />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <AnimatePresence>
        {openGroup && (
          <m.div
            ref={panel}
            id="nav-dropdown"
            className="nav-drop"
            initial={{ opacity: 0, scale: 0.98, y: -4, x: panelX }}
            animate={{ opacity: 1, scale: 1, y: 0, x: panelX }}
            exit={{ opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.14 } }}
            transition={spring.snappy}
            onPointerEnter={() => window.clearTimeout(closeTimer.current)}
            onPointerLeave={scheduleClose}
            onKeyDown={onPanelKey}
          >
            <m.div key={openGroup.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
              <p className="nav-drop-title">{openGroup.label}</p>
              {openGroup.links.map(([label, to]) => (
                <Link key={to} to={to} className="nav-drop-link" aria-current={to === pathname ? 'page' : undefined} onClick={() => show(null)}>
                  {label}
                </Link>
              ))}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}

const MENU_CLOSED = { opacity: 0, scale: 0.97, y: -6 };

export function Nav() {
  const [open, setOpen] = useState(false);
  const shell = useRef<HTMLElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const { pathname, hash } = useLocation();

  useEffect(() => setOpen(false), [pathname, hash]);

  useEffect(() => {
    if (!open) return;
    // Escape hands focus back to Menu before the focused link unmounts, so it never drops to the top of the page.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const inside = shell.current?.contains(document.activeElement);
      setOpen(false);
      if (inside) menuBtn.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!shell.current?.contains(e.target as Node)) setOpen(false);
    };
    // Tabbing out of the menu closes it, so the panel never covers the control that now has focus. A null target (the window losing focus) is left alone.
    const onFocusOut = (e: FocusEvent) => {
      if (e.relatedTarget && !shell.current?.contains(e.relatedTarget as Node)) setOpen(false);
    };
    const root = shell.current;
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    root?.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      root?.removeEventListener('focusout', onFocusOut);
    };
  }, [open]);

  // The pill tightens once you leave the top. One observer, no scroll listener.
  useEffect(() => {
    const el = sentinel.current;
    const root = shell.current;
    if (!el || !root) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) delete root.dataset.condensed;
      else root.dataset.condensed = '';
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} className="nav-sentinel" aria-hidden />
      <header className="nav-shell" ref={shell}>
        <nav className="nav-pill glass" aria-label="Main">
          <Link to="/" className="nav-home" aria-label={`${SITE.name} home`}>
            <img src="/logo.png" alt="" width={32} height={32} className="nav-logo" />
            <svg className="nav-name" viewBox={WORDMARK.viewBox} fill="currentColor" aria-hidden focusable="false">
              <path d={WORDMARK.d} />
            </svg>
          </Link>
          <DesktopLinks />
          <div className="nav-actions">
            <ThemeToggle />
            <PrimaryCta size="sm" className="nav-cta" chrome />
            <button ref={menuBtn} type="button" className="nav-menu-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="site-menu">
              {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
              Menu
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {open && (
            <m.nav id="site-menu" className="nav-panel" aria-label="Site" initial={MENU_CLOSED} animate={{ opacity: 1, scale: 1, y: 0 }} exit={MENU_CLOSED} transition={spring.snappy}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {NAV_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="nav-panel-group">{group.label}</p>
                    {group.links.map(([label, to]) => (
                      <Link key={to} to={to} className="nav-link" aria-current={linkActive(to, pathname, hash) ? 'page' : undefined}>
                        {label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
              <PrimaryCta className="mt-5 w-full sm:hidden" chrome />
            </m.nav>
          )}
        </AnimatePresence>
      </header>
      <MobileCtaBar menuOpen={open} />
    </>
  );
}

/**
 * The phone's one persistent action. Slides up once you have scrolled past the first screen, and steps aside when the footer's own action is on screen, when
 * one of the page's own copies of the action is (a plan's button, which also carries the plan), while the menu is open (it has the action itself), and
 * on the pages that have a different action: the form on /contact, the email on /careers.
 */
function MobileCtaBar({ menuOpen }: { menuOpen: boolean }) {
  const { pathname } = useLocation();
  const actionInView = useActionInView();
  const threshold = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState(false);
  const [footer, setFooter] = useState(false);

  useEffect(() => {
    const el = threshold.current;
    // The site footer, not a <footer> inside a page (a quote's attribution, say).
    const end = document.querySelector('footer.ft');
    const pastIo = new IntersectionObserver(([entry]) => setPast(!entry?.isIntersecting));
    if (el) pastIo.observe(el);
    const footerIo = new IntersectionObserver(([entry]) => setFooter(Boolean(entry?.isIntersecting)));
    if (end) footerIo.observe(end);
    return () => {
      pastIo.disconnect();
      footerIo.disconnect();
    };
  }, []);

  const show = past && !footer && !menuOpen && !actionInView && !OWN_ACTION_ROUTES.includes(pathname);

  return (
    <>
      <div ref={threshold} className="absolute top-0 left-0 h-[80dvh] w-px" aria-hidden />
      <div className="mobile-cta" data-show={show ? '' : undefined} inert={!show}>
        <PrimaryCta size="lg" chrome />
      </div>
    </>
  );
}
