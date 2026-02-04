# DataTable (headless)

This package is a **headless data table**: it ships **no styles** and **no default UI components**.
You decide how each piece looks (table, pagination, inputs, loading states, etc.).

> ✅ **Requirement:** you must inject UI components either via the `components` prop (per instance)
> or via `DataTableConfigProvider` (global).

---

## ✅ What's included

- **MobX store** with pagination, sorting, filters and search.
- **`useDataTable` hook** with state and helpers.
- **Controller interface** to connect your data source.
- **Headless infrastructure** (table, list, gallery, pagination, empty/error/loading, search).

---

## 🚀 Quick Start

### 1. Define your data type

```ts
import type { DataItem } from "~@/data-table";

type User = DataItem & {
  id: number;
  name: string;
  email: string;
};
```

### 2. Create a controller with MobX

```ts
import { makeAutoObservable, runInAction } from "mobx";
import type { IDataTableController, StandardQuery, ErrorInfo } from "~@/data-table";

class UserDataTableController implements IDataTableController<User> {
  readonly tableId = "users-table";

  // Observable state
  data: User[] = [];
  total: number = 0;
  isLoading = false;
  isFetching = false;
  isError = false;
  error: ErrorInfo | null = null;

  // Optional: abort controller for cancelling requests
  private _abortController: AbortController | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  dispose(): void {
    this._abortController?.abort();
    this._abortController = null;
  }

  async load(query: StandardQuery): Promise<void> {
    // Cancel previous request
    this._abortController?.abort();
    this._abortController = new AbortController();
    const signal = this._abortController.signal;

    const isFirstLoad = this.data.length === 0;

    runInAction(() => {
      this.isError = false;
      this.error = null;
      if (isFirstLoad) this.isLoading = true;
      else this.isFetching = true;
    });

    try {
      const page = query.page ?? 0;
      const limit = query.limit ?? 20;
      const search = query.search ?? "";

      const res = await fetch(`/api/users?page=${page}&limit=${limit}&search=${search}`, { signal });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const json = await res.json();

      runInAction(() => {
        this.data = json.items;
        this.total = json.total;
      });
    } catch (e) {
      if (signal.aborted) return;
      runInAction(() => {
        this.isError = true;
        this.error = { message: e instanceof Error ? e.message : "Unknown error" };
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
        this.isFetching = false;
      });
    }
  }
}
```

### 3. Define columns (separate from controller)

Columns use [TanStack Table column definitions](https://tanstack.com/table/latest/docs/guide/column-defs).
Use `DataTableProps<T>["columns"]` for type safety.

```tsx
import type { DataTableProps } from "~@/data-table";

export const getUserColumns = (): DataTableProps<User>["columns"] =>
  [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      size: 50,
      cell: ({ row }) => (
        <button onClick={() => console.log(row.original)}>Edit</button>
      ),
    },
  ] satisfies DataTableProps<User>["columns"];
```

### 4. Use the DataTable

```tsx
import { useMemo } from "react";
import { DataTable } from "~@/data-table";

export function UsersPage() {
  const controller = useMemo(() => new UserDataTableController(), []);
  const columns = useMemo(() => getUserColumns(), []);

  return (
    <DataTable<User>
      controller={controller}
      columns={columns}
      components={{
        TableView,
        Pagination,
        Loading,
        EmptyState,
        ErrorState,
        SearchInput, // Only if showSearch={true}
      }}
    />
  );
}
```

---

## 🧱 Columns

Columns **do not live in the controller**. Define them separately and pass them to `DataTable` via `columns`.

### Why separate?

- **Separation of concerns**: Controller handles data, columns handle presentation
- **Flexibility**: Same controller can be used with different column layouts
- **Testability**: Easier to test controller logic without UI concerns

### Type pattern

Always use `DataTableProps<T>["columns"]` for consistency:

```tsx
import type { DataTableProps } from "~@/data-table";

export const getColumns = (): DataTableProps<MyData>["columns"] =>
  [
    // columns...
  ] satisfies DataTableProps<MyData>["columns"];
```

### Conditional columns

```tsx
const columns = useMemo(() => {
  const allColumns = getColumns();
  return hasPermission ? allColumns : allColumns.filter(c => c.id !== "actions");
}, [hasPermission]);
```

### Custom cell rendering

For custom cell rendering, import `flexRender` directly from TanStack:

```tsx
import { flexRender } from "@tanstack/react-table";

// In your custom TableView component:
{flexRender(cell.column.columnDef.cell, cell.getContext())}
```

---

## 🧠 Controller Interface

```ts
interface IDataTableController<TData> {
  // Required
  readonly tableId: string;
  readonly data: TData[];
  readonly total: number | bigint;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly isError: boolean;
  readonly error: ErrorInfo | null;
  load(query: StandardQuery): Promise<void>;
  dispose(): void;

  // Optional
  readonly config?: Partial<DataTableConfig>;
  refresh?(): Promise<void>;
  onRowClick?(row: TData): void | Promise<void>;
  onRowDoubleClick?(row: TData): void | Promise<void>;
  isRowSelectable?(row: TData): boolean;
  getRowId?(row: TData): string;
  onSelectionChange?(selectedRows: TData[]): void | Promise<void>;
}
```

### StandardQuery

The `load` method receives a `StandardQuery` object:

```ts
interface StandardQuery {
  page?: number;      // Current page (0-based internally)
  limit?: number;     // Page size
  search?: string;    // Search query
  sortBy?: string;    // Sort field
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}
```

### ErrorInfo

```ts
interface ErrorInfo {
  message: string;
  code?: string | number;
  details?: unknown;
}
```

---

## ⚙️ Config

```ts
interface DataTableConfig {
  tableId?: string;
  searchDebounceMs?: number;       // Default: 300
  enableRowSelection?: boolean;    // Default: false
  enableMultiRowSelection?: boolean;
  defaultPageSize?: number;        // Default: 20
  paginationBase?: 0 | 1;          // Default: 0
}
```

### paginationBase

Use `paginationBase` to adapt to your API:

| Value | API expects | Example |
|-------|-------------|---------|
| `0` | page=0, page=1, page=2... | Most REST APIs |
| `1` | page=1, page=2, page=3... | Some legacy APIs |

Internally, the store always uses 0-based indexing. The conversion happens when calling `load()`.

---

## 🧩 Component Overrides

All components have strict TypeScript types:

| Component | Type | Required |
|-----------|------|----------|
| `TableView` | `DataTableTableViewProps<TData>` | ✅ Yes |
| `Pagination` | `DataTablePaginationProps` | ✅ Yes |
| `Loading` | `DataTableLoadingProps` | ✅ Yes |
| `EmptyState` | `DataTableEmptyStateProps` | ✅ Yes |
| `ErrorState` | `DataTableErrorStateProps` | ✅ Yes |
| `SearchInput` | `DataTableSearchInputProps` | If `showSearch=true` |
| `GalleryView` | `DataTableGalleryViewProps<TData>` | If `viewMode="gallery"` |
| `ListView` | `DataTableListViewProps<TData>` | If `viewMode="list"` |

### Example: Custom TableView

```tsx
import { flexRender } from "@tanstack/react-table";
import type { DataTableTableViewProps } from "~@/data-table";

const TableView: FC<DataTableTableViewProps<User>> = ({ table, onRowClick, isLoading }) => {
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} onClick={() => onRowClick?.(row.original)}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Example: Custom Pagination

```tsx
import type { DataTablePaginationProps } from "~@/data-table";

const Pagination: FC<DataTablePaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div>
      <button disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}>
        Previous
      </button>
      <span>Page {currentPage + 1} of {totalPages}</span>
      <button disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </button>
    </div>
  );
};
```

---

## ✅ Global Defaults (recommended)

Create an app-level provider to avoid repeating component overrides:

```tsx
// app/providers/AppDataTableProvider.tsx
import type { ReactNode } from "react";
import { DataTableConfigProvider, type DataTableComponentOverrides } from "~@/data-table";

const components: DataTableComponentOverrides = {
  TableView,
  Pagination,
  SearchInput,
  Loading,
  EmptyState,
  ErrorState,
};

export function AppDataTableProvider({ children }: { children: ReactNode }) {
  return (
    <DataTableConfigProvider
      value={{
        components,
        config: {
          defaultPageSize: 25,
          searchDebounceMs: 300,
        },
      }}
    >
      {children}
    </DataTableConfigProvider>
  );
}
```

Then wrap your app:

```tsx
<AppDataTableProvider>
  <App />
</AppDataTableProvider>
```

Now you can use `DataTable` without specifying components every time:

```tsx
<DataTable controller={controller} columns={columns} />
```

---

## ✅ useDataTable Hook

Access the store and helpers from within the DataTable tree:

```tsx
import { useDataTable } from "~@/data-table";

function MyCustomComponent() {
  const {
    // Data
    data,
    total,
    isLoading,
    isFetching,
    isError,
    error,

    // Pagination
    pagination,
    goToPage,
    setPageSize,

    // Search
    searchQuery,
    setSearchQuery,

    // Selection
    selectedRows,
    setSelection,

    // Table instance (TanStack)
    table,
  } = useDataTable<User>();

  return <div>...</div>;
}
```

---

## 📦 Exports

```ts
// Components
DataTable
DataTableConfigProvider

// Hooks
useDataTable
useDataTableDefaults
useDataTableStore
useDataTableController

// Store
DataTableStore

// Types
type IDataTableController
type StandardQuery
type ErrorInfo
type DataItem
type DataTableProps
type DataTableConfig
type DataTableComponentOverrides
type DataTableTableViewProps
type DataTablePaginationProps
type DataTableSearchInputProps
type DataTableLoadingProps
type DataTableEmptyStateProps
type DataTableErrorStateProps
type DataTableGalleryViewProps
type DataTableListViewProps
type ColumnDef  // Re-exported from @tanstack/react-table
type CellContext  // Re-exported from @tanstack/react-table
```

---

## ✅ Notes

- **No styles included**: You provide all UI components
- **MobX required**: Controller state must be observable
- **TanStack Table**: For custom cell rendering, import `flexRender` from `@tanstack/react-table`
- **Pagination is 0-based internally**: Use `paginationBase` config to adapt to your API

---