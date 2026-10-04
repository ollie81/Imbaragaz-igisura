# Imbaraga z'Igisura

Website for **Imbaraga z'Igisura** — traditional medicine and natural products, Musanze (Rwanda).

This repository currently contains the **technical foundation** only: project setup, design system,
internationalization, Supabase integration, database schema with security policies, and a temporary
contact holding page. Product pages and the admin tools are built next.

## Tech stack

| Concern         | Choice                                                               |
| --------------- | -------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Server Components) + React 19                |
| Language        | TypeScript 6 (strict)                                                |
| Styling         | Tailwind CSS 4 (design tokens in `src/app/globals.css`)              |
| i18n            | next-intl 4 — Kinyarwanda (`rw`, default) and English (`en`)         |
| Database / Auth | Supabase (Postgres + Row Level Security, Supabase Auth, Storage)     |
| Hosting         | Vercel-compatible (no custom server, no Node-only runtime tricks)    |
| Quality         | ESLint (next core-web-vitals + TS), Prettier (+ Tailwind class sort) |

Runtime dependencies are deliberately few: `next`, `react`, `react-dom`, `next-intl`,
`@supabase/supabase-js`, `@supabase/ssr`, `server-only`. No UI kit, icon library or CSS-in-JS.

## Running locally

Requirements: Node.js 20.9+ (22 recommended, see `.nvmrc`) and npm.

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000 → redirects to /rw
```

The site runs **without** Supabase configured (it simply shows no contact details), so you can work
on UI before the database exists.

### Scripts

| Script               | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | Development server                                         |
| `npm run build`      | Production build                                           |
| `npm run start`      | Serve the production build                                 |
| `npm run check`      | Typecheck + lint + formatting + translation key check      |
| `npm run format`     | Format all files with Prettier                             |
| `npm run i18n:check` | Verify every language file has the same keys as `en.json`  |
| `npm run db:types`   | Regenerate `src/types/database.ts` from the linked project |

## Environment variables

| Variable                               | Where           | Purpose                                                                                                         |
| -------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | browser+server  | Public site URL (canonical URLs, sitemap, Open Graph, QR codes). On Vercel it defaults to the production domain |
| `NEXT_PUBLIC_SUPABASE_URL`             | browser+server  | Supabase project URL                                                                                            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser+server  | Supabase publishable (or legacy anon) key — safe, RLS-restricted                                                |
| `SUPABASE_SECRET_KEY`                  | **server only** | Supabase secret (or legacy service_role) key — bypasses RLS. Not needed yet                                     |

Never prefix the secret key with `NEXT_PUBLIC_` and never commit `.env.local`.

## Architecture

```
src/
├─ app/                       Routes only (thin): layouts, pages, metadata, robots, sitemap
│  ├─ [locale]/               Every page lives under /rw/… or /en/…
│  │  ├─ layout.tsx           <html lang>, fonts, i18n provider, base metadata
│  │  ├─ (site)/              PUBLIC website (header + footer); statically rendered, revalidated every 5 min
│  │  ├─ admin/               ADMIN dashboard (noindex)
│  │  │  ├─ login/            Sign-in (placeholder until the sign-in method is chosen)
│  │  │  └─ (dashboard)/      Protected area — layout + every page call requireAdmin()
│  │  ├─ [...rest]/           Localized 404 for unknown paths
│  │  └─ not-found.tsx
│  ├─ robots.ts, sitemap.ts
│  └─ globals.css             Design tokens (Tailwind @theme)
├─ components/
│  ├─ ui/                     Generic primitives: Button, Card, Container, Section, icons
│  ├─ layout/                 Site header/footer, language switcher, skip link
│  ├─ business/               Business-aware components (contact buttons, opening hours)
│  └─ seo/                    JSON-LD renderer
├─ server/                    Data access + business logic (server-only). One module per domain
│                             (business.ts now; products.ts, orders.ts … later)
├─ lib/
│  ├─ supabase/               Supabase clients: public (cacheable), server (session), browser,
│  │                          service-role (server-only, bypasses RLS), proxy (session refresh)
│  ├─ auth/                   getCurrentAdmin() / requireAdmin()
│  ├─ seo/                    Metadata (canonical, hreflang, Open Graph) and JSON-LD builders
│  └─ utils/                  Small pure helpers (class names, phone links, opening hours)
├─ i18n/                      Locale config, routing, request config, locale-aware Link/redirect
├─ messages/                  UI text: rw.json, en.json (English is the reference catalog)
├─ config/                    Environment variables and technical site config
├─ types/                     Database types (generated shape) and next-intl typing
└─ proxy.ts                   Language detection/redirects; session refresh on admin routes
supabase/
├─ config.toml                Local Supabase CLI config (sign-ups disabled, strong passwords)
└─ migrations/                Versioned SQL schema, RLS policies, storage buckets, initial data
```

### Key decisions

- **Data from the database, not the code.** Components never contain products, prices, images or
  business facts. `src/server/*` loads them; components receive them as props. If the database is
  unavailable, business info falls back to the verified facts in `src/config/business-defaults.ts`
  (so QR-code visitors always get correct contact details), and product sections show an honest
  "coming soon" state, never guesses.
- **Public pages are static.** They read through a cookie-less Supabase client, so they can be
  prerendered and cached (fast on slow mobile connections). Only admin routes touch the session.
- **Language in the URL** (`/rw/…`, `/en/…`, `localePrefix: "always"`): unambiguous for search
  engines (hreflang alternates are emitted on every page) and stable for printed QR codes.
  `/` redirects using the visitor's previous choice or browser language, defaulting to Kinyarwanda.
- **Adding Swahili** = add `"sw"` in `src/i18n/config.ts`, create `src/messages/sw.json`, and insert
  `sw` into the `public.locales` table. No schema or component changes.
- **Minimal client JavaScript.** Everything is a Server Component except the language switcher.

### Database (Supabase)

Migrations in `supabase/migrations/`:

| File                                     | Contents                                                                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `…000100_foundation.sql`                 | `locales`, `admins`, `private.is_admin()` / `private.has_admin_role()`, updated_at trigger                                                     |
| `…000200_catalog.sql`                    | `product_categories` (+translations), `products` (+translations), `product_variants` (size + price), `product_images` (+alt text translations) |
| `…000300_business.sql`                   | `business_settings` (single row) + translations, `business_contacts`, `business_hours`                                                         |
| `…000400_storage.sql`                    | Public buckets `product-images`, `site-media` (5 MB, images only) + write policies                                                             |
| `…000500_initial_business_data.sql`      | Only the facts provided by the business: name, location, phones, WhatsApp, hours                                                               |
| `20261005000100_business_experience.sql` | `business_settings.experience_years` (shown as "20+ years")                                                                                    |

Design notes:

- **Translations** live in `*_translations` tables keyed by `(id, locale)`; the app falls back to
  Kinyarwanda, then to any available language, when a translation is missing.
- **Prices** are on `product_variants` (one row per size). `price` is nullable: `NULL` means
  "ask for the price" — it is never shown as 0 and never guessed.
- **Health information:** there is intentionally **no medical-claims column**. `traditional_use`
  must always be presented as traditional use. Medically verified claims, if ever needed, require a
  new table that records the evidence source and reviewer. This also gives the future AI assistant a
  clear boundary.
- Allowed values (status, availability, units, roles) use `CHECK` constraints instead of enums so
  they can be extended in a later migration. `products.metadata` (jsonb) holds small extras until
  they deserve a real column.
- Future features (orders, customers, inventory, loyalty, AI …) are added as new tables referencing
  `products` / `product_variants`; nothing in the current schema blocks them.

### Security model

- **Row Level Security on every table.** Anonymous visitors can read only published products, active
  categories/contacts and business info. Writes require an active row in `public.admins`:
  - `editor`: catalog (products, categories, images)
  - `manager`: catalog + business settings, contacts, hours, site media
  - `owner`: everything above + languages
- `public.admins` cannot be modified from the browser at all — only with the SQL editor/service role.
- The admin UI checks access server-side (`requireAdmin()`, which verifies the session with Supabase
  Auth), but the database enforces the same rules independently — the UI is never the only guard.
- The secret key is only reachable from `server-only` modules; importing them in client code fails the build.
- Public sign-up is disabled in `supabase/config.toml`; disable it in the hosted project too.
- Security headers (nosniff, frame denial, referrer and permissions policy, HSTS) are set in `next.config.ts`.

## Supabase setup (still to do)

1. Create a Supabase project (region close to Rwanda, e.g. `eu-west`/`eu-central`, or as decided).
2. Put the project URL and publishable key in `.env.local` (and in Vercel).
3. Apply the migrations: `npx supabase login`, `npx supabase link --project-ref <ref>`,
   `npx supabase db push`. Then `npm run db:types`.
4. Authentication → Sign In / Providers: **disable "Allow new users to sign up"**; set the site URL
   and redirect URLs to the production domain.
5. Create the business manager's account (Authentication → Users → _Invite user_, using their email),
   then grant access in the SQL editor:

   ```sql
   insert into public.admins (user_id, full_name, role)
   select id, 'Niyomugaba Patrick', 'owner' from auth.users where email = '<email>';
   ```

   No password is created by us; they set it themselves from the invitation email.

## Conventions

- Server-only modules start with `import "server-only"`.
- Use `Link`/`redirect` from `@/i18n/navigation` (not `next/link`) so URLs keep the language.
- UI text → `src/messages/*.json`; content → database. Kinyarwanda strings need family review.
- Use semantic colour tokens (`bg-primary`, `bg-accent`, `text-muted-foreground` …). Gold is for
  backgrounds/accents; don't put gold text on white (poor contrast).
- Run `npm run check && npm run build` before committing.
