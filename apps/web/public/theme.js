// Runs before first paint, so a saved or system dark theme never flashes light and the still state is set before any CSS animation starts. Lives in a file because the CSP forbids inline scripts.
(function () {
  var root = document.documentElement;
  var theme, still;
  try {
    theme = localStorage.getItem('kreators-theme');
    still = localStorage.getItem('kreators-still');
  } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.theme = theme;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0b0d' : '#f7f5f2');

  // One attribute for CSS: the visitor's Pause animations choice, or the OS asking for reduced motion.
  if (still === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches) root.dataset.still = '';

  // Reveal may hide content only once script has actually run.
  root.dataset.js = '';

  // iOS needs a touchstart listener before it will run :active. The CSP blocks the usual inline attribute.
  document.addEventListener('touchstart', function () {}, { passive: true });

  // The hero poster is the largest thing on the home page: start it now, before the bundle arrives.
  if (location.pathname === '/') {
    var poster = document.createElement('link');
    poster.rel = 'preload';
    poster.as = 'image';
    poster.href = '/media/fyndflow.jpg';
    poster.setAttribute('fetchpriority', 'high');
    document.head.appendChild(poster);
  }
})();
