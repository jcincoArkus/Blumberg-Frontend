import { t } from "~@/i18n/macro";
import { makeAutoObservable } from "~@/mobx";
import { getSeverityOrder } from "~@/models";
import type { Alert } from "~@/views";

import { dashboardAlertsViewModel } from "../dashboard/DashboardAlertsViewModel";

/**
 * Singleton ViewModel for the Active Alerts Panel.
 * Gets alert data from the DashboardAlertsViewModel singleton.
 */
class ActiveAlertsViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	// Get alerts from DashboardAlertsViewModel
	get alerts(): Alert[] {
		return dashboardAlertsViewModel.activeAlerts;
	}

	get sortedAlerts(): Alert[] {
		return [...this.alerts].sort((a, b) => {
			const aOrder = getSeverityOrder(a.severity);
			const bOrder = getSeverityOrder(b.severity);

			if (aOrder !== bOrder) return aOrder - bOrder;

			const aTime = new Date(a.createdAt).getTime();
			const bTime = new Date(b.createdAt).getTime();
			return aTime - bTime;
		});
	}

	getEquipmentName(_equipmentId?: string): string {
		// TODO: Implement equipment name lookup when equipment data is available
		return t`Unknown`;
	}

	getSiteName(_siteId?: string): string {
		// TODO: Implement site name lookup when site data is available
		return t`Unknown`;
	}

	getAlertZone(alert: Alert) {
		return this.getEquipmentName(alert.equipmentId) || this.getSiteName(alert.siteId);
	}
}

// Export singleton instance
export const activeAlertsViewModel = new ActiveAlertsViewModel();
