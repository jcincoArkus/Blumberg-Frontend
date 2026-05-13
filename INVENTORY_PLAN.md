# Inventory Module — Development Plan & Structure Reference

> **Source branch:** `Inventory`  
> **Module path:** `packages/views/inventory/`  
> **Status:** In-progress — API integrated; product/category creation modals live; Locations & Suppliers screen with MapBox live.

---

## File Structure

```
packages/views/inventory/
├── index.ts                    # Barrel: exports all view components
├── data.ts                     # Types, constants, mock data, utility fns
├── inventory.css               # Scoped CSS (.inventory-module namespace)
├── InventoryDashboardView.tsx  # Executive KPI overview screen
├── InventoryView.tsx           # Main lot inventory table
├── LotsView.tsx                # Simplified lot-focused table
├── IntakeView.tsx              # Goods receipt multi-step form
├── MovementsView.tsx           # Audit trail / movement history
├── ProductsView.tsx            # Product catalog with category filter + search
├── AddProductModal.tsx         # Dialog: create new product (wired to API)
├── AddCategoryModal.tsx        # Dialog: create new category with color picker (wired to API)
├── SitesView.tsx               # Locations & Suppliers screen (sites + zones + suppliers CRUD)
├── SiteModal.tsx               # Dialog: create/edit site; shows map-picked coords + geocoded name
├── ZoneModal.tsx               # Dialog: create/edit zone within a site
├── SupplierModal.tsx           # Dialog: create/edit supplier
└── SiteMap.tsx                 # MapBox GL map component with reverse-geocoding on click
```

---

## Data Layer (`data.ts`)

### Domain Types

| Type | Key Fields |
|---|---|
| `Category` | `id`, `name`, `color` (hex) |
| `Product` | `id`, `sku`, `name`, `categoryId`, `unit` (kg/unit/box), `kgPerBox`, `shelfLifeDays`, `price` |
| `Site` | `id`, `name`, `zones: string[]` |
| `Lot` | `id`, `productId`, `qty`, `unit`, `entryDate`, `expirationDate`, `siteId`, `zone`, `supplier`, `costPerUnit` |
| `Movement` | `id`, `type`, `timestamp`, `productId`, `qty`, `lotId`, `siteId`, `performedBy`, `note` |
| `ExpStatus` | `tone` (expired/critical/soon/ok), `label`, `daysUntil` |

### Movement Types
`intake` · `output` · `waste` · `adjustment` · `transfer`

### Mock Data Volumes
- 5 categories, 14 products, 3 sites (CDMX / Guadalajara / Monterrey)
- 18 lots, 25 movements (spanning 5 days)
- Reference date constant: `TODAY = "2026-04-29T10:30:00"`

### Utility Functions

| Function | Purpose |
|---|---|
| `addDays(date, n)` | Date arithmetic |
| `fmtDate(d)` | Long locale date (en-US) |
| `fmtDateShort(d)` | Short locale date |
| `fmtTime(d)` | Time-only format |
| `fmtMoney(n)` | MXN peso format |
| `daysUntil(date)` | Days to/from TODAY (negative = past) |
| `productById(id)` | Lookup with throw on miss |
| `categoryById(id)` | Lookup with throw on miss |
| `siteById(id)` | Lookup with throw on miss |
| `expStatus(exp)` | Returns `ExpStatus` with tone + label |

### Expiration Tones
| Tone | Condition |
|---|---|
| `expired` | Past expiration |
| `critical` | ≤ 2 days remaining |
| `soon` | ≤ 5 days remaining |
| `ok` | > 5 days remaining |

---

## Screens

### 1. `InventoryDashboardView` — Executive Overview

**Route:** `/inventory/dashboard` (implied)

**Top stat cards (4):**
- Active lots count
- Total inventory value (MXN)
- Total on-hand kg
- Lots expiring within 5 days

**Grid panels (2 × 2):**
- **By Site** — value + percentage share bar per site
- **By Category** — value + percentage share bar per category

**Grid panels (2 × 2):**
- **Expiration Risk** — 4 buckets: Past / ≤2d / ≤5d / >5d with count, value, and bar
- **Movements last 7d** — count per type (Intake, Output, Waste, Adjustment, Transfer)

**Bottom columns (2):**
- **Recent Activity** — last 6 movements as a compact table
- **Top 5 Products by Value** — ranked list with value bars

**Navigation links:** → `/inventory` (lots table) · → `/inventory/intake` (receive goods)

---

### 2. `InventoryView` — Main Inventory Table

**Route:** `/inventory`

**Filters (toolbar):**
- Site dropdown (All + 3 sites)
- Category dropdown (placeholder — not yet wired)
- Full-text search (lot ID, product name, SKU)
- Sort dropdown (Expiration / Name / Quantity — not yet wired)

**Stat cards above table (4):**
- Active lots · Inventory value · Expiring ≤5d · Past expiration
- Card accent color adapts to expiry risk count

**Table columns:**
| Column | Details |
|---|---|
| Product | Name, SKU, category color dot |
| Lot | Lot ID + supplier |
| Site | Site name + zone |
| Entered | Entry date + "X days ago" label |
| On Hand | Qty + unit; kg equiv shown if unit = box |
| Expires | Tone-colored date label |
| Value | MXN cost × qty |
| Actions | Adjust (pencil) · Mark waste (trash) — visible on hover |

**Row highlighting:** `expired`/`critical` → red left border · `soon` → amber left border

**Footer:** Expiration color legend · "Showing X of Y lots"

---

### 3. `LotsView` — Lot-Focused Table

**Route:** `/inventory/lots` (implied)

**Filters:** Full-text search (lot ID, product name, supplier)

**Table columns:** Lot ID · Product (name + SKU) · Supplier · Site/zone · Entry date · Expiration (date + tone) · Qty · Value

**Actions:** Export button (not yet wired)

**Footer:** "Showing X of Y lots"

> Simpler alternative to `InventoryView` — no stat cards, sorted by lot ID.

---

### 4. `IntakeView` — Goods Receipt Form

**Route:** `/inventory/intake`

**3-step form:**

**Step 1 — Shipment Details:**
- PO Number (auto-generated `PO-YYYY-XXXX` format, editable)
- Supplier (dropdown, populated from API)
- Destination Site + Zone (cascading selects)
- Arrival Date + Time
- Vehicle plate + Driver name
- Temperature check (≤ 6 °C validation with cold-chain banner)
- Received By

**Step 2 — Line Items (editable table):**
- Product selector · Qty · Unit (kg/unit/box) · Cost/unit
- Auto-computed: kg equivalent, shelf life display
- Add/remove row buttons
- Lot suffix field per line

**Step 3 — Lot Codes (review):**
- Lot codes pre-filled as `L-YYMMDD-XX` (auto-generated), editable per line
- Final review before save

**Right sidebar (sticky):**
- Line count
- Total units + kg equiv
- Subtotal · 16% Tax · Total cost (MXN)
- FIFO tip banner

**Actions:** Save (creates lots) · Print Receipt · Cancel

---

### 5. `ProductsView` — Product Catalog

**Route:** `/inventory/products`

**Toolbar:**
- Category filter (segment buttons — All + one per category, populated from API)
- Full-text search (name, SKU)

**Table columns:** Product (name + SKU + category color dot) · Category · Unit · kg/box · Shelf life · Price

**Actions (header):**
- **Add category** (Tag icon) → opens `AddCategoryModal`
- **Add product** (Plus icon) → opens `AddProductModal`
- Export button (not yet wired)

**Footer:** "Showing X of Y products"

#### `AddProductModal`
Fields: Name · SKU · Category (select, populated from `vm.categories`) · Unit (kg/unit/box) · kg per box (shown only when unit = box) · Shelf life (days) · Price (MXN/unit)  
On save: `createProductMutation.mutateAsync({ body })` → `refreshProducts()` → close  
Validation: all fields required; kg/box required when unit = box

#### `AddCategoryModal`
Fields: Name · Color (8 preset swatches + free color picker input)  
On save: `createCategoryMutation.mutateAsync({ body })` → `refreshCategories()` → close

---

### 6. `MovementsView` — Audit Trail

**Route:** `/inventory/movements`

**Filter tiles:**
- All Movements + one tile per type (Intake / Output / Waste / Adjustment / Transfer)
- Each tile shows count + contextual label (e.g., "fulfilled SOs", "review root cause")
- Selected tile is highlighted

**Table (grouped by date):**
- Day header rows: "Today · Apr 29", "Yesterday · Apr 28", "3d ago · Apr 26" …
- Columns: Time + Movement ID · Type chip (icon + label) · Product (name + SKU) · Lot · Site · By (person) · Reference note · Qty (±)

**Type chip colors:**
| Type | Color |
|---|---|
| intake | mint green |
| output | info blue |
| waste | rose red |
| adjustment | amber |
| transfer | teal |

**Qty display:** positive (intake/adjustment+) → green · negative (output/waste/adjustment−) → red

**Actions:** Last 7 days (date range) · Export CSV (not yet wired)

---

### 7. `SitesView` — Locations & Suppliers

**Route:** `/inventory/sites`  
**Nav label:** "Locations & Suppliers" (Warehouse icon)

Two sections stacked vertically, separated by a labeled divider.

#### Section A — Sites & Zones

**Layout:** Two-panel master-detail

- **Left panel (w-72):** Clickable list of sites. Each row shows: MapPin icon · site name · zone count badge · hover-reveal Edit (pencil) / Delete (trash) buttons. Selected site has teal left border + teal bg tint. Inline delete confirmation replaces the row (no separate dialog).
- **Right panel (flex-1):** Zones for the selected site. Header shows `"{Site name} · Zones"` + "Add zone" button. Each zone row has hover-reveal Edit / Delete. Same inline confirmation pattern. Empty state when no site selected.

**MapBox map (h-64, full width):** Sits between the section header and the two panels.
- Style: `mapbox://styles/mapbox/light-v11`, default center Mexico (lng -102.5, lat 23.6, zoom 4.5)
- Crosshair cursor; clicking calls MapBox Geocoding API (`/geocoding/v5/mapbox.places/{lng},{lat}.json?types=place`) to resolve City + State
- While geocoding: spinner marker + hint "Looking up location…"
- On result: opens `SiteModal` in add mode with coords + geocoded name (`"State - City"` format) pre-filled
- Token read from `config.mapboxToken` (`VITE_MAPBOX_TOKEN` env var). Shows a graceful fallback placeholder when token is empty.
- Supports `markers` prop for future use when API returns lat/lng per site

**Mutations (all in `InventoryViewModel`):**
- `createSiteMutation` / `updateSiteMutation` / `deleteSiteMutation` → `refreshSites()`
- `createZoneMutation` / `updateZoneMutation` / `deleteZoneMutation` → `refreshSites()`

#### Section B — Suppliers

**Layout:** Single flat list (no hierarchy)

Each row: Truck icon · supplier name · hover-reveal Edit / Delete. Inline delete confirmation. Footer shows supplier count.

**Mutations:** `createSupplierMutation` / `updateSupplierMutation` / `deleteSupplierMutation` → `refreshSuppliers()`

#### Modals

| Modal | Fields | API call |
|---|---|---|
| `SiteModal` | Name (required); shows geocoded location chip when coords provided | `createInventorySiteV1` / `updateInventorySiteV1` |
| `ZoneModal` | Zone name (required); site shown as read-only label | `createInventorySiteZoneV1` / `updateInventorySiteZoneV1` |
| `SupplierModal` | Name (required) | `createInventorySupplierV1` / `updateInventorySupplierV1` |

---

## ViewModel — `InventoryViewModel.ts`

Singleton at `packages/view-model/inventory/InventoryViewModel.ts`. Loaded via `useInventoryViewModel()` hook.

### Domain Types exported from `packages/view-model/inventory/index.ts`

| Type | Fields |
|---|---|
| `InvCategory` | `id`, `name`, `color` |
| `InvSupplier` | `id`, `name` |
| `InvProduct` | `id`, `sku`, `name`, `cat`, `unit`, `kgPerBox`, `shelfLife`, `price` |
| `InvSite` | `id`, `name`, `zones: string[]` |
| `InvSiteZone` | `id`, `name`, `siteId` |
| `InvLot` | `id`, `productId`, `qty`, `unit`, `entry`, `exp`, `siteId`, `zone`, `supplier`, `costPerUnit` |
| `InvMovement` | `id`, `type`, `at`, `productId`, `qty`, `unit`, `lotId`, `siteId`, `by`, `note` |
| `InvEnrichedLot` | Lot + joined product, category, site, expStatus, onhandKg, value, kg |
| `ExpStatus` / `ExpTone` | Expiration severity |

### Computed getters
`categories` · `suppliers` · `products` · `sites` · `siteZones` · `lots` · `movements` · `enrichedLots`  
Lookup helpers: `categoryById` · `productById` · `siteById`  
Maps: `categoryMap` · `productMap` · `siteMap`

### Mutations
| Mutation | Refresh method |
|---|---|
| `createShipmentMutation` / `createLineMutation` | `refresh()` |
| `createLotMutation` / `createMovementMutation` | `refresh()` |
| `createProductMutation` | `refreshProducts()` |
| `createCategoryMutation` | `refreshCategories()` |
| `createSiteMutation` / `updateSiteMutation` / `deleteSiteMutation` | `refreshSites()` |
| `createZoneMutation` / `updateZoneMutation` / `deleteZoneMutation` | `refreshSites()` |
| `createSupplierMutation` / `updateSupplierMutation` / `deleteSupplierMutation` | `refreshSuppliers()` |

---

## MapBox Integration

**Packages:** `react-map-gl@8.1.1`, `mapbox-gl@3.23.1`

**Token:** `VITE_MAPBOX_TOKEN` env var → `config.mapboxToken` (via `packages/config/`)
- Declared in `packages/config/vite-env.d.ts` (`ImportMetaEnv`)
- Typed in `packages/config/types.ts` (`AppConfig.mapboxToken: string`)
- Read in `packages/config/config.ts`
- Placeholder `VITE_MAPBOX_TOKEN=""` in `packages/config/configs/.env`; set real value in `.env.local`

**`SiteMap` component (`packages/views/inventory/SiteMap.tsx`):**
- Exports `SiteCoords = { lat: number; lng: number }`
- Props: `onLocationPick(coords, suggestedName?)`, `markers?`, `pendingMarker?`, `className?`
- Reverse-geocoding endpoint: `GET /geocoding/v5/mapbox.places/{lng},{lat}.json?types=place&limit=1`
- Name format: `"State - City"` (region from `context[]`, city from `text`)
- No-token fallback: dashed-border placeholder with instructions

---

## Styling (`inventory.css`)

Scoped under `.inventory-module` to avoid collisions with the rest of the app.

### CSS Custom Properties (oklch color space)
```
--inv-teal-{900,700,500,50}   # Primary accent
--inv-mint-{300,200,100}      # Intake / positive highlights
--inv-ink-{900,700,500,400,300} # Typography grays
```
Semantic colors: `--inv-amber`, `--inv-rose`, `--inv-leaf`, `--inv-info`

### Key Utility Classes
| Class | Purpose |
|---|---|
| `.page-h` | Page header (title + subtitle + right actions) |
| `.stat-grid` | 4-column stat card grid |
| `.stat` | Stat card with value, label, delta, accent bar |
| `.toolbar` | Filter/search bar with segment buttons |
| `.tbl` | Responsive table with expiration row tones |
| `.exp-cell` | Expiration column cell (tone-colored) |
| `.intake` | 2-column intake form (left steps + right sticky summary) |
| `.line-tbl` | Editable line items table inside intake |
| `.mov-*` | MovementsView-specific layout and type chip variants |

---

## Architecture & Tech Stack

| Concern | Approach |
|---|---|
| Framework | React (functional components + hooks) |
| State | `useState` + `useMemo` — local only |
| Routing | React Router 7 (`<Link>`) |
| Icons | Lucide React |
| i18n | Lingui (`t` macro) |
| Styling | Scoped CSS module (`inventory.css`) + CSS custom properties |
| Maps | MapBox GL JS via `react-map-gl` — token from `VITE_MAPBOX_TOKEN` |
| Data | API via `InventoryViewModel` (TanStack Query + MobX) |

---

## What's Not Yet Wired

- [x] **API integration** — inventory endpoints added to openapi.yaml, `bun api:gen` run, all views use real API via InventoryViewModel
- [x] **Add Product modal** — `AddProductModal.tsx` wired to `createInventoryProductV1`
- [x] **Add Category modal** — `AddCategoryModal.tsx` wired to `createInventoryCategoryV1`
- [x] **Sites & Zones CRUD** — `SitesView` + `SiteModal` + `ZoneModal` fully wired (create, update, delete)
- [x] **Suppliers CRUD** — `SitesView` + `SupplierModal` fully wired (create, update, delete)
- [x] **MapBox map** — `SiteMap.tsx` with reverse-geocoding; token via `VITE_MAPBOX_TOKEN`
- [ ] **Site coordinates** — API does not yet have `lat`/`lng` fields on `InventorySiteRequest`; map picks coords but they are not persisted
- [ ] **Site markers on map** — `SiteMap` has a `markers` prop ready; needs API to return coordinates per site
- [ ] **Edit / Delete product** — no modal yet; only creation is implemented
- [ ] **Edit / Delete category** — no modal yet; only creation is implemented
- [ ] **Category filter** in `InventoryView` (select renders but doesn't filter)
- [ ] **Sort dropdown** in `InventoryView` (select renders but doesn't sort)
- [ ] **Export CSV** in `MovementsView`, `LotsView`, and `ProductsView`
- [ ] **Adjust action** (pencil icon) in `InventoryView` row — no modal/form yet
- [ ] **Mark waste action** (trash icon) in `InventoryView` row — no confirmation/form yet
- [x] **IntakeView save** — full flow: creates IntakeShipment → ShipmentLines → Lot records → Movement audit entries; error handling with user-facing messages per phase
- [x] **IntakeView lot codes** — auto-generated `L-YYMMDD-XX` codes pre-filled in Step 3; user-editable before save; used as actual lot code on creation
- [x] **IntakeView PO number** — auto-generated `PO-YYYY-XXXX` on mount; editable by user; used as `poReference` on shipment creation
- [x] **IntakeView supplier dropdown** — wired to `getInventorySuppliersV1`; loads suppliers dynamically from API
- [ ] **IntakeView print receipt** — no implementation
- [ ] **Date range filter** in `MovementsView` ("Last 7 days" button)
- [x] **ViewModels** — `packages/view-model/inventory/InventoryViewModel.ts` singleton created; all domain queries + full set of mutations for sites, zones, suppliers, products, categories, lots, movements, shipments
- [x] **Route registration** — views wired into `apps/app/src/routes/_private+/inventory+/`
- [x] **i18n strings** — corrupted catalog entries removed; build compiles cleanly

---

## Known Issues & Gotchas

### Non-standard UUIDs from the backend
The backend generates UUIDs that do not conform to RFC 4122 (e.g., version/variant nibbles outside the standard range, like `11111111-0001-0001-0001-000000000005`). The `@hey-api/openapi-ts` code generator emits `z.uuid()` validators for all `format: uuid` fields in the OpenAPI spec, and Zod's strict UUID regex rejects these IDs before the HTTP request is even sent.

**Fix applied:** `validator: false` in `packages/api/openapi.config.ts` under `@hey-api/sdk`. This disables client-side Zod validation of request bodies globally. The Zod schemas in `zod.gen.ts` are still generated and available, but they are not wired into the SDK request pipeline.  
**Impact:** If you re-enable `validator: true` in the future, all inventory mutations (and any other mutation passing backend-generated IDs) will break again until the backend switches to standard UUIDs.

### Dialog portal and `.inventory-module` CSS scope
The `Dialog` component from `~@/ui` (Radix UI) renders into a portal outside the normal DOM tree, so the `.inventory-module` CSS scope does not automatically apply. The pattern used in `AddProductModal` and `AddCategoryModal` is to wrap inner content in `<div className="inventory-module">` so the CSS custom properties (`--inv-*`) and utility classes (`.btn`, `.input`, `.label`, `.field-grid`) work correctly inside the dialog.

### Adding new mutations to InventoryViewModel
When wiring a new API action (e.g., edit product, delete category), add the `ObservedMutation` instance to `InventoryViewModel` alongside the existing ones. Also add a `refreshX()` method that calls `.invalidate()` + `.refetch()` on the relevant query so the list updates immediately after a mutation succeeds. See `refreshProducts` / `refreshCategories` / `refreshSites` / `refreshSuppliers` for the pattern.

### views/index.ts uses explicit named exports
`packages/views/index.ts` does **not** use `export *` from sub-barrels — it has explicit named export lists. When adding a new view component, it must be added to both `packages/views/inventory/index.ts` (the inner barrel) **and** the explicit list in `packages/views/index.ts`. Forgetting the outer barrel causes a blank screen on the route (the import resolves to `undefined`).

### `openapi.config.ts` input path is machine-specific
The `inputPath` in `packages/api/openapi.config.ts` must point to the local backend repo. It is not committed with a guaranteed value — verify it before running `bun api:gen`. The expected relative path is `./../Blumberg-Backend/Adapters/OpenApi/openapi.yaml` (or `../backend/...` depending on the machine).

### MapBox token
Set `VITE_MAPBOX_TOKEN` in `.env.local` (not committed). The base `.env` file has `VITE_MAPBOX_TOKEN=""` as a placeholder. When the token is empty, `SiteMap` renders a dashed placeholder instead of crashing.

---

## Next Development Steps (Suggested Order)

1. ~~Register routes under `apps/app/src/routes/_private+/inventory/`~~ ✓
2. ~~Add OpenAPI endpoints for lots, movements, products, and intake to `packages/api/openapi.yaml` → `bun api:gen`~~ ✓
3. ~~Create ViewModels in `packages/view-model/inventory/` (singleton for filters/list, instance for intake form)~~ ✓
4. ~~Replace mock data with `ObservedQuery` / `ObservedMutation` calls~~ ✓
5. ~~Add Product and Category creation modals to `ProductsView`~~ ✓
6. ~~Wire `IntakeView` supplier dropdown to `getInventorySuppliersV1`~~ ✓
7. ~~Wire `IntakeView` save to create Lot + Movement records per line~~ ✓
8. ~~Auto-generate editable PO number and lot codes in IntakeView~~ ✓
9. ~~Full CRUD for Sites, Zones, and Suppliers (`SitesView`)~~ ✓
10. ~~Add MapBox map to Locations page with reverse-geocoding on click~~ ✓
11. Add `lat`/`lng` fields to `InventorySiteRequest` in OpenAPI spec → `bun api:gen` → persist coordinates on site create/edit → show site markers on map
12. Wire up Edit/Delete actions for products and categories (follow `SiteModal` pattern)
13. Wire up remaining `InventoryView` UI actions: category filter, sort dropdown, adjust modal, mark-waste confirmation
14. Implement Export CSV in `MovementsView`, `LotsView`, `ProductsView`
15. Add CASL authorization rules via `bun authorization:generate`
