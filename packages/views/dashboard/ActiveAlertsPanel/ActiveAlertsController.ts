import type { ErrorInfo, IDataTableController, StandardQuery } from "~@/data-table";
import { makeAutoObservable } from "~@/mobx";
import {
	activeAlertsPanelViewModel,
	alertsViewModel,
	dashboardAlertsViewModel,
} from "~@/view-model";

import type { Alert } from "../../alerts/types";

export interface AlertItem extends Alert {
	[key: string]: unknown;
}

/**
 * DataTable Controller for Active Alerts Panel.
 * Data comes from ActiveAlertsPanelViewModel (which uses alertsViewModel, same as /alerts page).
 */
export class ActiveAlertsController implements IDataTableController<AlertItem> {
	readonly tableId = "active-alerts";

	constructor() {
		makeAutoObservable(this);
	}

	get data(): AlertItem[] {
		return activeAlertsPanelViewModel.alertsForOverview as AlertItem[];
	}

	get total(): number {
		return activeAlertsPanelViewModel.alertsForOverview.length;
	}

	get isLoading(): boolean {
		return alertsViewModel.isLoading;
	}

	get isFetching(): boolean {
		return alertsViewModel.isFetching;
	}

	get isError(): boolean {
		return alertsViewModel.hasError;
	}

	get error(): ErrorInfo | null {
		const err = alertsViewModel.error;
		return err != null ? { message: err } : null;
	}

	async load(_query: StandardQuery): Promise<void> {
		// Ensure both dashboard-specific alerts (active overview) and full alerts list are loaded.
		alertsViewModel.load();
		dashboardAlertsViewModel.load();
	}

	dispose(): void {}
}
