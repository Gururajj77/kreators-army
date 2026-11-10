export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  /** The site's own address, allowed as a browser origin for writes. */
  PUBLIC_URL?: string;
  /** Secret. The passkey that unlocks /admin (and the Bearer key for scripts). The admin API refuses everything while this is unset. */
  ADMIN_KEY?: string;
  /**
   * Secret, legacy (v1.5). MEGA links (or embed codes), one per line. Read only for a library row that has a MEGA handle and
   * no mega_url, until the admin adopts its key ("Move it into the library"); delete it afterwards.
   */
  MEGA_LINKS?: string;
  /** Tests only: the MEGA mock, honoured only as http://127.0.0.1:<port> or http://localhost:<port>. */
  MEGA_API?: string;
  /** Hashcash rounds the Worker may spend when MEGA asks for one. Default 0 (Free plan): a challenge answers 503 busy. */
  MEGA_HASHCASH_ROUNDS?: string;
  /** 'on' turns the R2 mirror on when MEDIA_MIRROR is bound. Off by default (V2-SPEC D10). */
  MEGA_MIRROR?: string;
  MEDIA_MIRROR?: R2Bucket;
}

export interface AdminContext {
  via: 'cookie' | 'bearer';
  sid?: string;
}

export interface AppEnv {
  Bindings: Env;
  Variables: {
    requestId: string;
    admin?: AdminContext;
    /** The cookie session's row, for GET /api/admin/session (unix milliseconds). */
    session?: { expiresAt: number; seenAt: number };
  };
}
