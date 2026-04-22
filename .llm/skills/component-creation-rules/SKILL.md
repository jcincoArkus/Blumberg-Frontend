---
name: component-creation-rules
description: Rules and architecture for creating React components — maximum decomposition, ViewModel separation, MobX-first state, minimal React hooks, and reusable presentational sub-components. Use before creating any new component, page, panel, or feature.
---

# Component Creation Rules

## Overview

Mandatory rules for creating React components. Every component must follow the **5-Layer Component Pattern**: maximum decomposition, business logic in ViewModels, presentational sub-components via props, pure helper functions, and MobX-first state management — **minimizing React hooks**.

## Architecture — The 5-Layer Component Pattern

Every feature/panel MUST be organized into these layers:

```
packages/views/{feature}/{ComponentName}/
├── index.tsx            # 1. Root Component (observer + ViewModel)
├── types.ts             # 2. TypeScript interfaces
├── helpers.ts           # 3. Pure utility functions
├── constants.tsx        # 4. Static data (optional, only if needed)
├── SubComponentA.tsx    # 5. Presentational sub-components
├── SubComponentB.tsx
└── SubComponentC.tsx

packages/view-model/{feature}/
├── {ComponentName}ViewModel.ts   # ViewModel (business logic + state)
└── index.ts                       # Barrel exports
```

## Rule 1: Maximum Decomposition

Split components into the **smallest possible** presentational pieces. Each sub-component should have a **single responsibility**.

### When to Split

- **ALWAYS split** if a section of JSX can be described with a noun (e.g., "Header", "StatusBadge", "ListItem")
- **ALWAYS split** if a section has its own props/data needs
- **ALWAYS split** if a section renders a list item (extract `XxxListItem.tsx`)
- **ALWAYS split** if a section has conditional rendering logic
- **ALWAYS split** if a section exceeds ~30 lines of JSX

### Example: Decomposition of a Panel

A status panel with header, stats, and a list should be 6+ files, NOT one monolithic component:

```
StatusPanel/
├── index.tsx            # Root: observer + ViewModel
├── types.ts             # StatusItem, StatusPanelProps
├── helpers.ts           # getStatusColor(), formatTimestamp()
├── PanelHeader.tsx      # Title + summary badge
├── StatsRow.tsx         # Counter cells (Active/Pending/Error)
├── StatusListItem.tsx   # Single item row with icon + label
└── EmptyState.tsx       # "No items found" message
```

### Template: Root Component

```typescript
// index.tsx — Root Component
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { useItemsPanelViewModel } from "~@/view-model";

import { ItemListItem } from "./ItemListItem";
import { PanelHeader } from "./PanelHeader";
import { StatsRow } from "./StatsRow";

export type { Item } from "./types";

export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
      <div className="px-3 pt-3 pb-0.5">
        <PanelHeader title={t`Items`} count={vm.totalCount} />
      </div>
      <div className="px-3 pb-3 space-y-2">
        <StatsRow activeCount={vm.activeCount} pendingCount={vm.pendingCount} />
        {vm.sortedItems.map((item) => (
          <ItemListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
});
```

### Template: Presentational Sub-Component

```typescript
// StatsRow.tsx — Presentational (NO ViewModel, NO observer)
import type { FC } from "react";

import { t } from "~@/i18n/macro";

interface StatsRowProps {
  activeCount: number;
  pendingCount: number;
}

export const StatsRow: FC<StatsRowProps> = ({ activeCount, pendingCount }) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 text-center">
        <p className="text-lg font-semibold">{activeCount}</p>
        <p className="text-xs text-muted-foreground">{t`Active`}</p>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex-1 text-center">
        <p className="text-lg font-semibold">{pendingCount}</p>
        <p className="text-xs text-muted-foreground">{t`Pending`}</p>
      </div>
    </div>
  );
};
```

## Rule 2: ViewModel Separation — ZERO Business Logic in Components

**ALL** business logic, state management, data transformations, sorting, filtering, and computations MUST live in a ViewModel. Components are **presentation only**.

### What Goes in the ViewModel

| Belongs in ViewModel | Example |
|---|---|
| Data fetching / API integration | `ObservedQuery`, `ObservedMutation` |
| Computed / derived data | `get sortedItems()`, `get activeCount()` |
| Business logic with parameters | `getDisplayLabel(item)`, `getCategoryName(id)` |
| Data transformations | Sorting, filtering, mapping, aggregation |
| Shared state across components | Filters, selected entities, active category |
| Domain-level actions | `setFilter()`, `refresh()`, `selectItem()` |

### What Goes in the Component

| Belongs in Component | Example |
|---|---|
| **Local UI state only** | Drawer open/close, selected item for a modal |
| Rendering / layout | JSX, CSS classes, grid structure |
| Event handler wiring | `onClick={() => handleClick(item)}` |
| i18n labels | `t\`Active Items\`` |

### Template: ViewModel

```typescript
import { makeAutoObservable } from "~@/mobx";

import { domainDataViewModel } from "./DomainDataViewModel";

/**
 * Singleton ViewModel for ItemsPanel.
 * Delegates to DomainDataViewModel for shared data.
 */
class ItemsPanelViewModel {
  constructor() {
    makeAutoObservable(this);
  }

  // Delegate to domain ViewModel
  get items() {
    return domainDataViewModel.items;
  }

  // Derived state
  get sortedItems() {
    const order = { high: 0, medium: 1, low: 2 } as const;
    return [...this.items].sort((a, b) => {
      return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
    });
  }

  get activeCount() {
    return this.items.filter((i) => i.status === "active").length;
  }

  get pendingCount() {
    return this.items.filter((i) => i.status === "pending").length;
  }

  get totalCount() {
    return this.items.length;
  }

  // Method with parameter
  getDisplayLabel(item: Item) {
    return `${item.name} — ${item.category}`;
  }
}

export const itemsPanelViewModel = new ItemsPanelViewModel();

export function useItemsPanelViewModel() {
  return itemsPanelViewModel;
}
```

### Anti-Pattern: Business Logic in Components

```typescript
// ❌ NEVER DO THIS — business logic in component
export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  // ❌ Sorting in component
  const sorted = [...vm.items].sort((a, b) => a.name.localeCompare(b.name));

  // ❌ Filtering in component
  const active = vm.items.filter((item) => item.status === "active");

  // ❌ Aggregation in component
  const total = vm.items.reduce((sum, item) => sum + item.value, 0);

  // ❌ Transformation in component
  const mapped = vm.items.map((item) => ({ ...item, label: `${item.name} (${item.status})` }));

  return <div>...</div>;
});
```

```typescript
// ✅ ALL of the above must be ViewModel getters
class ItemsPanelViewModel {
  get sortedItems() { return [...this.items].sort(...); }
  get activeItems() { return this.items.filter(...); }
  get totalValue() { return this.items.reduce(...); }
  get labeledItems() { return this.items.map(...); }
}
```

## Rule 3: Minimize React Hooks — MobX First

**MobX replaces most React hooks.** Only use hooks when absolutely necessary.

### Hook Usage Rules

| Hook | Allowed? | When |
|---|---|---|
| `useState` | Minimal | **Only** for local UI state: drawer open, selected item for modal, collapsible open |
| `useMemo` | Minimal | **Only** for DataTable controller instances and column definitions |
| `useCallback` | Almost Never | Avoid — MobX actions + arrow functions handle this |
| `useEffect` | Almost Never | Avoid — use MobX `reaction` / `autorun` in ViewModel instead |
| `useReducer` | Never | Use ViewModel with MobX actions |
| `useContext` | Never | Use ViewModel singleton pattern |
| `useRef` | Rarely | Only for DOM refs (focus, scroll, measure) |

### Allowed useState Examples

```typescript
// ✅ Drawer/modal open state
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<Item | null>(null);

// ✅ Collapsible section open state
const [isSectionOpen, setIsSectionOpen] = useState(false);

// ✅ Simple local toggle (tab selection)
const [activeTab, setActiveTab] = useState<"recent" | "all">("recent");
```

### Allowed useMemo Examples

```typescript
// ✅ DataTable controller instance (created once)
const controller = useMemo(() => new ItemsController(), []);

// ✅ Column definitions (created once)
const columns = useMemo(() => getColumns(), []);

// ✅ Render function passed to DataTable
const listItem = useMemo(
  () =>
    function ListItem({ data }: { data: Item; index: number }) {
      return <ItemRow data={data} />;
    },
  [],
);
```

### Anti-Pattern: Overusing React Hooks

```typescript
// ❌ NEVER DO THIS
export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();

  // ❌ useMemo for ViewModel data → use getter
  const sorted = useMemo(() => [...vm.items].sort(...), [vm.items]);

  // ❌ useCallback for ViewModel actions → arrow functions in VM are auto-bound
  const handleClick = useCallback((id: string) => vm.selectItem(id), [vm]);

  // ❌ useEffect for side effects → use reaction in ViewModel
  useEffect(() => {
    if (vm.selectedId) vm.loadDetails(vm.selectedId);
  }, [vm.selectedId]);

  // ❌ useReducer → use ViewModel with MobX actions
  const [state, dispatch] = useReducer(reducer, initialState);

  // ❌ useState for business data → use ViewModel
  const [items, setItems] = useState<Item[]>([]);

  return <div>...</div>;
});
```

```typescript
// ✅ CORRECT — MobX handles everything
class ItemsPanelViewModel {
  get sortedItems() { return [...this.items].sort(...); }

  selectItem = (id: string) => { this.selectedId = id; };

  constructor() {
    makeAutoObservable(this);
    // reaction replaces useEffect
    reaction(
      () => this.selectedId,
      (id) => { if (id) this.loadDetails(id); },
    );
  }
}

// Component is clean — almost no hooks
export const ItemsPanel = observer(function ItemsPanel() {
  const vm = useItemsPanelViewModel();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Only UI state

  return (
    <div>
      {vm.sortedItems.map((item) => (
        <ItemCard key={item.id} item={item} onClick={() => vm.selectItem(item.id)} />
      ))}
    </div>
  );
});
```

## Rule 4: Reusable Components via Props

Sub-components MUST be reusable. They receive **all data via props** — never import ViewModels directly.

### Pattern: Only Root Imports ViewModel

```
index.tsx (observer)           → imports ViewModel, passes data as props
├── SubComponentA.tsx (FC)     → receives props, NO ViewModel
├── SubComponentB.tsx (FC)     → receives props, NO ViewModel
└── SubComponentC.tsx (FC)     → receives props, NO ViewModel
```

### Template: Reusable Sub-Component

```typescript
// ItemTile.tsx — Reusable, no ViewModel dependency
import type { FC } from "react";
import { Link } from "react-router";

import { cn } from "~@/ui";

import { getStatusColor } from "./helpers";
import type { Item } from "./types";

interface ItemTileProps {
  item: Item;
}

export const ItemTile: FC<ItemTileProps> = ({ item }) => {
  return (
    <Link
      to={`/items/${item.id}`}
      className="flex items-center gap-1.5 p-1.5 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      <div className={cn("size-2 rounded-full flex-shrink-0", getStatusColor(item.status))} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{item.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
      </div>
    </Link>
  );
};
```

### When a Sub-Component Needs Its Own ViewModel

If a sub-component has complex enough state to warrant its own ViewModel, it becomes a **separate feature component** with its own directory:

```
packages/views/{feature}/
├── ParentPanel/
│   ├── index.tsx       # Uses useParentViewModel()
│   └── ...
└── ChildWidget/        # Promoted to its own feature
    ├── index.tsx       # Uses useChildViewModel()
    ├── types.ts
    └── ...
```

## Rule 5: Pure Helper Functions

Extract ALL utility logic to `helpers.ts`. Helpers are **pure functions** — no state, no side effects, no imports from ViewModels.

### What Goes in helpers.ts

| Category | Example |
|---|---|
| Formatting | `formatDuration(timestamp)` → `"2h 30m"` |
| Color / status mapping | `getStatusColor(status)` → `"bg-emerald-500"` |
| Icon mapping | `getStatusIcon(status)` → `CheckCircle` |
| CSS class mapping | `getBadgeClassName(variant)` → `"bg-red-600 ..."` |
| Calculations | `getPercentage(count, total)` → `85` |
| Data formatting | `formatChartData(points)` → `[{ index, value }]` |
| Config objects | `getStatusConfig(status)` → `{ icon, label, className }` |

### Template: helpers.ts

```typescript
// helpers.ts — Pure functions only. No state, no ViewModel imports.

export function formatDuration(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
  if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
  return `${diffMins}m`;
}

export function getStatusColor(status: string) {
  switch (status) {
    case "active": return "bg-emerald-500";
    case "warning": return "bg-amber-500";
    case "error": return "bg-red-500";
    default: return "bg-slate-400";
  }
}
```

## Rule 6: Types in Separate File

ALL TypeScript interfaces and types MUST be in `types.ts` — never inline in components.

### Template: types.ts

```typescript
// types.ts
export interface Item {
  id: string;
  name: string;
  description: string;
  status: "active" | "pending" | "error" | "offline";
}

export interface ItemsPanelProps {
  maxItems?: number;
}

export type StatusKey = "active" | "pending" | "error";
```

### Rules

- Export domain types used by the component and its sub-components
- Export prop interfaces if the root component receives external props
- Export type aliases for union types used in helpers
- Re-export from `index.tsx` only types that external consumers need: `export type { Item } from "./types";`

## Rule 7: Constants in Separate File (When Complex)

Extract static configuration, navigation items, and lookup tables to `constants.tsx`.

### When to Use constants.tsx

- Items with icons (JSX required → `.tsx`)
- Lookup tables (keys, labels, mappings)
- Static configuration objects
- Arrays/objects that would clutter the component

### Template: constants.tsx

```typescript
// constants.tsx
import { Activity, Bell, Settings } from "lucide-react";

import { t } from "~@/i18n/macro";

import type { NavItem, Section } from "./types";

export const sections: Section[] = [
  {
    title: t`Operations`,
    items: [
      { label: t`Monitoring`, href: "/monitoring", icon: <Activity className="size-5" /> },
      { label: t`Alerts`, href: "/alerts", icon: <Bell className="size-5" /> },
    ],
  },
  {
    title: t`Settings`,
    items: [
      { label: t`Configuration`, href: "/config", icon: <Settings className="size-5" /> },
    ],
  },
];
```

## Rule 8: Import Order

Follow this strict import order in every file:

```typescript
// 1. React imports (minimize these)
import { useState } from "react";

// 2. Third-party imports
import { AlertCircle } from "lucide-react";
import { Link } from "react-router";

// 3. Internal packages (path aliases)
import type { ColumnDef } from "~@/data-table";
import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Badge, Button, cn } from "~@/ui";
import { useItemsPanelViewModel } from "~@/view-model";

// 4. Relative imports from sibling features
import { DetailDrawer } from "../../shared/DetailDrawer";

// 5. Local imports (same directory)
import { ItemController } from "./ItemController";
import { ItemListItem } from "./ItemListItem";
import { formatDuration, getStatusColor } from "./helpers";
import type { Item } from "./types";
```

## Checklist — Before Creating Any Component

Before writing code, verify:

- [ ] **ViewModel exists** — Create `{ComponentName}ViewModel.ts` in `packages/view-model/{feature}/`
- [ ] **All business logic in ViewModel** — Sorting, filtering, computations, data transformations
- [ ] **types.ts created** — All interfaces and types extracted
- [ ] **helpers.ts created** — All pure utility functions extracted
- [ ] **Maximum decomposition** — Every distinct UI section is its own sub-component file
- [ ] **Sub-components are presentational** — Receive data via props, no ViewModel imports
- [ ] **Only root uses observer + ViewModel** — Sub-components are plain `FC`
- [ ] **Minimal React hooks** — Only `useState` for UI state, `useMemo` for controllers/columns
- [ ] **No useCallback, useEffect, useReducer** — Use MobX actions/reactions in ViewModel
- [ ] **i18n applied** — All user-facing text uses `t` macro
- [ ] **Type exports** — Re-export public types from `index.tsx`
- [ ] **Barrel export** — Add component to `packages/views/{feature}/index.ts`

## Complete Example

See [references/example.md](references/example.md) for a fully worked example showing all 8 rules applied to creating an OrdersPanel with ViewModel, types, helpers, sub-components, root component, and barrel exports.

## Summary of Rules

| # | Rule | Key Point |
|---|---|---|
| 1 | Maximum Decomposition | Every UI section → its own file |
| 2 | ViewModel Separation | ZERO business logic in components |
| 3 | Minimize React Hooks | MobX replaces useMemo, useCallback, useEffect, useReducer |
| 4 | Reusable via Props | Sub-components receive data via props, never import ViewModel |
| 5 | Pure Helpers | All utility functions in helpers.ts, no state |
| 6 | Types Separate | All interfaces in types.ts |
| 7 | Constants Separate | Static data in constants.tsx when complex |
| 8 | Import Order | React → Third-party → Internal packages → Sibling → Local |
