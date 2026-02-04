import type { Table } from "@tanstack/react-table";
import type { ComponentType, ReactElement, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { DataItem, DataTableConfig, ErrorInfo } from "../types";

export interface DataTablePaginationInfo {
	currentPage: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	startItem?: number;
	endItem?: number;
	startIndex?: number;
	endIndex?: number;
	itemsOnCurrentPage?: number;
}

export interface DataTableTableViewProps<TData extends DataItem = DataItem> {
	table: Table<TData>;
	onRowClick?: (row: TData, index: number) => void;
	onRowDoubleClick?: (row: TData, index: number) => void;
	isLoading: boolean;
	isFetching: boolean;
	stickyHeader?: boolean;
}

export interface DataTablePaginationProps {
	pagination: DataTablePaginationInfo;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	pageSizeOptions?: number[];
	showPageSizeSelector?: boolean;
	showInfo?: boolean;
}

export interface DataTableSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	title?: string;
}

export interface DataTableLoadingProps {
	message?: string;
}

export interface DataTableEmptyStateProps {
	title?: string;
	message?: string;
	icon?: ReactNode;
	showActionButton?: boolean;
	actionButtonText?: string;
	onAction?: () => void;
}

export interface DataTableErrorStateProps {
	error?: ErrorInfo | null;
	title?: string;
	message?: string;
	icon?: ReactNode;
	showRetryButton?: boolean;
	retryButtonText?: string;
	onRetry?: () => void;
}

export interface DataTableGalleryViewProps<TData extends DataItem = DataItem> {
	data: TData[];
	CardComponent: ComponentType<{ data: TData; index: number }>;
	onItemClick?: (row: TData, index: number) => void;
	onItemDoubleClick?: (row: TData, index: number) => void;
	isLoading?: boolean;
	isFetching?: boolean;
	isClickable?: boolean;
	gridClassName?: string;
}

export interface DataTableListViewProps<TData extends DataItem = DataItem> {
	data: TData[];
	ItemComponent: ComponentType<{ data: TData; index: number }>;
	onItemClick?: (row: TData, index: number) => void;
	onItemDoubleClick?: (row: TData, index: number) => void;
	isLoading?: boolean;
	isFetching?: boolean;
}

export type DataTableComponentOverrides<TData extends DataItem = DataItem> = {
	TableView?: ComponentType<DataTableTableViewProps<TData>>;
	Pagination?: ComponentType<DataTablePaginationProps>;
	SearchInput?: ComponentType<DataTableSearchInputProps>;
	Loading?: ComponentType<DataTableLoadingProps>;
	EmptyState?: ComponentType<DataTableEmptyStateProps>;
	ErrorState?: ComponentType<DataTableErrorStateProps>;
	GalleryView?: ComponentType<DataTableGalleryViewProps<TData>>;
	ListView?: ComponentType<DataTableListViewProps<TData>>;
};

export interface DataTableDefaults<TData extends DataItem = DataItem> {
	config?: Partial<DataTableConfig>;
	components?: DataTableComponentOverrides<TData>;
}

const DataTableConfigContext = createContext<DataTableDefaults | null>(null);

export function DataTableConfigProvider({
	children,
	value,
}: {
	children: ReactNode;
	value: DataTableDefaults;
}): ReactElement {
	const memoizedValue = useMemo(() => value, [value]);

	return (
		<DataTableConfigContext.Provider value={memoizedValue}>
			{children}
		</DataTableConfigContext.Provider>
	);
}

export function useDataTableDefaults(): DataTableDefaults {
	return useContext(DataTableConfigContext) || {};
}
