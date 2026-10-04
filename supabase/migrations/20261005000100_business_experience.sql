-- =============================================================================
-- Years of experience, shown on the website ("20+ years").
-- Stored as a minimum ("more than N years") because the exact founding year
-- has not been provided. Safe to re-run.
-- =============================================================================

alter table public.business_settings
  add column if not exists experience_years smallint
    check (experience_years is null or experience_years between 1 and 200);

comment on column public.business_settings.experience_years is
  'Minimum years in business, displayed as "N+ years". Provided by the business.';

update public.business_settings
set experience_years = 20
where id = 1 and experience_years is null;
