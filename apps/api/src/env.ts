export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  /** The site's own address, allowed as a browser origin for writes. */
  PUBLIC_URL?: string;
  /** Secret. The admin API refuses everything while this is unset. */
  ADMIN_KEY?: string;
}

export interface AppEnv {
  Bindings: Env;
  Variables: {
    requestId: string;
  };
}
