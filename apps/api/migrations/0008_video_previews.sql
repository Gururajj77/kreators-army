-- Hover previews: a short silent loop per video (about 3.6 s, 360 px on the short edge, H.264 in MP4 or VP9 in WebM), made in
-- the admin's browser with WebCodecs and stored here like the posters: one BLOB per video, at most 600 KiB, served at a
-- versioned address /media/pv/<id>/<sha16>.<mp4|webm> (src/previews.ts). `bytes` is the last column so a listing that joins
-- this table for sha and mime never reads the clip itself.
--
-- Posters gain `auto`: 1 for a poster the preview pass picked by itself, 0 for one the admin set by hand (and for every poster
-- that exists today). "Make missing" never replaces a hand-set poster. The poster route's upsert does not name `auto`, so the
-- trigger below turns a replaced auto poster back into a hand-set one; the auto route deletes and inserts instead, which the
-- trigger does not see.

CREATE TABLE video_previews (
  video_id TEXT PRIMARY KEY REFERENCES videos (id) ON DELETE CASCADE,
  -- First 16 hex characters of the SHA-256 of bytes: the version in the public address.
  sha TEXT NOT NULL CHECK (length(sha) = 16 AND sha NOT GLOB '*[^0-9a-f]*'),
  mime TEXT NOT NULL CHECK (mime IN ('video/mp4', 'video/webm')),
  size INTEGER NOT NULL CHECK (size BETWEEN 1 AND 614400),
  width INTEGER CHECK (width IS NULL OR width BETWEEN 1 AND 4096),
  height INTEGER CHECK (height IS NULL OR height BETWEEN 1 AND 4096),
  duration_ms INTEGER CHECK (duration_ms IS NULL OR duration_ms BETWEEN 1 AND 60000),
  -- Where in the video the clip starts.
  start_ms INTEGER CHECK (start_ms IS NULL OR start_ms >= 0),
  made_at TEXT NOT NULL DEFAULT (datetime('now')),
  bytes BLOB NOT NULL CHECK (length(bytes) BETWEEN 1 AND 614400)
);

ALTER TABLE posters ADD COLUMN auto INTEGER NOT NULL DEFAULT 0 CHECK (auto IN (0, 1));

CREATE TRIGGER posters_set_by_hand AFTER UPDATE OF sha ON posters
FOR EACH ROW WHEN OLD.auto = 1 AND NEW.auto = 1
BEGIN
  UPDATE posters SET auto = 0 WHERE video_id = NEW.video_id;
END;
