-- =============================================================================
-- Business information: settings (single row), translations, contact
-- channels and opening hours. Everything the website shows about the business
-- is read from these tables so the family can update it without code changes.
-- =============================================================================

create table public.business_settings (
  id               smallint primary key default 1 check (id = 1),
  business_name    text not null check (char_length(business_name) between 1 and 200),
  country_code     char(2) not null default 'RW' check (country_code ~ '^[A-Z]{2}$'),
  city             text,
  address          text,
  latitude         numeric(9, 6) check (latitude between -90 and 90),
  longitude        numeric(9, 6) check (longitude between -180 and 180),
  google_maps_url  text check (google_maps_url is null or google_maps_url ~ '^https://'),
  timezone         text not null default 'Africa/Kigali',
  default_currency char(3) not null default 'RWF' check (default_currency ~ '^[A-Z]{3}$'),
  founded_year     smallint check (founded_year between 1900 and 2100),
  updated_by       uuid references auth.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.business_settings is 'Single-row table (id = 1) with language-neutral business information.';

create table public.business_settings_translations (
  locale               text primary key references public.locales (code) on update cascade,
  tagline              text,
  about                text,
  location_description text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table public.business_contacts (
  id            uuid primary key default gen_random_uuid(),
  type          text not null
                check (type in ('phone', 'whatsapp', 'email', 'facebook', 'instagram', 'tiktok', 'website', 'other')),
  value         text not null check (char_length(value) between 1 and 300),
  label         text,
  is_primary    boolean not null default false,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Phone-like values are stored in E.164 (e.g. +250788000000); the UI formats them.
  check (type not in ('phone', 'whatsapp') or value ~ '^\+[1-9][0-9]{7,14}$'),
  unique (type, value)
);

create index business_contacts_type_order_idx on public.business_contacts (type, display_order);

-- ISO day of week: 1 = Monday … 7 = Sunday. Several rows per day are allowed
-- (e.g. a lunch break). Holidays/special closures can be a separate table later.
create table public.business_hours (
  id          uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 1 and 7),
  opens_at    time,
  closes_at   time,
  is_closed   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (
    (is_closed and opens_at is null and closes_at is null)
    or (not is_closed and opens_at is not null and closes_at is not null and closes_at > opens_at)
  )
);

create index business_hours_day_idx on public.business_hours (day_of_week, opens_at);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
create trigger business_settings_set_updated_at before update on public.business_settings
  for each row execute function private.set_updated_at();
create trigger business_settings_translations_set_updated_at before update on public.business_settings_translations
  for each row execute function private.set_updated_at();
create trigger business_contacts_set_updated_at before update on public.business_contacts
  for each row execute function private.set_updated_at();
create trigger business_hours_set_updated_at before update on public.business_hours
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- Public: read. Owners and managers: write. (Editors manage the catalog only.)
-- -----------------------------------------------------------------------------
alter table public.business_settings enable row level security;
alter table public.business_settings_translations enable row level security;
alter table public.business_contacts enable row level security;
alter table public.business_hours enable row level security;

create policy "Business settings are publicly readable"
  on public.business_settings for select to anon, authenticated using (true);
create policy "Managers can manage business settings"
  on public.business_settings for all to authenticated
  using ((select private.has_admin_role(array['owner', 'manager'])))
  with check ((select private.has_admin_role(array['owner', 'manager'])));

create policy "Business translations are publicly readable"
  on public.business_settings_translations for select to anon, authenticated using (true);
create policy "Managers can manage business translations"
  on public.business_settings_translations for all to authenticated
  using ((select private.has_admin_role(array['owner', 'manager'])))
  with check ((select private.has_admin_role(array['owner', 'manager'])));

create policy "Active business contacts are publicly readable"
  on public.business_contacts for select to anon, authenticated
  using (is_active or (select private.is_admin()));
create policy "Managers can manage business contacts"
  on public.business_contacts for all to authenticated
  using ((select private.has_admin_role(array['owner', 'manager'])))
  with check ((select private.has_admin_role(array['owner', 'manager'])));

create policy "Business hours are publicly readable"
  on public.business_hours for select to anon, authenticated using (true);
create policy "Managers can manage business hours"
  on public.business_hours for all to authenticated
  using ((select private.has_admin_role(array['owner', 'manager'])))
  with check ((select private.has_admin_role(array['owner', 'manager'])));

grant select on
  public.business_settings,
  public.business_settings_translations,
  public.business_contacts,
  public.business_hours
to anon, authenticated;

grant insert, update, delete on
  public.business_settings,
  public.business_settings_translations,
  public.business_contacts,
  public.business_hours
to authenticated;

revoke insert, update, delete, truncate on
  public.business_settings,
  public.business_settings_translations,
  public.business_contacts,
  public.business_hours
from anon;
