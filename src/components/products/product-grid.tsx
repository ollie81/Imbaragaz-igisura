import type { ProductSummary } from "@/server/products";

import { ProductCard, type ProductContact } from "./product-card";

type ProductGridProps = {
  products: ProductSummary[];
  contact: ProductContact;
  headingLevel?: "h2" | "h3";
};

/** Responsive grid of product cards: 1 column on phones, 2 on tablets, 3 on desktops. */
export function ProductGrid({ products, contact, headingLevel }: ProductGridProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            contact={contact}
            priority={i === 0}
            headingLevel={headingLevel}
          />
        </li>
      ))}
    </ul>
  );
}
