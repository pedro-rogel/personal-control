# Personal Control Next

- This is the Next.js version of Personal Control. UI routes live in `src/app/`; interactive screens live in `src/features/pages/`.
- The existing Supabase database is shared with the original app. Do not create or modify database migrations here.
- Keep `src/integrations/supabase/types.ts` generated and unedited. Never put secret values in the repository or browser code.
- All application tables use owner-only RLS. Browser reads and writes use `src/lib/supabase-client.ts` and TanStack Query; saves persist immediately.
- Keep business rules in `src/lib/metrics.ts`, `src/lib/period.ts`, and `src/lib/backup.ts`; verify them with `src/test/business-rules.test.ts`.
- Authenticated pages use the client-only guard in `src/components/auth-guard.tsx` and share `AppShell` and `EditorProvider`.
- Home-screen install uses `public/manifest.webmanifest` and Apple metadata. Do not add a service worker.
