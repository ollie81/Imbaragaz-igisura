/**
 * Site navigation, shared by the header, mobile menu and footer.
 *
 * Contact points to the home-page section until it has its own page;
 * change the href here and every menu updates.
 */
export const mainNavigation = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/#contact" },
] as const;

export type NavKey = (typeof mainNavigation)[number]["key"];

/** In-page section ids used by the navigation above. */
export const sectionIds = {
  products: "products",
  about: "about",
  contact: "contact",
  location: "location",
} as const;
