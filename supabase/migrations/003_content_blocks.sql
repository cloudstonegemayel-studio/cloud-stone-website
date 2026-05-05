-- Migration 003: Add block-based content system to projects
-- Safe to run on top of any previous migration (all IF NOT EXISTS)

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='short_description') THEN
    ALTER TABLE projects ADD COLUMN short_description TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='content_blocks') THEN
    ALTER TABLE projects ADD COLUMN content_blocks JSONB DEFAULT '[]';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='project_status') THEN
    ALTER TABLE projects ADD COLUMN project_status TEXT; -- "Completed", "In Progress", etc.
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='cover_image') THEN
    ALTER TABLE projects ADD COLUMN cover_image TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='slider_items') THEN
    ALTER TABLE projects ADD COLUMN slider_items JSONB DEFAULT '[]';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='project_year') THEN
    ALTER TABLE projects ADD COLUMN project_year INTEGER;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='project_type') THEN
    ALTER TABLE projects ADD COLUMN project_type TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='location') THEN
    ALTER TABLE projects ADD COLUMN location TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='client') THEN
    ALTER TABLE projects ADD COLUMN client TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='site_area') THEN
    ALTER TABLE projects ADD COLUMN site_area TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_content_blocks ON projects USING gin(content_blocks);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order);
