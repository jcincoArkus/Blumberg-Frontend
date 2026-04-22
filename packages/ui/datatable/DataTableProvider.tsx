import type { ReactNode } from "react";

import { type DataTableComponentOverrides, DataTableConfigProvider } from "~@/data-table";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Loading } from "./Loading";
import { Pagination } from "./Pagination";
import { SearchInput } from "./SearchInput";
import { TableView } from "./TableView";

/**
 * Global DataTable component overrides
 * These components will be used by default for all DataTable instances
 */
const components: DataTableComponentOverrides = {
	TableView,
	Pagination,
	SearchInput,
	Loading,
	EmptyState,
	ErrorState,
};

/**
 * AppDataTableProvider
 * Wraps the application to provide default DataTable components and configuration
 *
 * Usage:
 * ```tsx
 * <AppDataTableProvider>
 *   <App />
 * </AppDataTableProvider>
 * ```
 */
export function AppDataTableProvider({ children }: { children: ReactNode }) {
	return (
		<DataTableConfigProvider
			value={{
				components,
				config: {
					defaultPageSize: 20,
					searchDebounceMs: 300,
					paginationBase: 0,
				},
			}}
		>
			{children}
		</DataTableConfigProvider>
	);
}
