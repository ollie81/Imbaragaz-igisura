-- =============================================================================
-- Catalogue extensions for the Products pages and the admin dashboard.
--
--   * product_translations: ingredients/composition and storage information.
--   * products.availability becomes OPTIONAL (NULL = not stated). Availability
--     is only shown to customers when the business has actually set it.
--   * Suggested product categories (names only; the admin can rename,
--     reorder, deactivate or delete them, and add new ones).
--
-- Non-destructive: no columns or rows are removed. Safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Product content fields
-- -----------------------------------------------------------------------------
alter table public.product_translations
  add column if not exists ingredients text,
  add column if not exists storage_instructions text;

comment on column public.product_translations.ingredients is
  'Ingredients / composition. Only information verified by the business.';
comment on column public.product_translations.storage_instructions is
  'How to store the product (e.g. keep in a cool, dry place).';

-- -----------------------------------------------------------------------------
-- Availability: optional, never assumed
-- -----------------------------------------------------------------------------
alter table public.products alter column availability drop not null;
alter table public.products alter column availability drop default;
alter table public.products drop constraint if exists products_availability_check;
alter table public.products add constraint products_availability_check
  check (availability is null
         or availability in ('in_stock', 'low_stock', 'out_of_stock', 'on_request'));

comment on column public.products.availability is
  'Shown to customers only when set. NULL = not stated (never assume "in stock").';

-- -----------------------------------------------------------------------------
-- Suggested categories
-- TODO(review): Kinyarwanda names should be confirmed by the family.
-- -----------------------------------------------------------------------------
insert into public.product_categories (slug, display_order)
values
  ('herbs-and-spices', 10),
  ('herbal-teas-and-plants', 20),
  ('seeds-and-grains', 30),
  ('nuts-and-dried-fruits', 40),
  ('natural-oils', 50),
  ('coconut-products', 60),
  ('soy-products', 70),
  ('natural-vinegars', 80),
  ('plant-based-powders', 90),
  ('traditional-products', 100),
  ('natural-personal-care', 110),
  ('other-products', 120)
on conflict (slug) do nothing;

insert into public.product_category_translations (category_id, locale, name)
select c.id, t.locale, t.name
from (values
  ('herbs-and-spices',       'en', 'Herbs and spices'),
  ('herbs-and-spices',       'rw', 'Ibirungo n''ibimera'),
  ('herbal-teas-and-plants', 'en', 'Herbal teas and plants'),
  ('herbal-teas-and-plants', 'rw', 'Icyayi cy''ibimera'),
  ('seeds-and-grains',       'en', 'Seeds and grains'),
  ('seeds-and-grains',       'rw', 'Inzuzi n''ibinyampeke'),
  ('nuts-and-dried-fruits',  'en', 'Nuts and dried fruits'),
  ('nuts-and-dried-fruits',  'rw', 'Ubunyobwa n''imbuto zumye'),
  ('natural-oils',           'en', 'Natural oils'),
  ('natural-oils',           'rw', 'Amavuta akomoka ku bimera'),
  ('coconut-products',       'en', 'Coconut products'),
  ('coconut-products',       'rw', 'Ibikomoka kuri coconut'),
  ('soy-products',           'en', 'Soy products'),
  ('soy-products',           'rw', 'Ibikomoka kuri soya'),
  ('natural-vinegars',       'en', 'Natural vinegars'),
  ('natural-vinegars',       'rw', 'Vinegere z''umwimerere'),
  ('plant-based-powders',    'en', 'Plant-based powders'),
  ('plant-based-powders',    'rw', 'Amafu akomoka ku bimera'),
  ('traditional-products',   'en', 'Traditional products'),
  ('traditional-products',   'rw', 'Ibicuruzwa gakondo'),
  ('natural-personal-care',  'en', 'Natural personal-care products'),
  ('natural-personal-care',  'rw', 'Ibyo kwita ku mubiri by''umwimerere'),
  ('other-products',         'en', 'Other products'),
  ('other-products',         'rw', 'Ibindi bicuruzwa')
) as t(slug, locale, name)
join public.product_categories c on c.slug = t.slug
on conflict (category_id, locale) do nothing;
