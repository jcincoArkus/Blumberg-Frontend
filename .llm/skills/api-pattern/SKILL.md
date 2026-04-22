---
name: api-pattern
description: Pattern for auto-generating TypeScript API SDK from OpenAPI specs using hey-api with automatic MobX integration. Use when working with ObservedQuery, ObservedMutation, or API data fetching.
---

# API Pattern with hey-api and MobX

## Overview

Pattern for auto-generating TypeScript API SDK from OpenAPI specs using **hey-api**, with automatic **MobX** integration via custom plugin that generates `ObservedQuery` and `ObservedMutation` wrappers.

## Key Principles

1. **Auto-Generated**: API SDK, types, and MobX wrappers generated from OpenAPI spec
2. **Type-Safe**: Full TypeScript inference from backend OpenAPI schema
3. **ObservedQuery**: MobX-reactive wrapper for GET requests (queries)
4. **ObservedMutation**: MobX-reactive wrapper for POST/PUT/DELETE (mutations)
5. **Usage**: Use in Controllers (DataTable) or ViewModels (shared data)
6. **Reactive**: Automatic UI updates when data changes via MobX

## ObservedQuery - Basic Usage

**For GET requests (queries).**

```typescript
import { getAllItemsV1ObservedQuery, type GetAllItemsV1Data } from "~@/api";

// Create instance
const query = getAllItemsV1ObservedQuery();

// Load data
query.load({ query: { page: 1, limit: 20 } });

// Or load and await
await query.loadAsync({ query: { page: 1, limit: 20 } });

// Access data (reactive)
const items = query.data?.data ?? [];
const total = query.data?.total ?? 0;

// Check status (reactive)
const isLoading = query.isLoading;
const isFetching = query.isFetching;
const hasError = query.hasError;
const error = query.error;

// Invalidate and refetch
query.invalidate();

// Cleanup
query.dispose();
```

## ObservedQuery - With Parameters

**For queries with path params or query params.**

```typescript
import { getItemDetailsV1ObservedQuery, type GetItemDetailsV1Data } from "~@/api";

// Create instance
const detailsQuery = getItemDetailsV1ObservedQuery();

// Load with path parameters
await detailsQuery.loadAsync({
  path: { id: "item-123" },
  query: {
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
  },
});

// Access data
const details = detailsQuery.data?.data ?? [];
```

## ObservedQuery - Auto-refresh (polling)

**For lists that should update without user action**, pass **observer options** as the second argument. The generated functions have the signature `getXxxV1ObservedQuery(defaultValues?, observerOptions?)`. Use **`refetchInterval`** (milliseconds)—TanStack Query’s documented way to poll—so the query refetches in the background.

**Reference:** [TanStack Query — useQuery: refetchInterval](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery#refetchinterval): *"If set to a number, [the query] will continuously refetch at this frequency in milliseconds."* Optional: `refetchIntervalInBackground: true` keeps polling when the tab is in the background.

```typescript
import { getActiveAlertsV1ObservedQuery } from "~@/api";

// Poll every 30 seconds so new data appears without reload
const ALERTS_POLL_INTERVAL_MS = 30_000;
const query = getActiveAlertsV1ObservedQuery(undefined, {
  refetchInterval: ALERTS_POLL_INTERVAL_MS,
});
query.load();
```

Use a shared constant (e.g. in `packages/view-model/constants.ts`) when the same interval is used in multiple ViewModels. Other TanStack Query options (e.g. `staleTime`) can be passed in `observerOptions` when needed.

## ObservedMutation - Basic Usage

**For POST/PUT/DELETE operations (mutations).**

```typescript
import {
  createItemV1ObservedMutation,
  updateItemV1ObservedMutation,
  deleteItemV1ObservedMutation,
} from "~@/api";
import type { ItemRequest } from "~@/api";

// Create instances
const createMutation = createItemV1ObservedMutation();
const updateMutation = updateItemV1ObservedMutation();
const deleteMutation = deleteItemV1ObservedMutation();

// Create item
const result = await createMutation.mutateAsync({
  body: { name: "New Item", status: "active" },
});

// Update item
await updateMutation.mutateAsync({
  path: { id: "item-123" },
  body: { name: "Updated Item" },
});

// Delete item
await deleteMutation.mutateAsync({
  path: { id: "item-123" },
});

// Check status (reactive)
const isPending = createMutation.isPending;
const isSuccess = createMutation.isSuccess;
const isError = createMutation.isError;
const error = createMutation.error;

// Reset state
createMutation.reset();
```

## Invalidating Queries After Mutations

**Always invalidate related queries after successful mutations.**

```typescript
// After creating/updating/deleting, invalidate related queries
await createMutation.mutateAsync({ body: newItem });

// Invalidate the list query to refetch
itemsQuery.invalidate();
```

## ObservedQuery API Reference

```typescript
class ObservedQuery<T> {
  // Getters (reactive)
  get data(): T | null;           // Response data (null if not loaded)
  get isLoading(): boolean;       // First load in progress
  get isFetching(): boolean;      // Any fetch in progress (including refetch)
  get hasError(): boolean;        // Has error
  get error(): Error | null;      // Error object (null if no error)
  get isReady(): boolean;         // Has completed at least once

  // Methods
  load(params?: Partial<D>): void;              // Load data (fire and forget)
  loadAsync(params?: Partial<D>): Promise<void>; // Load data (await)
  invalidate(): void;                            // Invalidate cache and refetch
  dispose(): void;                               // Cleanup
}
```

**Key Points:**
- `data` returns `null` if not loaded (safe for conditional rendering)
- `isLoading` is `true` only on first load
- `isFetching` is `true` on any fetch (including background refetch)
- `load()` is fire-and-forget, `loadAsync()` returns a Promise

## ObservedMutation API Reference

```typescript
class ObservedMutation<T, V> {
  // Getters (reactive)
  get data(): T | undefined;      // Response data
  get isPending(): boolean;       // Mutation in progress
  get isSuccess(): boolean;       // Mutation succeeded
  get isError(): boolean;         // Mutation failed
  get error(): Error | null;      // Error object

  // Methods
  mutate(variables: V): void;                    // Mutate (fire and forget)
  mutateAsync(variables: V): Promise<T>;         // Mutate (await)
  reset(): void;                                 // Reset state
}
```

**Key Points:**
- `mutate()` is fire-and-forget, `mutateAsync()` returns a Promise
- Always call `.invalidate()` on related queries after successful mutation
- Use `isPending` to show loading states in UI

## Best Practices

✅ **DO:**
- **Use private fields** - Store queries/mutations in `#query` or `#mutation` (private field)
- **Use generated functions** - Call auto-generated functions like `getAllItemsV1ObservedQuery()`
- **Type parameters** - Use generated types like `GetAllItemsV1Data` for parameters
- **Invalidate after mutations** - Call `.invalidate()` on related queries after mutations
- **Dispose on cleanup** - Call `.dispose()` when cleaning up
- **Use loadAsync for awaiting** - Use `loadAsync()` when you need to await the result
- **Access nested data** - Response is often nested: `query.data?.data`
- **Check for null** - Always use `?.` or `??` operators when accessing data
- **Auto-refresh when needed** - Use TanStack Query’s documented polling: pass `observerOptions` as the second argument with `refetchInterval` (ms); see [useQuery refetchInterval](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery#refetchinterval); use a shared constant for the interval

❌ **DON'T:**
- **Don't use ObservedQuery for mutations** - Use ObservedMutation instead
- **Don't use ObservedMutation for queries** - Use ObservedQuery instead
- **Don't forget to invalidate** - Always invalidate related queries after mutations
- **Don't access data without null check** - Always use `?.` or `??` operators
- **Don't create multiple instances** - Reuse the same instance
- **Don't use public fields** - Use `#query` (private) not `query` (public)

