// (r20admbtn) The admin's label flip. The public primary carries a second, ink copy of its label (components/ui.tsx ActionLit) that styles/buttons.css
// clips to the same growing circle as the yellow fill, so the label changes colour exactly at the fill's edge. The admin's intent buttons need the same
// for their fills: a solid green save floods a fresh light green (the label turns deep green where it has reached), and a quiet danger button floods
// red (the label turns white). Their labels are many shapes (icons, short and long words, spinners, a rolling "Saved"), so instead of a copy in each
// component, this keeps one aria-hidden copy of each such button's content in a .btn-lit span, rebuilt whenever the content changes.
//
// The copy changes nothing a reader or a test sees: it is aria-hidden and inert, its words are drawn from data-label by CSS (so the button's
// textContent and accessible name stay as they were), and ids are left off (the inner data-* stay: they are style hooks, as the "Saved" roll's). It
// is appended after the label, so a query finds the real element first. It exists before the first hover, so the fill's circle grows from 0 (a copy
// made on hover would start full).

/** The buttons with a label flip: every danger button (quiet until its red floods in) and every solid positive or danger one. */
const LIT = ':is(.adm, .adm-lock) .btn:is([data-intent="danger"], [data-intent="positive"][data-fill])';

const sources = (el: Element) => [...el.childNodes].filter((n) => !(n instanceof HTMLElement && n.classList.contains('btn-lit')));

function copyOf(node: Node, top: boolean): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    // Bare words in the button are flex items, trimmed by layout; inside an element a space is kept as it is.
    if (!text.trim()) return top ? null : document.createTextNode(text);
    const span = document.createElement('span');
    span.dataset.label = top ? text.trim() : text;
    return span;
  }
  if (!(node instanceof Element)) return null;
  if (node instanceof SVGElement) {
    const svg = node.cloneNode(true) as SVGElement;
    svg.removeAttribute('id');
    return svg;
  }
  const el = node.cloneNode(false) as Element;
  el.removeAttribute('id');
  for (const child of node.childNodes) {
    const c = copyOf(child, false);
    if (c) el.appendChild(c);
  }
  return el;
}

const signature = (el: Element) => sources(el).map((n) => (n instanceof Element ? n.outerHTML : n.textContent)).join('');
const seen = new WeakMap<Element, string>();

function sync() {
  frame = 0;
  for (const old of document.querySelectorAll<HTMLElement>('.adm .btn > .btn-lit, .adm-lock .btn > .btn-lit')) {
    if (!old.parentElement?.matches(LIT)) {
      seen.delete(old.parentElement!);
      old.remove();
    }
  }
  for (const btn of document.querySelectorAll<HTMLElement>(LIT)) {
    const sig = signature(btn);
    let lit = btn.querySelector<HTMLElement>(':scope > .btn-lit');
    if (lit && seen.get(btn) === sig) {
      // React may have added a node after it: the copy stays last, over the label.
      if (btn.lastElementChild !== lit) btn.appendChild(lit);
      continue;
    }
    seen.set(btn, sig);
    const next = document.createElement('span');
    next.className = 'btn-lit';
    next.setAttribute('aria-hidden', 'true');
    next.inert = true;
    for (const n of sources(btn)) {
      const c = copyOf(n, true);
      if (c) next.appendChild(c);
    }
    if (lit) lit.replaceWith(next);
    else btn.appendChild(next);
    lit = next;
  }
}

let frame = 0;
let observer: MutationObserver | null = null;

/** Starts keeping the copies (once); returns a stop for the admin's unmount. */
export function installLitLabels() {
  if (observer || typeof document === 'undefined') return () => {};
  observer = new MutationObserver((records) => {
    // Its own copies' changes need nothing.
    if (records.every((r) => (r.target instanceof Element ? r.target : r.target.parentElement)?.closest('.btn-lit'))) return;
    if (!frame) frame = requestAnimationFrame(sync);
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-intent', 'data-fill', 'class'] });
  sync();
  return () => {
    observer?.disconnect();
    observer = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    for (const lit of document.querySelectorAll('.adm .btn > .btn-lit, .adm-lock .btn > .btn-lit')) lit.remove();
  };
}
