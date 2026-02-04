import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type RowSelectionState,
	useReactTable,
} from "@tanstack/react-table";
import { useCallback, useContext, useMemo } from "react";

import { DataTableContext, useDataTableStore } from "../stores/DataTableContext";
import type {
	ActiveFilter,
	DataItem,
	DataTableActions,
	DataTableConfig,
	ErrorInfo,
	IDataTableController,
	SelectionState,
	SortingStateArray,
} from "../types";

/**
 * Pagination info interface
 */
interface PaginationInfo {
	currentPage: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	startItem: number;
	endItem: number;
	startIndex: number;
	endIndex: number;
	itemsOnCurrentPage: number;
}

/**
 * Hook result interface
 */
interface UseDataTableResult<TData extends DataItem = DataItem> {
	// TanStack Table instance
	table: ReturnType<typeof useReactTable<TData>>;

	// Data
	data: TData[];
	total: number;

	// Loading states
	isLoading: boolean;
	isFetching: boolean;
	isRefreshing: boolean;
	isError: boolean;
	error: ErrorInfo | null;

	// Pagination
	pagination: PaginationInfo;
	goToPage: (page: number) => void;
	setPageSize: (size: number) => void;
	goToFirstPage: () => void;
	goToLastPage: () => void;
	goToNextPage: () => void;
	goToPreviousPage: () => void;

	// Selection (basic state only - no bulk actions)
	selection: SelectionState;

	// Sorting
	sorting: SortingStateArray;
	setSorting: (sorting: SortingStateArray) => void;
	toggleSort: (columnId: string) => void;
	clearSort: () => void;

	// Filtering (basic state only - no advanced filtering UI)
	activeFilters: ActiveFilter[];

	// Search
	searchQuery: string;
	debouncedSearchQuery: string;
	setSearchQuery: (query: string) => void;
	clearSearch: () => void;

	// Actions
	refresh: () => Promise<void>;
	reset: () => void;

	// New properties
	actions: DataTableActions<TData>;
	config: DataTableConfig;
	controller: IDataTableController<TData>;

	// State
	state: Record<string, unknown>;
}

/**
 * Main hook for DataTable with optimized reactivity
 *
 * Key features:
 * 1. Correct dependencies for useMemo to prevent pagination issues
 * 2. Proper memoization of all computed values
 * 3. Optimized callback functions with useCallback
 * 4. Better separation of concerns
 * 5. Enhanced error handling
 */
export function useDataTable<TData extends DataItem = DataItem>(): UseDataTableResult<TData> {
	const store = useDataTableStore<TData>();
	const context = useContext(DataTableContext);

	// CRITICAL FIX: Specific dependencies for reactive updates
	// This solves the pagination issue from the RCA by ensuring useMemo
	// re-runs when the actual data or pagination state changes
	const tableData = store.data; // Specific dependency
	const paginationPageIndex = store.pagination.pageIndex; // Specific dependency
	const paginationPageSize = store.pagination.pageSize; // Specific dependency
	const sortingState = store.sorting; // Specific dependency
	// const _selectionState = store.selection; // Specific dependency - commented out as unused
	const isLoading = store.isLoading; // Specific dependency
	const isError = store.isError; // Specific dependency
	const error = store.error; // Specific dependency

	// Create row selection state
	const rowSelection = useMemo((): RowSelectionState => {
		const selection: RowSelectionState = {};
		store.selection.selectedRows.forEach((id) => {
			selection[id] = true;
		});
		return selection;
	}, [store.selection.selectedRows]);

	// Create TanStack Table instance
	const table = useReactTable({
		data: tableData, // Use specific dependency
		columns: store.columns,

		// Pagination
		state: {
			pagination: {
				pageIndex: paginationPageIndex, // Use specific dependency
				pageSize: paginationPageSize, // Use specific dependency
			},
			sorting: sortingState as SortingStateArray, // Use specific dependency
			rowSelection,
		},

		// Table features
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),

		// Manual pagination for server-side data
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,

		// Row count
		rowCount: store.total,

		// Row selection
		enableRowSelection: store.config.enableRowSelection,
		enableMultiRowSelection: store.config.enableMultiRowSelection,

		// Row ID
		getRowId: store.controller.getRowId || ((row: TData) => row.id?.toString() || ""),

		// Event handlers
		onPaginationChange: (updater) => {
			const newPagination = typeof updater === "function" ? updater(store.pagination) : updater;
			store.setPagination(newPagination);
		},

		onSortingChange: (
			updater: SortingStateArray | ((old: SortingStateArray) => SortingStateArray),
		) => {
			const newSorting = typeof updater === "function" ? updater(store.sorting) : updater;
			store.setSorting(newSorting);
		},

		onRowSelectionChange: (updater) => {
			const currentSelection: RowSelectionState = {};
			store.selection.selectedRows.forEach((id) => {
				currentSelection[id] = true;
			});

			const newSelection = typeof updater === "function" ? updater(currentSelection) : updater;

			const selectedIds = Object.keys(newSelection).filter((id) => newSelection[id]);
			const selectedRows = new Set(selectedIds);

			store.setSelection({
				selectedRows,
				selectedCount: selectedIds.length,
				isAllSelected: selectedIds.length === tableData.length && tableData.length > 0,
				isPartiallySelected: selectedIds.length > 0 && selectedIds.length < tableData.length,
			});
		},
	});

	// Memoized pagination info
	const pagination = useMemo(
		(): PaginationInfo => ({
			currentPage: paginationPageIndex + 1, // Convert to 1-based
			pageSize: paginationPageSize,
			totalItems: store.total,
			totalPages: Math.ceil(store.total / paginationPageSize),
			hasNextPage: paginationPageIndex < Math.ceil(store.total / paginationPageSize) - 1,
			hasPreviousPage: paginationPageIndex > 0,
			startIndex: paginationPageIndex * paginationPageSize,
			endIndex: Math.min((paginationPageIndex + 1) * paginationPageSize - 1, store.total - 1),
			startItem: paginationPageIndex * paginationPageSize + 1,
			endItem: Math.min((paginationPageIndex + 1) * paginationPageSize, store.total),
			itemsOnCurrentPage: Math.min(
				paginationPageSize,
				store.total - paginationPageIndex * paginationPageSize,
			),
		}),
		[paginationPageIndex, paginationPageSize, store.total],
	);

	// Optimized action callbacks with useCallback
	const goToPage = useCallback(
		(page: number) => {
			const pageIndex = Math.max(0, Math.min(page - 1, pagination.totalPages - 1));
			store.setPagination({ pageIndex });
		},
		[pagination.totalPages, store],
	);

	const setPageSize = useCallback(
		(pageSize: number) => {
			store.setPagination({ pageIndex: 0, pageSize });
		},
		[store],
	);

	const goToFirstPage = useCallback(() => {
		store.setPagination({ pageIndex: 0 });
	}, [store]);

	const goToLastPage = useCallback(() => {
		store.setPagination({ pageIndex: pagination.totalPages - 1 });
	}, [pagination.totalPages, store]);

	const goToNextPage = useCallback(() => {
		if (pagination.hasNextPage) {
			store.setPagination({ pageIndex: paginationPageIndex + 1 });
		}
	}, [pagination.hasNextPage, paginationPageIndex, store]);

	const goToPreviousPage = useCallback(() => {
		if (pagination.hasPreviousPage) {
			store.setPagination({ pageIndex: paginationPageIndex - 1 });
		}
	}, [pagination.hasPreviousPage, paginationPageIndex, store]);

	// Selection actions removed - not used without BulkActions

	// Sorting actions
	const setSorting = useCallback(
		(sorting: Array<{ id: string; desc: boolean }>) => {
			store.setSorting(sorting as SortingStateArray);
		},
		[store],
	);

	const toggleSort = useCallback(
		(columnId: string) => {
			const currentSort = store.sorting.find((s) => s.id === columnId);

			if (!currentSort) {
				// Add new sort
				store.setSorting([{ id: columnId, desc: false }] as SortingStateArray);
			} else if (!currentSort.desc) {
				// Change to descending
				store.setSorting([{ id: columnId, desc: true }] as SortingStateArray);
			} else {
				// Remove sort
				store.setSorting([] as SortingStateArray);
			}
		},
		[store],
	);

	const clearSort = useCallback(() => {
		store.setSorting([]);
	}, [store]);

	// Filter actions removed - no advanced filtering UI implemented

	// Search actions
	const setSearchQuery = useCallback(
		(query: string) => {
			store.setSearchQuery(query);
		},
		[store],
	);

	const clearSearch = useCallback(() => {
		store.setSearchQuery("");
	}, [store]);

	// General actions
	const refresh = useCallback(async () => {
		await store.refresh();
	}, [store]);

	const reset = useCallback(() => {
		store.reset();
	}, [store]);

	return {
		// Core objects
		table,

		// Data
		data: tableData,
		total: store.total,

		// Loading states
		isLoading,
		isFetching: store.isFetching,
		isRefreshing: store.isRefreshing,
		isError,
		error,

		// Pagination
		pagination,
		goToPage,
		setPageSize,
		goToFirstPage,
		goToLastPage,
		goToNextPage,
		goToPreviousPage,

		// Selection (basic state only)
		selection: store.selection,

		// Sorting
		sorting: store.sorting.map((s) => ({ id: s.id, desc: s.desc })),
		setSorting,
		toggleSort,
		clearSort,

		// Filtering (basic state only)
		activeFilters: store.filters,

		// Search
		searchQuery: store.search.query,
		debouncedSearchQuery: store.search.debouncedQuery,
		setSearchQuery,
		clearSearch,

		// Actions
		refresh,
		reset,

		// New properties
		actions: (context?.actions || {}) as DataTableActions<TData>,
		config: store.config,
		controller: store.controller,

		// State
		state: {
			data: tableData,
			total: store.total,
			isLoading,
			isRefreshing: store.isRefreshing,
			isError,
			error,
			pagination: store.pagination,
			selection: store.selection,
			sorting: store.sorting,
			filters: store.filters,
			search: store.search,
			lastUpdated: null,
		},
	};
}
