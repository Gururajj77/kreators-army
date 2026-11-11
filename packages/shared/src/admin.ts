/**
 * The admin API's shapes (admin brief 4.2, with V2-SPEC 2.11's deltas). Everything here is admin-only: canonical MEGA links
 * (with their keys) appear in these answers and never in the public `Video`.
 */
import type { ApiErrorBody } from './api.ts';
import type { TrialBrief } from './brief.ts';
import type { Lead, VideoAspect } from './videos.ts';

// ---- sources and MEGA -------------------------------------------------------------------------------

/** What plays, in order of preference (the generated `videos.source` column). 'none' is for drafts only. */
export const VIDEO_SOURCES = ['mega', 'file', 'youtube', 'wave', 'none'] as const;
export type VideoSource = (typeof VIDEO_SOURCES)[number];

export type MegaLinkKind = 'file' | 'folder-file';
export type MegaProblem =
  | 'not-mega' | 'no-key' | 'bad-key' | 'bad-link' | 'folder' // the link itself
  | 'not-found' | 'removed' | 'blocked' | 'over-quota' | 'busy' | 'upstream' // MEGA said
  | 'not-video'; // the file's header said
export type StreamGrade = 'ready' | 'heavy' | 'too-heavy' | 'unknown';
export type MegaWarningCode =
  | 'over-720p' | 'over-1080p' | 'bitrate-high' | 'bitrate-very-high'
  | 'hevc' | 'video-codec' | 'audio-codec' | 'no-audio' | 'not-fast-start' | 'no-header-info';

export interface MegaWarning {
  code: MegaWarningCode;
  message: string;
}

/** What MEGA and the file's own header said about a file. */
export interface MegaMeta {
  name: string | null;
  /** Bytes. */
  size: number;
  /** Displayed size, after rotation. */
  width: number | null;
  height: number | null;
  durationMs: number | null;
  /** Bits per second: size * 8 / duration. */
  bitrate: number | null;
  /** Video then audio sample-entry codes: 'avc1+mp4a', 'hvc1+mp4a', 'avc1' (no sound). Null when no header was read. */
  codec: string | null;
  /** moov before mdat. */
  fastStart: boolean | null;
}

export type MegaInspect =
  | {
      ok: true;
      /** The handle stored in `mega_handle`: the file's own, or its node handle inside a folder. */
      handle: string;
      kind: MegaLinkKind;
      /** Admin only: the canonical link, key included. */
      canonical: string;
      meta: MegaMeta;
      grade: StreamGrade;
      /** One line each: HEVC, other video codec, audio codec, no audio, not fast start, no header info. Grade copy is separate. */
      warnings: MegaWarning[];
      /** False for HEVC or an unknown video codec: it can be saved as a draft but cannot be published. */
      playable: boolean;
      /** The muted-preview rule (V2-SPEC 2.4.4) for this file. */
      previewOk: boolean;
      suggestedTitle: string;
      suggestedAspect: VideoAspect | null;
      /** '/media/mega-<handle>.mp4': streams for the admin session before the link is saved. */
      previewUrl: string;
      /** MEGA's own player, file links only. Admin only. */
      embedUrl: string | null;
      duplicate: { id: string; title: string; inBin: boolean } | null;
      /** ISO. */
      checkedAt: string;
      /** Came from mega_probes (under 24 hours old). */
      cached: boolean;
    }
  | { ok: false; problem: MegaProblem; message: string; handle?: string; retryAfter?: number };

// ---- videos ------------------------------------------------------------------------------------------

export type VideoProblem =
  | 'no-title' | 'no-brand' | 'no-stream' | 'no-poster'
  | 'mega-heavy' | 'mega-too-heavy' | 'mega-unreachable' | 'mega-key-in-secret'
  | 'hevc' | 'video-codec' | 'audio-codec' | 'not-fast-start' | 'no-header-info' | 'no-mega';

/** These block publishing; the rest (HEVC, other codecs, heavy files, index at the end) are warnings only and never stop a publish or a stream. */
export const BLOCKING_PROBLEMS: readonly VideoProblem[] = ['no-title', 'no-brand', 'no-stream', 'mega-unreachable'];

export interface AdminMega {
  handle: string;
  kind: MegaLinkKind;
  /** Canonical link with key; null while the key is still in the MEGA_LINKS secret. */
  url: string | null;
  keyIn: 'library' | 'secret';
  meta: MegaMeta | null;
  grade: StreamGrade;
  /** ISO, or null when never checked. */
  checkedAt: string | null;
  error: MegaProblem | null;
  embedUrl: string | null;
  playable: boolean;
  previewOk: boolean;
}

export interface AdminPoster {
  /** '/media/p/<id>/<sha16>.<ext>' or the v1 poster_url. */
  url: string;
  /** False for a v1 /media/*.jpg or https poster. */
  stored: boolean;
  width: number | null;
  height: number | null;
  timeMs: number | null;
  /** (pv) True when the "Thumbnails & previews" pass picked it; false or missing when it was set by hand (never replaced by "Make missing"). */
  auto?: boolean;
}

/** (pv) The stored hover clip (migration 0008). */
export interface AdminPreview {
  /** '/media/pv/<id>/<sha16>.<mp4|webm>' */
  url: string;
  mime: 'video/mp4' | 'video/webm';
  size: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  startMs: number | null;
  madeAt: string;
}

export interface AdminVideo {
  id: string;
  title: string;
  brand: string;
  category: string | null;
  platform: string | null;
  aspect: VideoAspect;
  views: number;
  /** The day it was uploaded, 'YYYY-MM-DD', or null when not set. */
  uploadDate: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  source: VideoSource;
  /** What the site plays: the public streamUrl (drafts stream for the admin). */
  streamUrl: string | null;
  mega: AdminMega | null;
  fileRef: string | null;
  waveRef: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  poster: AdminPoster | null;
  /** (pv) The stored hover clip, or null. Missing from answers made before migration 0008. */
  preview?: AdminPreview | null;
  importId: string | null;
  problems: VideoProblem[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** POST creates (title required), PATCH changes only what is present. null clears an optional field. */
export interface VideoWrite {
  title?: string;
  brand?: string;
  category?: string | null;
  platform?: string | null;
  aspect?: VideoAspect;
  views?: number;
  /** 'YYYY-MM-DD' (a real calendar day, not in the future); null or '' clears it. */
  uploadDate?: string | null;
  featured?: boolean;
  published?: boolean;
  sortOrder?: number;
  /** Any accepted MEGA form (file or folder file). A bare folder is a 400 with field 'mega'. null clears every mega_* column. */
  mega?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  /** '/media/<name>.mp4' */
  file?: string | null;
  /** v1 style: https image or /media/<name>.(jpg|png|webp); a stored poster wins. */
  posterUrl?: string | null;
  /** PATCH: 409 'stale' if the row changed since. */
  expectUpdatedAt?: string;
  /** @deprecated v1 CLI alias: MEGA -> mega, /media path -> file, YouTube -> youtube; wave -> 400 'wave-retired'. */
  url?: string;
}

export interface SaveWarning {
  /** A MegaWarningCode, or 'heavy', 'too-heavy', 'no-mega', 'instagram-in-use', 'youtube-in-use'. */
  code: string;
  message: string;
}
export interface VideoSaved {
  video: AdminVideo;
  warnings: SaveWarning[];
}
export interface AdminVideoList {
  videos: AdminVideo[];
  legacySecretCount: number;
  binCount: number;
}

// ---- bulk actions on the videos list (sel, round 4) -------------------------------------------------------

/** POST /api/admin/videos/bulk: one action on up to BULK_MAX videos, each with the same rules as its single route. */
export const BULK_ACTIONS = ['publish', 'unpublish', 'feature', 'unfeature', 'set', 'bin', 'restore', 'purge'] as const;
export type BulkAction = (typeof BULK_ACTIONS)[number];
export const BULK_MAX = 200;
/** The fields 'set' may change (validated as a VideoWrite; null or '' clears category, platform and uploadDate). */
export const BULK_FIELDS = ['brand', 'category', 'platform', 'uploadDate', 'aspect'] as const;
export type BulkField = (typeof BULK_FIELDS)[number];
export type BulkFields = Pick<VideoWrite, BulkField>;

export interface BulkRequest {
  ids: string[];
  action: BulkAction;
  /** 'set' only. */
  fields?: BulkFields;
}
export interface BulkFailure {
  id: string;
  code: AdminErrorCode;
  message: string;
  /** 'cannot-publish': what blocks it. */
  problems?: VideoProblem[];
}
export interface BulkResult {
  /** Every video the action reached, as it is now (purged ones are only in doneIds). */
  done: AdminVideo[];
  doneIds: string[];
  failed: BulkFailure[];
}

// ---- import -------------------------------------------------------------------------------------------

export type ImportStatus =
  | 'checking' | 'ready' | 'heavy' | 'too-heavy' | 'unknown-quality' | 'busy' | 'unreachable' | 'not-video'
  | 'no-key' | 'invalid' | 'duplicate' | 'duplicate-in-file' | 'needs-mega' | 'folder-limit' | 'unplayable';

export interface ImportRow {
  rowId: string;
  line: number | null;
  folder: { handle: string; name: string | null } | null;
  /** Canonical link (admin only). For a 'no-key' row, the link without its key, so a pasted key can be appended. */
  mega: string | null;
  handle: string | null;
  megaKind: MegaLinkKind | null;
  fileName: string | null;
  size: number | null;
  instagram: string | null;
  youtube: string | null;
  title: string;
  titleFrom: 'column' | 'text' | 'file-name' | 'none';
  brand: string;
  category: string | null;
  platform: string | null;
  views: number;
  uploadDate: string | null;
  aspect: VideoAspect | null;
  status: ImportStatus;
  check: MegaInspect | null;
  duplicate: { id: string; title: string; inBin: boolean; canFillLinks: boolean } | null;
  duplicateOfRow: string | null;
  notes: string[];
  selected: boolean;
}

export interface ImportDryRunRequest {
  text?: string;
  rows?: Partial<ImportRow>[];
  fileName?: string;
}
export interface ImportPreview {
  importId: string;
  format: 'line' | 'block' | 'table' | 'json' | 'rows';
  rows: ImportRow[];
  ignored: { line: number; link: string; reason: string }[];
  pairable: { instagram?: number; youtube?: number };
  counts: Partial<Record<ImportStatus, number>>;
}

export interface ImportCommitRow {
  rowId: string;
  action: 'create' | 'fill-links';
  /** fill-links only. */
  targetId?: string;
  mega: string | null;
  instagram: string | null;
  youtube: string | null;
  title: string;
  brand: string;
  category: string | null;
  platform: string | null;
  views: number;
  uploadDate: string | null;
  aspect: VideoAspect | null;
}
export interface ImportCommitRequest {
  importId: string;
  rows: ImportCommitRow[];
}
export interface ImportCommitResponse {
  importId: string;
  created: AdminVideo[];
  updated: AdminVideo[];
  skipped: { rowId: string; reason: 'needs-check' | 'mega-unusable' | 'duplicate' | 'invalid'; message: string }[];
}

// ---- enquiries ----------------------------------------------------------------------------------------

export const LEAD_STATUSES = ['new', 'contacted', 'archived'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const LEAD_KINDS = ['trial', 'question'] as const;
export type LeadKind = (typeof LEAD_KINDS)[number];

export interface AdminLead extends Lead {
  kind: LeadKind;
  brand: string;
  brief: TrialBrief | null;
  status: LeadStatus;
  statusAt: string | null;
  note: string;
}
export interface AdminLeadList {
  leads: AdminLead[];
  nextCursor: string | null;
  counts: Record<LeadStatus, number>;
}

// ---- session and errors -------------------------------------------------------------------------------

export interface AdminSession {
  via: 'cookie' | 'bearer';
  /** ISO; null for bearer. */
  expiresAt: string | null;
  idleExpiresAt: string | null;
  weakPasskey: boolean;
  /** MEGA_LINKS is set. */
  legacySecret: boolean;
}

export type AdminErrorCode =
  | 'admin-off' | 'locked' | 'expired' | 'wrong-passkey' | 'too-many' | 'forbidden' | 'bad-request' | 'not-found'
  | 'duplicate' | 'stale' | 'order-stale' | 'conflict' | 'not-in-bin' | 'too-large' | 'unsupported-type'
  | 'cannot-publish' | 'mega-unusable' | 'wave-retired';

export interface AdminErrorBody extends ApiErrorBody {
  code: AdminErrorCode;
  field?: string;
  retryAfter?: number;
  triesLeft?: number;
  problems?: VideoProblem[];
  existingId?: string;
  inBin?: boolean;
  video?: AdminVideo;
  /** 409 order-stale: the current order. */
  order?: { id: string; sortOrder: number }[];
  /** 422 mega-unusable: what MEGA or the file said. */
  megaProblem?: MegaProblem;
}
