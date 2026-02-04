import type { ColumnDef } from "@tanstack/react-table";
import type { ReactElement, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

import type { DataItem, DataTableActions, DataTableConfig, IDataTableController } from "../types";
import { DataTableStore } from "./DataTableStore";

/**
 * Context value interface
 */
interface DataTableContextValue<TData extends DataItem = DataItem> {
	store: DataTableStore<TData>;
	actions?: DataTableActions<TData>;
}

/**
 * React context for the datatable store
 */
export const DataTableContext = createContext<DataTableContextValue | null>(null);

/**
 * Provider props interface
 */
export interface DataTableProviderProps<TData extends DataItem = DataItem> {
	// Column definitions (required)
	columns:
		| ColumnDef<TData>[]
		| readonly ColumnDef<TData>[]
		| (() => ColumnDef<TData>[] | readonly ColumnDef<TData>[]);

	// Controller (required)
	controller: IDataTableController<TData>;

	// Common props
	config?: Partial<DataTableConfig>;
	actions?: DataTableActions<TData>;
	children: ReactNode;
}

/**
 * Provider component that creates and manages the datatable store
 */
export function DataTableProvider<TData extends DataItem = DataItem>({
	columns,
	controller,
	config,
	actions,
	children,
}: DataTableProviderProps<TData>): ReactElement {
	// Memoize the actual columns array
	const actualColumns = useMemo(() => {
		if (typeof columns === "function") {
			return columns();
		}
		return columns;
	}, [columns]);

	// Ref to hold the store for cleanup
	const storeRef = useRef<DataTableStore<TData> | null>(null);

	// Create or recreate store using useMemo
	const store = useMemo(() => {
		// Dispose previous store if it exists
		if (storeRef.current) {
			storeRef.current.dispose();
		}

		// Create new store
		const newStore = new DataTableStore(controller, actualColumns, config);
		storeRef.current = newStore;

		return newStore;
	}, [controller, actualColumns, config]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (storeRef.current) {
				storeRef.current.dispose();
				storeRef.current = null;
			}
		};
	}, []);

	// Memoize context value
	const contextValue = useMemo(
		(): DataTableContextValue<TData> => ({
			store,
			actions,
		}),
		[store, actions],
	);

	return (
		<DataTableContext.Provider value={contextValue as unknown as DataTableContextValue}>
			{children}
		</DataTableContext.Provider>
	);
}

/**
 * Hook to access the datatable store
 *
 * @throws Error if used outside of DataTableProvider
 */
export function useDataTableStore<TData extends DataItem = DataItem>(): DataTableStore<TData> {
	const context = useContext(DataTableContext);

	if (!context) {
		throw new Error(
			"useDataTableStore must be used within a DataTableProvider. " +
				"Make sure to wrap your component with <DataTableProvider>.",
		);
	}

	return context.store as unknown as DataTableStore<TData>;
}

/**
 * Hook to access the datatable controller
 *
 * @throws Error if used outside of DataTableProvider
 */
export function useDataTableController<
	TData extends DataItem = DataItem,
>(): IDataTableController<TData> {
	const store = useDataTableStore<TData>();
	return store.controller;
}
