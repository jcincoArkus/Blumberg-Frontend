import type { ColumnDef } from "@tanstack/react-table";
import type { ComponentType, ReactNode } from "react";

import type { DataTableComponentOverrides } from "../config/DataTableConfigProvider";
import type { DataTableActions } from "./actions.types";
import type { DataTableConfig } from "./config.types";
import type { IDataTableController } from "./controller.types";
import type { BaseComponentProps, DataItem, ViewMode } from "./core.types";
import type { SelectionState } from "./selection.types";

/**
 * Response type for paginated data
 */
export interface PaginatedResponse<T> {
	items?: T[];
	data?: T[];
	total?: number;
	page?: number;
	limit?: number;
}

/**
 * Main DataTable component props
 */
export interface DataTableProps<TData extends DataItem = DataItem> extends BaseComponentProps {
	// Controller (required)
	controller: IDataTableController<TData>;

	// Column definitions (required)
	columns:
		| ColumnDef<TData>[]
		| readonly ColumnDef<TData>[]
		| (() => ColumnDef<TData>[] | readonly ColumnDef<TData>[]);

	// Configuration
	config?: Partial<DataTableConfig>;

	// Actions
	actions?: DataTableActions<TData>;

	// Component overrides
	components?: DataTableComponentOverrides<TData>;

	// View options
	viewMode?: ViewMode;
	height?: number | string;
	isFullPage?: boolean;

	// Custom components
	galleryCard?: ComponentType<{ data: TData; index: number }>;
	listItem?: ComponentType<{ data: TData; index: number }>;
	customEmptyState?: () => ReactNode;

	// Gallery view options
	galleryClassName?: string;

	// Event handlers
	onRowClick?: (row: TData, index: number) => void;
	onRowDoubleClick?: (row: TData, index: number) => void;
	onSelectionChange?: (selectedRows: TData[], selectedIds: string[]) => void;

	// Search functionality
	showSearch?: boolean;
	searchPlaceholder?: string;
	title?: string;

	// Interaction options
	isClickable?: boolean;

	// Custom bars
	renderTopBar?: (props: TopBarProps<TData>) => ReactNode;
	renderBottomBar?: (props: BottomBarProps<TData>) => ReactNode;

	// Header actions
	headerActions?: ReactNode;
}

// Removed CustomViewProps - not used

/**
 * Top bar props
 */
export interface TopBarProps<_TData extends DataItem = DataItem> {
	selectedCount: number;
	totalCount: number;
	selection: SelectionState;
	onRefresh: () => void;
	onExport?: () => void;
	onImport?: () => void;
}

/**
 * Bottom bar props
 */
export interface BottomBarProps<_TData extends DataItem = DataItem> {
	selectedCount: number;
	totalCount: number;
	pagination: {
		currentPage: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
}
