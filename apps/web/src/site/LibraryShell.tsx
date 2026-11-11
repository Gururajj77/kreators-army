// The library's loading shell (main bundle, not the library chunk). While the library's chunk loads, the route shows the same header, the ring's
// reserved place, the bar and two rows of skeleton tiles, so the page is as tall as it will be and the footer never jumps when the chunk lands.
// The header copy lives here once and the library renders it too.

/** The grid first shows this many full rows; the rest come as the visitor nears the end, or with "View more". */
export const FIRST_ROWS = 2;

/** The grid's columns before it can be measured: the same breakpoints as .lib-grid in library.css. */
export function guessCols(): number {
  if (typeof window === 'undefined') return 4;
  if (matchMedia('(max-width: 734px)').matches) return 2;
  if (matchMedia('(max-width: 1068px)').matches) return 3;
  return 4;
}

export function LibraryIntro() {
  return (
    <div className="wrap lib-head-in">
      <div className="lib-head-copy">
        <p className="eyebrow">Video library</p>
        <h1 className="display">
          Watch the <span className="g-word">work</span>
        </h1>
        <p className="lead">Real street interviews for real brands. Play any video here, or open it where it was posted.</p>
      </div>
    </div>
  );
}

export function LibraryShell() {
  return (
    <div className="lib-shell" aria-busy="true">
      <header className="lib-head">
        <div className="ground" aria-hidden />
        <LibraryIntro />
        <div className="lib-ring-wrap" />
      </header>
      <section className="wrap lib-body" aria-label="Videos">
        <div className="lib-bar glass" aria-hidden>
          <div className="lib-bar-top lib-bar-shell" />
        </div>
        <div className="lib-grid">
          <span className="sr-only" role="status">
            Loading videos
          </span>
          {Array.from({ length: FIRST_ROWS * guessCols() }, (_, i) => (
            <div key={i} className="skeleton tile-skeleton" />
          ))}
        </div>
      </section>
    </div>
  );
}
