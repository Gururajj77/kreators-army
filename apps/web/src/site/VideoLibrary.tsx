import type { Video } from '@kreators/shared';
import { Check, ChevronDown, Search, Shuffle, X } from 'lucide-react';
import { AnimatePresence, LayoutGroup, m } from 'motion/react';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { Character, type CharacterHandle } from '../cast';
import { CastBubble, useCastLine } from '../components/chat';
import { DeckCard, previewSource, toneOf, useSeenBrands } from '../components/frames';
import { CardRing } from '../components/ring';
import { ChipRail } from '../components/tabs';
import { Cta, RollNumber, Seo } from '../components/ui';
import { TileSkeletons, VideoPlayerDialog, VideoTile } from '../components/video';
import { PRIMARY_ACTION, brandLogo, contactHref } from '../lib/content';
import { motionOk } from '../lib/motionOk';
import { useVideos } from '../lib/queries';
import { spring } from '../lib/spring';
import { FIRST_ROWS, LibraryIntro, guessCols } from './LibraryShell';
import { chipLabel, facetDefs, facets as facetsOf, newShuffleSeed, passes, sortVideos, sortsFor, suggest, tokens, withoutWordsOf, type Facet, type SortDef, type Suggestion } from '../lib/videoFind';

// The video library (V2-SPEC 5.7, content §3.6, visual §2.6). The brands are story rings (M6): a ring is a filter, set in the address, and turns grey
// once a video of that brand has been opened. The glass bar's top row is one line: the Uploaded menu (and the count) on the left, the search (with
// suggestions) truly centred, the sort and Shuffle on the right; on phones the search takes its own line first. Below it, the chip rails. The grid shows
// two full rows first, then four more as the visitor nears the end (or presses "View more"). The default order is Shuffled: a fresh random order per
// visit (the seed is made once per mount and kept in the history entry, so Back returns to the same order; it is not written to the address). "Our
// picks" (featured first, then the library's order) is ?sort=featured. The finding rules (facets, sorts, search) live in lib/videoFind.ts.
//
// Everything lives in the address, set with `replace` and no scroll jump:
//   brand     brand names, comma separated (the rings)
//   date      upload date: month (this month), 3m (last 3 months), year (this year), or a year such as 2025
//   shape     vertical, landscape
//   reach     1m (1M+ views), 100k (100K+), under (under 100K); unknown views match none
//   category  category names
//   platform  platform names
//   posted    instagram, youtube (a Watch link exists)
//   q         the search: every word must match the title, brand, category, platform or upload month and year; one slip allowed in words of 5
//             letters or more; shorthands ig/insta, yt/shorts, 1m/100k, a year, vertical/landscape
//   sort      featured (our picks), new, old, views, least, brand, short, long, shuffle (none: this visit's shuffle; new and old only with dates,
//             short and long only with lengths)
//   seed      the shuffle's seed with sort=shuffle (the Shuffle button writes both, so a shuffled order can be shared)
//   v         the open video (the player)
// Within a key the values are OR'd, across keys AND'd. Every count in the bar is the number a chip would leave, given the other filters.

/** The address keys that change which tiles show. */
const FILTER_KEYS = ['brand', 'date', 'shape', 'category', 'platform', 'reach', 'posted', 'q'];

/** Tiles animate their swap on a filter change only while this many or fewer are in play (M5h). */
const ANIMATE_MAX = 24;
/** Each reveal (the visitor nearing the end, or "View more") adds this many rows. */
const MORE_ROWS = 4;
/** How far below the screen the end of the grid may be when the next rows load. */
const MORE_MARGIN = '0px 0px 600px 0px';
/** The revealed rows, kept in the history entry, so Back and Forward return to as many tiles as were showing (for the same filters). */
const HISTORY_ROWS = 'kreatorsLibRows';
/** This visit's shuffle seed, kept in the history entry too: Back and a reload return to the same order; a new visit deals a new one. */
const HISTORY_SEED = 'kreatorsLibSeed';

function visitSeed(): string {
  try {
    const saved = (window.history.state as Record<string, unknown> | null)?.[HISTORY_SEED];
    if (typeof saved === 'string' && /^[a-z0-9]{1,12}$/.test(saved)) return saved;
  } catch {
    // No history state: a new order.
  }
  return newShuffleSeed();
}

const PHONE = '(max-width: 734px)';
const subscribePhone = (fn: () => void) => {
  const mq = matchMedia(PHONE);
  mq.addEventListener('change', fn);
  return () => mq.removeEventListener('change', fn);
};
const useIsPhone = () => useSyncExternalStore(subscribePhone, () => matchMedia(PHONE).matches, () => false);

const videoWord = (n: number) => (n === 1 ? 'video' : 'videos');

/** How many rows were showing, and for which address (without ?v): what the grid reveals, and what Back and Forward bring back. */
interface Reveal {
  key: string;
  rows: number;
  /** The polite line after a reveal: "Showing 16 of 40 videos". */
  said: string;
}

function savedReveal(): Reveal | null {
  try {
    const saved = (window.history.state as Record<string, unknown> | null)?.[HISTORY_ROWS] as Partial<Reveal> | undefined;
    return saved && typeof saved.key === 'string' && typeof saved.rows === 'number' && saved.rows >= FIRST_ROWS ? { key: saved.key, rows: saved.rows, said: '' } : null;
  } catch {
    return null;
  }
}

// ---------- The brand ring (library-slider-cta-spec §2): one card per brand on a slowly turning ring, each a filter ----------

/** The most brands on the ring; the rest stay reachable through the search's brand suggestions. */
const RING_BRANDS = 17;

/** Each brand's lead video, from all videos (so the ring never reshuffles with the filters): one with a poster, then featured, most views, newest. */
function leadVideos(videos: Video[]): Map<string, Video> {
  const lead = new Map<string, Video>();
  const better = (x: Video, y: Video) =>
    Number(Boolean(y.posterUrl)) - Number(Boolean(x.posterUrl)) ||
    Number(y.featured) - Number(x.featured) ||
    (y.views || 0) - (x.views || 0) ||
    (y.uploadDate ?? '').localeCompare(x.uploadDate ?? '');
  for (const v of videos) {
    const cur = lead.get(v.brand);
    if (!cur || better(v, cur) < 0) lead.set(v.brand, v);
  }
  return lead;
}

/** The panel colours, dealt round the ring by place (not by the brand's name), so no two neighbouring panels share a colour. */
const RING_TONES = ['tiko', 'sochu', 'bolu', 'gola'] as const;

/** The colour for place `k` of `n` round the ring: in turn, except that the last place, when it would match the first across the wrap, takes the
 *  third colour (it differs from both its neighbours). Clones get their own place's colour too. */
function ringTone(k: number, n: number): (typeof RING_TONES)[number] {
  const len = RING_TONES.length;
  if (k === n - 1 && n % len === 1 && n > 1) return RING_TONES[2];
  return RING_TONES[k % len] ?? 'tiko';
}

function BrandDisc({ brand, seen, size }: { brand: string; seen: boolean; size: 'sm' | 'lg' }) {
  const logo = brandLogo(brand);
  return (
    <span className="story-ring lib-disc" data-size={size} data-seen={seen ? '' : undefined} aria-hidden>
      <span className="story-ring-circle">
        <span className="story-ring-art" />
        <span className="story-ring-face">{logo ? <img src={logo} alt="" loading="lazy" decoding="async" /> : <span className="story-ring-letter" data-tone={toneOf(brand)}>{brand.charAt(0)}</span>}</span>
      </span>
    </span>
  );
}

function BrandRing({ brands, counts, videos, selected, onToggle, paused }: { brands: string[]; counts: Map<string, number>; videos: Video[]; selected: string[]; onToggle: (brand: string) => void; paused: boolean }) {
  const seen = useSeenBrands();
  const lead = useMemo(() => leadVideos(videos), [videos]);
  // Brands with a poster first (otherwise the facet's order, kept): until every brand has a poster, the ring opens on pictures, not a row of
  // colour panels. Once every brand has one this is the facet's order unchanged.
  const items = useMemo(() => {
    const has = (b: string) => Boolean(lead.get(b)?.posterUrl);
    return [...brands.filter(has), ...brands.filter((b) => !has(b))];
  }, [brands, lead]);
  const anySelected = selected.length > 0;
  return (
    <CardRing
      className="lib-ring"
      items={items}
      itemKey={(b) => b}
      label="Brands"
      interactive
      minCards={12}
      paused={paused}
      clipOf={(b) => lead.get(b)?.previewUrl}
      streamOf={(b) => {
        const v = lead.get(b);
        const source = v ? previewSource(v) : null;
        return source && !source.clip ? source.src : null;
      }}
      renderCard={(b, { tabIndex, clip, slot, slots }) => {
        const video = lead.get(b);
        const poster = video?.posterUrl;
        const n = counts.get(b) ?? 0;
        const on = selected.includes(b);
        const wasSeen = seen.has(b) && !on;
        return (
          <button
            type="button"
            className="cring-card lib-ring-card"
            tabIndex={tabIndex}
            aria-pressed={on}
            aria-label={`${b}, ${n} ${videoWord(n)}`}
            data-ring-brand={b}
            data-selected={on ? '' : undefined}
            data-dim={anySelected && !on ? '' : undefined}
            data-seen={wasSeen ? '' : undefined}
            data-poster={poster ? '' : undefined}
            data-tone={ringTone(slot, slots)}
            onClick={() => onToggle(b)}
          >
            {poster ? <img src={poster} alt="" loading="eager" fetchPriority="low" decoding="async" draggable={false} /> : <BrandDisc brand={b} seen={wasSeen} size="lg" />}
            {clip}
            {poster && <span className="lib-ring-scrim" aria-hidden />}
            <span className="lib-ring-label">
              {poster && <BrandDisc brand={b} seen={wasSeen} size="sm" />}
              <span className="lib-ring-name">{b}</span>
            </span>
            {on && (
              <span className="lib-ring-check" aria-hidden>
                <svg viewBox="0 0 16 16" focusable="false">
                  <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </button>
        );
      }}
    />
  );
}

// ---------- The bar's menus: a button and an opaque popover. The sort: radios, the current one checked. Uploaded: checkboxes (OR'd), open while picking ----------

interface MenuItem {
  value: string;
  label: string;
  count?: number;
}

function BarMenu({ name, kind, items, selected, onPick, className, align = 'right', children }: { name: string; kind: 'radio' | 'checkbox'; items: MenuItem[]; selected: string[]; onPick: (value: string) => void; className: string; align?: 'left' | 'right'; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const viaKeys = useRef(false);
  const role = kind === 'radio' ? 'menuitemradio' : 'menuitemcheckbox';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    const onFocus = (e: FocusEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocus);
    };
  }, [open]);

  // Opened from the keyboard, focus goes to the (first) checked option.
  useLayoutEffect(() => {
    if (!open || !viaKeys.current) return;
    viaKeys.current = false;
    pop.current?.querySelector<HTMLElement>(`[aria-checked="true"], [role="${role}"]`)?.focus();
  }, [open, role]);

  const options = () => [...(pop.current?.querySelectorAll<HTMLElement>(`[role="${role}"]`) ?? [])];
  const onMenuKey = (e: ReactKeyboardEvent) => {
    const list = options();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => list[(i + list.length) % list.length]?.focus();
    if (e.key === 'ArrowDown') go(at + 1);
    else if (e.key === 'ArrowUp') go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(list.length - 1);
    else if (e.key === 'Tab') setOpen(false);
    else return;
    if (e.key !== 'Tab') e.preventDefault();
  };

  return (
    <div ref={root} className={`lib-menu-wrap ${className}-wrap`}>
      <button
        ref={button}
        type="button"
        className={`lib-btn ${className}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          viaKeys.current = e.detail === 0;
          setOpen((o) => !o);
        }}
      >
        {children}
        <ChevronDown className="lib-chev size-4" aria-hidden />
      </button>
      {open && (
        <div ref={pop} className={`lib-pop ${className}-pop`} data-align={align} role="menu" aria-label={name} onKeyDown={onMenuKey}>
          {items.map((s) => {
            const on = selected.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                role={role}
                aria-checked={on}
                className="lib-opt"
                onClick={() => {
                  onPick(s.value);
                  if (kind === 'checkbox') return;
                  setOpen(false);
                  button.current?.focus();
                }}
              >
                <span className="lib-opt-label">{s.label}</span>
                {s.count !== undefined && (
                  <span className="lib-opt-count">
                    <span className="sr-only">, </span>
                    {s.count}
                    <span className="sr-only"> {videoWord(s.count)}</span>
                  </span>
                )}
                <Check className="lib-opt-check size-4" aria-hidden />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SortMenu({ sorts, value, onChange }: { sorts: SortDef[]; value: string; onChange: (next: string) => void }) {
  const label = sorts.find((s) => s.value === value)?.label ?? sorts[0]?.label;
  return (
    <BarMenu name="Sort" kind="radio" items={sorts} selected={[value]} onPick={onChange} className="lib-sort">
      <span className="lib-sort-label">
        <span className="sr-only">Sort: </span>
        {label}
      </span>
    </BarMenu>
  );
}

/** The Uploaded facet as a compact menu (it sits on the bar's one line): its options with the videos each would leave, OR'd; the button shows how many are chosen. */
function DateMenu({ facet, onChange }: { facet: Facet; onChange: (next: string[]) => void }) {
  const n = facet.selected.length;
  return (
    <BarMenu
      name={facet.def.label}
      kind="checkbox"
      align="left"
      items={facet.options.map((o) => ({ value: o.value, label: o.label, count: o.count }))}
      selected={facet.selected}
      onPick={(value) => onChange(facet.selected.includes(value) ? facet.selected.filter((x) => x !== value) : [...facet.selected, value])}
      className="lib-date"
    >
      <span className="lib-date-label">{facet.def.label}</span>
      {n > 0 && (
        <span className="lib-date-n">
          <span className="sr-only">, </span>
          {n}
          <span className="sr-only"> chosen</span>
        </span>
      )}
    </BarMenu>
  );
}

// ---------- The search: a combobox whose suggestions turn typed words into filters ----------

/**
 * The ARIA 1.2 combobox pattern: focus stays in the box, the arrows move the active suggestion (aria-activedescendant), Enter or a click applies it as a
 * filter, Escape closes the list (and a second Escape empties the box). Nothing is announced as the list changes: the box says it is expanded, and
 * the result count is announced once typing pauses.
 */
function SearchBox({ q, onSearch, suggestions, onPick }: { q: string; onSearch: (next: string) => void; suggestions: Suggestion[]; onPick: (s: Suggestion) => void }) {
  const id = useId();
  const listId = `${id}-list`;
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);
  const n = suggestions.length;
  const open = focused && !dismissed && n > 0;
  const signature = suggestions.map((s) => `${s.key}:${s.value}`).join('|');

  // A new list starts with nothing active: Enter then searches, it never applies a filter the visitor has not chosen.
  useEffect(() => setActive(-1), [signature]);

  const pick = (s: Suggestion | undefined) => {
    if (!s) return;
    setActive(-1);
    setDismissed(true);
    onPick(s);
  };

  const onKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (n === 0) return;
      e.preventDefault();
      const down = e.key === 'ArrowDown';
      if (!open) {
        setDismissed(false);
        setActive(down ? 0 : n - 1);
        return;
      }
      setActive((a) => (down ? (a + 1) % n : a <= 0 ? n - 1 : a - 1));
    } else if (e.key === 'Enter') {
      if (open && active >= 0) {
        e.preventDefault();
        pick(suggestions[active]);
      } else setDismissed(true);
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setDismissed(true);
        setActive(-1);
      } else if (q) {
        e.preventDefault();
        onSearch('');
      }
    } else if (e.key === 'Tab') setDismissed(true);
  };

  return (
    <div className="lib-search-wrap">
      <label className="lib-search">
        <Search className="lib-search-icon size-4" aria-hidden />
        <span className="sr-only">Search videos</span>
        <input
          id="lib-q"
          name="q"
          type="search"
          placeholder="Search videos"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          value={q}
          onChange={(e) => {
            setDismissed(false);
            onSearch(e.target.value);
          }}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setActive(-1);
          }}
        />
        {q && (
          <button type="button" className="lib-search-clear" aria-label="Clear search" onClick={() => onSearch('')}>
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </label>
      <ul id={listId} className="lib-pop lib-suggest" role="listbox" aria-label="Suggested filters" hidden={!open}>
        {open &&
          suggestions.map((s, i) => (
            <li
              key={`${s.key}:${s.value}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className="lib-sug"
              data-active={i === active ? '' : undefined}
              // Keeps the focus in the box, so the list does not close before the click lands.
              onPointerDown={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
              onPointerMove={() => i !== active && setActive(i)}
              onClick={() => pick(s)}
            >
              <span className="lib-sug-label">{s.label}</span>
              <span className="lib-sug-kind">
                <span className="sr-only">, </span>
                {s.kind}
              </span>
              <span className="lib-sug-count">
                <span className="sr-only">, </span>
                {s.count}
                <span className="sr-only"> {videoWord(s.count)}</span>
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}

// ---------- The bar: glass over the tiles; one line of Uploaded (and the count), the centred search, the sort and Shuffle; then the chip rails ----------

interface BarProps {
  facets: Facet[];
  onFacet: (key: string, next: string[]) => void;
  sorts: SortDef[];
  sort: string;
  onSort: (next: string) => void;
  /** Deal the whole library into a new random order (each press a new one). */
  onShuffle: () => void;
  q: string;
  onSearch: (next: string) => void;
  suggestions: Suggestion[];
  onPick: (s: Suggestion) => void;
  count: number;
  ready: boolean;
}

/** The Shuffle button: a new random order of every video on each press. The die turns once per press (not under reduced motion or still). */
function ShuffleButton({ onShuffle, active }: { onShuffle: () => void; active: boolean }) {
  const [turns, setTurns] = useState(0);
  return (
    <button
      type="button"
      className="lib-btn lib-shuffle"
      data-active={active || undefined}
      aria-label="Shuffle all videos"
      title="Shuffle all videos"
      onClick={() => {
        setTurns((t) => t + 1);
        onShuffle();
      }}
    >
      <Shuffle key={turns} className="size-4 lib-shuffle-icon" data-turn={turns > 0 || undefined} aria-hidden />
      <span className="lib-shuffle-label">Shuffle</span>
    </button>
  );
}

function FilterBar({ facets, onFacet, sorts, sort, onSort, onShuffle, q, onSearch, suggestions, onPick, count, ready }: BarProps) {
  const phone = useIsPhone();
  const date = facets.find((f) => f.def.key === 'date');
  const rails = facets.filter((f) => f.def.key !== 'date');
  // The DOM follows what is seen, left to right and top to bottom (the keyboard's order): on phones the search is a line of its own above the rest.
  const left = (
    <div key="left" className="lib-bar-left">
      {date && <DateMenu facet={date} onChange={(next) => onFacet('date', next)} />}
      <p className="lib-count" aria-hidden>
        {ready ? (
          <>
            <RollNumber value={count} countUp={false} /> <span>{videoWord(count)}</span>
          </>
        ) : (
          ' '
        )}
      </p>
    </div>
  );
  const search = <SearchBox key="search" q={q} onSearch={onSearch} suggestions={suggestions} onPick={onPick} />;
  const right = (
    <div key="right" className="lib-bar-right">
      <SortMenu sorts={sorts} value={sort} onChange={onSort} />
      <ShuffleButton onShuffle={onShuffle} active={sort === 'shuffle'} />
    </div>
  );
  return (
    <div className="lib-bar glass">
      <div className="lib-bar-top">{phone ? [search, left, right] : [left, search, right]}</div>

      {rails.length > 0 && (
        <div className="lib-facets">
          {rails.map((f) => (
            <div key={f.def.key} className="lib-facet">
              <span className="lib-facet-label" aria-hidden>
                {f.def.label}
              </span>
              <ChipRail
                mode="multi"
                label={f.def.label}
                options={f.options.map((o) => ({ value: o.value, label: o.label, count: o.count }))}
                value={f.selected}
                onChange={(next) => onFacet(f.def.key, next)}
                size={phone ? 'md' : 'sm'}
                wrap
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- States ----------

/** Two rows of plain skeletons first (the rows the grid will show), so a fast load shows nothing else. After 400 ms Gola holds the first tile and claps until the videos arrive. No bubble. */
function LoadingGrid({ cols }: { cols: number }) {
  const count = FIRST_ROWS * cols;
  const [late, setLate] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setLate(true), 400);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="lib-grid" aria-busy="true">
      <span className="sr-only" role="status">
        Loading videos
      </span>
      {late ? (
        <>
          <div className="tile-skeleton tile-host">
            <GolaClap />
          </div>
          <TileSkeletons count={count - 1} />
        </>
      ) : (
        <TileSkeletons count={count} />
      )}
    </div>
  );
}

function GolaClap() {
  const gola = useRef<CharacterHandle>(null);
  useEffect(() => {
    if (!motionOk()) return;
    const id = window.setInterval(() => gola.current?.play('signature', { force: true }), 1200);
    return () => window.clearInterval(id);
  }, []);
  return <Character ref={gola} who="gola" size={104} prop />;
}

/** Tiko says the state's line once, a moment after the state appears (after `delay` ms, so it never talks over its own glance). */
function useTikoLine(key: 'library.empty' | 'library.error' | null, delay = 500) {
  const tiko = useRef<CharacterHandle>(null);
  const cast = useCastLine();
  const { say } = cast;
  useEffect(() => {
    if (!key) return;
    const t = window.setTimeout(() => void say(key, { by: tiko.current, expression: null }), delay);
    return () => window.clearTimeout(t);
  }, [key, say, delay]);
  return { tiko, bubble: key ? <CastBubble {...cast.bubble(key)} /> : null };
}

function LibraryError({ onRetry }: { onRetry: () => void }) {
  const { tiko, bubble } = useTikoLine('library.error');
  return (
    <div role="alert" className="lib-state frame" data-bubble-bounds="">
      <Character ref={tiko} who="tiko" size={150} expression="confused" track={false}>
        {bubble}
      </Character>
      <p className="h4">The library could not load.</p>
      <Cta kind="ink" onClick={onRetry}>
        Try again
      </Cta>
    </div>
  );
}

/** The one filter whose removal brings back the most videos, as the empty state offers it. */
interface Fix {
  label: string;
  count: number;
  apply: () => void;
}

/**
 * No tiles. With filters set, the filters are the reason: the one to drop for the most videos back is offered first, then clearing them all. With none,
 * the library simply has nothing live yet, and there is nothing to clear.
 */
function LibraryEmpty({ onClear, hasFilters, fix }: { onClear: () => void; hasFilters: boolean; fix: Fix | null }) {
  // Tiko looks left then right first (to 1.6 s), then says its line.
  const { tiko, bubble } = useTikoLine(hasFilters ? 'library.empty' : null, 1700);
  const stage = useRef<HTMLDivElement>(null);
  const clearBtn = useRef<HTMLDivElement>(null);

  // Looks left, then right, once. No matches is a small puzzle, not a loop.
  useEffect(() => {
    const box = stage.current?.getBoundingClientRect();
    if (!box) return;
    const y = box.top + box.height / 2;
    const left = window.setTimeout(() => tiko.current?.lookAt({ x: box.left - 180, y }, 620), 260);
    const right = window.setTimeout(() => tiko.current?.lookAt({ x: box.right + 180, y }, 620), 980);
    return () => {
      window.clearTimeout(left);
      window.clearTimeout(right);
    };
  }, [tiko]);

  const hop = () => tiko.current?.play('hop', { small: true, force: true });

  return (
    <m.div className="lib-state frame" data-bubble-bounds="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
      <div ref={stage}>
        <Character ref={tiko} who="tiko" size={180} prop expression="confused">
          {bubble}
        </Character>
      </div>
      {hasFilters ? (
        <>
          <div className="lib-state-copy">
            <h2 className="h3">No videos match those filters</h2>
            <p className="lead">Try fewer filters, or clear them to see everything.</p>
          </div>
          <div ref={clearBtn} className="lib-state-actions" onPointerEnter={() => tiko.current?.lookAt(clearBtn.current, 1200)}>
            {fix && (
              <Cta
                kind="ink"
                className="lib-fix"
                onClick={() => {
                  hop();
                  fix.apply();
                }}
              >
                Remove ‘{fix.label}’ to see {fix.count} {videoWord(fix.count)}
              </Cta>
            )}
            <Cta
              kind={fix ? 'ghost' : 'ink'}
              onClick={() => {
                hop();
                onClear();
              }}
            >
              Clear filters
            </Cta>
          </div>
        </>
      ) : (
        <div className="lib-state-copy">
          <h2 className="h3">No videos in the library yet</h2>
          <p className="lead">New street interviews appear here as soon as they go live.</p>
        </div>
      )}
    </m.div>
  );
}

/** The end of the work: a deck of three posters and the one thing worth saying there. It fills the last row's gap where there is one. */
function LibraryEnd({ fill, videos }: { fill: number[]; videos: Video[] }) {
  const [r4, r3, r2] = fill;
  // A full last row (0 left) puts the card in one cell of a new row.
  const style = { '--rest-4': Math.max(1, r4 ?? 1), '--rest-3': Math.max(1, r3 ?? 1), '--rest-2': Math.max(1, r2 ?? 1) } as CSSProperties;
  return (
    <div className="lib-end" data-r4={r4} data-r3={r3} data-r2={r2} style={style}>
      <DeckCard videos={videos} to={contactHref()} className="lib-end-card">
        <span className="lib-end-title">Want one for your brand?</span>
        <span className="btn btn-accent btn-sm lib-end-go" aria-hidden>
          {PRIMARY_ACTION.label}
        </span>
        <span className="sr-only">{PRIMARY_ACTION.label}</span>
      </DeckCard>
    </div>
  );
}


// ---------- The page ----------

export function VideoLibrary() {
  const { data: videos = [], isPending, isError, refetch } = useVideos();
  const [params, setParams] = useSearchParams();

  const list = (key: string) => params.get(key)?.split(',').filter(Boolean) ?? [];
  // The box keeps its own text: the address updates a moment after each key, and a box tied to it would drop fast typing. A change of the address
  // from elsewhere (a link to the library with another search) still reaches the box.
  const urlQ = params.get('q') ?? '';
  const [q, setQ] = useState(urlQ);
  const wroteQ = useRef(urlQ);
  useEffect(() => {
    if (urlQ === wroteQ.current) return;
    wroteQ.current = urlQ;
    setQ(urlQ);
  }, [urlQ]);
  const openId = params.get('v');

  // Exiting tiles leave the flow at once (popLayout), so a filter that shortens the grid would pull the footer up over tiles still landing. The grid keeps
  // its height until the last tile has left and the ones that stay have had time to land, then lets go in one step.
  const grid = useRef<HTMLDivElement>(null);
  const holdTimer = useRef(0);
  const letGo = () => {
    window.clearTimeout(holdTimer.current);
    if (grid.current) grid.current.style.minHeight = '';
  };
  const exitsDone = () => {
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(letGo, 220);
  };
  const holdGrid = () => {
    const el = grid.current;
    if (!el) return;
    if (!el.style.minHeight) el.style.minHeight = `${el.offsetHeight}px`;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(letGo, 1100);
  };
  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  const update = (changes: Record<string, string | null>) => {
    if (Object.keys(changes).some((key) => FILTER_KEYS.includes(key))) holdGrid();
    if ('q' in changes) wroteQ.current = changes.q ?? '';
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) value ? next.set(key, value) : next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };
  const setList = (key: string) => (values: string[]) => update({ [key]: values.join(',') || null });

  // The address, read once per render: the selection per facet key, the search's words, the sort.
  const defs = useMemo(() => facetDefs(videos), [videos]);
  const paramsKey = params.toString();
  const selection = useMemo(() => Object.fromEntries(defs.map((d) => [d.key, list(d.key)])), [defs, paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const toks = useMemo(() => tokens(q), [q]);
  const sorts = useMemo(() => sortsFor(videos), [videos]);
  // No sort in the address: this visit's shuffle (made once per mount, so filtering, searching and "View more" never reshuffle the grid).
  const [ownSeed] = useState(visitSeed);
  const sortParam = params.get('sort') ?? 'shuffle';
  const sort = sorts.some((s) => s.value === sortParam) ? sortParam : 'shuffle';
  const seed = (sort === 'shuffle' && params.get('seed')) || ownSeed;

  const facets = useMemo(() => facetsOf(videos, defs, selection, toks), [videos, defs, selection, toks]);
  // The whole library is ordered first, then filtered: a shuffle keeps each video's place under any filter or search (every other sort is stable,
  // so ordering first changes nothing there).
  const ordered = useMemo(() => sortVideos(videos, sort, seed), [videos, sort, seed]);
  const filtered = useMemo(() => ordered.filter((v) => passes(v, defs, selection, toks)), [ordered, defs, selection, toks]);
  const suggestions = useMemo(() => (q.trim() ? suggest(videos, facets, selection, q) : []), [videos, facets, selection, q]);

  const brandFacet = facets.find((f) => f.def.key === 'brand');
  const brands = selection.brand ?? [];
  const barFacets = facets.filter((f) => f.def.key !== 'brand' && f.show);

  // The chips row: every selected value, the brands first, one click takes it off.
  const chips = [...facets.filter((f) => f.def.key === 'brand'), ...facets.filter((f) => f.def.key !== 'brand')].flatMap((f) =>
    f.selected.map((value) => ({ key: f.def.key, value, label: f.def.key === 'brand' ? value : chipLabel(f.def, value), values: f.selected })),
  );
  const hasFilters = chips.length > 0 || toks.length > 0;
  const clear = () => {
    setQ('');
    update(Object.fromEntries(FILTER_KEYS.map((key) => [key, null])));
  };

  const onSearch = (next: string) => {
    setQ(next);
    update({ q: next || null });
  };

  const onPick = (s: Suggestion) => {
    const rest = withoutWordsOf(q, s.label);
    setQ(rest);
    update({ [s.key]: [...(selection[s.key] ?? []), s.value].join(','), q: rest || null });
  };

  // No match: the one filter (a whole facet, or the search) whose removal brings back the most videos.
  const fix = useMemo(() => {
    if (filtered.length > 0 || videos.length === 0) return null;
    const options: { label: string; count: number; change: Record<string, string | null> }[] = facets
      .filter((f) => f.selected.length > 0)
      .map((f) => ({
        label: `${f.def.label}: ${f.selected.map((value) => f.def.options.find((o) => o.value === value)?.label ?? value).join(', ')}`,
        count: videos.filter((v) => passes(v, defs, selection, toks, f.def.key)).length,
        change: { [f.def.key]: null },
      }));
    if (toks.length > 0) options.push({ label: `Search: ${q.trim()}`, count: videos.filter((v) => passes(v, defs, selection, [])).length, change: { q: null } });
    const best = options.reduce<(typeof options)[number] | null>((top, o) => (o.count > (top?.count ?? 0) ? o : top), null);
    return best;
  }, [filtered.length, videos, facets, defs, selection, toks, q]);

  const toggleBrand = (brand: string) => setList('brand')(brands.includes(brand) ? brands.filter((b) => b !== brand) : [...brands, brand]);

  const index = filtered.findIndex((v) => v.id === openId);
  const openVideo = index >= 0 ? filtered[index] : videos.find((v) => v.id === openId);
  const prev = index > 0 ? filtered[index - 1] : undefined;
  const next = index >= 0 ? filtered[index + 1] : undefined;
  const show = (id: string | null) => update({ v: id });

  // Anything that moves a tile changes this; opening a video does not. Tiles only measure when it changes.
  const signature = `${filtered.map((v) => v.id).join()}|${chips.length}`;
  const animate = filtered.length <= ANIMATE_MAX;

  const n = filtered.length;
  const fill = [4, 3, 2].map((cols) => (cols - (n % cols)) % cols);
  const ready = !isPending && !isError;

  // ---- Two full rows, then more. The columns are the grid's own (measured, so they follow the CSS at every width and on resize). Any change of the
  // filters, the sort or the search goes back to two rows; opening a video does not.
  const [cols, setCols] = useState(guessCols);
  useLayoutEffect(() => {
    const el = grid.current;
    const measure = () => {
      const next = el ? getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length : guessCols();
      if (next > 0) setCols(next);
    };
    measure();
    const ro = el ? new ResizeObserver(measure) : null;
    if (el) ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ready]);

  const viewKey = useMemo(() => {
    const p = new URLSearchParams(paramsKey);
    p.delete('v');
    p.sort();
    return p.toString();
  }, [paramsKey]);
  const [reveal, setReveal] = useState<Reveal>(() => {
    const saved = savedReveal();
    return saved?.key === viewKey ? saved : { key: viewKey, rows: FIRST_ROWS, said: '' };
  });
  const current = reveal.key === viewKey;
  const rows = current ? reveal.rows : FIRST_ROWS;
  const shown = Math.min(n, rows * cols);
  const left = n - shown;
  const revealSaid = current ? reveal.said : '';

  // Kept in the history entry (the router's own replace drops it, so it is written again after each one).
  useEffect(() => {
    try {
      const state = (window.history.state ?? {}) as Record<string, unknown>;
      const had = state[HISTORY_ROWS] as Partial<Reveal> | undefined;
      if (had?.key === viewKey && had.rows === rows && state[HISTORY_SEED] === ownSeed) return;
      window.history.replaceState({ ...state, [HISTORY_ROWS]: { key: viewKey, rows }, [HISTORY_SEED]: ownSeed }, '');
    } catch {
      // No history state: Back simply shows two rows (in a new order).
    }
  }, [viewKey, rows, paramsKey, ownSeed]);

  const moreRef = useRef<HTMLDivElement>(null);
  const focusFrom = useRef<number | null>(null);
  const more = (focus: boolean) => {
    if (left <= 0) return;
    // Loading on its own while the button has the focus (a keyboard visitor tabbed to it, which scrolled it near) hands the focus on too.
    if (focus || moreRef.current?.contains(document.activeElement)) focusFrom.current = shown;
    const nextRows = rows + MORE_ROWS;
    const nextShown = Math.min(n, nextRows * cols);
    setReveal({ key: viewKey, rows: nextRows, said: `Showing ${nextShown} of ${n} ${videoWord(n)}` });
  };
  const moreLatest = useRef(more);
  moreLatest.current = more;

  // "View more" hands the focus to the first new tile, where the button was.
  useLayoutEffect(() => {
    const from = focusFrom.current;
    if (from === null) return;
    focusFrom.current = null;
    const cell = grid.current?.querySelectorAll<HTMLElement>(':scope > .lib-cell')[from];
    cell?.querySelector<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')?.focus();
  }, [shown]);

  // The next rows load as the end of the grid nears the screen, once the visitor has scrolled (a tall screen never opens on more than two rows).
  // Armed by a scroll down after the last filter change: a filter that shortens the page (the browser pulling the page up) or the page as it opens
  // never loads more by itself, so every new set of filters starts on its two rows.
  const [armedFor, setArmedFor] = useState<string | null>(null);
  const scrolled = armedFor === viewKey;
  // New filters start over: two rows, and not armed (set while rendering, the way React keeps state in step with a changed prop).
  if (reveal.key !== viewKey) {
    setReveal({ key: viewKey, rows: FIRST_ROWS, said: '' });
    setArmedFor(null);
  }
  useEffect(() => {
    if (scrolled) return;
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      if (y > last + 4) setArmedFor(viewKey);
      last = y;
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [scrolled, viewKey]);
  useEffect(() => {
    const el = moreRef.current;
    if (!scrolled || !el || left <= 0) return;
    // A fresh observer after every reveal reports at once, so a fast scroll that is still near the end keeps loading.
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && moreLatest.current(false), { rootMargin: MORE_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, [scrolled, shown, left > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // A video beyond the shown rows (a deep link, or the player's next) brings its row in, so closing the player lands on its tile.
  useEffect(() => {
    if (index < shown) return;
    const need = Math.ceil((index + 1) / cols);
    setReveal((r) => ({ key: viewKey, rows: Math.max(need, r.key === viewKey ? r.rows : FIRST_ROWS), said: '' }));
  }, [index, shown, cols, viewKey]);

  // The count is announced once the visitor pauses, not on every key.
  const [said, setSaid] = useState<number | null>(null);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setSaid(n), 900);
    return () => window.clearTimeout(t);
  }, [n, ready]);

  // The ring: the brand facet's options in its order, at most RING_BRANDS (the ones with the most videos), each named with the count it would leave.
  const ringBrands = useMemo(() => {
    if (!brandFacet?.show) return [];
    // A search or filter that leaves no brand at all keeps the whole set: the ring never leaves a hole in the header.
    const all = brandFacet.options.length > 0 ? brandFacet.options.map((o) => o.value) : brandFacet.def.options.map((o) => o.value);
    if (all.length <= RING_BRANDS) return all;
    const total = new Map<string, number>();
    for (const v of videos) total.set(v.brand, (total.get(v.brand) ?? 0) + 1);
    const top = new Set([...all].sort((x, y) => (total.get(y) ?? 0) - (total.get(x) ?? 0)).slice(0, RING_BRANDS));
    return all.filter((b) => top.has(b));
  }, [brandFacet, videos]);
  const ringCounts = useMemo(() => new Map((brandFacet?.options ?? []).map((o) => [o.value, o.count] as const)), [brandFacet]);

  return (
    <>
      <Seo title="Video library" description="Watch Kreators.Army vox pop street interviews made for real brands. Filter by brand and reach, then play any video or open it where it was posted." />

      <header className="lib-head">
        <div className="ground" aria-hidden />
        <LibraryIntro />
        <div className="lib-ring-wrap" data-ready={ready ? '' : undefined} data-none={isError || (ready && ringBrands.length === 0) ? '' : undefined}>
          {ready && ringBrands.length > 0 && <BrandRing brands={ringBrands} counts={ringCounts} videos={videos} selected={brands} onToggle={toggleBrand} paused={Boolean(openVideo)} />}
        </div>
      </header>

      <section className="wrap lib-body" aria-label="Videos">
        <FilterBar
          facets={ready ? barFacets : []}
          onFacet={(key, values) => setList(key)(values)}
          sorts={sorts}
          sort={sort}
          // Shuffled from the menu goes back to this visit's order (the default, a clean address); the Shuffle button deals a new, shareable one.
          onSort={(value) => value !== sort && update(value === 'shuffle' ? { sort: null, seed: null } : { sort: value, seed: null })}
          onShuffle={() => update({ sort: 'shuffle', seed: newShuffleSeed() })}
          q={q}
          onSearch={onSearch}
          suggestions={ready ? suggestions : []}
          onPick={onPick}
          count={n}
          ready={ready}
        />

        {ready && (
          <div className="lib-status">
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {said === null ? '' : `${said} ${videoWord(said)}`}
            </p>
            <p className="lib-count-line" aria-hidden>
              <RollNumber value={n} countUp={false} /> {videoWord(n)}
            </p>
            <LayoutGroup id="lib-chips">
              <AnimatePresence initial={false} mode="popLayout">
                {chips.map((f) => (
                  <m.button key={f.key + f.value} type="button" className="lib-chip" layout="position" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring.snappy} onClick={() => setList(f.key)(f.values.filter((v) => v !== f.value))} aria-label={`Remove filter ${f.label}`}>
                    {f.label}
                    <X className="size-3.5" aria-hidden />
                  </m.button>
                ))}
                {hasFilters && (
                  <m.button key="__clear" type="button" className="lib-clear" layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring.snappy} onClick={clear}>
                    Clear all
                  </m.button>
                )}
              </AnimatePresence>
            </LayoutGroup>
          </div>
        )}

        {isError ? (
          <LibraryError onRetry={() => void refetch()} />
        ) : isPending ? (
          <LoadingGrid cols={cols} />
        ) : (
          <>
            <LayoutGroup id="lib-grid">
              <div ref={grid} className="lib-grid">
                {animate ? (
                  <AnimatePresence initial={false} mode="popLayout" onExitComplete={exitsDone}>
                    {filtered.slice(0, shown).map((v, i) => (
                      <m.div key={v.id} className="lib-cell" layout="position" layoutDependency={signature} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={spring.snappy}>
                        <VideoTile video={v} eager={i < 4} onOpen={(video) => show(video.id)} sticker date />
                      </m.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  filtered.slice(0, shown).map((v, i) => (
                    <div key={v.id} className="lib-cell">
                      <VideoTile video={v} eager={i < 4} onOpen={(video) => show(video.id)} sticker date />
                    </div>
                  ))
                )}
                {n > 0 && left === 0 && <LibraryEnd fill={fill} videos={filtered.slice(0, 3)} />}
              </div>
            </LayoutGroup>
            {left > 0 && (
              <div ref={moreRef} className="lib-more">
                <Cta kind="ghost" className="lib-more-btn" onClick={() => more(true)}>
                  View more<span aria-hidden> · </span>
                  {left} left
                </Cta>
              </div>
            )}
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {revealSaid}
            </p>
            <AnimatePresence mode="popLayout">
              {n === 0 && (
                <LibraryEmpty
                  key="empty"
                  onClear={clear}
                  hasFilters={hasFilters}
                  fix={
                    fix && {
                      label: fix.label,
                      count: fix.count,
                      apply: () => {
                        if ('q' in fix.change) setQ('');
                        update(fix.change);
                      },
                    }
                  }
                />
              )}
            </AnimatePresence>
          </>
        )}
      </section>

      <AnimatePresence>
        {openVideo && (
          <VideoPlayerDialog
            key="player"
            video={openVideo}
            position={index >= 0 && filtered.length > 1 ? { index, total: filtered.length } : undefined}
            upNext={index >= 0 ? filtered.slice(index + 1, index + 4).map((v) => ({ video: v, onSelect: () => show(v.id) })) : undefined}
            onClose={() => show(null)}
            onPrev={prev && (() => show(prev.id))}
            onNext={next && (() => show(next.id))}
          />
        )}
      </AnimatePresence>
    </>
  );
}
