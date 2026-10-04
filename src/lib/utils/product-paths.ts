/** Canonical URL path (without locale) of a product detail page. */
export function productPath(slug: string): string {
  return `/products/${slug}`;
}
