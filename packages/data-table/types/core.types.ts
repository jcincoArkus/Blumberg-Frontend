import type { CSSProperties } from "react";

/**
 * Standard query interface for API calls
 * Compatible with backend pagination and filtering
 */
export interface StandardQuery {
	page: number;
	limit: number;
	/**
	 * Global search term (preferred).
	 *
	 * Note: `DataTableStore` builds this param as `search` and our OpenAPI list endpoints
	 * also expect `search`.
	 */
	search?: string;
	sort?: string; // Field to sort by
	sortDir?: "ASC" | "DESC";
	[key: string]: unknown; // Additional filters
}

/**
 * Pagination state
 */
export interface PaginationState {
	pageIndex: number; // 0-based for TanStack Table
	pageSize: number;
}

/**
 * Sorting state (compatible with TanStack Table)
 */
export interface SortingState {
	id: string;
	desc: boolean;
}

/**
 * Array of sorting states (compatible with TanStack Table ColumnSort[])
 */
export type SortingStateArray = SortingState[];

/**
 * View modes supported by the datatable
 */
export type ViewMode = "table" | "gallery" | "list" | "custom";

/**
 * Size variants
 */
export type SizeVariant = "sm" | "md" | "lg";

/**
 * Color variants
 */
export type ColorVariant = "primary" | "secondary" | "success" | "warning" | "error" | "info";

/**
 * Base component props that all datatable components should extend
 */
export interface BaseComponentProps {
	className?: string;
	style?: CSSProperties;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
	disabled?: boolean;
	disabledReason?: string;
}

/**
 * Props for components that can show loading state
 */
export interface LoadableProps {
	loading?: boolean;
	loadingText?: string;
}

/**
 * Generic data item interface
 */
export interface DataItem {
	id?: string | number | null;
	[key: string]: unknown;
}

/**
 * Error information (used by controllers)
 */
export interface ErrorInfo {
	message: string;
	code?: string | number;
	details?: Record<string, unknown>;
	timestamp?: Date;
}
