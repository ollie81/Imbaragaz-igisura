-- Kinyarwanda wording for the shop's spot, as written by the family.
-- Only replaces seeded text. Safe to re-run.
update public.business_settings_translations
set location_description = 'Muri Gare ya Musanze: ku miryango yo hasi, umuryango wa gatatu (ureba mu majyaruguru)'
where locale = 'rw'
  and location_description in (
    'Hafi ya Gare ya Musanze',
    'Muri Gare ya Musanze',
    'Muri Gare ya Musanze: igorofa rya mbere, umuryango wa 3 (ureba mu majyaruguru)',
    'Muri Gare ya Musanze: hasi (nta ngazi), umuryango wa 3 (ureba mu majyaruguru)'
  );
