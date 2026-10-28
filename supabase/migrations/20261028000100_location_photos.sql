-- =============================================================================
-- Photos that show customers how to find the shop (e.g. the bus station
-- entrance, the building, the door), each with an optional caption per
-- language. Files live in the public `site-media` bucket under `location/`;
-- owners and managers manage them (same as the other site-wide settings).
-- =============================================================================

create table public.location_photos (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null unique
                check (storage_path ~ '^location/[0-9a-f-]{36}\.(webp|jpg)$'),
  width         integer check (width is null or width > 0),
  height        integer check (height is null or height > 0),
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index location_photos_order_idx on public.location_photos (display_order, created_at);

create table public.location_photo_translations (
  photo_id   uuid not null references public.location_photos (id) on delete cascade,
  locale     text not null references public.locales (code) on update cascade,
  caption    text not null check (char_length(caption) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (photo_id, locale)
);

create trigger location_photos_set_updated_at before update on public.location_photos
  for each row execute function private.set_updated_at();
create trigger location_photo_translations_set_updated_at before update on public.location_photo_translations
  for each row execute function private.set_updated_at();

alter table public.location_photos enable row level security;
alter table public.location_photo_translations enable row level security;

create policy "Location photos are publicly readable"
  on public.location_photos for select to anon, authenticated using (true);
create policy "Managers can manage location photos"
  on public.location_photos for all to authenticated
  using ((select private.has_admin_role(array['owner', 'manager'])))
  with check ((select private.has_admin_role(array['owner', 'manager'])));

create policy "Location photo captions are publicly readable"
  on public.location_photo_translations for select to anon, authenticated using (true);
create policy "Managers can manage location photo captions"
  on public.location_photo_translations for all to authenticated
  using ((select private.has_admin_role(array['owner', 'manager'])))
  with check ((select private.has_admin_role(array['owner', 'manager'])));

grant select on public.location_photos, public.location_photo_translations to anon, authenticated;
grant insert, update, delete on public.location_photos, public.location_photo_translations to authenticated;
revoke insert, update, delete, truncate on public.location_photos, public.location_photo_translations from anon;
