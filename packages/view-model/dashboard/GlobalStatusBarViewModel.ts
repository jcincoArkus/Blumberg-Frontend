import { makeAutoObservable, reaction } from "~@/mobx";
import type { Domain } from "~@/views";

import { dashboardAlertsViewModel } from "./DashboardAlertsViewModel";
import { dashboardSensorsViewModel } from "./DashboardSensorsViewModel";

/**
 * Singleton ViewModel for the GlobalStatusBar component.
 * Provides system status, alert counts, and sensor online metrics.
 * Coordinates between sensors and alerts ViewModels.
 */
class GlobalStatusBarViewModel {
	// Observable state for domain filtering
	activeDomain: Domain = "All";

	constructor() {
		makeAutoObservable(this);

		// Sync domain changes to both sensors and alerts ViewModels
		reaction(
			() => this.activeDomain,
			(domain) => {
				dashboardSensorsViewModel.setActiveDomain(domain);
				dashboardAlertsViewModel.setActiveDomain(domain, dashboardSensorsViewModel.sensorIds);
			},
			{ fireImmediately: true },
		);
	}

	// Get system status from alerts and sensors
	get systemStatus() {
		// Combine alerts status with sensor health
		const alertsStatus = dashboardAlertsViewModel.systemStatus;
		const offlineSensors = dashboardSensorsViewModel.offlineSensors.length;
		const totalSensors = dashboardSensorsViewModel.sensors.length;

		// If alerts say critical, return critical
		if (alertsStatus === "critical") return "critical";

		// Check sensor health
		if (totalSensors > 0 && offlineSensors / totalSensors > 0.2) return "critical";
		if (totalSensors > 0 && offlineSensors / totalSensors > 0.1) return "degraded";

		// Return alerts status (degraded or healthy)
		return alertsStatus;
	}

	// Get alert counts by severity
	get activeAlerts() {
		return dashboardAlertsViewModel.alertsBySeverity;
	}

	// Get sensors online count
	get sensorsOnline() {
		return dashboardSensorsViewModel.sensorsOnline;
	}

	// Get total sensors count
	get totalSensors() {
		return dashboardSensorsViewModel.sensors.length;
	}

	// Get all active alerts for drawer
	get alerts() {
		return dashboardAlertsViewModel.activeAlerts;
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
