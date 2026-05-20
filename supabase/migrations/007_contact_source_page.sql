-- Add source_page column to contact_submissions
-- This column tracks which page/form the inquiry came from
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS source_page TEXT;

CREATE INDEX IF NOT EXISTS idx_contact_source_page
  ON contact_submissions(source_page);
