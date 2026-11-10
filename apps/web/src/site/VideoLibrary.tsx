import type { Video } from '@kreators/shared';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { AnimatePresence, LayoutGroup, m } from 'motion/react';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Character, type CharacterHandle } from '../cast';
import { CastBubble, useCastLine } from '../components/chat';
import { Coverflow, DeckCard, StoryRing, useSeenBrands } from '../components/frames';
import { ChipRail } from '../components/tabs';
import { Cta, RollNumber, Seo } from '../components/ui';
import { TileSkeletons, VideoPlayerDialog, VideoTile } from '../components/video';
import { PRIMARY_ACTION, brandLogo, contactHref } from '../lib/content';
import { motionOk } from '../lib/motionOk';
import { useVideos } from '../lib/queries';
import { spring } from '../lib/spring';
import { chipLabel, facetDefs, facets as facetsOf, passes, sortVideos, sortsFor, suggest, tokens, withoutWordsOf, type Facet, type SortDef, type Suggestion } from '../lib/videoFind';

// The video library (V2-SPEC 5.7, content §3.6, visual §2.6). The brands are story rings (M6): a ring is a filter, set in the address, and turns grey
// once a video of that brand has been opened. The glass bar holds the count, the search (with suggestions) and the sort on top, and below them the chip
// rails. Featured videos get a coverflow while some, not all, are featured. The finding rules (facets, sorts, search) live in lib/videoFind.ts.
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
//   sort      new, old, views, least, brand, short, long (none: our picks; new and old only with dates, short and long only with lengths)
//   v         the open video (the player)
// Within a key the values are OR'd, across keys AND'd. Every count in the bar is the number a chip would leave, given the other filters.

/** The address keys that change which tiles show. */
const FILTER_KEYS = ['brand', 'date', 'shape', 'category', 'platform', 'reach', 'posted', 'q'];

/** Tiles animate their swap on a filter change only while this many or fewer are in play (M5h). */
const ANIMATE_MAX = 24;
/** At most this many in the featured row. */
const FEATURED_MAX = 7;

const PHONE = '(max-width: 734px)';
const subscribePhone = (fn: () => void) => {
  const mq = matchMedia(PHONE);
  mq.addEventListener('change', fn);
  return () => mq.removeEventListener('change', fn);
};
const useIsPhone = () => useSyncExternalStore(subscribePhone, () => matchMedia(PHONE).matches, () => false);

const videoWord = (n: number) => (n === 1 ? 'video' : 'videos');

// ---------- The brand rings ----------

function BrandRings({ brands, selected, onToggle }: { brands: string[]; selected: string[]; onToggle: (brand: string) => void }) {
  const seen = useSeenBrands();
  return (
    <div className="lib-rings" role="group" aria-label="Brands">
      {brands.map((b) => (
        <StoryRing key={b} brand={b} logo={brandLogo(b)} seen={seen.has(b)} selected={selected.includes(b)} onSelect={() => onToggle(b)} />
      ))}
      <StoryRing
        brand="Your brand"
        dashed
        to={contactHref()}
        caption={
          <>
            Your brand<span className="sr-only">: {PRIMARY_ACTION.label}</span>
          </>
        }
      />
    </div>
  );
}

// ---------- The sort menu: a button and an opaque popover of radios, the current one checked ----------

function SortMenu({ sorts, value, onChange }: { sorts: SortDef[]; value: string; onChange: (next: string) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const viaKeys = useRef(false);

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

  // Opened from the keyboard, focus goes to the checked option.
  useLayoutEffect(() => {
    if (!open || !viaKeys.current) return;
    viaKeys.current = false;
    pop.current?.querySelector<HTMLElement>('[aria-checked="true"], [role="menuitemradio"]')?.focus();
  }, [open]);

  const label = sorts.find((s) => s.value === value)?.label ?? sorts[0]?.label;
  const items = () => [...(pop.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])];
  const onMenuKey = (e: ReactKeyboardEvent) => {
    const list = items();
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
    <div ref={root} className="lib-sort-wrap">
      <button
        ref={button}
        type="button"
        className="lib-btn lib-sort"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          viaKeys.current = e.detail === 0;
          setOpen((o) => !o);
        }}
      >
        <span className="lib-sort-label">
          <span className="sr-only">Sort: </span>
          {label}
        </span>
        <ChevronDown className="lib-chev size-4" aria-hidden />
      </button>
      {open && (
        <div ref={pop} className="lib-pop lib-sort-pop" role="menu" aria-label="Sort" onKeyDown={onMenuKey}>
          {sorts.map((s) => {
            const on = s.value === value;
            return (
              <button
                key={s.value}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                className="lib-opt"
                onClick={() => {
                  onChange(s.value);
                  setOpen(false);
                  button.current?.focus();
                }}
              >
                <span className="lib-opt-label">{s.label}</span>
                <Check className="lib-opt-check size-4" aria-hidden />
              </button>
            );
          })}
        </div>
      )}
    </div>
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

// ---------- The bar: glass over the tiles; the count, the search and the sort, then the chip rails as one sideways strip ----------

interface BarProps {
  facets: Facet[];
  onFacet: (key: string, next: string[]) => void;
  sorts: SortDef[];
  sort: string;
  onSort: (next: string) => void;
  q: string;
  onSearch: (next: string) => void;
  suggestions: Suggestion[];
  onPick: (s: Suggestion) => void;
  count: number;
  ready: boolean;
}

function FilterBar({ facets, onFacet, sorts, sort, onSort, q, onSearch, suggestions, onPick, count, ready }: BarProps) {
  const phone = useIsPhone();
  return (
    <div className="lib-bar glass">
      <div className="lib-bar-top">
        <p className="lib-count" aria-hidden>
          {ready ? (
            <>
              <RollNumber value={count} countUp={false} /> <span>{videoWord(count)}</span>
            </>
          ) : (
            ' '
          )}
        </p>
        <SearchBox q={q} onSearch={onSearch} suggestions={suggestions} onPick={onPick} />
        <SortMenu sorts={sorts} value={sort} onChange={onSort} />
      </div>

      {facets.length > 0 && (
        <div className="lib-facets">
          {facets.map((f) => (
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

/** Plain skeletons first, so a fast load shows nothing else. After 400 ms Gola holds the first tile and claps until the videos arrive. No bubble. */
function LoadingGrid() {
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
          <TileSkeletons count={7} />
        </>
      ) : (
        <TileSkeletons count={8} />
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
  const sortParam = params.get('sort') ?? 'featured';
  const sort = sorts.some((s) => s.value === sortParam) ? sortParam : 'featured';

  const facets = useMemo(() => facetsOf(videos, defs, selection, toks), [videos, defs, selection, toks]);
  const filtered = useMemo(() => sortVideos(videos.filter((v) => passes(v, defs, selection, toks)), sort), [videos, defs, selection, toks, sort]);
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

  // Featured (M14): only while some, not all, are featured, and only on the unfiltered library, where "our picks" means something.
  const featured = videos.filter((v) => v.featured);
  const showFeatured = !hasFilters && featured.length >= 1 && featured.length < videos.length;

  // Anything that moves a tile changes this; opening a video does not. Tiles only measure when it changes.
  const signature = `${filtered.map((v) => v.id).join()}|${chips.length}`;
  const animate = filtered.length <= ANIMATE_MAX;

  const n = filtered.length;
  const fill = [4, 3, 2].map((cols) => (cols - (n % cols)) % cols);
  const ready = !isPending && !isError;

  // The count is announced once the visitor pauses, not on every key.
  const [said, setSaid] = useState<number | null>(null);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setSaid(n), 900);
    return () => window.clearTimeout(t);
  }, [n, ready]);

  const ringBrands = brandFacet?.show ? brandFacet.options.map((o) => o.value) : [];

  return (
    <>
      <Seo title="Video library" description="Watch Kreators.Army vox pop street interviews. Filter by brand and reach." />

      <header className="lib-head">
        <div className="ground" aria-hidden />
        <div className="wrap lib-head-in">
          <div className="lib-head-copy">
            <p className="eyebrow">Video library</p>
            <h1 className="display">
              Watch the <span className="g-word">work</span>
            </h1>
            <p className="lead">Real street interviews for real brands. Play any video here, or open it where it was posted.</p>
          </div>
          <div className="lib-rings-wrap" data-ready={ready ? '' : undefined}>
            {ready && ringBrands.length > 0 && <BrandRings brands={ringBrands} selected={brands} onToggle={toggleBrand} />}
          </div>
        </div>
      </header>

      <section className="wrap lib-body" aria-label="Videos">
        <FilterBar
          facets={ready ? barFacets : []}
          onFacet={(key, values) => setList(key)(values)}
          sorts={sorts}
          sort={sort}
          onSort={(value) => update({ sort: value === 'featured' ? null : value })}
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

        {ready && showFeatured && (
          <div className="lib-featured">
            <Coverflow videos={featured.slice(0, FEATURED_MAX)} onOpen={(video) => show(video.id)} label="Featured videos" />
          </div>
        )}

        {isError ? (
          <LibraryError onRetry={() => void refetch()} />
        ) : isPending ? (
          <LoadingGrid />
        ) : (
          <>
            <LayoutGroup id="lib-grid">
              <div ref={grid} className="lib-grid">
                {animate ? (
                  <AnimatePresence initial={false} mode="popLayout" onExitComplete={exitsDone}>
                    {filtered.map((v, i) => (
                      <m.div key={v.id} className="lib-cell" layout="position" layoutDependency={signature} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={spring.snappy}>
                        <VideoTile video={v} eager={i < 4} onOpen={(video) => show(video.id)} sticker date />
                      </m.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  filtered.map((v, i) => (
                    <div key={v.id} className="lib-cell">
                      <VideoTile video={v} eager={i < 4} onOpen={(video) => show(video.id)} sticker date />
                    </div>
                  ))
                )}
                {n > 0 && <LibraryEnd fill={fill} videos={filtered.slice(0, 3)} />}
              </div>
            </LayoutGroup>
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
