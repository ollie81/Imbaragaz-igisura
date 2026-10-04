-- =============================================================================
-- Foundation: shared helpers, supported content locales, administrators.
--
-- Conventions used across all migrations:
--   * snake_case names, uuid primary keys (gen_random_uuid()).
--   * created_at / updated_at on every mutable table, maintained by trigger.
--   * Constrained text + CHECK instead of Postgres ENUMs, so allowed values can
--     be extended later with a simple constraint swap inside a migration.
--   * Translatable content lives in *_translations tables keyed by locale, so a
--     new language (e.g. Swahili) is added with data, not with schema changes.
--   * Row Level Security is enabled on every table. The public (anon) role can
--     only read published content; only active administrators can write.
-- =============================================================================

-- Functions that must not be callable through the Data API live here.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Locales
-- Content languages the business publishes in. Adding Swahili later:
--   insert into public.locales (code, name, native_name, sort_order) values ('sw', 'Swahili', 'Kiswahili', 3);
-- -----------------------------------------------------------------------------
create table public.locales (
  code        text primary key check (code ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  name        text not null,
  native_name text not null,
  is_enabled  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.locales is 'Languages that content can be published in. Translation tables reference this.';

create trigger locales_set_updated_at
  before update on public.locales
  for each row execute function private.set_updated_at();

insert into public.locales (code, name, native_name, sort_order) values
  ('rw', 'Kinyarwanda', 'Ikinyarwanda', 1),
  ('en', 'English', 'English', 2);

-- -----------------------------------------------------------------------------
-- Administrators
-- A row here grants a Supabase Auth user access to the admin dashboard.
-- Rows are managed only with the service role / SQL editor (no client writes).
-- -----------------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null check (char_length(full_name) between 1 and 200),
  role       text not null default 'editor' check (role in ('owner', 'manager', 'editor')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.admins is 'Supabase Auth users allowed to manage site content. Managed via service role only.';
comment on column public.admins.role is 'owner: full control incl. future admin management; manager: business settings + catalog; editor: catalog content.';

create trigger admins_set_updated_at
  before update on public.admins
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- Authorization helpers (SECURITY DEFINER so they can read public.admins
-- regardless of the caller's RLS visibility; search_path pinned for safety).
-- -----------------------------------------------------------------------------
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = (select auth.uid())
      and a.is_active
  );
$$;

create or replace function private.has_admin_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = (select auth.uid())
      and a.is_active
      and a.role = any (allowed_roles)
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.has_admin_role(text[]) from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.has_admin_role(text[]) to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.locales enable row level security;
alter table public.admins enable row level security;

create policy "Locales are publicly readable"
  on public.locales for select
  to anon, authenticated
  using (true);

create policy "Owners can manage locales"
  on public.locales for all
  to authenticated
  using ((select private.has_admin_role(array['owner'])))
  with check ((select private.has_admin_role(array['owner'])));

-- Signed-in users may see only their own admin row (used by the app to check
-- access); active admins can see the full list. No insert/update/delete
-- policies: admin membership is changed with the service role only.
create policy "Users can read their own admin record"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

-- Explicit privileges (RLS still decides which rows are visible/writable).
grant select on public.locales to anon, authenticated;
grant insert, update, delete on public.locales to authenticated;
grant select on public.admins to authenticated;
revoke insert, update, delete, truncate on public.admins from anon, authenticated;
revoke all on public.admins from anon;
