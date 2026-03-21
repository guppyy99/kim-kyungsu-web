# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean political campaign/governance web application ("김경수 노션") with public-facing pages and a protected admin dashboard. Built on the Manus WebDev platform with React 19 + Express + tRPC.

## Commands

All commands run from the `web/` directory:

- **Dev server:** `pnpm dev` — starts Express + Vite dev server (tsx watch)
- **Build:** `pnpm build` — Vite builds client to `dist/public`, esbuild bundles server to `dist/index.js`
- **Start production:** `pnpm start` — runs `dist/index.js`
- **Type check:** `pnpm check` — `tsc --noEmit`
- **Format:** `pnpm format` — Prettier
- **Tests:** `pnpm test` — Vitest (server-only, Node environment, no jsdom)
- **Run single test:** `pnpm vitest run server/path/to/file.test.ts`
- **DB migrations:** `pnpm db:push` — generates and runs Drizzle migrations (requires `DATABASE_URL`)

## Architecture

### Monorepo Layout (single package.json in `web/`)

```
client/     → React 19 SPA (Vite, Tailwind v4, wouter router)
server/     → Express API server (tRPC, JWT auth)
shared/     → Types and constants shared between client/server
drizzle/    → MySQL schema (Drizzle ORM) and migrations
```

### Path Aliases

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

### Client (`client/src/`)

- **Router:** wouter (not react-router). `App.tsx` defines two route trees: `PublicRouter` (Layout wrapper) and `AdminRouter` (AdminLayout wrapper with auth guard).
- **API layer:** tRPC React Query client at `lib/trpc.ts` — all server calls use `trpc.useQuery`/`trpc.useMutation`. Endpoint: `/api/trpc`.
- **UI components:** shadcn/ui (new-york style) in `components/ui/`. Uses Radix primitives, `class-variance-authority`, `tailwind-merge`, `clsx`.
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin. CSS variables for theming in `index.css`.
- **Auto-logout:** Admin panel has a 10-minute inactivity timeout with a 1-minute warning toast, then auto-logout.

### Server (`server/`)

- **Entry:** `_core/index.ts` — Express app with tRPC middleware at `/api/trpc` and OAuth callback at `/api/oauth/callback`. 50MB body parser limit for file uploads.
- **tRPC setup:** `_core/trpc.ts` defines three procedure types: `publicProcedure`, `protectedProcedure` (requires auth), `adminProcedure` (requires admin role).
- **All routes in one file:** `routers.ts` — the entire `appRouter` with nested routers (auth, announcements, schedules, proposals, policy, pledges, admin, files). The `AppRouter` type is exported and imported by the client for end-to-end type safety.
- **Auth:** JWT sessions in cookies (`app_session_id`). Two login methods: Manus OAuth flow (`_core/oauth.ts` + `_core/sdk.ts`) and admin username/password (SHA256 with salt + "kimkyungsu2026"). Unauthenticated tRPC errors trigger client-side redirect to login.
- **Database:** MySQL via Drizzle ORM. Lazy connection via `getDb()` in `db.ts` — returns null if `DATABASE_URL` not set. All queries handle null DB gracefully (empty arrays or errors). Schema in `drizzle/schema.ts`.
- **File storage:** Base64 upload → S3 via Manus storage proxy (`storage.ts`). File paths: `kimkyungsu/{category}/{nanoid}.{ext}`.
- **Notifications:** `_core/notification.ts` sends to Manus Notification Service. Fails gracefully if service unreachable.

### Shared (`shared/`)

- Re-exports Drizzle schema types via `@shared/types`.
- Constants (cookie name, error messages) in `@shared/const`.
- Custom `HttpError` class in `_core/errors.ts`.

## Environment Variables

Required: `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`
Optional: `OWNER_OPEN_ID` (auto-promotes user to admin), `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `PORT`, `ADMIN_SETUP_KEY`

## Key Patterns

- Korean language is used extensively in UI text, DB enum values, and code comments — preserve this convention.
- Zod is used for all tRPC input validation. superjson is the tRPC transformer on both sides.
- Tests use `appRouter.createCaller(ctx)` pattern with mocked DB, storage, and notifications. Test context includes a mock user object with `TrpcContext` type.
- The wouter router is patched (`patches/wouter@3.7.1.patch`) to expose `window.__WOUTER_ROUTES__` for debugging.
- Seed data (sample pledges, announcements, schedules) auto-inserts on first admin stats query if DB is empty.
- The server runs without a database connection for local development — `getDb()` returns null and routes return empty data.
