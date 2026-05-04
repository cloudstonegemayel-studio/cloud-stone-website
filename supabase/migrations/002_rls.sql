-- ─── Row Level Security ──────────────────────────────────────────
ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- ─── PROJECTS ────────────────────────────────────────────────────
-- Public: read published projects only
CREATE POLICY "Public read published projects"
  ON projects FOR SELECT
  USING (status = 'published');

-- Authenticated (admin): full access
CREATE POLICY "Admin full access projects"
  ON projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ─── SHOP ITEMS ──────────────────────────────────────────────────
CREATE POLICY "Public read published shop items"
  ON shop_items FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admin full access shop items"
  ON shop_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ─── CONTACT SUBMISSIONS ─────────────────────────────────────────
-- Anyone can submit
CREATE POLICY "Anyone can submit contact"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Only authenticated admin can read
CREATE POLICY "Admin reads contact submissions"
  ON contact_submissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admin can update status
CREATE POLICY "Admin updates contact status"
  ON contact_submissions FOR UPDATE
  USING (auth.role() = 'authenticated');
