CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT,
  platform TEXT,
  source TEXT NOT NULL CHECK (source IN ('youtube', 'wave', 'file')),
  ref TEXT NOT NULL,
  aspect TEXT NOT NULL DEFAULT 'vertical' CHECK (aspect IN ('vertical', 'landscape')),
  poster_url TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (source, ref)
);

CREATE INDEX idx_videos_listing ON videos (published, sort_order, views DESC);

INSERT INTO videos (id, title, brand, source, ref, poster_url, views, featured) VALUES
  ('seed-fyndflow', 'FyndFlow street interview', 'FyndFlow', 'file', '/media/fyndflow.mp4', '/media/fyndflow.jpg', 11000000, 1),
  ('seed-ansh-mehra', 'AI and design meetup with Ansh Mehra', 'Ansh Mehra', 'file', '/media/ansh-mehra.mp4', '/media/ansh-mehra.jpg', 210000, 1),
  ('seed-8club', '8Club street interview', '8Club', 'file', '/media/8club.mp4', '/media/8club.jpg', 200000, 1),
  ('seed-circlestore-3', 'CircleStore.in street interview', 'CircleStore.in', 'file', '/media/circlestore-3.mp4', '/media/circlestore-3.jpg', 120000, 1),
  ('seed-brandingbum', 'Hot takes on Valentine''s', 'BrandingBum', 'file', '/media/brandingbum.mp4', '/media/brandingbum.jpg', 110000, 1),
  ('seed-rode', 'Presenting the RØDE Show, Bangalore edition', 'Rode Mic India', 'file', '/media/rode.mp4', '/media/rode.jpg', 100000, 1),
  ('seed-waxys', 'Top 5 turnoffs', 'Waxys.in', 'file', '/media/waxys.mp4', '/media/waxys.jpg', 70000, 1),
  ('seed-circlestore-2', 'New phone vs Goa trip', 'CircleStore.in', 'file', '/media/circlestore-2.mp4', '/media/circlestore-2.jpg', 60000, 1),
  ('seed-circlestore-1', 'Bad second-hand buying experiences', 'CircleStore.in', 'file', '/media/circlestore-1.mp4', '/media/circlestore-1.jpg', 50000, 1);
