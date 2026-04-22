/**
 * Main configuration for DataTable
 * Only includes properties that are actually used in the code
 */
export interface DataTableConfig {
	// Basic configuration
	tableId: string;

	// Search configuration (only debounce is used)
	searchDebounceMs?: number;

	// Selection configuration (used by TanStack Table)
	enableRowSelection?: boolean;
	enableMultiRowSelection?: boolean;

	// Pagination configuration (used in store)
	defaultPageSize?: number;
	initialPage?: number;
	paginationBase?: 0 | 1; // Whether API uses 0-based or 1-based pagination
}
