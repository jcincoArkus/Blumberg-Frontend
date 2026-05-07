# Implementing API Calls for a New Screen — Reference Guide

This document captures the end-to-end process used to wire up the Inventory module from mock data to real API calls. Follow these steps whenever adding API-backed screens.

---

## Overview of Steps

1. Define the API contract in the backend OpenAPI spec
2. Regenerate the API client
3. Create a ViewModel
4. Update views to use the ViewModel

---

## Step 1 — Define the API contract in `openapi.yaml`

**File:** `Blumberg-Backend/Adapters/OpenApi/openapi.yaml`

This is the single source of truth for all API calls. Do not hand-write API calls in the frontend.

### 1a. Add a tag

Find the `tags:` section and add an entry for the new domain:

```yaml
tags:
  - name: Inventory
```

### 1b. Add paths

Find the `paths:` section (ends just before `components:`). Add one block per endpoint. Follow this exact template — all three content types are required in both requests and responses for the codegen to produce correct TypeScript:

```yaml
  /api/v1/inventory/your-resource:
    get:
      tags:
        - Inventory
      operationId: getYourResourceV1
      parameters:
        - name: Page
          in: query
          schema:
            type: integer
            format: int32
        - name: PageSize
          in: query
          schema:
            type: integer
            format: int32
      responses:
        '200':
          description: Success
          content:
            text/plain:
              schema:
                $ref: '#/components/schemas/YourResourcePagedResponse'
            application/json:
              schema:
                $ref: '#/components/schemas/YourResourcePagedResponse'
            text/json:
              schema:
                $ref: '#/components/schemas/YourResourcePagedResponse'

  /api/v1/inventory/your-resource/{id}:
    post:
      tags:
        - Inventory
      operationId: createYourResourceV1
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/YourResourceRequest'
          text/json:
            schema:
              $ref: '#/components/schemas/YourResourceRequest'
          application/*+json:
            schema:
              $ref: '#/components/schemas/YourResourceRequest'
      responses:
        '200':
          description: Success
          content:
            text/plain:
              schema:
                $ref: '#/components/schemas/YourResourceResponse'
            application/json:
              schema:
                $ref: '#/components/schemas/YourResourceResponse'
            text/json:
              schema:
                $ref: '#/components/schemas/YourResourceResponse'
```

### 1c. Add schemas

Find the `components: schemas:` section (ends just before `securitySchemes:`). Add Request, Response, and PagedResponse schemas:

```yaml
    YourResourceRequest:
      type: object
      properties:
        name:
          type: string
          nullable: true
        # ... other fields

    YourResourceResponse:
      type: object
      properties:
        id:
          type: string
          nullable: true
        name:
          type: string
          nullable: true
        # ... other fields

    YourResourcePagedResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/YourResourceResponse'
          nullable: true
        totalCount:
          type: integer
          format: int32
        page:
          type: integer
          format: int32
        pageSize:
          type: integer
          format: int32
        totalPages:
          type: integer
          format: int32
```

**Naming tips:**
- Prefix schema names with the domain (e.g. `InventoryLotResponse`) to avoid collisions with existing schemas that share generic names like `SiteResponse`.
- All response properties should be `nullable: true` to match backend serialization behavior.
- If you need joined/denormalized fields (e.g. `productName` on a lot), add them inline to the response schema and document them as computed — the backend populates them.

---

## Step 2 — Regenerate the API client

**Before running the command**, verify `packages/api/openapi.config.ts`:

```ts
// This path is machine-specific — adjust to where you cloned the backend
inputPath: "./../Blumberg-Backend/Adapters/OpenApi/openapi.yaml"
```

Then run:

```bash
bun api:gen
```

This regenerates `packages/api/generated/` and produces:
- `types.gen.ts` — TypeScript types for all request/response schemas
- `sdk.gen.ts` — raw API functions
- `mobx-query.gen.ts` — `ObservedQuery` wrappers (for GET endpoints)
- `mobx-mutation.gen.ts` — `ObservedMutation` wrappers (for POST/PUT/DELETE endpoints)

Generated function names follow the `operationId` from the spec:
- `getYourResourceV1` → `getYourResourceV1ObservedQuery`
- `createYourResourceV1` → `createYourResourceV1ObservedMutation`

---

## Step 3 — Create a ViewModel

**Location:** `packages/view-model/<domain>/YourViewModel.ts`

ViewModels are the data layer between the API and views. Choose the right pattern:

| Pattern | When to use |
|---|---|
| **Singleton** | Shared reference data used across multiple views (lists, lookup tables) |
| **Instance** | Per-page state like a create/edit form |

### Singleton ViewModel template

```typescript
import { makeAutoObservable } from "~@/mobx";
import {
  getYourResourceV1ObservedQuery,
  createYourResourceV1ObservedMutation,
  type YourResourceResponse,
} from "~@/api";

// Define lean domain types that views consume
// (avoids importing generated nullable types directly into views)
export type YourResource = {
  id: string;
  name: string;
  // ... non-nullable, mapped fields
};

function mapYourResource(r: YourResourceResponse): YourResource {
  return {
    id: r.id ?? "",
    name: r.name ?? "",
  };
}

class YourViewModel implements Disposable {
  #hasLoaded = false;

  #resourceQuery = getYourResourceV1ObservedQuery({
    query: { Page: 1, PageSize: 500 },
  });

  createMutation = createYourResourceV1ObservedMutation();

  constructor() {
    makeAutoObservable(this);
  }

  load() {
    if (this.#hasLoaded) return;
    this.#hasLoaded = true;
    this.#resourceQuery.observe();
  }

  get isLoading() {
    return this.#resourceQuery.isLoading;
  }

  get resources(): YourResource[] {
    return (this.#resourceQuery.data?.items ?? []).map(mapYourResource);
  }

  resourceById(id: string): YourResource {
    return this.resources.find((r) => r.id === id) ?? { id: "", name: "—" };
  }

  refresh() {
    this.#resourceQuery.invalidate();
    this.#resourceQuery.refetch();
  }

  [Symbol.dispose]() {
    this.#resourceQuery.dispose();
  }
}

export const yourViewModel = new YourViewModel();

export function useYourViewModel() {
  yourViewModel.load();
  return yourViewModel;
}
```

### Export from the package barrel

**`packages/view-model/<domain>/index.ts`:**
```typescript
export { yourViewModel, useYourViewModel } from "./YourViewModel";
export type { YourResource } from "./YourViewModel";
```

**`packages/view-model/index.ts`** — add:
```typescript
export * from "./<domain>";
```

---

## Step 4 — Update views to use the ViewModel

### 4a. Wrap with `observer`

```tsx
import { observer } from "~@/mobx";

export const YourView = observer(function YourView() {
  // ...
});
```

### 4b. Call the hook at the top

```tsx
import { useYourViewModel } from "~@/view-model";

export const YourView = observer(function YourView() {
  const vm = useYourViewModel();
  // ...
});
```

### 4c. Replace mock data references

| Before (mock) | After (ViewModel) |
|---|---|
| `import { lots } from "./data"` | `vm.lots` |
| `productById(id)` | `vm.productById(id)` |
| Static constant `TODAY` | `new Date()` / `Date.now()` |
| Hardcoded arrays for categories/sites | `vm.categories`, `vm.sites` |

### 4d. Add a loading state

```tsx
{vm.isLoading ? (
  <div style={{ padding: "40px 16px", textAlign: "center" }}>
    Loading…
  </div>
) : (
  <table>…</table>
)}
```

### 4e. Wire mutations (for forms)

```tsx
const handleSave = async () => {
  setSaving(true);
  try {
    const shipment = await vm.createShipmentMutation.mutateAsync({
      body: { /* request fields */ },
    });
    // create related resources as needed
    await vm.createLineMutation.mutateAsync({ body: { shipmentId: shipment.id, … } });
    vm.refresh();
    navigate("/your-route");
  } finally {
    setSaving(false);
  }
};
```

### 4f. Fix type conflicts on mapped fields

If a ViewModel type has `exp: Date` but you want to override it with `exp: ExpStatus` in a local enriched type, use `Omit` to remove the conflicting field first:

```typescript
type EnrichedLot = Omit<InvLot, "exp"> & {
  exp: ExpStatus;   // replaces the Date field
  expDate: Date;    // keep the original date separately
};
```

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| `bun api:gen` fails with ENOENT | Check `inputPath` in `packages/api/openapi.config.ts` |
| Schema name collides with existing type | Prefix with domain name (e.g. `InventorySiteResponse`) |
| Response fields are `undefined` at runtime | Add `?? ""` / `?? 0` / `?? []` fallbacks in `mapXxx()` |
| View doesn't react to data changes | Ensure the view component is wrapped with `observer()` |
| `vm.load()` called too late | Call it at the top of the component, before any `useMemo` |
| TypeScript error: type not assignable | Use `Omit<BaseType, "conflictingField">` in enriched local types |
