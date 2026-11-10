import type { Video } from '@kreators/shared';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { AnimatePresence, LayoutGroup, m } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Character, type CharacterHandle } from '../cast';
import { CastBubble, useCastLine } from '../components/chat';
import { Coverflow, DeckCard, StoryRing, useSeenBrands } from '../components/frames';
import { ChipRail, type ChipOption } from '../components/tabs';
import { Cta, RollNumber, Seo } from '../components/ui';
import { TileSkeletons, VideoPlayerDialog, VideoTile } from '../components/video';
import { PRIMARY_ACTION, brandLogo, contactHref } from '../lib/content';
import { motionOk } from '../lib/motionOk';
import { useVideos } from '../lib/queries';
import { spring } from '../lib/spring';

// The video library (V2-SPEC 5.7, content §3.6, visual §2.6). The brands are story rings (M6): a ring is a filter, set in the address, and turns grey
// once a video of that brand has been opened. The glass bar holds the chip rails for Category, Platform, Reach and Posted on (each only when some video
// has a value), the sort menu and the search. Featured videos get a coverflow while some, not all, are featured. Every filter lives in the address with
// `replace` and no scroll jump; `?v=<id>` opens the player.

const REACH = [
  { value: '1m', label: '1M+ views', match: (v: Video) => v.views >= 1_000_000 },
  { value: '100k', label: '100K+ views', match: (v: Video) => v.views >= 100_000 },
  { value: 'under', label: 'Under 100K views', match: (v: Video) => v.views < 100_000 },
];

const POSTED = [
  { value: 'instagram', label: 'Instagram', match: (v: Video) => Boolean(v.links.instagram) },
  { value: 'youtube', label: 'YouTube', match: (v: Video) => Boolean(v.links.youtube) },
];

const SORTS = [
  { value: 'featured', label: 'Our picks' },
  { value: 'views', label: 'Most viewed' },
  { value: 'least', label: 'Least viewed' },
  { value: 'brand', label: 'Brand A to Z' },
];

/** The address keys that change which tiles show. */
const FILTER_KEYS = ['brand', 'category', 'platform', 'reach', 'posted', 'q'];

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

interface Group {
  key: string;
  label: string;
  options: ChipOption[];
  selected: string[];
  set: (next: string[]) => void;
}

function facet(videos: Video[], key: 'category' | 'platform'): ChipOption[] {
  const counts = new Map<string, number>();
  for (const v of videos) {
    const value = v[key];
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ value, label: value, count }));
}

/** Brands in the order the library lists them (the founder's order), each once. */
function brandsOf(videos: Video[]): string[] {
  const seen = new Set<string>();
  for (const v of videos) if (v.brand) seen.add(v.brand);
  return [...seen];
}

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

// ---------- The sort menu: a button and an opaque popover of four radios, the current one checked ----------

function SortMenu({ value, onChange }: { value: string; onChange: (next: string) => void }) {
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

  const label = SORTS.find((s) => s.value === value)?.label ?? SORTS[0]?.label;
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
          {SORTS.map((s) => {
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

// ---------- The bar: glass over the tiles; chip rails that scroll as one strip, then the search and the sort ----------

function FilterBar({ groups, sort, onSort, q, onSearch, count, ready }: { groups: Group[]; sort: string; onSort: (next: string) => void; q: string; onSearch: (next: string) => void; count: number; ready: boolean }) {
  const phone = useIsPhone();
  return (
    <div className="lib-bar glass">
      <p className="lib-count" aria-hidden>
        {ready ? (
          <>
            <RollNumber value={count} countUp={false} /> <span>{videoWord(count)}</span>
          </>
        ) : (
          ' '
        )}
      </p>

      <div className="lib-facets">
        {groups.map((g) => (
          <div key={g.key} className="lib-facet">
            <span className="lib-facet-label" aria-hidden>
              {g.label}
            </span>
            <ChipRail mode="multi" label={g.label} options={g.options} value={g.selected} onChange={g.set} size={phone ? 'md' : 'sm'} wrap />
          </div>
        ))}
      </div>

      <div className="lib-tools">
        <label className="lib-search">
          <Search className="lib-search-icon size-4" aria-hidden />
          <span className="sr-only">Search videos</span>
          <input id="lib-q" name="q" type="search" placeholder="Search videos" enterKeyHint="search" autoComplete="off" value={q} onChange={(e) => onSearch(e.target.value)} />
          {q && (
            <button type="button" className="lib-search-clear" aria-label="Clear search" onClick={() => onSearch('')}>
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </label>
        <SortMenu value={sort} onChange={onSort} />
      </div>
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

/** No tiles. With filters set, the filters are the reason; with none, the library simply has nothing live yet, and there is nothing to clear. */
function LibraryEmpty({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
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
          <div ref={clearBtn} onPointerEnter={() => tiko.current?.lookAt(clearBtn.current, 1200)}>
            <Cta
              kind="ink"
              onClick={() => {
                tiko.current?.play('hop', { small: true, force: true });
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
  const brands = list('brand');
  const categories = list('category');
  const platforms = list('platform');
  const reach = list('reach');
  const posted = list('posted');
  // The box keeps its own text: the address updates a moment after each key, and a box tied to it would drop fast typing.
  const [q, setQ] = useState(params.get('q') ?? '');
  const sort = params.get('sort') ?? 'featured';
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

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const reachRules = REACH.filter((r) => reach.includes(r.value));
    const postedRules = POSTED.filter((r) => posted.includes(r.value));
    const out = videos.filter(
      (v) =>
        (brands.length === 0 || brands.includes(v.brand)) &&
        (categories.length === 0 || (v.category !== null && categories.includes(v.category))) &&
        (platforms.length === 0 || (v.platform !== null && platforms.includes(v.platform))) &&
        (reachRules.length === 0 || reachRules.some((r) => r.match(v))) &&
        (postedRules.length === 0 || postedRules.some((r) => r.match(v))) &&
        (!needle || [v.title, v.brand, v.category, v.platform].some((s) => s?.toLowerCase().includes(needle))),
    );
    if (sort === 'views') out.sort((a, b) => b.views - a.views);
    if (sort === 'least') out.sort((a, b) => a.views - b.views);
    if (sort === 'brand') out.sort((a, b) => a.brand.localeCompare(b.brand));
    return out;
    // The lists are rebuilt from the address on every render; the address itself is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos, params, q]);

  const chips = [
    ...brands.map((value) => ({ key: 'brand', value, label: value, values: brands })),
    ...categories.map((value) => ({ key: 'category', value, label: value, values: categories })),
    ...platforms.map((value) => ({ key: 'platform', value, label: value, values: platforms })),
    ...reach.map((value) => ({ key: 'reach', value, label: REACH.find((r) => r.value === value)?.label ?? value, values: reach })),
    ...posted.map((value) => ({ key: 'posted', value, label: `Posted on ${POSTED.find((r) => r.value === value)?.label ?? value}`, values: posted })),
  ];
  const hasFilters = chips.length > 0 || q !== '';
  const clear = () => {
    setQ('');
    update({ brand: null, category: null, platform: null, reach: null, posted: null, q: null });
  };

  const onSearch = (next: string) => {
    setQ(next);
    update({ q: next || null });
  };

  const count = (match: (v: Video) => boolean) => videos.filter(match).length;
  const groups: Group[] = [
    { key: 'category', label: 'Category', options: facet(videos, 'category'), selected: categories, set: setList('category') },
    { key: 'platform', label: 'Platform', options: facet(videos, 'platform'), selected: platforms, set: setList('platform') },
    {
      key: 'reach',
      label: 'Reach',
      options: videos.length ? REACH.filter((r) => count(r.match) > 0).map((r) => ({ value: r.value, label: r.label, count: count(r.match) })) : [],
      selected: reach,
      set: setList('reach'),
    },
    {
      key: 'posted',
      label: 'Posted on',
      options: POSTED.filter((r) => count(r.match) > 0).map((r) => ({ value: r.value, label: r.label, count: count(r.match) })),
      selected: posted,
      set: setList('posted'),
    },
  ].filter((g) => g.options.length > 0);

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
  const brandList = brandsOf(videos);

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
            {ready && brandList.length > 0 && <BrandRings brands={brandList} selected={brands} onToggle={toggleBrand} />}
          </div>
        </div>
      </header>

      <section className="wrap lib-body" aria-label="Videos">
        <FilterBar groups={groups} sort={sort} onSort={(value) => update({ sort: value === 'featured' ? null : value })} q={q} onSearch={onSearch} count={n} ready={ready} />

        {ready && (
          <div className="lib-status">
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {n} {videoWord(n)}
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
                        <VideoTile video={v} eager={i < 4} onOpen={(video) => show(video.id)} sticker />
                      </m.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  filtered.map((v, i) => (
                    <div key={v.id} className="lib-cell">
                      <VideoTile video={v} eager={i < 4} onOpen={(video) => show(video.id)} sticker />
                    </div>
                  ))
                )}
                {n > 0 && <LibraryEnd fill={fill} videos={filtered.slice(0, 3)} />}
              </div>
            </LayoutGroup>
            <AnimatePresence mode="popLayout">{n === 0 && <LibraryEmpty key="empty" onClear={clear} hasFilters={hasFilters} />}</AnimatePresence>
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
