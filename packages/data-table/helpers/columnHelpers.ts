/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	type ColumnDef,
	createColumnHelper as tanstackCreateColumnHelper,
} from "@tanstack/react-table";

/**
 * Enhanced column helper that provides more flexible type handling
 * Wraps TanStack's createColumnHelper with better type inference
 */
export function createColumnHelper<TData = any>() {
	const baseHelper = tanstackCreateColumnHelper<TData>();

	return {
		...baseHelper,

		/**
		 * Flexible accessor that accepts any return type without explicit typing
		 * Useful when you want to use (row) => row.field syntax without type annotations
		 */
		flexAccessor: <TValue = any>(
			accessor: ((row: TData) => TValue) | keyof TData,
			column: {
				id?: string;
				header?: any;
				cell?: any;
				footer?: any;
				size?: number;
				minSize?: number;
				maxSize?: number;
				enableSorting?: boolean;
				enableColumnFilter?: boolean;
				enableGlobalFilter?: boolean;
				enableResizing?: boolean;
				sortingFn?: any;
				filterFn?: any;
				aggregationFn?: any;
				meta?: any;
			},
		): ColumnDef<TData, any> => {
			if (typeof accessor === "function") {
				// For function accessors, use 'any' as the value type
				return baseHelper.accessor(accessor as any, column as any);
			} else {
				// For string accessors, use the normal accessor
				return baseHelper.accessor(accessor as any, column as any);
			}
		},

		/**
		 * Standard accessor - delegates to TanStack's implementation
		 */
		accessor: baseHelper.accessor,

		/**
		 * Display column - delegates to TanStack's implementation
		 */
		display: baseHelper.display,

		/**
		 * Group column - delegates to TanStack's implementation
		 */
		group: baseHelper.group,
	};
}
