-- (form7) The guided brief saves as it goes. Once step 1 has an email or a phone, each completed step (and leaving the page)
-- upserts ONE row per form session, keyed by a random draft id the browser keeps in sessionStorage, with completion 'partial'.
-- Sending the form turns that same row into the complete lead. Additive only: every existing row reads as complete.
-- (The inbox status column keeps its own CHECK; widening it would need a table rebuild, so partial/complete is its own column.)
ALTER TABLE leads ADD COLUMN draft_id TEXT CHECK (draft_id IS NULL OR length(draft_id) BETWEEN 16 AND 64);
ALTER TABLE leads ADD COLUMN completion TEXT NOT NULL DEFAULT 'complete' CHECK (completion IN ('partial', 'complete'));
-- The furthest step the visitor reached: 1 to 5, 6 = the review.
ALTER TABLE leads ADD COLUMN step_reached INTEGER CHECK (step_reached IS NULL OR step_reached BETWEEN 1 AND 6);
-- When each step's answers were last saved: {"1": "2026-11-11 10:02:03", "2": ...}.
ALTER TABLE leads ADD COLUMN steps TEXT CHECK (steps IS NULL OR (json_valid(steps) AND length(steps) <= 2000));
-- How many times this draft was saved (capped by the API).
ALTER TABLE leads ADD COLUMN saves INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN updated_at TEXT;
ALTER TABLE leads ADD COLUMN completed_at TEXT;

CREATE UNIQUE INDEX idx_leads_draft ON leads (draft_id) WHERE draft_id IS NOT NULL;
CREATE INDEX idx_leads_completion ON leads (completion, created_at DESC);
