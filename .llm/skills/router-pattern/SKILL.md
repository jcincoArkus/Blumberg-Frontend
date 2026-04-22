---
name: router-pattern
description: Pattern for file-based routing with React Router v7 Framework Mode using remix-flat-routes conventions. Use when creating new routes or pages.
---

# Router Pattern with React Router v7 + remix-flat-routes

## Overview

Pattern for implementing **file-based routing** with **React Router v7 Framework Mode** using **remix-flat-routes** conventions for file naming and organization.

## Stack

- **React Router v7** - Framework mode with Vite plugin
- **remix-flat-routes** - File naming conventions
- **@react-router/remix-routes-option-adapter** - Adapter for Remix-style routes

## Key Principles

1. **File-Based Routing**: Routes defined by file structure in `routes/`
2. **Flat Routes Convention**: Use dot notation or `+` folders for hierarchy
3. **Pathless Layouts**: Use `_` prefix for layouts without URL segments
4. **Client-Side Only**: SSR disabled (`ssr: false`)
5. **Auto-Generated Types**: Types in `.react-router/types/`

## File Naming Conventions

| Pattern | URL | Description |
|---------|-----|-------------|
| `_index.tsx` | `/` | Root index route |
| `about.tsx` | `/about` | Simple route |
| `about.contact.tsx` | `/about/contact` | Nested via dot notation |
| `$id.tsx` | `/:id` | Dynamic parameter |
| `$.tsx` | `/*` | Splat/catch-all |
| `_auth.tsx` | - | Pathless layout (no URL segment) |
| `_auth.login.tsx` | `/login` | Route inside pathless layout |
| `_auth+/login.tsx` | `/login` | Same, using hybrid folder |

## Hybrid Folder Convention (`+`)

Append `+` to folder names to use flat-file convention inside:

```
routes/
├── _public+/                 # Pathless layout folder
│   ├── _public.tsx           # Layout component (renders Outlet)
│   └── login.tsx             # /login
├── _private+/                # Pathless layout folder
│   ├── _private.tsx          # Layout component
│   ├── home.tsx              # /home
│   ├── items+/               # Nested folder
│   │   ├── index.tsx         # /items
│   │   └── $id.tsx           # /items/:id
│   └── settings+/
│       ├── index.tsx         # /settings
│       └── profile.tsx       # /settings/profile
```

## Configuration

**routes.ts:**
```typescript
import path from "node:path";
import { fileURLToPath } from "node:url";
import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";
import { flatRoutes } from "remix-flat-routes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default remixRoutesOptionAdapter((defineRoutes) => {
  return flatRoutes("routes", defineRoutes, {
    appDir: __dirname,
    ignoredRouteFiles: ["**/.*"],
  });
});
```

**react-router.config.ts:**
```typescript
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  appDirectory: "src",
  buildDirectory: "dist",
} satisfies Config;
```

**vite.config.ts:**
```typescript
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
});
```

## Template: Root Layout (root.tsx)

```typescript
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404
      ? "The requested page could not be found."
      : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <main>
      <h1>{message}</h1>
      <p>{details}</p>
    </main>
  );
}
```

## Template: Pathless Layout Route (_layout+/_layout.tsx)

```typescript
import { Outlet } from "react-router";

/**
 * Pathless layout route.
 * Wraps child routes without adding URL segment.
 */
export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

## Template: Layout with clientLoader

```typescript
import { Outlet } from "react-router";

import type { Route } from "./+types/_private";

export async function clientLoader() {
  return { user: await fetchCurrentUser() };
}

export default function PrivateLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="layout">
      <Sidebar user={user} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

## Template: Simple Page Route

```typescript
/**
 * Page component.
 * Layout is provided by parent layout route.
 */
export default function ItemsPage() {
  return (
    <div>
      <h1>Items</h1>
      <p>List of items</p>
    </div>
  );
}
```

## Template: Page with clientLoader

```typescript
import type { Route } from "./+types/items";

export async function clientLoader() {
  const items = await fetchItems();
  return { items };
}

export default function ItemsPage({ loaderData }: Route.ComponentProps) {
  const { items } = loaderData;

  return (
    <div>
      <h1>Items ({items.length})</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Template: Dynamic Route ($id.tsx)

```typescript
import { Link } from "react-router";

import type { Route } from "./+types/$id";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const item = await fetchItem(params.id);
  return { item };
}

export default function ItemDetailPage({ loaderData }: Route.ComponentProps) {
  const { item } = loaderData;

  if (!item) {
    return (
      <div>
        <h1>Item Not Found</h1>
        <Link to="/items">Back to Items</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/items">Back</Link>
      <h1>{item.name}</h1>
      <p>{item.description}</p>
    </div>
  );
}
```

## Template: Index Route with Redirect

```typescript
import { redirect } from "react-router";

import type { Route } from "./+types/_index";

export async function clientLoader() {
  const isAuthenticated = await checkAuth();

  if (isAuthenticated) {
    throw redirect("/home");
  }

  throw redirect("/login");
}

export default function Index() {
  return <div>Redirecting...</div>;
}
```

## Navigation

```typescript
import { Link, useNavigate, useParams } from "react-router";

// Declarative (preferred)
<Link to="/items">Items</Link>
<Link to={`/items/${id}`}>View</Link>
<Link to="/items" replace>Replace history</Link>

// Programmatic
const navigate = useNavigate();
navigate("/home");
navigate("/home", { replace: true });
navigate(-1); // Go back

// Access dynamic params
const { id } = useParams();
```

## Route Module Exports

```typescript
import type { Route } from "./+types/items";

// Data loading (runs before render)
export async function clientLoader({ params, request }: Route.ClientLoaderArgs) {
  return { data: await fetchData() };
}

// Page component
export default function Page({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.data}</div>;
}

// Error handling
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <div>Error: {error.message}</div>;
}

// Page metadata
export const meta: Route.MetaFunction = () => [
  { title: "Page Title" },
];

// Link prefetching
export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: "/styles.css" },
];
```

## Best Practices

✅ **DO:**
- Use `_segment+/` folders for pathless layouts
- Use `$param.tsx` for dynamic routes
- Use dot notation for flat nesting: `about.contact.tsx`
- Export `default function` for components
- Use `clientLoader` for data fetching
- Import types from `./+types/[route-name]`

❌ **DON'T:**
- Forget `<Outlet />` in layout components
- Mix folder conventions inconsistently
- Use server-side features when `ssr: false`
- Block navigation with slow clientLoader

## Common Patterns

**Protected Route:**
```typescript
export async function clientLoader() {
  if (!isAuthenticated()) {
    throw redirect("/login");
  }
  return {};
}
```

**Nested Dynamic Routes:**
```
items+/$id+/index.tsx   → /items/:id
items+/$id+/edit.tsx    → /items/:id/edit
```

**Catch-All Route:**
```typescript
// $.tsx matches any unmatched path
export default function CatchAll() {
  return <div>Page not found</div>;
}
```
