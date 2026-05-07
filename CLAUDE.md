# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

This is a **Next.js 16 + Supabase** academic management app with three user roles: `admin`, `docente`, `estudiante`.

### Route groups

- `app/(auth)/` — Public pages (login, registro). Auth callback at `/auth/callback`.
- `app/(dashboard)/` — Protected pages split by role: `/admin`, `/docente`, `/estudiante`.
- `app/api/` — API routes mirroring the same role split: `api/admin/`, `api/docente/`, `api/estudiante/`, `api/auth/`.

### Auth & session flow

- `middleware.ts` runs on every request, creates a Supabase server client, verifies the user via `supabase.auth.getUser()`, and redirects unauthenticated users from private routes to `/login`.
- `lib/supabase/server.ts` — async server client (Server Components, API routes, middleware).
- `lib/supabase/client.ts` — browser client (Client Components).
- Dashboard layout (`app/(dashboard)/layout.tsx`) independently verifies the session and fetches `usuarios_perfil` (columns: `nombre_completo`, `rol`) to determine the sidebar navigation.

### Role-based navigation

`lib/navigation.ts` exports `navigationConfig` — a `Record<string, NavGroup[]>` keyed by role. The `AppSidebar` component reads the user's `rol` from `usuarios_perfil` to render the correct nav items.

### Supabase table

- `usuarios_perfil` — joined to `auth.users` by `id`, contains at minimum `nombre_completo` and `rol`.

### Key conventions

- Validation schemas live in `lib/validations/` using **Zod v4**. Form integration uses `react-hook-form` + `@hookform/resolvers/zod`.
- UI components are **shadcn/ui** (Radix-based) in `components/ui/`. Add new ones via `npx shadcn add <component>`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are required env vars (see `.env.local`).
- Images served from Supabase Storage (`*.supabase.co`) are allowed via `next.config.ts`.
