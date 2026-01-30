# ViewModel Patterns

This document describes the patterns used for ViewModels in this codebase.

## Core Concepts

### 1. Singleton vs Instance ViewModels

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Singleton** | Global state (auth, user, permissions) | `authViewModel` |
| **Instance** | Page-specific state (CRUD, filters, UI) | `new AlertsViewModel()` |

### 2. ViewModel Structure

```typescript
import { makeAutoObservable } from "~@/mobx";

export class ExampleViewModel {
  // Observable state
  items: Item[] = [];
  selectedItem: Item | null = null;
  isLoading = false;

  constructor(initialData?: Item[]) {
    makeAutoObservable(this);
    if (initialData) {
      this.items = initialData;
    }
  }

  // Computed properties (derived state)
  get filteredItems(): Item[] {
    return this.items.filter((item) => item.active);
  }

  get itemCount(): number {
    return this.items.length;
  }

  // Actions (state mutations)
  selectItem = (item: Item | null) => {
    this.selectedItem = item;
  };

  addItem = (item: Item) => {
    this.items.push(item);
  };

  // Cleanup method
  dispose() {
    // Cancel subscriptions, clear timers, etc.
  }
}
```

### 3. Factory Hook Pattern

For instance ViewModels, use a factory hook to manage lifecycle:

```typescript
import { useEffect, useState } from "react";
import { ExampleViewModel } from "./ExampleViewModel";

export function useExampleViewModel(initialData: Item[]) {
  const [vm] = useState(() => new ExampleViewModel(initialData));

  useEffect(() => {
    return () => vm.dispose();
  }, [vm]);

  return vm;
}
```

### 4. Using ViewModels in Components

```typescript
import { observer } from "~@/mobx";
import { useExampleViewModel } from "~@/view-model";

const ExamplePage = observer(function ExamplePage() {
  const vm = useExampleViewModel(initialData);

  return (
    <div>
      <p>Count: {vm.itemCount}</p>
      <ul>
        {vm.filteredItems.map((item) => (
          <li key={item.id} onClick={() => vm.selectItem(item)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
});
```

## Integration with ObservedQuery/ObservedMutation

For API integration, use `ObservedQuery` and `ObservedMutation`:

```typescript
import { makeAutoObservable } from "~@/mobx";
import { ObservedQuery, ObservedMutation } from "~@/mobx";
import { getItemsQuery, createItemMutation } from "~@/api";

export class ItemsViewModel {
  itemsQuery = new ObservedQuery(getItemsQuery, {});
  createMutation = new ObservedMutation(createItemMutation);

  constructor() {
    makeAutoObservable(this);
  }

  get items() {
    return this.itemsQuery.data ?? [];
  }

  get isLoading() {
    return this.itemsQuery.isLoading;
  }

  load = () => {
    this.itemsQuery.load();
  };

  createItem = async (data: CreateItemData) => {
    await this.createMutation.mutateAsync(data);
    this.itemsQuery.invalidate();
  };

  dispose() {
    this.itemsQuery.dispose();
    this.createMutation.dispose();
  }
}
```

## Best Practices

1. **Keep ViewModels focused**: One ViewModel per feature/page
2. **Use computed for derived state**: Avoid storing derived data
3. **Always call dispose**: Clean up resources on unmount
4. **Use `observer()` HOC**: Wrap components that use ViewModels
5. **Prefer instance over singleton**: Unless state is truly global
6. **Keep UI state in ViewModel**: Modals, selections, filters belong in VM

