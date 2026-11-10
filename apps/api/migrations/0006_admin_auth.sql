-- Unlocking /admin. One row per passkey or Bearer attempt (failures, and passkey successes so a known address is never
-- locked out by someone else's guessing). Pruned after 30 days.
CREATE TABLE admin_attempts (
  id INTEGER PRIMARY KEY,
  -- HMAC-SHA-256 of the address (an IPv6 address's /64) under a key derived from ADMIN_KEY. No raw address is stored.
  ip_hash TEXT NOT NULL,
  ok INTEGER NOT NULL CHECK (ok IN (0, 1)),
  via TEXT NOT NULL CHECK (via IN ('passkey', 'bearer')),
  at INTEGER NOT NULL -- unix milliseconds
);
CREATE INDEX idx_admin_attempts_ip ON admin_attempts (ip_hash, at);
CREATE INDEX idx_admin_attempts_at ON admin_attempts (at);

-- One row per unlocked browser. The cookie carries the id, signed; deleting the row locks that browser.
CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY CHECK (length(id) = 22),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  seen_at INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  -- "Chrome on macOS", for the list of unlocked browsers. Never the full user agent.
  agent TEXT NOT NULL DEFAULT '' CHECK (length(agent) <= 60)
);
CREATE INDEX idx_admin_sessions_expiry ON admin_sessions (expires_at);
