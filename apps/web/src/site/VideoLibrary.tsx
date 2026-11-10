import { videoPoster, type Video } from '@kreators/shared';
import { ArrowUpRight, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, LayoutGroup, m } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Character, type CharacterHandle } from '../cast';
import { Cta, RollNumber, Seo, Tile, TileBody } from '../components/ui';
import { TileSkeletons, VideoPlayerDialog, VideoTile } from '../components/video';
import { CLOSING, PRIMARY_ACTION, contactHref } from '../lib/content';
import { motionOk } from '../lib/motionOk';
import { useVideos } from '../lib/queries';
import { spring } from '../lib/spring';

const REACH = [
  { value: '1m', label: '1M+ views', match: (v: Video) => v.views >= 1_000_000 },
  { value: '100k', label: '100K+ views', match: (v: Video) => v.views >= 100_000 },
  { value: 'under', label: 'Under 100K views', match: (v: Video) => v.views < 100_000 },
];

const SORTS = [
  { value: 'featured', label: 'Our picks' },
  { value: 'views', label: 'Most viewed' },
  { value: 'least', label: 'Least viewed' },
  { value: 'brand', label: 'Brand A to Z' },
];

type FacetKey = 'brand' | 'category' | 'platform';

interface Option {
  value: string;
  label: string;
  count?: number;
}

interface Group {
  key: string;
  label: string;
  options: Option[];
  selected: string[];
  set: (next: string[]) => void;
}

function facet(videos: Video[], key: FacetKey): Option[] {
  const counts = new Map<string, number>();
  for (const v of videos) {
    const value = v[key];
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ value, label: value, count }));
}

const toggled = (list: string[], value: string, on: boolean) => (on ? [...list, value] : list.filter((v) => v !== value));

const videoWord = (n: number) => (n === 1 ? 'video' : 'videos');

/** The one popover the bar shows at a time; its trigger points at it while open. */
const POP_ID = 'lib-pop';

/** The address keys that change which tiles show. */
const FILTER_KEYS = ['brand', 'category', 'platform', 'reach', 'q'];

// ---------- The bar: glass over the tiles, popovers opaque. Desktop gets a menu per filter; a phone gets one panel, one tap from anything. ----------

function FilterRows({ group, name }: { group: Group; name: string }) {
  return (
    <div role="group" aria-label={group.label}>
      {group.options.map((o) => (
        <label key={o.value} className="lib-opt">
          <input type="checkbox" name={name} checked={group.selected.includes(o.value)} onChange={(e) => group.set(toggled(group.selected, o.value, e.target.checked))} />
          <span className="lib-opt-label">{o.label}</span>
          {o.count !== undefined && <span className="lib-opt-count">{o.count}</span>}
        </label>
      ))}
    </div>
  );
}

function SortRows({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Sort">
      {SORTS.map((s) => (
        <label key={s.value} className="lib-opt">
          <input type="radio" name="lib-sort" checked={s.value === value} onChange={() => onChange(s.value)} />
          <span className="lib-opt-label">{s.label}</span>
        </label>
      ))}
    </div>
  );
}

function PanelTags({ group }: { group: Group }) {
  return (
    <div className="lib-tags" role="group" aria-label={group.label}>
      {group.options.map((o) => {
        const on = group.selected.includes(o.value);
        return (
          <button key={o.value} type="button" className="lib-tag" aria-pressed={on} onClick={() => group.set(toggled(group.selected, o.value, !on))}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterBar({
  groups,
  sort,
  onSort,
  q,
  onSearch,
  count,
  ready,
  active,
  onClear,
}: {
  groups: Group[];
  sort: string;
  onSort: (next: string) => void;
  q: string;
  onSearch: (next: string) => void;
  count: number;
  ready: boolean;
  active: number;
  onClear: () => void;
}) {
  const [menu, setMenu] = useState<string | null>(null);
  const [panelMax, setPanelMax] = useState<number | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const popEl = useRef<HTMLDivElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const pop = useRef({ x: 0, origin: 24 });
  const focusFirst = useRef(false);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const trigger = triggers.current.get(menu);
      setMenu(null);
      trigger?.focus();
    };
    // Focus moving anywhere but the popover or its own trigger closes it, so it never stays open behind the control the keyboard is on.
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Node;
      if (!popEl.current?.contains(target) && target !== triggers.current.get(menu)) setMenu(null);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [menu]);

  // Opened from the keyboard, focus goes straight to the first option rather than six Tabs away, past the rest of the bar.
  useLayoutEffect(() => {
    if (!menu || !focusFirst.current) return;
    focusFirst.current = false;
    popEl.current?.querySelector<HTMLElement>('input, button')?.focus();
  }, [menu]);

  // The popover is drawn after the whole bar, so Tab is steered to read as if it sat under its trigger: trigger, its options, then the next control.
  const controls = (root: HTMLElement | null) =>
    [...(root?.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled])') ?? [])].filter((el) => el.getClientRects().length > 0);

  const onTriggerKey = (key: string) => (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab' || e.shiftKey || menu !== key) return;
    const first = controls(popEl.current)[0];
    if (!first) return;
    e.preventDefault();
    first.focus();
  };

  const onPopKey = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab' || !menu) return;
    const inPop = controls(popEl.current);
    const trigger = triggers.current.get(menu);
    if (e.shiftKey && e.target === inPop[0]) {
      e.preventDefault();
      trigger?.focus();
    } else if (!e.shiftKey && e.target === inPop[inPop.length - 1]) {
      const order = controls(bar.current).filter((el) => !popEl.current?.contains(el));
      const next = trigger ? order[order.indexOf(trigger) + 1] : undefined;
      // After the last trigger the browser's own order already leads out of the bar, which closes the popover.
      if (!next) return;
      e.preventDefault();
      setMenu(null);
      next.focus();
    }
  };

  const open = (key: string, e?: ReactMouseEvent) => {
    focusFirst.current = e?.detail === 0;
    if (menu === key) return setMenu(null);
    const box = bar.current?.getBoundingClientRect();
    const trigger = triggers.current.get(key)?.getBoundingClientRect();
    if (box && trigger) {
      const POP_WIDTH = 288;
      const x = Math.max(0, Math.min(trigger.left - box.left, box.width - POP_WIDTH));
      pop.current = { x, origin: trigger.left - box.left - x + 28 };
      setPanelMax(window.innerHeight - box.bottom - 20);
    }
    setMenu(key);
  };

  const buttonRef = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) triggers.current.set(key, el);
    else triggers.current.delete(key);
  };

  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? SORTS[0]?.label;
  const current = groups.find((g) => g.key === menu);
  const popStyle = { '--pop-x': `${pop.current.x}px`, '--pop-origin': `${pop.current.origin}px`, '--panel-max': panelMax ? `${panelMax}px` : undefined } as CSSProperties;

  return (
    <div ref={bar} className="lib-bar glass">
      <p className="lib-count" aria-hidden>
        {ready ? (
          <>
            <RollNumber value={count} countUp={false} /> <span>{videoWord(count)}</span>
          </>
        ) : (
          '\u00A0'
        )}
      </p>

      <div className="lib-menus">
        {groups.map((g) => (
          <button
            key={g.key}
            ref={buttonRef(g.key)}
            type="button"
            className="lib-btn"
            data-on={g.selected.length > 0 ? '' : undefined}
            aria-expanded={menu === g.key}
            aria-controls={menu === g.key ? POP_ID : undefined}
            onClick={(e) => open(g.key, e)}
            onKeyDown={onTriggerKey(g.key)}
          >
            {g.label}
            {g.selected.length > 0 && <span className="lib-badge">{g.selected.length}</span>}
            <ChevronDown className="lib-chev size-4" aria-hidden />
          </button>
        ))}
      </div>

      <div className="lib-tools">
        <label className="lib-search">
          <Search className="lib-search-icon size-4" aria-hidden />
          <span className="sr-only">Search videos</span>
          <input id="lib-q" name="q" type="search" placeholder="Search" enterKeyHint="search" autoComplete="off" value={q} onChange={(e) => onSearch(e.target.value)} />
          {q && (
            <button type="button" className="lib-search-clear" aria-label="Clear search" onClick={() => onSearch('')}>
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </label>
        <button
          ref={buttonRef('sort')}
          type="button"
          className="lib-btn lib-sort"
          aria-expanded={menu === 'sort'}
          aria-controls={menu === 'sort' ? POP_ID : undefined}
          onClick={(e) => open('sort', e)}
          onKeyDown={onTriggerKey('sort')}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          <span>{sortLabel}</span>
        </button>
        <button
          ref={buttonRef('panel')}
          type="button"
          className="lib-btn lib-filters"
          data-on={active > 0 ? '' : undefined}
          aria-expanded={menu === 'panel'}
          aria-controls={menu === 'panel' ? POP_ID : undefined}
          onClick={(e) => open('panel', e)}
          onKeyDown={onTriggerKey('panel')}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
          {active > 0 && <span className="lib-badge">{active}</span>}
        </button>
      </div>

      {current && (
        <div ref={popEl} id={POP_ID} className="lib-pop" style={popStyle} onKeyDown={onPopKey}>
          <FilterRows group={current} name={`lib-${current.key}`} />
        </div>
      )}
      {menu === 'sort' && (
        <div ref={popEl} id={POP_ID} className="lib-pop" style={popStyle} onKeyDown={onPopKey}>
          <SortRows
            value={sort}
            onChange={(v) => {
              onSort(v);
              setMenu(null);
            }}
          />
        </div>
      )}
      {menu === 'panel' && (
        <div ref={popEl} id={POP_ID} className="lib-pop" data-panel="" style={popStyle} onKeyDown={onPopKey}>
          <div className="lib-panel-scroll">
            {groups.map((g) => (
              <section key={g.key} className="lib-panel-group">
                <h3>{g.label}</h3>
                <PanelTags group={g} />
              </section>
            ))}
            <section className="lib-panel-group">
              <h3>Sort</h3>
              <div className="lib-tags" role="radiogroup" aria-label="Sort">
                {SORTS.map((s) => (
                  <button key={s.value} type="button" role="radio" aria-checked={s.value === sort} className="lib-tag" onClick={() => onSort(s.value)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
          <div className="lib-panel-foot">
            {active > 0 && (
              <button type="button" className="lib-clear" onClick={onClear}>
                Clear all
              </button>
            )}
            <button type="button" className="btn btn-ink flex-1" onClick={() => setMenu(null)}>
              Show {count} {videoWord(count)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- States ----------

/** Plain skeletons first, so a fast load shows nothing else. After 400 ms Gola holds the first tile and claps until the videos arrive. */
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

function LibraryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="lib-state frame">
      <Character who="gola" size={150} expression="confused" track={false} />
      <p className="h4">The library could not load.</p>
      <Cta kind="ink" onClick={onRetry}>
        Try again
      </Cta>
    </div>
  );
}

/** No tiles. With filters set, the filters are the reason; with none, the library simply has nothing live yet, and there is nothing to clear. */
function LibraryEmpty({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  const tiko = useRef<CharacterHandle>(null);
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
  }, []);

  return (
    <m.div className="lib-state frame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
      <div ref={stage}>
        <Character ref={tiko} who="tiko" size={180} prop expression="confused" />
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

/** Fills the last row's gap with the one thing worth saying at the end of the work. Whatever fits in the cells left over. */
function LibraryEnd({ fill, posters }: { fill: number[]; posters: string[] }) {
  const [r4, r3, r2] = fill;
  const style = { '--rest-4': r4, '--rest-3': r3, '--rest-2': r2 } as CSSProperties;
  return (
    <div className="lib-end" data-r4={r4} data-r3={r3} data-r2={r2} style={style}>
      <Tile to={contactHref()} className="lib-end-tile" label="Get a Free Trial Video">
        {posters.length > 0 && (
          <div className="lib-end-fan" aria-hidden>
            {posters.map((src) => (
              <img key={src} src={src} alt="" loading="lazy" />
            ))}
          </div>
        )}
        <TileBody className="lib-end-copy">
          <p className="lib-end-title">Want one for your brand?</p>
          <p className="lib-end-lead">{CLOSING.body}</p>
          <span className="btn btn-accent btn-sm lib-end-go" aria-hidden>
            {PRIMARY_ACTION.label}
          </span>
          <span className="lib-end-arrow" aria-hidden>
            <ArrowUpRight className="size-5" />
          </span>
        </TileBody>
      </Tile>
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
  // The box keeps its own text: the address updates a moment after each key, and a box tied to it would drop fast typing.
  const [q, setQ] = useState(params.get('q') ?? '');
  const sort = params.get('sort') ?? 'featured';
  const openId = params.get('v');

  // Exiting tiles leave the flow at once (popLayout), so a filter that shortens the grid would pull the footer up over tiles still landing. The grid keeps its
  // height until the last tile has left and the ones that stay have had time to land, then lets go in one step. A change that removes nothing lets go on the timer.
  const grid = useRef<HTMLDivElement>(null);
  const holdTimer = useRef(0);
  const letGo = () => {
    window.clearTimeout(holdTimer.current);
    if (grid.current) grid.current.style.minHeight = '';
  };
  const SETTLE_MS = 220;
  const exitsDone = () => {
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(letGo, SETTLE_MS);
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
    const out = videos.filter(
      (v) =>
        (brands.length === 0 || brands.includes(v.brand)) &&
        (categories.length === 0 || (v.category !== null && categories.includes(v.category))) &&
        (platforms.length === 0 || (v.platform !== null && platforms.includes(v.platform))) &&
        (reachRules.length === 0 || reachRules.some((r) => r.match(v))) &&
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
  ];
  const hasFilters = chips.length > 0 || q !== '';
  const clear = () => {
    setQ('');
    update({ brand: null, category: null, platform: null, reach: null, q: null });
  };

  const onSearch = (next: string) => {
    setQ(next);
    update({ q: next || null });
  };

  const groups: Group[] = [
    { key: 'brand', label: 'Brand', options: facet(videos, 'brand'), selected: brands, set: setList('brand') },
    { key: 'category', label: 'Category', options: facet(videos, 'category'), selected: categories, set: setList('category') },
    { key: 'platform', label: 'Platform', options: facet(videos, 'platform'), selected: platforms, set: setList('platform') },
    { key: 'reach', label: 'Reach', options: videos.length ? REACH.map((r) => ({ value: r.value, label: r.label, count: videos.filter(r.match).length })) : [], selected: reach, set: setList('reach') },
  ].filter((g) => g.options.length > 0);

  const index = filtered.findIndex((v) => v.id === openId);
  const openVideo = index >= 0 ? filtered[index] : videos.find((v) => v.id === openId);
  const prev = index > 0 ? filtered[index - 1] : undefined;
  const next = index >= 0 ? filtered[index + 1] : undefined;
  const show = (id: string | null) => update({ v: id });

  // Anything that moves a tile changes this; opening a video does not. Tiles only measure when it changes.
  const signature = `${filtered.map((v) => v.id).join()}|${chips.length}`;

  const n = filtered.length;
  const fill = [4, 3, 2].map((cols) => (cols - (n % cols)) % cols);
  const ready = !isPending && !isError;

  return (
    <>
      <Seo title="Video library" description="Watch Kreators.Army vox pop street interviews. Filter by brand and reach." />

      <header className="lib-head">
        <div className="ground" aria-hidden />
        <div className="wrap lib-head-in">
          <div>
            <p className="eyebrow">Video library</p>
            <h1 className="display">
              Watch the <span className="g-word">work</span>
            </h1>
          </div>
          <p className="lead">Short street interviews made for Reels, Shorts and every short-form platform.</p>
        </div>
      </header>

      <section className="wrap lib-body" aria-label="Videos">
        <FilterBar groups={groups} sort={sort} onSort={(value) => update({ sort: value === 'featured' ? null : value })} q={q} onSearch={onSearch} count={n} ready={ready} active={chips.length + (sort !== 'featured' ? 1 : 0)} onClear={clear} />

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

        {isError ? (
          <LibraryError onRetry={() => void refetch()} />
        ) : isPending ? (
          <LoadingGrid />
        ) : (
          <>
            <LayoutGroup id="lib-grid">
              <div ref={grid} className="lib-grid">
                <AnimatePresence initial={false} mode="popLayout" onExitComplete={exitsDone}>
                  {filtered.map((v, i) => (
                    <m.div key={v.id} className="lib-cell" layout="position" layoutDependency={signature} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={spring.snappy}>
                      <VideoTile video={v} eager={i < 4} onOpen={(video) => show(video.id)} />
                    </m.div>
                  ))}
                </AnimatePresence>
                {n > 0 && <LibraryEnd fill={fill} posters={filtered.flatMap((v) => videoPoster(v) ?? []).slice(0, 3)} />}
              </div>
            </LayoutGroup>
            <AnimatePresence mode="popLayout">{n === 0 && <LibraryEmpty key="empty" onClear={clear} hasFilters={hasFilters} />}</AnimatePresence>
          </>
        )}
      </section>

      <AnimatePresence>
        {openVideo && <VideoPlayerDialog key="player" video={openVideo} position={index >= 0 && filtered.length > 1 ? { index, total: filtered.length } : undefined} upNext={index >= 0 ? filtered.slice(index + 1, index + 4).map((v) => ({ video: v, onSelect: () => show(v.id) })) : undefined} onClose={() => show(null)} onPrev={prev && (() => show(prev.id))} onNext={next && (() => show(next.id))} />}
      </AnimatePresence>
    </>
  );
}
