import type { DataTableConfig } from "../types";

/**
 * Default configuration for DataTable
 * Only includes properties that are actually used in the code
 */
export const DEFAULT_CONFIG: Required<DataTableConfig> = {
	// Basic configuration
	tableId: "datatable",

	// Search configuration (only debounce is used)
	searchDebounceMs: 300,

	// Selection configuration (used by TanStack Table)
	enableRowSelection: false,
	enableMultiRowSelection: false,

	// Pagination configuration (used in store)
	defaultPageSize: 20,
	initialPage: 0,
	paginationBase: 0, // Default to 0-based pagination for API
};
