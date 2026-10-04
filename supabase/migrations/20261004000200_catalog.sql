-- =============================================================================
-- Product catalog: categories, products, size/price variants, images.
--
-- Health-information policy (important for the website AND the future AI
-- assistant): this schema deliberately has NO column for medical or
-- therapeutic claims. `traditional_use` stores how a product is traditionally
-- used and must always be presented as tradition, never as a verified medical
-- effect. If medically verified claims are ever needed, they must be added as
-- a separate table that records the evidence source and the reviewer.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Categories (optional hierarchy via parent_id)
-- -----------------------------------------------------------------------------
create table public.product_categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  parent_id     uuid references public.product_categories (id) on delete set null,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

create index product_categories_parent_id_idx on public.product_categories (parent_id);
create index product_categories_display_order_idx on public.product_categories (display_order);

create table public.product_category_translations (
  category_id uuid not null references public.product_categories (id) on delete cascade,
  locale      text not null references public.locales (code) on update cascade,
  name        text not null check (char_length(name) between 1 and 200),
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (category_id, locale)
);

create index product_category_translations_locale_idx on public.product_category_translations (locale);

-- -----------------------------------------------------------------------------
-- Products (language-neutral fields only)
-- -----------------------------------------------------------------------------
create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id   uuid references public.product_categories (id) on delete set null,
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  availability  text not null default 'in_stock'
                check (availability in ('in_stock', 'low_stock', 'out_of_stock', 'on_request')),
  is_featured   boolean not null default false,
  display_order integer not null default 0,
  published_at  timestamptz,
  -- Escape hatch for small, non-critical attributes before they earn a column.
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by    uuid references auth.users (id) on delete set null,
  updated_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.products.status is 'Only "published" products are visible to the public.';
comment on column public.products.availability is 'Shown to customers and used by the AI assistant; never inferred.';

create index products_category_id_idx on public.products (category_id);
create index products_status_display_order_idx on public.products (status, display_order);
create index products_featured_idx on public.products (display_order)
  where is_featured and status = 'published';

-- Translatable product content. One row per (product, locale).
create table public.product_translations (
  product_id         uuid not null references public.products (id) on delete cascade,
  locale             text not null references public.locales (code) on update cascade,
  name               text not null check (char_length(name) between 1 and 200),
  short_description  text,
  description        text,
  origin             text,
  traditional_use    text,
  usage_instructions text,
  warnings           text,
  seo_title          text,
  seo_description    text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  primary key (product_id, locale)
);

comment on column public.product_translations.traditional_use is
  'How the product is TRADITIONALLY used. Must be displayed as traditional use, never as a medically verified claim.';
comment on column public.product_translations.warnings is
  'Cautions and notes (e.g. allergies, consult a health professional). Displayed prominently.';

create index product_translations_locale_idx on public.product_translations (locale);

-- -----------------------------------------------------------------------------
-- Variants: each sellable size with its own price.
-- price is nullable on purpose: NULL means "ask for price", never 0.
-- -----------------------------------------------------------------------------
create table public.product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  sku           text unique,
  label         text,
  size_value    numeric(10, 3) check (size_value is null or size_value > 0),
  size_unit     text check (size_unit in ('ml', 'l', 'g', 'kg', 'piece', 'pack')),
  price         numeric(12, 2) check (price is null or price >= 0),
  currency      char(3) not null default 'RWF' check (currency ~ '^[A-Z]{3}$'),
  is_available  boolean not null default true,
  is_default    boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check ((size_value is null) = (size_unit is null))
);

create index product_variants_product_id_idx on public.product_variants (product_id, display_order);
create unique index product_variants_one_default_idx on public.product_variants (product_id) where is_default;

-- -----------------------------------------------------------------------------
-- Images (files live in the "product-images" storage bucket)
-- -----------------------------------------------------------------------------
create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  variant_id    uuid references public.product_variants (id) on delete set null,
  storage_path  text not null unique,
  width         integer check (width is null or width > 0),
  height        integer check (height is null or height > 0),
  is_primary    boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.product_images.storage_path is 'Object path inside the "product-images" bucket.';

create index product_images_product_id_idx on public.product_images (product_id, display_order);
create index product_images_variant_id_idx on public.product_images (variant_id);
create unique index product_images_one_primary_idx on public.product_images (product_id) where is_primary;

create table public.product_image_translations (
  image_id   uuid not null references public.product_images (id) on delete cascade,
  locale     text not null references public.locales (code) on update cascade,
  alt_text   text not null check (char_length(alt_text) between 1 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (image_id, locale)
);

create index product_image_translations_locale_idx on public.product_image_translations (locale);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
create trigger product_categories_set_updated_at before update on public.product_categories
  for each row execute function private.set_updated_at();
create trigger product_category_translations_set_updated_at before update on public.product_category_translations
  for each row execute function private.set_updated_at();
create trigger products_set_updated_at before update on public.products
  for each row execute function private.set_updated_at();
create trigger product_translations_set_updated_at before update on public.product_translations
  for each row execute function private.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants
  for each row execute function private.set_updated_at();
create trigger product_images_set_updated_at before update on public.product_images
  for each row execute function private.set_updated_at();
create trigger product_image_translations_set_updated_at before update on public.product_image_translations
  for each row execute function private.set_updated_at();

-- Stamp published_at the first time a product is published.
create or replace function private.set_product_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger products_set_published_at before insert or update of status on public.products
  for each row execute function private.set_product_published_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- Public: read only active categories and published products (+ their children).
-- Admins: full read/write on the catalog.
-- -----------------------------------------------------------------------------
alter table public.product_categories enable row level security;
alter table public.product_category_translations enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_image_translations enable row level security;

-- Categories
create policy "Active categories are publicly readable"
  on public.product_categories for select to anon, authenticated
  using (is_active or (select private.is_admin()));
create policy "Admins can manage categories"
  on public.product_categories for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Active category translations are publicly readable"
  on public.product_category_translations for select to anon, authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.product_categories c
      where c.id = category_id and c.is_active
    )
  );
create policy "Admins can manage category translations"
  on public.product_category_translations for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- Products
create policy "Published products are publicly readable"
  on public.products for select to anon, authenticated
  using (status = 'published' or (select private.is_admin()));
create policy "Admins can manage products"
  on public.products for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Published product translations are publicly readable"
  on public.product_translations for select to anon, authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'published'
    )
  );
create policy "Admins can manage product translations"
  on public.product_translations for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Published product variants are publicly readable"
  on public.product_variants for select to anon, authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'published'
    )
  );
create policy "Admins can manage product variants"
  on public.product_variants for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Published product images are publicly readable"
  on public.product_images for select to anon, authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'published'
    )
  );
create policy "Admins can manage product images"
  on public.product_images for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Published product image translations are publicly readable"
  on public.product_image_translations for select to anon, authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1
      from public.product_images i
      join public.products p on p.id = i.product_id
      where i.id = image_id and p.status = 'published'
    )
  );
create policy "Admins can manage product image translations"
  on public.product_image_translations for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Privileges (RLS above still filters rows)
-- -----------------------------------------------------------------------------
grant select on
  public.product_categories,
  public.product_category_translations,
  public.products,
  public.product_translations,
  public.product_variants,
  public.product_images,
  public.product_image_translations
to anon, authenticated;

grant insert, update, delete on
  public.product_categories,
  public.product_category_translations,
  public.products,
  public.product_translations,
  public.product_variants,
  public.product_images,
  public.product_image_translations
to authenticated;

revoke insert, update, delete, truncate on
  public.product_categories,
  public.product_category_translations,
  public.products,
  public.product_translations,
  public.product_variants,
  public.product_images,
  public.product_image_translations
from anon;
