/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Generic actions interface for DataTable
 * Completely extensible - any custom action can be added
 */
export interface DataTableActions<TData = any> {
	// Completely extensible - any custom action
	[key: string]: (item: TData, ...args: any[]) => void | Promise<void>;
}
