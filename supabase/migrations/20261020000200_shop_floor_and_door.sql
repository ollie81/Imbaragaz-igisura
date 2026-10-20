-- Exact spot inside Musanze Bus Station, as given by the family:
-- first floor, 3rd door when facing north. Only replaces seeded text, so a
-- description edited in the admin dashboard is left alone. Safe to re-run.
update public.business_settings_translations
set location_description = 'Inside Musanze Bus Station: first floor, 3rd door (facing north)'
where locale = 'en'
  and location_description in ('Near Musanze Bus Station', 'Inside Musanze Bus Station');

update public.business_settings_translations
set location_description = 'Muri Gare ya Musanze: igorofa rya mbere, umuryango wa 3 (ureba mu majyaruguru)'
where locale = 'rw'
  and location_description in ('Hafi ya Gare ya Musanze', 'Muri Gare ya Musanze');
