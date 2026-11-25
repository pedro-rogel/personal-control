# Personal Control Next

- This is a modular Next.js monolith. UI routes live in `src/app/`; interactive screens live in `src/features/pages/`.
- PostgreSQL access stays on the server through Drizzle and `DATABASE_URL`. Never put database credentials or `BETTER_AUTH_SECRET` in browser code or the repository.
- Local Drizzle migrations live in `drizzle/local-migrations/`. `drizzle/migrations/` holds historical Supabase SQL and must not be applied to the local database.
- Authentication uses Better Auth with database sessions. Every data operation must require a session, filter rows by `owner_id`, and verify that child `student_id` belongs to the same user. Never trust a client supplied `owner_id`.
- Client data hooks live in `src/lib/data.ts` and use the local `/api/records` route. Saves persist immediately.
- Keep business rules in `src/lib/metrics.ts`, `src/lib/period.ts`, and `src/lib/backup.ts`; verify them with `src/test/business-rules.test.ts`.
- Authenticated pages share `AppShell` and `EditorProvider`.
- Home-screen install uses `public/manifest.webmanifest` and Apple metadata. Do not add a service worker.
