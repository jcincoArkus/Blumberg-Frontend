---
name: Component + ViewModel Pattern
description: Pattern for integrating React Components with ViewModels using the Observer Pattern with MobX
version: 1.0.0
tags: [react, mobx, viewmodel, observer, integration, typescript]
---

# Component + ViewModel Pattern

## Overview

Pattern for integrating **React Components** with **ViewModels** using the **Observer Pattern** with **MobX**.

## Key Principles

1. **Observer HOC**: All components that use ViewModels must be wrapped with `observer()`
2. **Hook Pattern**: Components access ViewModels via `useXxxViewModel()` hooks
3. **Functional Components**: Use function declarations with named exports
4. **Reactive**: MobX makes components re-render automatically when ViewModel data changes
5. **Separation**: UI state in component, business data in ViewModel

## Template: Basic Component with ViewModel

```typescript
import { observer } from "@/mobx";
import { useItemsPanelViewModel } from "@/view-models";

export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  return (
    <div>
      <h2>Items ({vm.itemCount})</h2>
      <ul>
        {vm.items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
});
```

**Note:** `itemCount` should be a getter in the ViewModel:

```typescript
// In ViewModel
get itemCount(): number {
  return this.items.length;
}
```

## Template: Component with Props

```typescript
import { observer } from "@/mobx";
import { useItemsPanelViewModel } from "@/view-models";

interface ItemsPanelProps {
  onItemClick?: (itemId: string) => void;
}

export const ItemsPanel = observer(function ItemsPanel({
  onItemClick,
}: ItemsPanelProps) {
  const vm = useItemsPanelViewModel();

  return (
    <div>
      <h2>Items ({vm.itemCount})</h2>
      <ul>
        {vm.items.map((item) => (
          <li key={item.id} onClick={() => onItemClick?.(item.id)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
});
```

## Template: Component with Local State

```typescript
import { useState } from "react";
import { observer } from "@/mobx";
import { useItemsPanelViewModel } from "@/view-models";
import type { Item } from "@/models";

export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  // Local state (not in ViewModel)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  return (
    <div>
      <h2>Items ({vm.itemCount})</h2>
      <ul>
        {vm.sortedItems.map((item) => (
          <li key={item.id} onClick={() => handleItemClick(item)}>
            {item.name}
          </li>
        ))}
      </ul>

      {isDrawerOpen && selectedItem && (
        <ItemDrawer item={selectedItem} onClose={() => setIsDrawerOpen(false)} />
      )}
    </div>
  );
});
```

## Template: Component with ViewModel Getters

```typescript
import { observer } from "@/mobx";
import { useItemsPanelViewModel } from "@/view-models";

export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  return (
    <div>
      <h2>Items ({vm.itemCount})</h2>

      {/* ✅ Use getter for ViewModel state */}
      <div>{vm.sortedItems.map((item) => ...)}</div>

      {/* ✅ Use getter for computed values */}
      <div>Active: {vm.activeItemCount}</div>
    </div>
  );
});
```

**Note:** Getters should be in the ViewModel:

```typescript
// In ViewModel
get sortedItems(): Item[] {
  return this.items.sort((a, b) => a.name.localeCompare(b.name));
}

get activeItemCount(): number {
  return this.items.filter(item => item.status === 'active').length;
}
```

## Template: Component with ViewModel Methods

```typescript
import { observer } from "@/mobx";
import { useItemsPanelViewModel } from "@/view-models";

interface ItemsPanelProps {
  maxItems?: number;
}

export const ItemsPanel = observer(function ItemsPanel({ 
  maxItems = 10 
}: ItemsPanelProps) {
  const vm = useItemsPanelViewModel();

  return (
    <div>
      <h2>Items ({vm.itemCount})</h2>

      {/* ✅ Use method with prop parameter */}
      <ul>
        {vm.getDisplayItems(maxItems).map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
});
```

**Note:** Methods can receive parameters:

```typescript
// In ViewModel
getDisplayItems(maxItems: number): Item[] {
  return this.items.slice(0, maxItems);
}
```

## When to Use Local State vs ViewModel

**Local State (`useState`):**
- ✅ UI state (modals, drawers, tabs, selected items)
- ✅ Form input values (before submission)
- ✅ Temporary state (hover, focus, expanded)

**ViewModel State:**
- ✅ Business data (items, users, orders)
- ✅ Shared state across components
- ✅ Computed/derived state (use getters, NOT useMemo)
- ✅ State that needs to persist across component unmounts

## When to Use Getters vs Methods

**ViewModel Getters (Computed Properties):**
- ✅ Use when: Transforming data based on **ViewModel state only** (no parameters needed)
- ✅ Sorting, filtering, transforming business data
- ✅ Calculations based on ViewModel state
- ✅ MobX automatically caches and tracks dependencies
- ❌ Cannot receive parameters
- Example: `get sortedItems()`, `get activeItems()`, `get totalCount()`

**ViewModel Methods:**
- ✅ Use when: Need to pass **parameters from props or local state**
- ✅ Filtering/transforming based on dynamic parameters
- ✅ Can receive parameters
- ❌ Not cached by MobX (recalculated on every call)
- Example: `getDisplayItems(maxItems: number)`, `getFilteredItems(status: string)`

## Common Mistakes

❌ **DON'T do this:**

```typescript
// ❌ WRONG: Computed value in component
export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  // ❌ WRONG: Transforming ViewModel data in component
  const displayItems = vm.items.slice(0, 10);
  const sortedItems = vm.items.sort((a, b) => a.name.localeCompare(b.name));
  const activeItems = vm.items.filter(item => item.status === 'active');

  return <div>{displayItems.map(...)}</div>;
});
```

✅ **DO this instead:**

```typescript
// ✅ CORRECT: Computed values in ViewModel
class ItemsPanelViewModel {
  // ✅ Getter - based on ViewModel state only
  get sortedItems(): Item[] {
    return this.items.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ✅ Getter - based on ViewModel state only
  get activeItems(): Item[] {
    return this.items.filter(item => item.status === 'active');
  }

  // ✅ Method - receives parameters from props/local state
  getDisplayItems(maxItems: number): Item[] {
    return this.items.slice(0, maxItems);
  }
}

// ✅ Component just uses the getter/method
export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  return <div>{vm.sortedItems.map(...)}</div>;
});
```

## Key Points

✅ **DO:**
- Wrap components with `observer()` when using ViewModels
- Use function declarations: `observer(function ComponentName() { ... })`
- Access ViewModels via hooks: `const vm = useXxxViewModel()`
- Keep local UI state in `useState` (not in ViewModel)
- Use ViewModel getters for computed values (MobX caches automatically)
- Use ViewModel methods when you need to pass parameters

❌ **DON'T:**
- Forget to wrap with `observer()` when using ViewModel
- Use arrow functions: `const Component = observer(() => { ... })` ❌
- Access ViewModel directly: `import { viewModel } from "..."` ❌
- Put UI state in ViewModels (modals, drawers, selected items)
- Transform ViewModel data in components (use getters/methods instead)
- Use `useMemo` for ViewModel data transformations (use getters instead)


