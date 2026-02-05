import type { IDataTableController, StandardQuery } from "~@/data-table";
import { makeAutoObservable } from "~@/mobx";
import { activeAlertsPanelViewModel } from "~@/view-model";

import type { Alert } from "../../alerts/types";

export interface AlertItem extends Alert {
	[key: string]: unknown;
}

/**
 * DataTable Controller for Active Alerts Panel.
 * Delegates data to ActiveAlertsPanelViewModel (Pattern 2: Controller with ViewModel).
 */
export class ActiveAlertsController implements IDataTableController<AlertItem> {
	readonly tableId = "active-alerts";

	constructor() {
		makeAutoObservable(this);
	}

	// Delegate to ViewModel
	get data(): AlertItem[] {
		return activeAlertsPanelViewModel.sortedAlerts as AlertItem[];
	}

	get total(): number {
		return activeAlertsPanelViewModel.sortedAlerts.length;
	}

	get isLoading(): boolean {
		return false;
	}

	get isFetching(): boolean {
		return false;
	}

	get isError(): boolean {
		return false;
	}

	get error(): null {
		return null;
	}

	async load(_query: StandardQuery): Promise<void> {
		return Promise.resolve();
	}

	dispose(): void {}
}
