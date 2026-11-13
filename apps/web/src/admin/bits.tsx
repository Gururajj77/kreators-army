// Owner: A4 Admin. Small pieces every admin screen shares: the modal layer stack (native <dialog> with showModal, so toasts can follow the top one),
// a confirm dialog, the switch with the knob squash (motion M5f), a popover menu, status chips, relative times and the cast's empty states.
import { ChevronDown } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { create } from 'zustand';
import { Character } from '../cast';
import type { CastId } from '../lib/content';

// ---------- The layer stack: every admin <dialog> registers while open ----------

export const useLayers = create<{ stack: HTMLDialogElement[] }>(() => ({ stack: [] }));

function pushLayer(el: HTMLDialogElement) {
  useLayers.setState((s) => ({ stack: [...s.stack.filter((d) => d !== el), el] }));
}

function popLayer(el: HTMLDialogElement) {
  useLayers.setState((s) => ({ stack: s.stack.filter((d) => d !== el) }));
}

/** The topmost open admin dialog, or null. Toasts render inside it, so they stay visible and clickable above a modal. */
export const useTopLayer = () => useLayers((s) => s.stack.at(-1) ?? null);

export type CloseReason = 'esc' | 'backdrop' | 'button';

/**
 * A native modal <dialog>, opened with showModal() in a layout effect (as the site's player is), registered in the layer stack. Esc and a click on the
 * backdrop ask `onClose`, which decides (the drawer's dirty guard can refuse). Under `data-still` the CSS fades instead of sliding.
 */
export function Modal({
  open = true,
  onClose,
  labelledBy,
  label,
  className,
  children,
  backdropCloses = true,
  dialogRef,
}: {
  open?: boolean;
  onClose: (reason: CloseReason) => void;
  labelledBy?: string;
  label?: string;
  className?: string;
  children: ReactNode;
  backdropCloses?: boolean;
  dialogRef?: RefObject<HTMLDialogElement | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !open) return;
    if (!el.open) el.showModal();
    pushLayer(el);
    return () => {
      popLayer(el);
      if (el.open) el.close();
    };
  }, [open]);

  useEffect(() => {
    if (dialogRef) dialogRef.current = ref.current;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      closeRef.current('esc');
    };
    // A click whose target is the dialog itself landed on the backdrop (the content box fills the dialog).
    const onClick = (e: MouseEvent) => {
      if (backdropCloses && e.target === el) closeRef.current('backdrop');
    };
    el.addEventListener('cancel', onCancel);
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('cancel', onCancel);
      el.removeEventListener('click', onClick);
    };
  }, [backdropCloses]);

  if (!open) return null;
  return (
    <dialog ref={ref} className={`adm-modal ${className ?? ''}`} aria-labelledby={labelledBy} aria-label={label}>
      {children}
    </dialog>
  );
}

/** "Delete this video? …" and its kind: a small modal with Cancel and one action. The action is solid red when it destroys something, solid green
 *  otherwise (round 20: the colour says what the button does; `icon` goes left of the label, aria-hidden). */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  danger = false,
  icon,
  busy = false,
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  body?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  /** A lucide icon (size-4, aria-hidden) before the confirm label. */
  icon?: ReactNode;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <Modal onClose={() => !busy && onCancel()} labelledBy={id} className="adm-confirm">
      <div className="adm-confirm-in">
        <h2 id={id} className="adm-confirm-title">
          {title}
        </h2>
        {body && <div className="adm-confirm-body">{body}</div>}
        {children}
        <div className="adm-confirm-actions">
          <button type="button" className="btn btn-sm btn-ghost" data-intent="neutral" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-sm btn-ink" data-intent={danger ? 'danger' : 'positive'} data-fill="" onClick={onConfirm} disabled={busy} autoFocus>
            {icon}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Switch (role="switch", knob squash) ----------

export function Switch({
  checked,
  onChange,
  label,
  visibleLabel,
  disabled,
  busy,
  describedBy,
  className,
  id,
  switchRef,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** The accessible name. */
  label: string;
  /** Text beside the switch (part of the button, so it is also clickable). */
  visibleLabel?: ReactNode;
  disabled?: boolean;
  busy?: boolean;
  describedBy?: string;
  className?: string;
  id?: string;
  switchRef?: RefObject<HTMLButtonElement | null>;
}) {
  // Each change restarts the squash keyframes (a new key on the knob's inner span).
  const [flips, setFlips] = useState(0);
  return (
    <button
      ref={switchRef}
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={visibleLabel ? undefined : label}
      aria-describedby={describedBy}
      aria-busy={busy || undefined}
      disabled={disabled}
      className={`adm-switch ${className ?? ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setFlips((n) => n + 1);
        onChange(!checked);
      }}
    >
      <span className="adm-switch-track" aria-hidden>
        <span className="adm-switch-knob">
          <span key={flips} className="adm-switch-squash" data-flip={flips ? '' : undefined} />
        </span>
      </span>
      {visibleLabel && <span className="adm-switch-label">{visibleLabel}</span>}
      {visibleLabel && <span className="sr-only">{label}</span>}
    </button>
  );
}

// ---------- Popover menu (popover="auto": top layer, light dismiss and Esc for free) ----------

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

function placePopover(pop: HTMLElement, anchor: HTMLElement, align: 'start' | 'end' = 'end') {
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;
  let left = align === 'end' ? r.right - w : r.left;
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  let top = r.bottom + 6;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(top)}px`;
}

/** Opens a popover anchored to a button. Returns handlers; the popover element needs `popover="auto"`. */
export function usePopover(align: 'start' | 'end' = 'end') {
  const pop = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const el = pop.current;
    if (!el) return;
    const onToggle = (e: Event) => {
      const isOpen = (e as ToggleEvent).newState === 'open';
      setOpen(isOpen);
      if (isOpen && anchor.current) placePopover(el, anchor.current, align);
      if (!isOpen && el.contains(document.activeElement)) anchor.current?.focus({ preventScroll: true });
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, [align]);
  const show = useCallback(() => {
    const el = pop.current;
    if (!el || !anchor.current) return;
    try {
      el.showPopover();
    } catch {
      return;
    }
    placePopover(el, anchor.current, align);
  }, [align]);
  const hide = useCallback(() => {
    try {
      pop.current?.hidePopover();
    } catch {
      // already closed
    }
  }, []);
  const toggle = useCallback(() => (pop.current?.matches(':popover-open') ? hide() : show()), [hide, show]);
  return { pop, anchor, open, show, hide, toggle };
}

/** A "⋯" style menu: a button and a role="menu" popover with arrow keys between items. */
export function MenuButton({
  label,
  children,
  items,
  className,
  buttonClass = 'btn adm-icon-btn',
  align = 'end',
}: {
  /** The button's accessible name. */
  label: string;
  /** The button's content (an icon). */
  children: ReactNode;
  items: MenuItem[];
  className?: string;
  buttonClass?: string;
  align?: 'start' | 'end';
}) {
  const { pop, anchor, open, toggle, hide } = usePopover(align);
  const menuId = useId();
  useEffect(() => {
    if (open) pop.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])')?.focus({ preventScroll: true });
  }, [open, pop]);
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const list = [...(pop.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? [])];
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length];
      next?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      (e.key === 'Home' ? list[0] : list.at(-1))?.focus();
    } else if (e.key === 'Tab') hide();
  };
  return (
    <span className={`adm-menu-wrap ${className ?? ''}`}>
      <button
        ref={anchor}
        type="button"
        className={buttonClass}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
      >
        {children}
      </button>
      <div ref={pop} id={menuId} popover="auto" role="menu" aria-label={label} className="adm-menu" onKeyDown={onKey} onClick={(e) => e.stopPropagation()}>
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="adm-menu-item"
            data-danger={item.danger ? '' : undefined}
            disabled={item.disabled}
            onClick={() => {
              hide();
              item.onSelect();
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </span>
  );
}

/** A split button: the main action, and a chevron with a small menu of related ones ("Lock" and "Lock everywhere"). */
export function SplitButton({ label, onClick, menuLabel, items, className }: { label: ReactNode; onClick: () => void; menuLabel: string; items: MenuItem[]; className?: string }) {
  return (
    <span className={`adm-split ${className ?? ''}`}>
      <button type="button" className="btn btn-sm adm-split-main" onClick={onClick}>
        {label}
      </button>
      <MenuButton label={menuLabel} items={items} buttonClass="btn btn-sm adm-split-more">
        <ChevronDown className="size-4" aria-hidden />
      </MenuButton>
    </span>
  );
}

// ---------- Chips, times, empty states ----------

export type ChipTone = 'green' | 'amber' | 'grey' | 'ink' | 'blue';

export function StatusChip({ tone, children, title, className }: { tone: ChipTone; children: ReactNode; title?: string; className?: string }) {
  return (
    <span className={`adm-chip ${className ?? ''}`} data-tone={tone} title={title}>
      {children}
    </span>
  );
}

/** D1 writes UTC as 'YYYY-MM-DD HH:MM:SS(.sss)'; ISO strings pass through. */
export function parseWhen(value: string | null | undefined): Date | null {
  if (!value) return null;
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value) ? `${value.replace(' ', 'T')}Z` : value;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function relativeTime(value: string | null | undefined, now = Date.now()): string {
  const d = parseWhen(value);
  if (!d) return '';
  const s = Math.round((now - d.getTime()) / 1000);
  if (s < 45) return 'now';
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 7) return days === 1 ? 'yesterday' : `${days} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric' });
}

export function exactTime(value: string | null | undefined): string {
  const d = parseWhen(value);
  return d ? d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
}

/** A time that reads "2 h ago" and shows the exact date on hover. */
export function When({ value, className }: { value: string | null | undefined; className?: string }) {
  const d = parseWhen(value);
  if (!d) return null;
  return (
    <time className={className} dateTime={d.toISOString()} title={exactTime(value)}>
      {relativeTime(value)}
    </time>
  );
}

/** An empty state with one of the cast at rest (admin brief 5.7: no reactions, no bubbles). */
export function EmptyState({ who, size = 104, title, children, className }: { who: CastId; size?: number; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`adm-empty ${className ?? ''}`}>
      <Character who={who} size={size} prop track={false} />
      <p className="adm-empty-title">{title}</p>
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={`adm-spin ${className ?? ''}`} aria-hidden />;
}

/** The live region for reorder and other announcements. One per screen. */
export function Announcer({ text, assertive = false }: { text: string; assertive?: boolean }) {
  return (
    <p className="sr-only" aria-live={assertive ? 'assertive' : 'polite'} aria-atomic="true">
      {text}
    </p>
  );
}

/** m:ss for a duration in ms. */
export function clock(ms: number | null | undefined): string {
  if (!ms || ms < 0) return '';
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** True when the key press came from somewhere typing happens. */
export function inField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
}
