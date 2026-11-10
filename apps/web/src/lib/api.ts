import type { ApiErrorBody, LeadInput, VideoListResponse } from '@kreators/shared';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) headers.set('Content-Type', 'application/json');

  const res = await fetch(`/api${path}`, { ...init, headers });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, (body as ApiErrorBody | null)?.error ?? `Request failed (${res.status})`);
  return body as T;
}

export const api = {
  videos: () => request<VideoListResponse>('/videos'),
  contact: (lead: LeadInput) => request<{ ok: true }>('/contact', { method: 'POST', body: JSON.stringify(lead) }),
};
