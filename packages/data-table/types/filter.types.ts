/**
 * Active filter state - simplified to only what's actually used
 */
export interface ActiveFilter {
	id: string;
	columnId?: string;
	value: unknown;
	operator?: string;
	label?: string;
	displayValue?: string;
}
