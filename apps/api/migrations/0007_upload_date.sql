-- The day a video was uploaded (posted), as the founder writes it in the admin: YYYY-MM-DD, or NULL when not set.
ALTER TABLE videos ADD COLUMN upload_date TEXT CHECK (upload_date IS NULL OR (length(upload_date) = 10 AND upload_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'));
