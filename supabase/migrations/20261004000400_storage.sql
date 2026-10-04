-- =============================================================================
-- Storage buckets for public images.
--   product-images : product photos (path convention: <product_id>/<file>)
--   site-media     : logo, storefront and other site photos
-- Both are publicly readable (served via CDN); only admins can upload/change.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('site-media', 'site-media', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
on conflict (id) do nothing;

-- Public buckets are readable through the public URL without a policy; this
-- policy is for listing/reading through the API.
create policy "Public images are readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('product-images', 'site-media'));

create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()))
  with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));

create policy "Managers can upload site media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and (select private.has_admin_role(array['owner', 'manager'])));
create policy "Managers can update site media"
  on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and (select private.has_admin_role(array['owner', 'manager'])))
  with check (bucket_id = 'site-media' and (select private.has_admin_role(array['owner', 'manager'])));
create policy "Managers can delete site media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and (select private.has_admin_role(array['owner', 'manager'])));
