/**
 * Selection state - simplified to only what's actually used
 */
export interface SelectionState {
	selectedRows: Set<string>;
	isAllSelected: boolean;
	isPartiallySelected: boolean;
	selectedCount: number;
}
