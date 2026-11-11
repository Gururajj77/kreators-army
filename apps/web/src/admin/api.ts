// Owner: A4 Admin. One fetch for every admin call (admin brief 5.1, V2-SPEC 4.1): same-origin credentials, JSON in and out, the AdminErrorBody mapped to
// an AdminApiError, and a 401 `locked` or `expired` from any call raising the session sheet instead of throwing: the call waits for the passkey and is
// sent again once, so a drawer or an import in progress keeps its state. Mutations are refused, never queued, while the browser is offline.
import type {
  AdminErrorBody,
  AdminErrorCode,
  AdminLead,
  AdminLeadList,
  AdminPoster,
  AdminSession,
  AdminVideo,
  AdminVideoList,
  BulkRequest,
  BulkResult,
  ImportCommitRequest,
  ImportCommitResponse,
  ImportDryRunRequest,
  ImportPreview,
  LeadCompletion,
  LeadKind,
  LeadStatus,
  MegaInspect,
  VideoSaved,
  VideoWrite,
} from '@kreators/shared';
import { create } from 'zustand';

export type AdminFailCode = AdminErrorCode | 'offline' | 'network' | 'server';

export class AdminApiError extends Error {
  readonly status: number;
  readonly code: AdminFailCode;
  readonly body: Partial<AdminErrorBody>;
  readonly requestId: string | null;

  constructor(status: number, code: AdminFailCode, message: string, body: Partial<AdminErrorBody> = {}) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.code = code;
    this.body = body;
    this.requestId = body.requestId ?? null;
  }
}

export const isAdminError = (e: unknown, code?: AdminFailCode): e is AdminApiError => e instanceof AdminApiError && (code === undefined || e.code === code);

// ---------- Shared UI state that the fetch layer drives: offline, the session sheet, the server-error toast ----------

interface AdminUi {
  offline: boolean;
  /** The session sheet is open, waiting for the passkey. */
  sheet: boolean;
}

export const useAdminUi = create<AdminUi>(() => ({ offline: typeof navigator !== 'undefined' && navigator.onLine === false, sheet: false }));

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useAdminUi.setState({ offline: false }));
  window.addEventListener('offline', () => useAdminUi.setState({ offline: true }));
}

let sheetEnabled = false;
let waiters: ((ok: boolean) => void)[] = [];

/** The shell turns the sheet on while it is mounted; on the lock screen a 401 simply throws. */
export function enableSessionSheet(on: boolean) {
  sheetEnabled = on;
  if (!on) settleUnlock(false);
}

function needUnlock(): Promise<boolean> {
  if (!sheetEnabled) return Promise.resolve(false);
  useAdminUi.setState({ sheet: true });
  return new Promise((resolve) => waiters.push(resolve));
}

/** The sheet calls this: true after a successful unlock (every waiting call is sent again), false when the founder chose to lock. */
export function settleUnlock(ok: boolean) {
  const list = waiters;
  waiters = [];
  useAdminUi.setState({ sheet: false });
  for (const resolve of list) resolve(ok);
}

let serverError: ((requestId: string | null) => void) | null = null;
/** The toast host registers here: a 5xx shows "Something broke on our side. Request {id}." */
export function onServerError(fn: ((requestId: string | null) => void) | null) {
  serverError = fn;
}

// ---------- The fetch ----------

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  json?: unknown;
  body?: BodyInit;
  headers?: Record<string, string>;
  /** The session gate itself: a 401 is the answer, never the sheet. */
  gate?: boolean;
  /** No toast for a 5xx (the caller shows its own error). */
  quiet?: boolean;
  signal?: AbortSignal;
}

const OFFLINE_MESSAGE = "You're offline. Changes will fail until you reconnect.";

export async function adminFetch<T>(path: string, opts: FetchOptions = {}, retried = false): Promise<T> {
  const method = opts.method ?? 'GET';
  if (method !== 'GET' && typeof navigator !== 'undefined' && navigator.onLine === false) {
    useAdminUi.setState({ offline: true });
    throw new AdminApiError(0, 'offline', OFFLINE_MESSAGE);
  }
  const headers: Record<string, string> = { Accept: 'application/json', ...opts.headers };
  let body = opts.body;
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }
  let res: Response;
  try {
    res = await fetch(`/api/admin${path}`, { method, headers, body, credentials: 'same-origin', cache: 'no-store', signal: opts.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (offline) useAdminUi.setState({ offline: true });
    throw new AdminApiError(0, offline ? 'offline' : 'network', offline ? OFFLINE_MESSAGE : "Couldn't reach the server. Check your connection and try again.");
  }
  if (useAdminUi.getState().offline) useAdminUi.setState({ offline: false });
  if (res.status === 204) return undefined as T;
  const data: unknown = await res.json().catch(() => null);
  if (res.ok) return data as T;

  const err = (data && typeof data === 'object' ? data : {}) as Partial<AdminErrorBody>;
  if (res.status === 401 && (err.code === 'locked' || err.code === 'expired') && !opts.gate && !retried) {
    if (await needUnlock()) return adminFetch<T>(path, opts, true);
  }
  if (res.status >= 500 && res.status !== 503) {
    if (!opts.quiet) serverError?.(err.requestId ?? null);
    throw new AdminApiError(res.status, 'server', 'Something broke on our side.', err);
  }
  throw new AdminApiError(res.status, (err.code ?? (res.status === 503 ? 'admin-off' : 'server')) as AdminFailCode, err.error ?? `Request failed (${res.status})`, err);
}

// ---------- Unlock: outside the guard, so it never raises the sheet ----------

export type UnlockResult =
  | { ok: true; session: AdminSession }
  | { ok: false; code: 'wrong-passkey'; triesLeft: number | null }
  | { ok: false; code: 'too-many'; retryAfter: number }
  | { ok: false; code: 'admin-off' | 'offline' | 'network' | 'bad-request' | 'server'; message: string };

export async function unlock(passkey: string): Promise<UnlockResult> {
  try {
    const session = await adminFetch<AdminSession>('/session', { method: 'POST', json: { passkey }, gate: true, quiet: true });
    return { ok: true, session };
  } catch (e) {
    if (!(e instanceof AdminApiError)) throw e;
    if (e.code === 'wrong-passkey') return { ok: false, code: 'wrong-passkey', triesLeft: typeof e.body.triesLeft === 'number' ? e.body.triesLeft : null };
    if (e.code === 'too-many') return { ok: false, code: 'too-many', retryAfter: Math.max(1, Number(e.body.retryAfter) || 900) };
    if (e.code === 'admin-off' || e.code === 'offline' || e.code === 'network' || e.code === 'bad-request') return { ok: false, code: e.code, message: e.message };
    return { ok: false, code: 'server', message: e.requestId ? `Something broke on our side. Request ${e.requestId}.` : 'Something broke on our side.' };
  }
}

// ---------- Typed calls (admin brief 4.3, with A1's deltas) ----------

export interface LeadFilters {
  status?: LeadStatus | 'all';
  kind?: LeadKind;
  /** (form7) Sent enquiries, or the ones the form saved before the visitor stopped. */
  completion?: LeadCompletion;
  q?: string;
  cursor?: string;
  limit?: number;
}

const leadQuery = (f: LeadFilters & { from?: string; to?: string }) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v !== undefined && v !== '' && v !== null) p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export interface PosterMeta {
  width?: number;
  height?: number;
  timeMs?: number;
}

export const adminApi = {
  session: () => adminFetch<AdminSession>('/session', { gate: true }),
  lock: () => adminFetch<void>('/session', { method: 'DELETE', gate: true, quiet: true }),
  lockEverywhere: () => adminFetch<void>('/sessions', { method: 'DELETE' }),

  videos: (bin = false) => adminFetch<AdminVideoList>(`/videos${bin ? '?bin=1' : ''}`),
  video: (id: string) => adminFetch<{ video: AdminVideo }>(`/videos/${encodeURIComponent(id)}`).then((r) => r.video),
  createVideo: (write: VideoWrite) => adminFetch<VideoSaved>('/videos', { method: 'POST', json: write }),
  updateVideo: (id: string, write: VideoWrite) => adminFetch<VideoSaved>(`/videos/${encodeURIComponent(id)}`, { method: 'PATCH', json: write }),
  deleteVideo: (id: string) => adminFetch<{ video: AdminVideo }>(`/videos/${encodeURIComponent(id)}`, { method: 'DELETE' }).then((r) => r.video),
  restoreVideo: (id: string, published?: boolean) =>
    adminFetch<{ video: AdminVideo }>(`/videos/${encodeURIComponent(id)}/restore`, { method: 'POST', json: published === undefined ? {} : { published } }).then((r) => r.video),
  purgeVideo: (id: string) => adminFetch<void>(`/videos/${encodeURIComponent(id)}?purge=1`, { method: 'DELETE' }),
  reorder: (ids: string[]) => adminFetch<{ order: { id: string; sortOrder: number }[] }>('/videos/order', { method: 'PUT', json: { ids } }),
  uploadPoster: (id: string, blob: Blob, meta: PosterMeta = {}) => {
    const headers: Record<string, string> = { 'Content-Type': blob.type || 'image/webp' };
    if (meta.width) headers['X-Poster-Width'] = String(Math.round(meta.width));
    if (meta.height) headers['X-Poster-Height'] = String(Math.round(meta.height));
    if (meta.timeMs !== undefined) headers['X-Poster-Time-Ms'] = String(Math.max(0, Math.round(meta.timeMs)));
    return adminFetch<{ poster: AdminPoster; video: AdminVideo }>(`/videos/${encodeURIComponent(id)}/poster`, { method: 'PUT', body: blob, headers });
  },
  removePoster: (id: string) => adminFetch<void>(`/videos/${encodeURIComponent(id)}/poster`, { method: 'DELETE' }),
  megaCheck: (id: string) => adminFetch<{ video: AdminVideo; inspect: MegaInspect }>(`/videos/${encodeURIComponent(id)}/mega-check`, { method: 'POST' }),
  /** (sel) One action on several videos (POST /videos/bulk). */
  bulk: (req: BulkRequest) => adminFetch<BulkResult>('/videos/bulk', { method: 'POST', json: req }),
  adoptSecret: () => adminFetch<{ adopted: AdminVideo[]; missing: string[] }>('/videos/adopt-secret', { method: 'POST' }),

  inspect: (link: string, opts: { refresh?: boolean; videoId?: string } = {}, signal?: AbortSignal) =>
    adminFetch<MegaInspect>('/mega/inspect', { method: 'POST', json: { link, ...opts }, signal }),

  dryRun: (req: ImportDryRunRequest) => adminFetch<ImportPreview>('/import/dry-run', { method: 'POST', json: req }),
  commit: (req: ImportCommitRequest) => adminFetch<ImportCommitResponse>('/import/commit', { method: 'POST', json: req }),
  undoImport: (importId: string) => adminFetch<{ binned: number; kept: number }>(`/import/${encodeURIComponent(importId)}/undo`, { method: 'POST' }),

  leads: (f: LeadFilters) => adminFetch<AdminLeadList>(`/leads${leadQuery(f)}`),
  lead: (id: string) => adminFetch<{ lead: AdminLead }>(`/leads/${encodeURIComponent(id)}`).then((r) => r.lead),
  updateLead: (id: string, patch: { status?: LeadStatus; note?: string }) =>
    adminFetch<{ lead: AdminLead }>(`/leads/${encodeURIComponent(id)}`, { method: 'PATCH', json: patch }).then((r) => r.lead),
  deleteLead: (id: string) => adminFetch<void>(`/leads/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  leadsCsvUrl: (f: { status?: LeadStatus | 'all'; kind?: LeadKind; completion?: LeadCompletion }) => `/api/admin/leads.csv${leadQuery(f)}`,
};

/** Query keys (admin brief 5.1). */
export const keys = {
  session: ['admin', 'session'] as const,
  videos: (bin: boolean) => ['admin', 'videos', { bin }] as const,
  video: (id: string) => ['admin', 'video', id] as const,
  leads: (f: object) => ['admin', 'leads', f] as const,
  lead: (id: string) => ['admin', 'lead', id] as const,
};

/** Retry once for a network blip; never for an answer the server meant. */
export const retryOnce = (count: number, err: unknown) => count < 1 && err instanceof AdminApiError && (err.code === 'network' || err.code === 'server');
