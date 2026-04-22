/* eslint-disable */
import "@tanstack/react-table";

import type { DataTableColumnMeta } from "./column.types";

declare module "@tanstack/react-table" {
	type ColumnMeta<TData extends RowData = any, TValue = unknown> = DataTableColumnMeta;
}
