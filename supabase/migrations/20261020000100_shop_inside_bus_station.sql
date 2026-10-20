-- The shop is INSIDE Musanze Bus Station, not near it (confirmed by the family).
-- Only replaces the original seed text, so a description already edited in the
-- admin dashboard is left alone. Safe to re-run.
update public.business_settings_translations
set location_description = 'Inside Musanze Bus Station'
where locale = 'en' and location_description = 'Near Musanze Bus Station';

update public.business_settings_translations
set location_description = 'Muri Gare ya Musanze'
where locale = 'rw' and location_description = 'Hafi ya Gare ya Musanze';
