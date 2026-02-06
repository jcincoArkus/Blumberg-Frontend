---
name: component-pattern
description: Pattern for implementing React components using the Observer Pattern with MobX and hooks for accessing ViewModels. Use when creating new React components, connecting components to ViewModels, adding observer() wrappers, or deciding between local state vs ViewModel state.
---

# React Component Pattern with MobX

## Overview

Pattern for implementing React components using the **Observer Pattern** with **MobX** and **hooks** for accessing ViewModels.

## Key Principles

1. **Observer HOC**: All components that use ViewModels must be wrapped with `observer()`
2. **Hook Pattern**: Components access ViewModels via `useXxxViewModel()` hooks
3. **Functional Components**: Use function declarations with named exports
4. **Type Safety**: Use TypeScript for props and state
5. **Memoization**: Use `useMemo` for expensive computations and object references

## Template: Basic Component with ViewModel

```typescript
import { observer } from "~@/mobx";
import { useItemsPanelViewModel } from "~@/view-model";

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
import { observer } from "~@/mobx";
import { useItemsPanelViewModel } from "~@/view-model";

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

**Note:** If you need to transform/filter/limit items based on ViewModel state, use a getter:

```typescript
// In ViewModel
class ItemsPanelViewModel {
  maxItems = 10;

  // ✅ Getter - no parameters, uses ViewModel state
  get displayItems(): Item[] {
    return this.items.slice(0, this.maxItems);
  }

  setMaxItems(max: number) {
    this.maxItems = max;
  }
}

// In Component
export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  return (
    <div>
      <h2>Items ({vm.itemCount})</h2>
      <ul>
        {vm.displayItems.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
});
```

**Note:** If you need to pass parameters from props, use a method in the ViewModel:

```typescript
// In ViewModel
class ItemsPanelViewModel {
  // ✅ Method - can receive parameters
  getDisplayItems(maxItems: number): Item[] {
    return this.items.slice(0, maxItems);
  }

  // ✅ Method with multiple parameters
  getFilteredItems(status: string, limit: number): Item[] {
    return this.items
      .filter(item => item.status === status)
      .slice(0, limit);
  }
}

// In Component
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
      <ul>
        {vm.getDisplayItems(maxItems).map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
});
```

## Template: Component with Local State

```typescript
import { useState } from "react";
import { observer } from "~@/mobx";
import { useItemsPanelViewModel } from "~@/view-model";
import type { Item } from "~@/models";

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

## File Structure

```
packages/views/
├── items/
│   ├── ItemsPanel/
│   │   ├── index.tsx                # Main component
│   │   ├── ItemsListItem.tsx        # Sub-component
│   │   └── types.ts                 # Component-specific types
│   └── ItemsDetails/
│       └── index.tsx
```

## Best Practices

✅ **DO:**
- Wrap components with `observer()` when using ViewModels
- Use function declarations: `observer(function ComponentName() { ... })`
- Access ViewModels via hooks: `const vm = useXxxViewModel()`
- Use `useMemo` for expensive computations
- Use `useMemo` for object/array references passed to child components
- Keep local UI state in `useState` (not in ViewModel)
- Use TypeScript for props interfaces

❌ **DON'T:**
- Forget to wrap with `observer()` when using ViewModel
- Use arrow functions: `const Component = observer(() => { ... })` ❌
- Access ViewModel directly: `import { viewModel } from "..."` ❌
- Put UI state in ViewModels (modals, drawers, selected items)
- Use `useMemo` for sorting/filtering ViewModel data (use ViewModel getters instead)

## When to Use Local State vs ViewModel

**Local State (`useState`):**
- UI state (modals, drawers, tabs, selected items)
- Form input values (before submission)
- Temporary state (hover, focus, expanded)

**ViewModel State:**
- Business data (alerts, sensors, sites)
- Shared state across components
- Computed/derived state (use getters, NOT useMemo)
- State that needs to persist across component unmounts

## When to Use useMemo vs ViewModel Getters vs ViewModel Methods

**ViewModel Getters (Computed Properties):**
- ✅ Use when: Transforming data based on **ViewModel state only** (no parameters needed)
- ✅ Sorting, filtering, transforming business data
- ✅ Calculations based on ViewModel state
- ✅ Derived state that should be reactive
- ✅ MobX automatically caches and tracks dependencies
- ❌ Cannot receive parameters
- Example: `get sortedItems()`, `get activeItems()`, `get totalCount()`

**ViewModel Methods:**
- ✅ Use when: Need to pass **parameters from props or local state**
- ✅ Filtering/transforming based on dynamic parameters
- ✅ Can receive parameters
- ❌ Not cached by MobX (recalculated on every call)
- Example: `getDisplayItems(maxItems: number)`, `getFilteredItems(status: string)`

**useMemo in Components:**
- ✅ Use when: Creating object/array references for child component props
- ✅ Expensive computations that depend on **local state or props**
- ✅ Creating controller instances
- ✅ Creating column definitions
- ❌ NOT for ViewModel data transformations
- Example: `useMemo(() => new Controller(), [])`, `useMemo(() => getColumns(), [])`

**❌ DON'T use useMemo for:**
- Sorting/filtering ViewModel data (use ViewModel getters instead)
- Calculations based on ViewModel state (use ViewModel getters instead)
- Slicing/limiting ViewModel data (use ViewModel getters instead)
- Transforming ViewModel data (use ViewModel getters instead)

**Example of WRONG approach:**
```typescript
// ❌ DON'T DO THIS
export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  // ❌ WRONG: Computed value in component
  const displayItems = vm.items.slice(0, 10);
  const sortedItems = vm.items.sort((a, b) => a.name.localeCompare(b.name));
  const activeItems = vm.items.filter(item => item.status === 'active');

  return <div>{displayItems.map(...)}</div>;
});
```

**Example of CORRECT approach:**
```typescript
// ✅ DO THIS: Use getters for ViewModel state, methods for parameters
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

  // ✅ Method - receives multiple parameters
  getFilteredItems(status: string, limit: number): Item[] {
    return this.items
      .filter(item => item.status === status)
      .slice(0, limit);
  }
}

// ✅ Component uses getters and methods appropriately
interface ItemsPanelProps {
  maxItems?: number;
}

export const ItemsPanel = observer(function ItemsPanel({
  maxItems = 10
}: ItemsPanelProps) {
  const vm = useItemsPanelViewModel();

  return (
    <div>
      {/* ✅ Use getter for ViewModel state */}
      <div>{vm.sortedItems.map(...)}</div>

      {/* ✅ Use method with prop parameter */}
      <div>{vm.getDisplayItems(maxItems).map(...)}</div>
    </div>
  );
});
```

## Import Order

```typescript
// 1. React imports
import { useState, useMemo } from "react";

// 2. Third-party imports
import { DataTable, type ColumnDef } from "~@/data-table";

// 3. MobX imports
import { observer } from "~@/mobx";

// 4. ViewModel imports
import { useItemsPanelViewModel } from "~@/view-model";

// 5. Local imports
import { ItemsController } from "./ItemsController";
import type { Item } from "./types";
```
