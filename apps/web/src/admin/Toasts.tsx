// Owner: A4 Admin. Toasts (admin brief 5.7): bottom centre, one role="status" region, actions such as Undo are real buttons. While a modal is open the
// region renders inside the top one, so a toast is never hidden under a backdrop or made inert by it.
import { AnimatePresence, m } from 'motion/react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { spring } from '../lib/spring';
import { onServerError } from './api';
import { useTopLayer } from './bits';

export interface ToastItem {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
  tone: 'info' | 'error';
  ms: number;
}

const useToastStore = create<{ items: ToastItem[] }>(() => ({ items: [] }));
let nextId = 1;
const timers = new Map<number, number>();

export function dismissToast(id: number) {
  window.clearTimeout(timers.get(id));
  timers.delete(id);
  useToastStore.setState((s) => ({ items: s.items.filter((t) => t.id !== id) }));
}

/** Shows a toast. With an action it stays 8 s (the Undo window), otherwise 3.2 s; errors stay 6 s. At most three at once. */
export function toast(text: string, opts: { action?: ToastItem['action']; tone?: ToastItem['tone']; ms?: number } = {}): number {
  const id = nextId++;
  const ms = opts.ms ?? (opts.action ? 8000 : opts.tone === 'error' ? 6000 : 3200);
  useToastStore.setState((s) => {
    const items = [...s.items, { id, text, action: opts.action, tone: opts.tone ?? 'info', ms }];
    for (const old of items.slice(0, Math.max(0, items.length - 3))) {
      window.clearTimeout(timers.get(old.id));
      timers.delete(old.id);
    }
    return { items: items.slice(-3) };
  });
  timers.set(id, window.setTimeout(() => dismissToast(id), ms));
  return id;
}

export function Toasts() {
  const items = useToastStore((s) => s.items);
  const host = useTopLayer();

  useEffect(() => {
    onServerError((requestId) => toast(requestId ? `Something broke on our side. Request ${requestId}.` : 'Something broke on our side.', { tone: 'error' }));
    return () => onServerError(null);
  }, []);

  const region = (
    <div className="adm-toasts" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <m.div
            key={t.id}
            layout="position"
            className="adm-toast"
            data-tone={t.tone}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: spring.bouncy }}
            exit={{ opacity: 0, transition: { duration: 0.14 } }}
          >
            <span className="adm-toast-text">{t.text}</span>
            {t.action && (
              <button
                type="button"
                className="btn btn-sm adm-toast-action"
                onClick={() => {
                  dismissToast(t.id);
                  t.action?.run();
                }}
              >
                {t.action.label}
              </button>
            )}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
  return host ? createPortal(region, host) : region;
}
