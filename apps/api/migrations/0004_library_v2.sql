-- The library moves to MEGA as its main stream. Each entry gains its MEGA link (server only) with what MEGA and the file's
-- own header said about it, where the video is posted (Instagram, YouTube), a bundled fallback, a stored poster, the bulk
-- import it came from and a recycle bin.
--
-- SQLite cannot change a CHECK constraint in place, so `videos` is rebuilt: create, copy, drop, rename, re-index.
-- No BEGIN/COMMIT: D1 refuses them, and it applies one migration file as one unit (a failure leaves nothing behind).
-- Nothing references `videos` before this file. From here on `posters` does, so a later rebuild of `videos` must start
-- with `PRAGMA defer_foreign_keys = true;`.
--
-- `ref` and UNIQUE (source, ref) go. What plays is now one column per kind of source, and `source` is computed from them
-- (a generated column), so the API can never store a source that disagrees with the links.

CREATE TABLE videos_v2 (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) <= 140),
  -- Blank only on a draft: a bulk import leaves the brand for the founder to fill in.
  brand TEXT NOT NULL DEFAULT '' CHECK (length(brand) <= 60),
  category TEXT CHECK (category IS NULL OR length(category) <= 40),
  platform TEXT CHECK (platform IS NULL OR length(platform) <= 40),
  aspect TEXT NOT NULL DEFAULT 'vertical' CHECK (aspect IN ('vertical', 'landscape')),
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- MEGA. Server only: no column here except mega_handle ever reaches a visitor, and the handle only inside the stream path.
  mega_handle TEXT UNIQUE CHECK (mega_handle IS NULL OR (length(mega_handle) = 8 AND mega_handle NOT GLOB '*[^A-Za-z0-9_-]*')),
  -- Canonical link: https://mega.nz/file/<handle>#<key43> or https://mega.nz/folder/<fh>#<fkey22>/file/<handle>.
  -- NULL with a handle only for an entry moved here from the MEGA_LINKS secret, until the admin adopts its key.
  mega_url TEXT CHECK (mega_url IS NULL OR ((mega_url GLOB 'https://mega.nz/file/*' OR mega_url GLOB 'https://mega.nz/folder/*') AND length(mega_url) <= 120)),
  -- A folder file's own 32-byte key (base64url), recovered from the folder listing, so plays skip the listing.
  mega_key TEXT CHECK (mega_key IS NULL OR (length(mega_key) = 43 AND mega_key NOT GLOB '*[^A-Za-z0-9_-]*')),
  mega_name TEXT CHECK (mega_name IS NULL OR length(mega_name) <= 255),
  mega_size INTEGER CHECK (mega_size IS NULL OR mega_size >= 0),
  mega_width INTEGER CHECK (mega_width IS NULL OR mega_width BETWEEN 1 AND 16384),
  mega_height INTEGER CHECK (mega_height IS NULL OR mega_height BETWEEN 1 AND 16384),
  mega_duration_ms INTEGER CHECK (mega_duration_ms IS NULL OR mega_duration_ms > 0),
  mega_bitrate INTEGER CHECK (mega_bitrate IS NULL OR mega_bitrate > 0),
  mega_codec TEXT CHECK (mega_codec IS NULL OR length(mega_codec) <= 40),
  mega_fast_start INTEGER CHECK (mega_fast_start IS NULL OR mega_fast_start IN (0, 1)),
  mega_checked_at TEXT,
  mega_error TEXT CHECK (mega_error IS NULL OR mega_error IN ('not-found', 'removed', 'blocked', 'bad-key', 'over-quota', 'busy', 'not-video', 'upstream')),
  -- What the sniffer read beyond the columns above (V2-SPEC 2.1): rotation, RFC 6381 codec strings, fragmented or not, and the byte
  -- offsets that hold the first 3, 6 and 10 seconds, which bound the stream's ?preview= answers. JSON from sniff.metaForD1().
  mega_meta TEXT CHECK (mega_meta IS NULL OR (json_valid(mega_meta) AND length(mega_meta) <= 4000)),

  -- A video bundled with the site (/media/<name>.mp4). Plays only while the entry has no MEGA link.
  file_ref TEXT CHECK (file_ref IS NULL OR (file_ref GLOB '/media/?*.mp4' AND file_ref NOT GLOB '*..*' AND file_ref NOT GLOB '/media/*/*' AND file_ref NOT GLOB '/media/mega-*')),
  -- A v1 wave.video player address. Kept so old rows still play; the admin cannot add new ones.
  wave_ref TEXT CHECK (wave_ref IS NULL OR wave_ref GLOB 'https://*'),
  -- Where the video is posted. Stored only in the canonical form the API rebuilds from the parsed id.
  instagram_url TEXT CHECK (instagram_url IS NULL OR (instagram_url GLOB 'https://www.instagram.com/*' AND length(instagram_url) <= 120)),
  youtube_url TEXT CHECK (youtube_url IS NULL OR ((youtube_url GLOB 'https://www.youtube.com/watch?v=*' OR youtube_url GLOB 'https://www.youtube.com/shorts/*') AND length(youtube_url) <= 80)),
  -- A v1 poster (/media/<name>.jpg or an https image). A row in `posters` wins over it.
  poster_url TEXT CHECK (poster_url IS NULL OR poster_url GLOB '/*' OR poster_url GLOB 'https://*'),
  -- The bulk import that created the entry, so a whole import can be undone.
  import_id TEXT CHECK (import_id IS NULL OR length(import_id) <= 40),
  -- Recycle bin: set on delete, cleared on restore, purged after 30 days.
  deleted_at TEXT,

  -- What the public site plays, in this order of preference. Never written by the API.
  source TEXT GENERATED ALWAYS AS (
    CASE
      WHEN mega_handle IS NOT NULL THEN 'mega'
      WHEN file_ref IS NOT NULL THEN 'file'
      WHEN wave_ref IS NOT NULL THEN 'wave'
      WHEN youtube_url IS NOT NULL THEN 'youtube'
      ELSE 'none'
    END
  ) VIRTUAL,

  CHECK (mega_url IS NULL OR (mega_handle IS NOT NULL AND instr(mega_url, '/' || mega_handle) > 0)),
  CHECK (mega_key IS NULL OR mega_url GLOB 'https://mega.nz/folder/*'),
  -- A live entry has a title, a brand and something to play, and is not in the bin.
  CHECK (published = 0 OR (deleted_at IS NULL AND length(trim(title)) > 0 AND length(trim(brand)) > 0
    AND (mega_handle IS NOT NULL OR file_ref IS NOT NULL OR wave_ref IS NOT NULL OR youtube_url IS NOT NULL)))
);

-- Every existing row is kept. A row the founder pointed at /media/mega-<handle>.mp4 (the MEGA_LINKS era) becomes a MEGA
-- entry with that handle; its key stays in the secret until the admin adopts it. A seed row also gets its bundled file
-- back as the fallback. Values the old API could not have written are clamped rather than allowed to fail the copy.
WITH old AS (
  SELECT
    *,
    CASE
      WHEN source = 'file' AND ref GLOB '/media/mega-????????.mp4' AND substr(ref, 13, 8) NOT GLOB '*[^A-Za-z0-9_-]*' THEN substr(ref, 13, 8)
    END AS handle,
    (source = 'file' AND ref GLOB '/media/mega-*') AS was_mega
  FROM videos
),
mapped AS (
  SELECT
    *,
    CASE
      WHEN source = 'file' AND NOT was_mega THEN ref
      WHEN was_mega AND id GLOB 'seed-?*' THEN '/media/' || substr(id, 6) || '.mp4'
    END AS file,
    CASE WHEN source = 'wave' THEN ref END AS wave,
    CASE WHEN source = 'youtube' THEN 'https://www.youtube.com/watch?v=' || ref END AS youtube
  FROM old
)
INSERT INTO videos_v2 (
  id, title, brand, category, platform, aspect, views, featured, sort_order, published, created_at, updated_at,
  mega_handle, file_ref, wave_ref, youtube_url, poster_url
)
SELECT
  id,
  substr(title, 1, 140),
  substr(brand, 1, 60),
  substr(category, 1, 40),
  substr(platform, 1, 40),
  aspect,
  max(views, 0),
  featured <> 0,
  sort_order,
  CASE
    WHEN published = 0 THEN 0
    WHEN length(trim(title)) = 0 OR length(trim(brand)) = 0 THEN 0
    WHEN handle IS NULL AND file IS NULL AND wave IS NULL AND youtube IS NULL THEN 0
    ELSE 1
  END,
  created_at,
  updated_at,
  handle,
  file,
  wave,
  youtube,
  poster_url
FROM mapped;

DROP TABLE videos;
ALTER TABLE videos_v2 RENAME TO videos;

CREATE INDEX idx_videos_listing ON videos (published, sort_order, views DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_videos_instagram ON videos (instagram_url) WHERE instagram_url IS NOT NULL;
CREATE INDEX idx_videos_youtube ON videos (youtube_url) WHERE youtube_url IS NOT NULL;
CREATE INDEX idx_videos_import ON videos (import_id) WHERE import_id IS NOT NULL;
CREATE INDEX idx_videos_bin ON videos (deleted_at) WHERE deleted_at IS NOT NULL;

-- One poster per video, a frame picked from the stream or an uploaded image. Kept out of `videos` so a listing never reads
-- image bytes, and `bytes` is the last column so reading the small ones never walks the image's overflow pages.
CREATE TABLE posters (
  video_id TEXT PRIMARY KEY REFERENCES videos (id) ON DELETE CASCADE,
  -- First 16 hex characters of the SHA-256 of bytes: the version in the public address.
  sha TEXT NOT NULL CHECK (length(sha) = 16 AND sha NOT GLOB '*[^0-9a-f]*'),
  mime TEXT NOT NULL CHECK (mime IN ('image/webp', 'image/jpeg', 'image/png')),
  width INTEGER CHECK (width IS NULL OR width BETWEEN 1 AND 4096),
  height INTEGER CHECK (height IS NULL OR height BETWEEN 1 AND 4096),
  -- Where in the video the frame was taken, when it was picked rather than uploaded.
  time_ms INTEGER CHECK (time_ms IS NULL OR time_ms >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  bytes BLOB NOT NULL CHECK (length(bytes) BETWEEN 1 AND 524288)
);

-- What the last check of a MEGA link found, for 24 hours: the admin preview can stream a link before it is saved, and a
-- save or a bulk import commit reuses the check instead of asking MEGA again. Rows older than a day are ignored and pruned.
CREATE TABLE mega_probes (
  handle TEXT PRIMARY KEY CHECK (length(handle) = 8),
  link TEXT NOT NULL,
  file_key TEXT CHECK (file_key IS NULL OR length(file_key) = 43),
  name TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  duration_ms INTEGER,
  bitrate INTEGER,
  codec TEXT,
  fast_start INTEGER,
  error TEXT,
  -- Same JSON shape as videos.mega_meta, so a save copies the check without asking MEGA again.
  meta TEXT CHECK (meta IS NULL OR json_valid(meta)),
  checked_at INTEGER NOT NULL
);
CREATE INDEX idx_mega_probes_age ON mega_probes (checked_at);
