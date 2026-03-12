import type { IDataTableController, StandardQuery } from "~@/data-table";
import { makeAutoObservable } from "~@/mobx";
import { activeAlertsPanelViewModel, dashboardAlertsViewModel } from "~@/view-model";

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

	// Delegate to ViewModel (overview limited so dashboard card height stays stable)
	get data(): AlertItem[] {
		return activeAlertsPanelViewModel.alertsForOverview as AlertItem[];
	}

	get total(): number {
		return activeAlertsPanelViewModel.alertsForOverview.length;
	}

	get isLoading(): boolean {
		return dashboardAlertsViewModel.isLoading;
	}

	get isFetching(): boolean {
		return dashboardAlertsViewModel.isFetching;
	}

	get isError(): boolean {
		return dashboardAlertsViewModel.hasError;
	}

	get error(): null {
		return null;
	}

	async load(_query: StandardQuery): Promise<void> {
		return Promise.resolve();
	}

	dispose(): void {}
}
