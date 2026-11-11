// (admin8) The edit drawer's preview of a MEGA video: read and decrypted by this page (megaSource.ts) and played from a same-origin address,
// so the poster picker can still draw its frames. Never the whole-file fallback: without a service worker the drawer says so and shows
// MEGA's own player instead (file links only).
import { useEffect, useState } from 'react';
import { AdminApiError } from '../api';
import { MEGA_SAYS, MegaError } from './mega';
import { openSource, type SourceRef } from './megaSource';

export interface MegaPreview {
  src: string | null;
  loading: boolean;
  error: string | null;
}

export function useMegaPreview(ref: SourceRef | null): MegaPreview {
  const key = ref ? JSON.stringify(ref) : '';
  const [state, setState] = useState<MegaPreview & { key: string }>({ key: '', src: null, loading: false, error: null });
  useEffect(() => {
    if (!key) return;
    const abort = new AbortController();
    let release: (() => void) | null = null;
    setState({ key, src: null, loading: true, error: null });
    openSource(JSON.parse(key) as SourceRef, { signal: abort.signal, allowBlob: false })
      .then((s) => {
        if (abort.signal.aborted) return s.release();
        release = s.release;
        setState({ key, src: s.url, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (abort.signal.aborted) return;
        const error = e instanceof MegaError ? MEGA_SAYS[e.kind] : e instanceof AdminApiError || e instanceof Error ? e.message : "The video couldn't be opened.";
        setState({ key, src: null, loading: false, error });
      });
    return () => {
      abort.abort();
      // (final8) Late: a <video> whose src was just swapped (an unsaved link saved, so probe -> video id) can still ask for a range of the
      // old address; released at once, that ask is a 404 in the console. The token only maps to the page's own reader, so a few seconds is free.
      const r = release;
      if (r) window.setTimeout(r, 10000);
    };
  }, [key]);
  if (!key) return { src: null, loading: false, error: null };
  // Until the effect runs for a new ref, the old one's answer is not shown.
  if (state.key !== key) return { src: null, loading: true, error: null };
  return { src: state.src, loading: state.loading, error: state.error };
}
