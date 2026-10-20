-- Photo of the shop, shown on the home page instead of the drawing.
-- The file lives in the public `site-media` bucket under `shop/`; owners and
-- managers upload it from the admin dashboard (storage policies from
-- 20261004000400_storage.sql). Existing RLS on business_settings applies.
alter table public.business_settings
  add column if not exists shop_photo_path text
    check (shop_photo_path is null or shop_photo_path ~ '^shop/[0-9a-f-]{36}\.(webp|jpg)$'),
  add column if not exists shop_photo_width integer check (shop_photo_width is null or shop_photo_width > 0),
  add column if not exists shop_photo_height integer check (shop_photo_height is null or shop_photo_height > 0);

comment on column public.business_settings.shop_photo_path is
  'Path in the site-media bucket of the shop photo shown on the home page (null = show the drawing).';
