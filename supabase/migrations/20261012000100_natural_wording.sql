-- =============================================================================
-- Wording requested by the business: the website speaks about NATURAL
-- products. It does not use "traditional"/"gakondo", "medicine"/"imiti" or
-- "ibicuruzwa"/"ubucuruzi" (trade) in customer-facing text.
--
--   * Removes the suggested "Traditional products" category, only if no
--     product uses it (products would otherwise just lose their category).
--   * Renames "Ibindi bicuruzwa" → "Ibindi by'umwimerere", only if the
--     manager has not already changed it.
--
-- Safe to re-run.
-- =============================================================================

delete from public.product_categories c
where c.slug = 'traditional-products'
  and not exists (select 1 from public.products p where p.category_id = c.id);

update public.product_category_translations t
set name = 'Ibindi by''umwimerere'
from public.product_categories c
where t.category_id = c.id
  and c.slug = 'other-products'
  and t.locale = 'rw'
  and t.name = 'Ibindi bicuruzwa';
