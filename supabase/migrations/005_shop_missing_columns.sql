-- Migration 005: add columns to shop_items that 002_schema_v2 introduced
-- Safe to run on any version of the schema (all IF NOT EXISTS)

ALTER TABLE public.shop_items ADD COLUMN IF NOT EXISTS item_number      INTEGER;
ALTER TABLE public.shop_items ADD COLUMN IF NOT EXISTS availability     TEXT DEFAULT 'available';
ALTER TABLE public.shop_items ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE public.shop_items ADD COLUMN IF NOT EXISTS photo_url        TEXT;
ALTER TABLE public.shop_items ADD COLUMN IF NOT EXISTS sketch_url       TEXT;

-- Also ensure sort_order exists (some fresh installs skip 002)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shop_items' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.shop_items ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shop_availability ON public.shop_items(availability);
CREATE INDEX IF NOT EXISTS idx_shop_number       ON public.shop_items(item_number);
CREATE INDEX IF NOT EXISTS idx_shop_sort         ON public.shop_items(sort_order);
