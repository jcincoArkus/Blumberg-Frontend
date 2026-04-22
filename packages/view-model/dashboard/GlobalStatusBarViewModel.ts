import { makeAutoObservable, reaction } from "~@/mobx";
import type { Domain } from "~@/views";

import { alertsViewModel } from "../alerts";
import { dashboardAlertsViewModel } from "./DashboardAlertsViewModel";
import { dashboardSensorsViewModel } from "./DashboardSensorsViewModel";

/**
 * Singleton ViewModel for the GlobalStatusBar component.
 * Uses alertsViewModel (same as Active Alerts panel) for alert counts and status; sensors for online count.
 */
class GlobalStatusBarViewModel {
	activeDomain: Domain = "All";

	constructor() {
		makeAutoObservable(this);

		reaction(
			() => this.activeDomain,
			(domain) => {
				dashboardSensorsViewModel.setActiveDomain(domain);
				dashboardAlertsViewModel.setActiveDomain(domain, dashboardSensorsViewModel.sensorIds);
			},
			{ fireImmediately: true },
		);
	}

	get systemStatus() {
		const alertsStatus = alertsViewModel.systemStatus;
		const offlineSensors = dashboardSensorsViewModel.offlineSensors.length;
		const totalSensors = dashboardSensorsViewModel.sensors.length;

		if (alertsStatus === "critical") return "critical";
		if (totalSensors > 0 && offlineSensors / totalSensors > 0.2) return "critical";
		if (totalSensors > 0 && offlineSensors / totalSensors > 0.1) return "degraded";
		return alertsStatus;
	}

	get activeAlerts() {
		return alertsViewModel.alertsBySeverity;
	}

	// Get sensors online count
	get sensorsOnline() {
		return dashboardSensorsViewModel.sensorsOnline;
	}

	// Get total sensors count
	get totalSensors() {
		return dashboardSensorsViewModel.sensors.length;
	}

	get alerts() {
		return alertsViewModel.unresolvedAlerts;
	}

	// Set active domain
	setActiveDomain = (domain: Domain) => {
		this.activeDomain = domain;
	};
}

// Export singleton instance
export const globalStatusBarViewModel = new GlobalStatusBarViewModel();

/**
 * Hook to access the GlobalStatusBarViewModel singleton.
 * @returns The singleton instance of GlobalStatusBarViewModel
 */
export function useGlobalStatusBarViewModel() {
	return globalStatusBarViewModel;
}
