---
name: viewmodel-pattern
description: Pattern for implementing ViewModels using Singleton + Hook Pattern with MobX, including ObservedQuery/ObservedMutation API integration. Use when creating ViewModels, integrating with API queries/mutations, or managing shared reactive state across components.
---

# ViewModel Pattern with MobX

## Overview

Pattern for implementing ViewModels using a **Singleton + Hook Pattern** with **MobX** for reactive state management, integrated with **ObservedQuery** and **ObservedMutation** from the auto-generated API.

## Key Principles

1. **Singleton Pattern**: One instance per ViewModel, exported as a constant
2. **Hook Pattern**: Each ViewModel exposes a `useXxxViewModel()` hook in the same file
3. **MobX Observable**: All ViewModels use `makeAutoObservable(this)` for reactivity
4. **Private Fields**: Store ObservedQuery/ObservedMutation in `#query`/`#mutation` (private fields)
5. **Separation of Concerns**:
   - **Domain ViewModels**: Own data and business logic (e.g., `ItemsViewModel`)
   - **Component ViewModels**: Proxy/delegate to domain ViewModels (e.g., `ItemsPanelViewModel`)

## Template: Domain ViewModel (Lazy Network Loading)

```typescript
import { makeAutoObservable } from "~@/mobx";
import { getAllItemsV1ObservedQuery } from "~@/api";
import type { Item } from "~@/models";

class ItemsViewModel {
  #itemsQuery: ReturnType<typeof getAllItemsV1ObservedQuery> | null = null;
  #hasLoaded = false;

  activeCategory: string = "All";
  selectedIds: Set<string> = new Set();

  constructor() {
    makeAutoObservable(this);
  }

  #ensureQuery() {
    if (this.#itemsQuery) return this.#itemsQuery;
    this.#itemsQuery = getAllItemsV1ObservedQuery();
    return this.#itemsQuery;
  }

  load = () => {
    if (this.#hasLoaded) return;
    this.#hasLoaded = true;
    this.#ensureQuery().load();
  }

  // Actions
  setActiveCategory = (category: string) => {
    this.activeCategory = category;
  };

  toggleSelection = (itemId: string) => {
    if (this.selectedIds.has(itemId)) {
      this.selectedIds.delete(itemId);
    } else {
      this.selectedIds.add(itemId);
    }
  };

  // Computed properties
  get items(): Item[] {
    return this.#itemsQuery?.data?.data ?? [];
  }

  get activeItems(): Item[] {
    return this.items.filter((item) => item.status === "active");
  }

  get itemsByCategory(): Item[] {
    if (this.activeCategory === "All") return this.items;
    return this.items.filter((item) => item.category === this.activeCategory);
  }

  get itemsByStatus() {
    return {
      active: this.items.filter((item) => item.status === "active").length,
      pending: this.items.filter((item) => item.status === "pending").length,
      inactive: this.items.filter((item) => item.status === "inactive").length,
    };
  }

  get isLoading(): boolean {
    return this.#itemsQuery?.isLoading ?? false;
  }

  refresh = async () => {
    const q = this.#ensureQuery();
    this.#hasLoaded = true;
    await q.loadAsync();
  };

  invalidate = () => {
    this.#itemsQuery?.invalidate();
  };

  dispose = () => {
    this.#itemsQuery?.dispose();
    this.#itemsQuery = null;
    this.#hasLoaded = false;
  };
}

export const itemsViewModel = new ItemsViewModel();

export function useItemsViewModel() {
  // Lazy, idempotent network load – safe to call from multiple components.
  itemsViewModel.load();
  return itemsViewModel;
}
```

## Template: Domain ViewModel with Mutations

```typescript
import { makeAutoObservable } from "~@/mobx";
import {
  getAllItemsV1ObservedQuery,
  createItemV1ObservedMutation,
  updateItemV1ObservedMutation,
  deleteItemV1ObservedMutation,
} from "~@/api";
import type { Item, ItemRequest } from "~@/models";

class ItemsViewModel {
  #itemsQuery = getAllItemsV1ObservedQuery();
  #createMutation = createItemV1ObservedMutation();
  #updateMutation = updateItemV1ObservedMutation();
  #deleteMutation = deleteItemV1ObservedMutation();

  constructor() {
    makeAutoObservable(this);
    this.#itemsQuery.load();
  }

  get items(): Item[] {
    return this.#itemsQuery.data?.data ?? [];
  }

  get isLoading(): boolean {
    return this.#itemsQuery.isLoading;
  }

  get isCreating(): boolean {
    return this.#createMutation.isPending;
  }

  get isUpdating(): boolean {
    return this.#updateMutation.isPending;
  }

  get isDeleting(): boolean {
    return this.#deleteMutation.isPending;
  }

  createItem = async (input: ItemRequest): Promise<Item | null> => {
    const result = await this.#createMutation.mutateAsync({ body: input });
    if (result.data) {
      this.#itemsQuery.invalidate();
      return result.data;
    }
    return null;
  };

  updateItem = async (itemId: string, input: ItemRequest): Promise<void> => {
    await this.#updateMutation.mutateAsync({
      path: { id: itemId },
      body: input,
    });
    this.#itemsQuery.invalidate();
  };

  deleteItem = async (itemId: string): Promise<void> => {
    await this.#deleteMutation.mutateAsync({ path: { id: itemId } });
    this.#itemsQuery.invalidate();
  };

  dispose = () => {
    this.#itemsQuery.dispose();
  };
}

export const itemsViewModel = new ItemsViewModel();
export function useItemsViewModel() {
  return itemsViewModel;
}
```

## Template: ViewModel with Parameters

```typescript
import { makeAutoObservable } from "~@/mobx";
import { getItemDetailsV1ObservedQuery } from "~@/api";
import type { ItemDetail } from "~@/models";

class ItemDetailsViewModel {
  itemId: string = "";
  startDate: Date = new Date();
  endDate: Date = new Date();

  #detailsQuery = getItemDetailsV1ObservedQuery();

  constructor() {
    makeAutoObservable(this);
  }

  setItemId = async (itemId: string) => {
    this.itemId = itemId;
    await this.#detailsQuery.loadAsync({
      path: { id: itemId },
      query: { startDate: this.startDate, endDate: this.endDate },
    });
  };

  setDateRange = async (startDate: Date, endDate: Date) => {
    this.startDate = startDate;
    this.endDate = endDate;
    await this.#detailsQuery.loadAsync({
      path: { id: this.itemId },
      query: { startDate, endDate },
    });
  };

  get details(): ItemDetail[] {
    return this.#detailsQuery.data?.data ?? [];
  }

  get isLoading(): boolean {
    return this.#detailsQuery.isLoading;
  }

  dispose = () => {
    this.#detailsQuery.dispose();
  };
}

export const itemDetailsViewModel = new ItemDetailsViewModel();
export function useItemDetailsViewModel() {
  return itemDetailsViewModel;
}
```

## Template: Component ViewModel (Proxy)

```typescript
import { makeAutoObservable } from "~@/mobx";
import { itemsViewModel } from "./ItemsViewModel";
import type { Item } from "~@/models";

class ItemsPanelViewModel {
  constructor() {
    makeAutoObservable(this);
  }

  get items(): Item[] {
    return itemsViewModel.activeItems;
  }

  get sortedItems(): Item[] {
    return [...this.items].sort((a, b) => {
      const statusOrder = { active: 0, pending: 1, inactive: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }
}

export const itemsPanelViewModel = new ItemsPanelViewModel();

export function useItemsPanelViewModel() {
  return itemsPanelViewModel;
}
```

## File Structure

```
packages/view-model/
├── items/
│   ├── index.ts                      # Exports all ViewModels
│   ├── ItemsViewModel.ts             # Domain ViewModel
│   ├── ItemsPanelViewModel.ts        # Component ViewModel (proxy)
│   └── ItemsDetailsViewModel.ts      # Component ViewModel (proxy)
```

## Best Practices

✅ **DO:**
- Use `makeAutoObservable(this)` in constructor
- Export singleton instance as constant (e.g., `export const viewModel = new ViewModel()`)
- Export hook in same file (e.g., `export function useViewModel() { return viewModel; }`)
- Use `#query` and `#mutation` (private fields) to store API instances
- Call auto-generated functions like `getAllItemsV1ObservedQuery()`
- Access nested response data: `this.#query.data?.data`
- Invalidate queries after mutations: `this.#query.invalidate()`
- Use computed properties (`get`) for derived state
- Use arrow functions for actions to preserve `this` binding
- Provide a `dispose()` method for cleanup

❌ **DON'T:**
- Create multiple instances of the same ViewModel
- Export the class directly (export the instance instead)
- Put hooks in separate files
- Use public fields for queries/mutations (use `#query` not `query`)
- Forget to invalidate after mutations
- Access data without null checks (always use `?.` or `??`)
- Put UI state in ViewModels (use local component state instead)
- Use `makeObservable` (use `makeAutoObservable` instead)

## When to Use ViewModels

**Use ViewModels when:**
- ✅ Data is shared across multiple components
- ✅ Need computed properties (filtering, sorting, aggregations)
- ✅ Need to coordinate multiple queries/mutations
- ✅ Complex business logic that doesn't belong in components

**Don't use ViewModels when:**
- ❌ Data is only used in one component (use Controller instead)
- ❌ Simple DataTable with no shared state (use DataTable Controller with ObservedQuery)
