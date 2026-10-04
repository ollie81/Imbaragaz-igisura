-- =============================================================================
-- Initial business information, exactly as provided by the business.
-- Only confirmed facts are inserted; everything else is left NULL for the
-- family to fill in from the admin dashboard. Safe to re-run.
-- =============================================================================

insert into public.business_settings (id, business_name, country_code, city, address, timezone, default_currency)
values (1, 'Imbaraga z''Igisura', 'RW', 'Musanze', 'Musanze, Muhoza, Kigombe', 'Africa/Kigali', 'RWF')
on conflict (id) do nothing;

-- TODO(review): Kinyarwanda wording should be confirmed by the family.
insert into public.business_settings_translations (locale, location_description)
values
  ('en', 'Near Musanze Bus Station'),
  ('rw', 'Hafi ya Gare ya Musanze')
on conflict (locale) do nothing;

insert into public.business_contacts (type, value, is_primary, display_order)
values
  ('phone',    '+250788220423', true,  1),
  ('phone',    '+250783965104', false, 2),
  ('whatsapp', '+250788220423', true,  1),
  ('whatsapp', '+250783965104', false, 2)
on conflict (type, value) do nothing;

-- Every day, 06:00 – 22:00.
insert into public.business_hours (day_of_week, opens_at, closes_at)
select d, time '06:00', time '22:00'
from generate_series(1, 7) as d
where not exists (select 1 from public.business_hours);
