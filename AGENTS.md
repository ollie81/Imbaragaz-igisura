<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules — Imbaraga z'Igisura

Read `README.md` (Architecture section) before changing code. Non-negotiables:

- **No hard-coded business data.** Products, prices, images, contacts, hours, address and
  descriptions come from Supabase. Never invent products, prices, testimonials or business facts.
  The only exception is `src/config/business-defaults.ts`: verified facts used as a fallback when the
  database is unavailable (keep it in sync with the seed migrations; never add unconfirmed data).
- **No medical claims.** How a product is used is stored in `traditional_use` and shown as
  "How it is commonly used" / "Uko bikunze gukoreshwa". Never write cures or treatment promises.
  At the business's request the site does NOT show "not a medically proven effect" style notes;
  product pages only advise pregnant people / people under a doctor's care to ask a professional.
- **Wording (requested by the business).** Customer-facing text speaks about **natural** products.
  Do not use "medicine"/"imiti", "traditional"/"gakondo" or "ibicuruzwa"/"ubucuruzi" (trade) to
  describe what the business offers. In Kinyarwanda use e.g. "Ibyo dutanga", "ibintu by'umwimerere",
  "ibikomoka ku bimera".
- **No hard-coded UI text.** All user-facing strings go in `src/messages/*.json` (English is the
  reference; run `npm run i18n:check`). Kinyarwanda wording must be reviewed by the family.
- **Security.** Admin pages and Server Actions call `requireAdmin()`; the database enforces the same
  rules with RLS. The secret/service-role key is server-only (`src/lib/supabase/service-role.ts`).
- **Schema changes** are new files in `supabase/migrations/` (never edit an applied migration), with RLS
  policies, then `npm run db:types`.
- **Admin mutations** go through `runAdminAction()` (`src/server/admin/guard.ts`): it checks the
  session server-side, acts as the signed-in user (so RLS applies) and refreshes cached pages.
- **Cached (ISR) routes**: `loading.tsx`, `error.tsx` and `not-found.tsx` under cached routes must not
  call next-intl server APIs (they can run before the request locale is set and then read headers,
  which breaks static rendering). Use client components with the messages the layout provides.
- Run `npm run check` and `npm run build` before committing.
