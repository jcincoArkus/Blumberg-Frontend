# MobX Debugging, Reactivity & Limitations

## Template: Debugging

### `trace()` — Find Why Something Re-renders

```typescript
import { trace } from "mobx";

const ItemsList = observer(function ItemsList() {
  trace(); // Logs which observable triggered this re-render
  const vm = useItemsViewModel();
  return <div>{vm.items.length}</div>;
});
```

### `spy()` — Global Event Listener

```typescript
import { spy } from "mobx";

// Listen to ALL MobX events (actions, reactions, computations)
const disposer = spy((event) => {
  console.log(event.type, event);
});

// Don't forget to dispose
disposer();
```

### Dependency Trees

```typescript
import { getDependencyTree, getObserverTree } from "mobx";

// What does this computed depend on?
getDependencyTree(store, "filteredItems");

// What observes this observable?
getObserverTree(store, "items");
```

## Understanding Reactivity

MobX tracks **property access during tracked function execution**, not values.

### What IS Tracked

```typescript
autorun(() => {
  console.log(store.items.length); // ✅ store.items and .length are tracked
  console.log(store.user.name);    // ✅ store.user and .name are tracked
});
```

### What is NOT Tracked

```typescript
// ❌ Reads after async boundaries are NOT tracked
autorun(() => {
  setTimeout(() => {
    console.log(store.items.length); // NOT tracked — async
  }, 100);
});

// ❌ Reads in async callbacks after await are NOT tracked
autorun(async () => {
  await somePromise;
  console.log(store.items.length); // NOT tracked — after await
});

// ❌ Values extracted before the tracked function
const items = store.items; // Extracted outside
autorun(() => {
  console.log(items.length); // Tracks .length on the ARRAY, but NOT store.items
});
```

### Key Rules

- Only **synchronous** reads inside tracked functions are tracked
- `setTimeout`, `await`, and other async boundaries break tracking
- Actions are **untracked** — reads inside actions don't create subscriptions
- Computed values are only recalculated when actually **observed**

## Limitations

1. **`makeAutoObservable` cannot be used with subclasses** — use `makeObservable` with explicit annotations if inheritance is required
2. **`#` private fields are not supported** by MobX — they are invisible to the library and thus ignored
3. **All properties must be initialized** before `make(Auto)Observable` is called — declare fields or assign in constructor before the call
4. **Options are "sticky"** — `make(Auto)Observable` options (like `autoBind`) are set once and cannot be changed later
5. **Each field can only be annotated once** — overrides cannot re-annotate a field already annotated by a parent
6. **Only prototype methods are overridable** in subclasses — arrow function properties (field initializers) are own properties and cannot be overridden
7. **Non-plain objects** (class instances) passed as property values are NOT made observable automatically — only plain objects and arrays are
8. **MobX observable Maps/Sets** use different APIs — `map.set(key, value)` instead of direct assignment
9. **Computed values must be pure** — no side effects, no observable mutations
10. **Reactions run synchronously** by default after the action that triggers them — use `delay` option for debouncing
