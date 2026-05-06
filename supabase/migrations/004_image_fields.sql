-- ── Projects: new image fields ────────────────────────────────────────────────
alter table public.projects add column if not exists project_number integer;
alter table public.projects add column if not exists light_text     boolean default false;

alter table public.projects add column if not exists card_image          text;
alter table public.projects add column if not exists card_image_alt      text;
alter table public.projects add column if not exists card_hover_image     text;
alter table public.projects add column if not exists card_hover_image_alt text;

alter table public.projects add column if not exists cover_image_alt text;

alter table public.projects add column if not exists section2_image     text;
alter table public.projects add column if not exists section2_image_alt text;
alter table public.projects add column if not exists section4_image     text;
alter table public.projects add column if not exists section4_image_alt text;

-- ── Shop items: image alt + popup gallery ──────────────────────────────────────
alter table public.shop_items add column if not exists photo_alt     text;
alter table public.shop_items add column if not exists sketch_alt    text;
-- popup_images: [{url: string, alt: string}]
alter table public.shop_items add column if not exists popup_images jsonb default '[]'::jsonb;
