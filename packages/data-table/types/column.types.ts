/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef as TanStackColumnDef } from "@tanstack/react-table";

import type { DataItem } from "./core.types";

/**
 * Extended meta type for columns with additional DataTable-specific properties
 */
export interface DataTableColumnMeta {
	/**
	 * Whether the cell should respond to row clicks
	 * Set to false for action columns to prevent row click propagation
	 * @default true
	 */
	clickable?: boolean;

	/**
	 * Alignment of the cell content
	 */
	align?: "left" | "center" | "right";

	/**
	 * Whether the column should stick to a side when scrolling
	 */
	sticky?: "left" | "right";

	/**
	 * Custom className for the cell
	 */
	className?: string;

	/**
	 * Whether this column is searchable for global search
	 */
	searchable?: boolean;

	/**
	 * Additional custom properties
	 */
	[key: string]: any;
}

/**
 * Extended column definition that builds on TanStack Table
 * Includes DataTable-specific meta properties
 */
export type ColumnDef<TData extends DataItem = DataItem, TValue = any> = TanStackColumnDef<
	TData,
	TValue
> & {
	meta?: DataTableColumnMeta;
};
