-- ─── PROJECTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        UNIQUE NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  content     JSONB,
  thumbnail   TEXT,
  images      TEXT[],
  tags        TEXT[],
  category    TEXT,
  status      TEXT        DEFAULT 'draft'
              CHECK (status IN ('draft', 'published')),
  featured    BOOLEAN     DEFAULT false,
  sort_order  INTEGER     DEFAULT 0,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SHOP ITEMS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        UNIQUE NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  content     JSONB,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency    TEXT        DEFAULT 'UAH',
  thumbnail   TEXT,
  images      TEXT[],
  tags        TEXT[],
  category    TEXT,
  status      TEXT        DEFAULT 'draft'
              CHECK (status IN ('draft', 'published', 'out_of_stock')),
  featured    BOOLEAN     DEFAULT false,
  sort_order  INTEGER     DEFAULT 0,
  stock       INTEGER,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONTACT SUBMISSIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  subject     TEXT,
  message     TEXT        NOT NULL,
  status      TEXT        DEFAULT 'new'
              CHECK (status IN ('new', 'read', 'replied', 'archived')),
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUTO-UPDATE updated_at ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_shop_items_updated_at
  BEFORE UPDATE ON shop_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_slug     ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_shop_slug         ON shop_items(slug);
CREATE INDEX IF NOT EXISTS idx_shop_status       ON shop_items(status);
CREATE INDEX IF NOT EXISTS idx_contact_created   ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status    ON contact_submissions(status);
