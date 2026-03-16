## Skill: Lazy-loading MobX view models that perform network requests

**Goal:** Prevent view models from firing network requests (e.g. alerts, sensors) when merely imported, so public routes like `login` stay clean and only the screens that need data trigger loading.

### Pattern

- **Do not start network work in the constructor.**
  - Avoid calling `.load()`, `.refetch()`, or similar inside `constructor()` or at field initializers.
  - Constructors should only set up observable state and reactions.

- **Expose an explicit `load()` method on the view model.**
  - Responsible for kicking off the initial query / subscription.
  - Idempotent: safe to call multiple times from different places.
  - Use an internal flag to ensure it only actually loads once.

- **Trigger `load()` from the route/component that needs the data.**
  - For pages: call `vm.load()` inside the `useXxxViewModel` hook or inside a `useEffect` in the route component.
  - For dashboard widgets: call `vm.load()` from their controller’s `load()` method.

### Reference implementation

**Alert view model (frontend example)**

```ts
class AlertsViewModel implements Disposable {
  activeTab: AlertStatus | "all" = "all";

  #alertsQuery = getAllAlertsV1ObservedQuery(
    { query: { Page: 1, PageSize: DEFAULT_PAGE_SIZE } },
    { refetchInterval: ALERTS_POLL_INTERVAL_MS },
  );
  #hasLoaded = false;

  constructor() {
    makeAutoObservable(this);
    // IMPORTANT: no network calls here
  }

  load = () => {
    if (this.#hasLoaded) return;
    this.#hasLoaded = true;
    this.#alertsQuery.load();
  };

  refresh = async () => {
    this.load(); // ensure initial load triggered
    await this.#alertsQuery.loadAsync({
      query: { Page: 1, PageSize: DEFAULT_PAGE_SIZE },
    });
  };
}

export const alertsViewModel = new AlertsViewModel();

export function useAlertsViewModel() {
  alertsViewModel.load(); // page-level hook decides when data is needed
  return alertsViewModel;
}
```

**Dashboard controller using the same pattern**

```ts
async load(_query: StandardQuery): Promise<void> {
  alertsViewModel.load();          // full alerts list
  dashboardAlertsViewModel.load(); // active alerts overview
}
```

### When to apply this skill

- Adding new view models that:
  - use `get*ObservedQuery`, or
  - call API clients directly.
- Refactoring existing view models that currently fire requests from their constructor and cause:
  - requests on `/login` or other public pages,
  - duplicate initial requests when multiple widgets share the same view model.

### Checklist

- [ ] No network calls in any view model constructor.
- [ ] Every networked view model exposes an idempotent `load()` method.
- [ ] Hooks (`useXxxViewModel`) or controllers call `load()` when a screen/widget mounts.
- [ ] Login and other public routes import only auth-related view models (no data view models with implicit side effects).

