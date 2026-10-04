<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules — Imbaraga z'Igisura

Read `README.md` (Architecture section) before changing code. Non-negotiables:

- **No hard-coded business data.** Products, prices, images, contacts, hours, address and
  descriptions come from Supabase. Never invent products, prices, testimonials or business facts.
- **No medical claims.** Product health information is stored only as `traditional_use` and must be
  presented as traditional use, never as a verified medical effect.
- **No hard-coded UI text.** All user-facing strings go in `src/messages/*.json` (English is the
  reference; run `npm run i18n:check`). Kinyarwanda wording must be reviewed by the family.
- **Security.** Admin pages and Server Actions call `requireAdmin()`; the database enforces the same
  rules with RLS. The secret/service-role key is server-only (`src/lib/supabase/service-role.ts`).
- **Schema changes** are new files in `supabase/migrations/` (never edit an applied migration), with RLS
  policies, then `npm run db:types`.
- Run `npm run check` and `npm run build` before committing.
