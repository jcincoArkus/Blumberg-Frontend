---
name: mobx-pattern
description: Core MobX reactive state management patterns — makeAutoObservable, observables, computed, actions, reactions, and React integration. Use when creating stores, ViewModels, computed properties, reactions, or debugging reactivity issues.
---

# Core MobX Reactive State Management

## Overview

MobX reactive state management using `makeAutoObservable` with automatic inference of observables, computed properties, and actions. This project uses the **JavaScript API only** (no decorators) with `autoBind: true` enabled by default via a project wrapper module.

## Key Principles

1. **Prefer `makeAutoObservable`** over `makeObservable` — auto-infers annotations from class shape
2. **No decorators** — JavaScript API only (`makeAutoObservable`, `makeObservable`)
3. **`#` private fields** for fields MobX should ignore (MobX cannot observe them)
4. **`autoBind: true` by default** — the project wrapper applies this automatically
5. **Getters → computed**, methods → actions — auto-inferred by `makeAutoObservable`
6. **Always dispose reactions** in a `dispose()` method
7. **`observer()` for all React components** that read observable state
8. **Dereference observable properties inside `observer`**, not outside
9. **No subclassing** with `makeAutoObservable` — use composition instead
10. **Import from `~@/mobx`** — never import directly from `"mobx"` or `"mobx-react-lite"`

## Template: MobX Module Setup

The project wraps MobX to apply `autoBind: true` by default and re-exports everything from a single module:

```typescript
// packages/mobx/mobx.ts — project wrapper
import { makeAutoObservable as _internalMakeAutoObservable } from "mobx";

export const makeAutoObservable: typeof _internalMakeAutoObservable = (
  target,
  overrides,
  options,
) => {
  return _internalMakeAutoObservable(target, overrides, {
    autoBind: true,
    ...options,
  });
};

export {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
  when,
} from "mobx";
export { observer } from "mobx-react-lite";
```

**Usage:** Always import from `~@/mobx`:

```typescript
import { makeAutoObservable, observer, reaction, runInAction } from "~@/mobx";
```

## Template: makeAutoObservable Inference Rules

| Class Member | Inferred Annotation | Notes |
|---|---|---|
| Own property | `observable` | Any value assigned in constructor or as field initializer |
| Getter | `computed` | Cached, lazy — recalculates only when dependencies change |
| Setter | `action` | |
| Method | `autoAction` | Automatically action-wrapped |
| Generator function | `flow` | For async flows with cancellation support |
| `#` private field | **ignored** | MobX cannot access private fields — use for non-reactive state |
| `false` in overrides | **excluded** | Explicitly opt out a public field |

## Template: Class with Observable State

```typescript
import { makeAutoObservable } from "~@/mobx";
import type { Item } from "~@/models";

class ItemsStore {
  // #-private fields → ignored by MobX (not observable)
  #apiClient: ApiClient;

  // Public properties → observable (auto-inferred)
  items: Item[] = [];
  selectedId: string | null = null;
  isLoading = false;

  constructor(apiClient: ApiClient) {
    this.#apiClient = apiClient;
    // Must be called AFTER all fields are initialized
    makeAutoObservable(this);
  }

  // Getter → computed (auto-inferred, cached by MobX)
  get selectedItem(): Item | undefined {
    return this.items.find((item) => item.id === this.selectedId);
  }

  get itemCount(): number {
    return this.items.length;
  }

  // Arrow function → action (auto-bound via autoBind: true)
  setSelectedId = (id: string | null) => {
    this.selectedId = id;
  };

  setItems = (items: Item[]) => {
    this.items = items;
  };
}
```

### Using Overrides to Exclude Fields

```typescript
class ItemsStore {
  items: Item[] = [];
  // This should NOT be observable (e.g., a static config)
  pageSize = 25;

  constructor() {
    makeAutoObservable(this, {
      pageSize: false, // Exclude from MobX tracking
    });
  }
}
```

## Template: Computed Properties

### Basic Getter (Cached, Lazy)

```typescript
class ItemsStore {
  items: Item[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Recalculates only when `this.items` changes
  get activeItems(): Item[] {
    return this.items.filter((item) => item.status === "active");
  }

  // Computed from other computed
  get activeItemCount(): number {
    return this.activeItems.length;
  }
}
```

### Computed with Arguments (4 Strategies)

Computed getters cannot take arguments. Use one of these patterns instead:

**Strategy 1: Store the argument as observable state**

```typescript
class ItemsStore {
  items: Item[] = [];
  filterStatus: string = "all";

  constructor() {
    makeAutoObservable(this);
  }

  setFilterStatus = (status: string) => {
    this.filterStatus = status;
  };

  // Now a regular computed — argument is stored as state
  get filteredItems(): Item[] {
    if (this.filterStatus === "all") return this.items;
    return this.items.filter((item) => item.status === this.filterStatus);
  }
}
```

**Strategy 2: Regular method (not cached)**

```typescript
class ItemsStore {
  items: Item[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Not cached — recalculates on every call
  getItemsByStatus(status: string): Item[] {
    return this.items.filter((item) => item.status === status);
  }
}
```

**Strategy 3: Dedicated structure with `computedFn` (external library)**

```typescript
import { computedFn } from "mobx-utils";

class ItemsStore {
  items: Item[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Cached per argument combination
  getItemsByStatus = computedFn(function (this: ItemsStore, status: string) {
    return this.items.filter((item) => item.status === status);
  });
}
```

**Strategy 4: Use a Map of computed values**

```typescript
class ItemsStore {
  items: Item[] = [];
  statusCounts = new Map<string, number>();

  constructor() {
    makeAutoObservable(this);
  }
}
```

### Rules for Computed Properties

- No side effects inside computed getters
- Don't create or update other observables inside computed
- Don't depend on non-observable values (they won't trigger recalculation)

## Template: Actions

### Synchronous Actions

```typescript
class ItemsStore {
  items: Item[] = [];
  selectedId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Arrow function actions (auto-bound)
  addItem = (item: Item) => {
    this.items.push(item);
  };

  removeItem = (id: string) => {
    this.items = this.items.filter((item) => item.id !== id);
  };

  // Multiple state changes in one action → single re-render
  reset = () => {
    this.items = [];
    this.selectedId = null;
  };
}
```

### Async Actions with `runInAction`

```typescript
import { makeAutoObservable, runInAction } from "~@/mobx";

class ItemsStore {
  items: Item[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // State modifications after await MUST use runInAction
  loadItems = async () => {
    this.isLoading = true; // ✅ Before await — inside action
    this.error = null;

    try {
      const data = await fetchItems();
      // ✅ After await — wrap in runInAction
      runInAction(() => {
        this.items = data;
        this.isLoading = false;
      });
    } catch (e) {
      // ✅ After await — wrap in runInAction
      runInAction(() => {
        this.error = (e as Error).message;
        this.isLoading = false;
      });
    }
  };
}
```

### Async Actions with `flow` (Generator Pattern)

```typescript
import { makeAutoObservable } from "~@/mobx";

class ItemsStore {
  items: Item[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
    // flow is auto-inferred for generator methods
  }

  // Generator function → flow (auto-inferred)
  // Use `yield` instead of `await` — no runInAction needed
  *loadItems() {
    this.isLoading = true;
    try {
      const data = yield fetchItems(); // yield instead of await
      this.items = data; // ✅ No runInAction needed with flow
      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
    }
  }
}
```

### Actions and Inheritance

- Only **prototype methods** are overridable in subclasses
- Arrow function properties (field initializers) are **not overridable**
- This is another reason to prefer composition over inheritance with MobX

## Template: Reactions & Disposal Pattern

### `autorun` — Runs when Any Dependency Changes

```typescript
import { makeAutoObservable, autorun } from "~@/mobx";

class ItemsStore {
  items: Item[] = [];
  #disposers: (() => void)[] = [];

  constructor() {
    makeAutoObservable(this);

    // autorun runs immediately and again whenever dependencies change
    this.#disposers.push(
      autorun(() => {
        console.log(`Items count: ${this.items.length}`);
      }),
    );
  }

  dispose = () => {
    this.#disposers.forEach((d) => d());
    this.#disposers = [];
  };
}
```

### `reaction` — Data Function + Effect Function

```typescript
import { makeAutoObservable, reaction } from "~@/mobx";

class ItemsStore {
  items: Item[] = [];
  selectedId: string | null = null;
  #disposers: (() => void)[] = [];

  constructor() {
    makeAutoObservable(this);

    // Only runs effect when the data function's return value changes
    this.#disposers.push(
      reaction(
        () => this.selectedId, // data function — tracked
        (selectedId) => {      // effect function — NOT tracked
          if (selectedId) {
            this.loadItemDetails(selectedId);
          }
        },
      ),
    );
  }

  loadItemDetails = async (id: string) => {
    // ...
  };

  dispose = () => {
    this.#disposers.forEach((d) => d());
    this.#disposers = [];
  };
}
```

### `when` — Predicate + Effect (Runs Once)

```typescript
import { makeAutoObservable, when } from "~@/mobx";

class ItemsStore {
  items: Item[] = [];
  #disposers: (() => void)[] = [];

  constructor() {
    makeAutoObservable(this);

    // Runs effect once when predicate becomes true, then auto-disposes
    this.#disposers.push(
      when(
        () => this.items.length > 0,
        () => {
          console.log("Items loaded for the first time");
        },
      ),
    );
  }

  dispose = () => {
    this.#disposers.forEach((d) => d());
    this.#disposers = [];
  };
}

// Promise form (auto-disposes, but still store disposer for early cleanup)
async function waitForItems(store: ItemsStore) {
  await when(() => store.items.length > 0);
  console.log("Items are available");
}
```

### Critical Pattern: Disposal

```typescript
class ItemsStore {
  #disposers: (() => void)[] = [];

  constructor() {
    makeAutoObservable(this);

    // Store ALL reaction disposers
    this.#disposers.push(
      autorun(() => { /* ... */ }),
      reaction(() => this.x, (x) => { /* ... */ }),
      when(() => this.ready, () => { /* ... */ }),
    );
  }

  // Always provide a dispose method
  dispose = () => {
    this.#disposers.forEach((d) => d());
    this.#disposers = [];
  };
}
```

### Rules for Reactions

- Use reactions **sparingly** — prefer computed properties for derived state
- Don't update observables that the same reaction reads (infinite loops)
- Always dispose reactions to prevent memory leaks
- `autorun` runs immediately; `reaction` does not (by default)

## Template: React Integration — observer()

### Basic observer Component

```typescript
import { observer } from "~@/mobx";

// ✅ Named function declaration inside observer()
export const ItemsList = observer(function ItemsList() {
  const vm = useItemsViewModel();

  return (
    <ul>
      {vm.items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </ul>
  );
});
```

### Key Rules

- `observer()` applies `memo` automatically — no need for `React.memo`
- `observer` must be the **innermost** decorator when combining HOCs
- Observable properties must be **dereferenced inside** the observer component

```typescript
// ✅ CORRECT: Dereference inside observer
const ItemsList = observer(function ItemsList() {
  const vm = useItemsViewModel();
  return <div>{vm.items.length}</div>; // ✅ Reads .items inside observer
});

// ❌ WRONG: Dereference outside observer
function Parent() {
  const vm = useItemsViewModel();
  const count = vm.items.length; // ❌ Read outside observer
  return <ItemCount count={count} />; // Won't re-render when items change
}
```

### observer Must Be Innermost

```typescript
// ✅ CORRECT: observer is innermost
export const ItemsList = withErrorBoundary(
  observer(function ItemsList() {
    // ...
  }),
);

// ❌ WRONG: observer wrapping other HOCs
export const ItemsList = observer(
  withErrorBoundary(function ItemsList() {
    // ...
  }),
);
```

## React Optimization Tips

1. **Many small observer components** — each re-renders independently
2. **Render lists in dedicated components** — prevents parent re-render on list changes
3. **Dereference values late** — pass observable objects, not extracted primitive props
4. **Don't use array indexes as keys** — use stable IDs
5. **Don't pass observables to non-observer components** — dereference first or wrap with observer

```typescript
// ✅ CORRECT: Dedicated list component, pass object not primitives
const ItemsList = observer(function ItemsList() {
  const vm = useItemsViewModel();
  return (
    <ul>
      {vm.items.map((item) => (
        <ItemRow key={item.id} item={item} /> {/* Pass object, not item.name */}
      ))}
    </ul>
  );
});

const ItemRow = observer(function ItemRow({ item }: { item: Item }) {
  return <li>{item.name} — {item.status}</li>; {/* Dereference late */}
});
```

## Debugging & Reactivity

See [references/debugging.md](references/debugging.md) for debugging tools (`trace`, `spy`, dependency trees), reactivity tracking rules, and MobX limitations.

## Best Practices

### DO

```typescript
// ✅ Use makeAutoObservable with the project wrapper
import { makeAutoObservable } from "~@/mobx";
class Store {
  constructor() {
    makeAutoObservable(this);
  }
}

// ✅ Use # private fields for non-reactive state
class Store {
  #apiClient: ApiClient;
  items: Item[] = [];
}

// ✅ Dispose all reactions
class Store {
  #disposers: (() => void)[] = [];
  dispose = () => {
    this.#disposers.forEach((d) => d());
    this.#disposers = [];
  };
}

// ✅ Wrap all reactive components with observer()
const MyComponent = observer(function MyComponent() { /* ... */ });

// ✅ Use runInAction after await
const data = await fetchData();
runInAction(() => {
  this.data = data;
});

// ✅ Use arrow functions for actions (auto-bound)
setName = (name: string) => {
  this.name = name;
};
```

### DON'T

```typescript
// ❌ Don't use decorators
class Store {
  @observable items = []; // WRONG
  @action setItems() {}   // WRONG
}

// ❌ Don't use makeObservable unless subclassing is required
makeObservable(this, {
  items: observable,
  setItems: action,
}); // Prefer makeAutoObservable

// ❌ Don't subclass with makeAutoObservable
class ChildStore extends ParentStore { // WRONG — makeAutoObservable cannot be subclassed
  constructor() {
    super();
    makeAutoObservable(this);
  }
}

// ❌ Don't forget disposal — causes memory leaks
constructor() {
  autorun(() => { /* ... */ }); // WRONG — disposer not stored
}

// ❌ Don't mutate state outside actions
store.items.push(newItem); // WRONG — outside action context

// ❌ Don't import directly from "mobx" or "mobx-react-lite"
import { makeAutoObservable } from "mobx";           // WRONG
import { observer } from "mobx-react-lite";           // WRONG
// ✅ Always: import { makeAutoObservable, observer } from "~@/mobx";

// ❌ Don't read observables outside observer and pass as props
function Parent() {
  const items = store.items; // WRONG — breaks reactivity
  return <Child items={items} />;
}

// ❌ Don't create side effects in computed getters
get total() {
  this.lastCalculated = Date.now(); // WRONG — side effect in computed
  return this.items.length;
}
```

## Limitations

See [references/debugging.md](references/debugging.md) for the full list of 10 MobX limitations.
