-- Enquiries become an inbox. A trial request carries the guided brief (one JSON document, validated by the API against the
-- option lists in packages/shared); every enquiry gets a status the founder moves and a private note.
-- Rows from v1 keep their columns and read as questions with no brief.
ALTER TABLE leads ADD COLUMN kind TEXT NOT NULL DEFAULT 'question' CHECK (kind IN ('trial', 'question'));
ALTER TABLE leads ADD COLUMN brand TEXT NOT NULL DEFAULT '' CHECK (length(brand) <= 120);
ALTER TABLE leads ADD COLUMN brief TEXT CHECK (brief IS NULL OR (json_valid(brief) AND length(brief) <= 16000));
ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'archived'));
ALTER TABLE leads ADD COLUMN status_at TEXT;
ALTER TABLE leads ADD COLUMN note TEXT NOT NULL DEFAULT '' CHECK (length(note) <= 2000);

CREATE INDEX idx_leads_inbox ON leads (status, created_at DESC);
