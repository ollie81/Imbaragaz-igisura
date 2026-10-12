-- =============================================================================
-- Draft products identified from the shop's own signs (photographs supplied by
-- the business, October 2026).
--
-- IMPORTANT
--   * Every product is a DRAFT: invisible to the public until a manager
--     reviews it and clicks "Publish" in the admin dashboard.
--   * Only the NAME is filled in. No price, size, description, origin,
--     traditional use or availability is set — those must come from the
--     business. A sign listing a product is not proof that it is in stock.
--   * A Kinyarwanda name is only added where the sign itself shows one;
--     otherwise the English name is shown in both languages until translated.
--   * Unclear sign entries were deliberately NOT added (e.g. "Umunyu wa
--     Gikukuru", "Amajyani ya soya", "Umumero w'ingano").
--
-- Safe to re-run: existing slugs are left untouched.
-- =============================================================================

with seed (slug, category_slug, sort, name_en, name_rw) as (
  values
    -- Herbs and spices
    ('cloves',            'herbs-and-spices',        10, 'Cloves',            null),
    ('cinnamon',          'herbs-and-spices',        20, 'Cinnamon',          'Mudaralasini'),
    ('turmeric',          'herbs-and-spices',        30, 'Turmeric',          'Curcuma, Manjano'),
    ('ginger',            'herbs-and-spices',        40, 'Ginger',            'Tangawizi'),
    ('fenugreek',         'herbs-and-spices',        50, 'Fenugreek',         null),
    ('bay-leaves',        'herbs-and-spices',        60, 'Bay leaves',        null),
    ('coriander',         'herbs-and-spices',        70, 'Coriander',         null),
    ('star-anise',        'herbs-and-spices',        80, 'Star anise',        null),
    ('cardamom',          'herbs-and-spices',        90, 'Cardamom',          null),
    ('fennel-seed',       'herbs-and-spices',       100, 'Fennel seed',       null),
    ('black-pepper',      'herbs-and-spices',       110, 'Black pepper',      null),
    ('tea-masala',        'herbs-and-spices',       120, 'Tea masala',        null),
    -- Herbal teas and plants
    ('samamaki-leaves',   'herbal-teas-and-plants',  10, 'Samamaki leaves',   null),
    ('chamomile',         'herbal-teas-and-plants',  20, 'Chamomile',         null),
    ('hibiscus-tea',      'herbal-teas-and-plants',  30, 'Hibiscus tea',      null),
    ('moringa',           'herbal-teas-and-plants',  40, 'Moringa',           null),
    -- Seeds and grains
    ('flax-seed',         'seeds-and-grains',        10, 'Flax seed',         null),
    ('black-seed',        'seeds-and-grains',        20, 'Black seed',        null),
    ('sesame-seeds',      'seeds-and-grains',        30, 'Sesame seeds',      'Sezame'),
    -- Nuts and dried fruits
    ('almond-nuts',       'nuts-and-dried-fruits',   10, 'Almond nuts',       null),
    ('cashew-nuts',       'nuts-and-dried-fruits',   20, 'Cashew nuts',       null),
    ('brazil-nuts',       'nuts-and-dried-fruits',   30, 'Brazil nuts',       null),
    ('pecan-nuts',        'nuts-and-dried-fruits',   40, 'Pecan nuts',        null),
    ('hazelnuts',         'nuts-and-dried-fruits',   50, 'Hazelnuts',         null),
    ('pistachio-nuts',    'nuts-and-dried-fruits',   60, 'Pistachio nuts',    null),
    ('kiwi-fruits',       'nuts-and-dried-fruits',   70, 'Kiwi fruits',       null),
    ('grapes',            'nuts-and-dried-fruits',   80, 'Grapes',            'Umuzabibu'),
    -- Natural oils
    ('olive-oil',         'natural-oils',            10, 'Olive oil',         'Amavuta ya elayo'),
    ('sunflower-oil',     'natural-oils',            20, 'Sunflower oil',     'Amavuta y''ibihwagari'),
    ('sesame-oil',        'natural-oils',            30, 'Sesame oil',        'Amavuta ya sezame'),
    ('castor-oil',        'natural-oils',            40, 'Castor oil',        'Castor oil (Amagaja)'),
    -- Coconut products
    ('coconut-oil',       'coconut-products',        10, 'Coconut oil',       'Amavuta ya coconut'),
    ('coconut-milk',      'coconut-products',        20, 'Coconut milk',      'Amata ya coconut'),
    ('coconut-flour',     'coconut-products',        30, 'Coconut flour',     'Ifu ya coconut'),
    -- Soy products
    ('soy-flour',         'soy-products',            10, 'Soy flour',         'Ifu ya soya'),
    ('soy-milk',          'soy-products',            20, 'Soy milk',          'Amata ya soya'),
    ('tofu',              'soy-products',            30, 'Tofu',              'Inyama za soya (Tofu)'),
    -- Natural vinegars
    ('apple-vinegar',     'natural-vinegars',        10, 'Apple vinegar',     null),
    -- Other products (salts)
    ('himalayan-salt',    'other-products',          10, 'Himalayan salt',    null),
    ('sea-salt',          'other-products',          20, 'Sea salt',          'Umunyu w''inyanja'),
    ('rock-salt',         'other-products',          30, 'Rock salt',         'Umunyu w''urutare')
),
inserted as (
  insert into public.products (slug, category_id, status, availability, display_order)
  select s.slug, c.id, 'draft', null, s.sort
  from seed s
  left join public.product_categories c on c.slug = s.category_slug
  on conflict (slug) do nothing
  returning id, slug
)
insert into public.product_translations (product_id, locale, name)
select i.id, t.locale, t.name
from inserted i
join seed s on s.slug = i.slug
cross join lateral (
  values ('en', s.name_en), ('rw', s.name_rw)
) as t(locale, name)
where t.name is not null;
