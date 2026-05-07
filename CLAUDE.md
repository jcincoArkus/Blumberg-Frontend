# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager & Runtime

**Always use Bun** (v1.3.8+). Never use npm or yarn.

## Common Commands

```bash
bun app:start            # Dev server at localhost:4080
bun build                # Production build
bun format               # Format with Biome
bun format:check         # Check formatting (CI)
bun app:typecheck        # Type-check (react-router typegen + tsgo)
bun api:gen              # Regenerate API client from OpenAPI spec
bun i18n:extract         # Extract i18n strings from source
bun i18n:compile         # Compile i18n catalogs to TypeScript
bun authorization:generate  # Regenerate CASL authorization rules
```

No test runner is configured.

## Monorepo Structure

```
apps/app/src/            # Main React Router 7 application
  routes/                # Filesystem-based routes (React Router conventions)
  root.tsx               # Root layout + global error boundary
  app.css                # Global Tailwind + CSS custom properties

packages/
  api/                   # OpenAPI-generated client + Axios config
  authorization/         # CASL-based permission system
  config/                # VITE_* env config (per-stage .env files)
  data-table/            # TanStack Table v8 wrapper + MobX store
  forms/                 # Schema-driven form engine (Zod + React Hook Form)
  i18n/                  # Lingui integration
  mobx/                  # MobX helpers (makeAutoObservable with autoBind)
  models/                # Domain DTOs + mappers (preferred over packages/domain)
  query-client/          # TanStack Query v5 setup
  ui/                    # Radix UI primitives + Tailwind components
  view-model/            # MobX ViewModels by feature domain
  views/                 # Feature-specific view components
```

## Architecture

### Routing
React Router 7 with filesystem routes. Conventions:
- `_private+/` — authenticated routes, `_public+/` — unauthenticated
- `index.tsx` → list, `new.tsx` → create, `$id.tsx` → detail, `$id+/edit.tsx` → edit
- Layout files: `_private.tsx`, `_public.tsx`

### State Management
**MobX + TanStack Query** hybrid:
1. `ObservedQuery` / `ObservedMutation` (in `packages/mobx/`) wrap TanStack Query with MobX reactivity
2. ViewModels in `packages/view-model/` own domain state — use **singleton VMs** for global state (auth, dashboard) and **instance VMs** for page-scoped state (CRUD forms, filters)
3. Route components are wrapped with `observer()` from mobx-react-lite
4. See `packages/view-model/PATTERNS.md` for ViewModel patterns

### API Layer
- `bun api:gen` regenerates `packages/api/generated/` from `packages/api/openapi.yaml`
- Client config lives in `packages/api/client.ts` (Axios + qs for array params with `repeat` format)
- Do not hand-write API calls — edit the OpenAPI spec and regenerate

### Forms
Schema-driven headless engine in `packages/forms/`. Define a typed `FormSchema`, use `<Form>` component — no manual JSX per field. Supports conditional visibility (`shownIf`), multi-step, and Zod validation. See `packages/forms/README.md`.

### Styling
Tailwind CSS v4 + CSS custom properties (oklch color space) defined in `apps/app/src/app.css`. Use the `cn()` utility (`clsx` + `tailwind-merge`) from `packages/ui/utils.ts` for conditional classNames. Components use `data-slot` attributes for CSS targeting.

### i18n
All user-facing strings must use Lingui macros (`t` template tag or `<Trans>`). Run `bun i18n:extract` after adding strings, then `bun i18n:compile` before testing translations. Details in `packages/i18n/i18n.md`.

### Module Aliases
Path alias `~@/` maps to `packages/`. Example: `import { Button } from "~@/ui"`.

## Environment
Copy `packages/config/configs/.env` to `.env.local` for local overrides. Key vars:
- `VITE_API_URL` — backend API base URL
- `VITE_WSS_URL` — WebSocket URL
- `VITE_ENV` — `local | develop | staging | production`
