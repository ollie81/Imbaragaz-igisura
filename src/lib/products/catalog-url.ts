export type CatalogParams = { q?: string; category?: string; page?: number };

/** Builds a Products page URL (without locale) that keeps the active filters. */
export function catalogHref({ q, category, page }: CatalogParams): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

/** Reads a single string from Next.js searchParams. */
export function readParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() || undefined;
}
