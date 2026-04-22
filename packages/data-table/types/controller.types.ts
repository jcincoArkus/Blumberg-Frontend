/* eslint-disable @typescript-eslint/no-explicit-any */

import type { DataTableConfig } from "./config.types";
import type { DataItem, ErrorInfo, StandardQuery } from "./core.types";

/**
 * Simplified interface that all datatable controllers must implement
 * This is the only interface needed - no abstract classes or complex inheritance
 *
 * Controller interface for datatable data sources.
 *
 * @example
 * const controller = new UsersDataTableController();
 * <DataTable controller={controller} columns={columns} />
 */
export interface IDataTableController<TData extends DataItem = DataItem> {
	// Core identification
	readonly tableId: string;

	// Observable state (required for reactivity)
	readonly data: TData[];
	readonly total: number | bigint;
	readonly isLoading: boolean;
	readonly isFetching: boolean;
	readonly isError: boolean;
	readonly error: ErrorInfo | null;

	// Main data loading method
	load(query: StandardQuery | any): Promise<void>;

	// Lifecycle
	dispose(): void;

	// Optional configuration
	readonly config?: Partial<DataTableConfig>;

	// Optional event handlers
	refresh?(): Promise<void>;
	onRowClick?(row: TData): void | Promise<void>;
	onRowDoubleClick?(row: TData): void | Promise<void>;
	isRowSelectable?(row: TData): boolean;
	getRowId?(row: TData): string;
	onSelectionChange?(selectedRows: TData[]): void | Promise<void>;
}
