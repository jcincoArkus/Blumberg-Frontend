import { t } from "~@/i18n/macro";
import { makeAutoObservable } from "~@/mobx";
import { getSeverityOrder } from "~@/models";
import type { Alert } from "~@/views";

import { dashboardAlertsViewModel } from "./DashboardAlertsViewModel";

/**
 * Singleton ViewModel for the ActiveAlertsPanel component.
 * Provides sorted active alerts and helper methods.
 */
class ActiveAlertsPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	// Get active alerts from DashboardAlertsViewModel
	get alerts(): Alert[] {
		return dashboardAlertsViewModel.activeAlerts;
	}

	// Get alerts sorted by severity and time
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

	// Helper: Get equipment name (placeholder for now)
	getEquipmentName(_equipmentId?: string): string {
		// TODO: Implement equipment name lookup when equipment data is available
		return t`Unknown`;
	}

	// Helper: Get site name (placeholder for now)
	getSiteName(_siteId?: string): string {
		// TODO: Implement site name lookup when site data is available
		return t`Unknown`;
	}

	// Helper: Get alert zone (equipment or site name)
	getAlertZone(alert: Alert) {
		return this.getEquipmentName(alert.equipmentId) || this.getSiteName(alert.siteId);
	}
}

// Export singleton instance
export const activeAlertsPanelViewModel = new ActiveAlertsPanelViewModel();

/**
 * Hook to access the ActiveAlertsPanelViewModel singleton.
 * @returns The singleton instance of ActiveAlertsPanelViewModel
 */
export function useActiveAlertsPanelViewModel() {
	return activeAlertsPanelViewModel;
}
