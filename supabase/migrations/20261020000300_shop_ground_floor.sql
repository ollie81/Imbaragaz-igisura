-- Correction from the family: the shop is on the GROUND floor (no stairs),
-- 3rd door when facing north. Only replaces seeded text. Safe to re-run.
update public.business_settings_translations
set location_description = 'Inside Musanze Bus Station: ground floor, 3rd door (facing north)'
where locale = 'en'
  and location_description in (
    'Near Musanze Bus Station',
    'Inside Musanze Bus Station',
    'Inside Musanze Bus Station: first floor, 3rd door (facing north)'
  );

update public.business_settings_translations
set location_description = 'Muri Gare ya Musanze: hasi (nta ngazi), umuryango wa 3 (ureba mu majyaruguru)'
where locale = 'rw'
  and location_description in (
    'Hafi ya Gare ya Musanze',
    'Muri Gare ya Musanze',
    'Muri Gare ya Musanze: igorofa rya mbere, umuryango wa 3 (ureba mu majyaruguru)'
  );
