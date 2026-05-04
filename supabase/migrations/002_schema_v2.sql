-- ─── MIGRATION v2: Redesigned schema for Cloud Stone Studio ─────────────────
-- Run this AFTER 001_schema.sql (or apply both fresh)
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks)

-- ─── ADD source_page to contact_submissions ───────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_submissions' AND column_name = 'source_page'
  ) THEN
    ALTER TABLE contact_submissions ADD COLUMN source_page TEXT;
  END IF;
END $$;

-- ─── DROP old projects / shop_items and recreate with full schema ─────────
-- (Only safe in fresh installs — comment out DROP if you have existing data)

DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS shop_items CASCADE;

-- ─── PROJECTS (design portfolio) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        UNIQUE NOT NULL,
  title           TEXT        NOT NULL,

  -- Display
  project_number  INTEGER,                         -- shown on card e.g. "27"
  project_year    INTEGER,
  project_type    TEXT,                            -- 'Residential' | 'Commercial' | 'Hospitality'
  location        TEXT,
  client          TEXT,
  site_area       TEXT,                            -- e.g. "350 m²"

  -- Media
  card_image      TEXT,                            -- catalog card thumbnail URL
  cover_image     TEXT,                            -- hero/main image URL
  slider_items    JSONB       DEFAULT '[]',        -- [{type:'image'|'video', url, thumbnail}]

  -- Content
  description     TEXT,
  content         JSONB       DEFAULT '[]',        -- rich content blocks (text, images, etc.)

  -- Meta
  status          TEXT        DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published')),
  featured        BOOLEAN     DEFAULT false,
  sort_order      INTEGER     DEFAULT 0,
  tags            TEXT[]      DEFAULT '{}',
  metadata        JSONB       DEFAULT '{}',

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SHOP ITEMS (materials / products) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_items (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,

  item_number      INTEGER,                        -- displayed as [01], [02] etc.
  category         TEXT,                           -- 'Stone' | 'Marble' | 'Special'
  availability     TEXT        DEFAULT 'available'
                   CHECK (availability IN ('available', 'sold', 'expected')),

  description      TEXT,                           -- short subtitle shown on card
  long_description TEXT,                           -- full text shown in popup

  photo_url        TEXT,                           -- card image URL
  sketch_url       TEXT,                           -- sketch/background overlay for card
  images           TEXT[]      DEFAULT '{}',       -- popup gallery; falls back to photo_url if empty

  status           TEXT        DEFAULT 'draft'
                   CHECK (status IN ('draft', 'published')),
  sort_order       INTEGER     DEFAULT 0,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUTO-UPDATE updated_at ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated_at  ON projects;
DROP TRIGGER IF EXISTS trg_shop_items_updated_at ON shop_items;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_shop_items_updated_at
  BEFORE UPDATE ON shop_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_slug       ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status     ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured   ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_number     ON projects(project_number);
CREATE INDEX IF NOT EXISTS idx_shop_slug           ON shop_items(slug);
CREATE INDEX IF NOT EXISTS idx_shop_status         ON shop_items(status);
CREATE INDEX IF NOT EXISTS idx_shop_availability   ON shop_items(availability);
CREATE INDEX IF NOT EXISTS idx_shop_category       ON shop_items(category);
CREATE INDEX IF NOT EXISTS idx_shop_sort           ON shop_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_shop_number         ON shop_items(item_number);
CREATE INDEX IF NOT EXISTS idx_contact_created     ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status      ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_source      ON contact_submissions(source_page);
