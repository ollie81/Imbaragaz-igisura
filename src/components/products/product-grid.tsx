import type { ProductSummary } from "@/server/products";

import { ProductCard } from "./product-card";

/** Responsive grid of product cards: 1 column on phones, 2 on tablets, 3 on desktops. */
export function ProductGrid({ products }: { products: ProductSummary[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard product={product} priority={i === 0} />
        </li>
      ))}
    </ul>
  );
}
