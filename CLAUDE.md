# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- Install deps: `npm install`
- Generate config artifacts: `npm run config:generate`
- Dev server (includes config generation): `npm run dev`
- Production build (includes config generation): `npm run build`
- Start production server: `npm run start` (cross-platform) / `npm run start:win` (PowerShell)
- Lint (includes config generation): `npm run lint`
- Type check: `npx tsc --noEmit`

### Docker (host-mapped config)

- First start / rebuild image: `docker compose up -d --build`
- Restart app after editing runtime config files: `docker compose restart app`
- View logs: `docker compose logs -f app`

### Tests

- There is currently no dedicated test runner script in `package.json`.
- Use `npm run lint` + `npm run build` as the main validation path.

## High-Level Architecture

This is a Next.js 15 App Router project with two product surfaces:

- `app/dashboard/*`: authenticated account center
- `app/portal/*`: service portal UI

### Authentication Layer (`lib/logto/`)

Authentication and account operations are centralized in the `lib/logto/` module:

```
lib/logto/
├── types.ts          # TypeScript interfaces
├── config.ts         # Logto configuration
├── client.ts         # Client methods (getLogtoContext, signIn, etc.)
├── account-api.ts    # Account API operations (user access token)
├── management-api.ts # Management API operations (M2M token)
└── index.ts          # Unified exports
```

> **Note**: `app/logto.ts` is kept for backward compatibility and re-exports from `lib/logto/`.

### Auth and API Model (critical)

The app intentionally uses two token types:

1. **User access token** (from Logto session via `@logto/next`):
   - Used for Account API (`/api/my-account*`, `/api/verifications*`)
   - Covers self-service actions (profile, password update flow, email/phone verification flow, MFA-related operations)
   - Implemented in `lib/logto/account-api.ts`
2. **M2M token** (from `LOGTO_M2M_CLIENT_ID/SECRET`):
   - Used for Management API operations requiring admin scope/context
   - Used for endpoints like user sessions/account deletion and some identity-management paths
   - Implemented in `lib/logto/management-api.ts`

When changing auth behavior, keep this boundary explicit instead of mixing all operations into M2M.

## Config Runtime (critical)

Config is loaded at runtime from mounted YAML and validated on startup:

- Runtime source files (Docker): `/app/runtime-config/services.yaml`, `/app/runtime-config/features.yaml`
- Runtime validator: `scripts/validate-runtime-config.mjs`
- Runtime loader: `lib/config/runtime-config.ts`
- Stable imports: `config/services.ts` and `config/features.ts`
- Public client config endpoint: `/api/public-config`
- Navigation config: `config/navigation.ts` (shared between Sidebar and Navbar)

`CONFIG_DIR` can override the runtime config directory (default: `config/source` in local non-Docker execution).

## Request / Rendering Flow

- `app/dashboard/layout.tsx` performs auth gate via `getLogtoContext()` and fetches account info for shared layout UI.
- Client pages in dashboard call internal API routes (`/api/account-*`, `/api/account/*`) instead of calling Logto directly from browser.
- Route handlers generally:
  1. verify authentication via `getLogtoContext()`
  2. enforce feature gates from `config/features`
  3. delegate to helpers in `lib/logto/`
  4. validate request body with Zod schemas from `lib/schemas.ts`

## Utilities

- **`lib/logger.ts`**: Environment-aware logger with automatic sanitization of sensitive data
- **`lib/schemas.ts`**: Zod validation schemas for API requests
- **`lib/i18n/`**: Simple i18n framework (currently Chinese only)
- **`hooks/use-fetch.ts`**: Data fetching hooks with request cancellation

## Docker Runtime Notes

Current Docker flow is image-first + runtime-config oriented:

- Entrypoint: `scripts/docker-entrypoint.sh`
- On container start it loads `/app/runtime-config/app.env`, validates `/app/runtime-config/*.yaml`, then starts the standalone server.
- Compose maps host directory `deploy/config` to `/app/runtime-config`, so config changes are applied by container restart.

## Environment Variables

See `.env.example` for full list. Core variables used across auth and runtime:

- `LOGTO_ENDPOINT`, `LOGTO_APP_ID`, `LOGTO_APP_SECRET`, `LOGTO_COOKIE_SECRET`
- `BASE_URL_DEV`, `BASE_URL_PROD`
- `LOGTO_M2M_CLIENT_ID`, `LOGTO_M2M_CLIENT_SECRET`
- Optional social connector IDs and `LOGTO_AVAILABLE_CONNECTORS`
- Optional `CONFIG_DIR` (runtime config directory used by Docker/runtime loader)
- Optional `LOG_LEVEL` (debug, info, warn, error)
- Optional `DISABLE_LOGGING` (set to "true" to disable all logging)

## Code Quality Guidelines

1. **Logging**: Use `lib/logger.ts` instead of `console.log`. Sensitive data is automatically redacted.
2. **Validation**: Always validate API request bodies with Zod schemas from `lib/schemas.ts`.
3. **Types**: Keep types in `lib/logto/types.ts`. Use explicit return types for exported functions.
4. **Navigation**: Use shared navigation config from `config/navigation.ts` instead of duplicating nav items.
5. **Data Fetching**: Use `useFetch` or `useMutation` from `hooks/use-fetch.ts` for client-side data fetching.
