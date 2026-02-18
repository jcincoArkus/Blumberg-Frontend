import { makeAutoObservable } from "~@/mobx";

import { dashboardSensorsViewModel } from "./DashboardSensorsViewModel";

/**
 * Singleton ViewModel for the SensorReliabilityPanel component.
 * Provides sensor reliability metrics and issue counts.
 */
class SensorReliabilityPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	// Get sensor reliability data from DashboardSensorsViewModel
	get reliability() {
		return dashboardSensorsViewModel.sensorReliability;
	}

	// Individual metric getters for convenience
	get offlineCount() {
		return this.reliability.offline;
	}

	get staleCount() {
		return this.reliability.stale;
	}

	get flappingCount() {
		return this.reliability.flapping;
	}

	get totalSensors() {
		return dashboardSensorsViewModel.sensors.length;
	}

	get offlineSensors() {
		return this.reliability.offlineSensors;
	}

	get staleSensors() {
		return this.reliability.staleSensors;
	}

	get flappingSensors() {
		return this.reliability.flappingSensors;
	}

	/** Number of sensors that are not offline, stale, or flapping. */
	get healthyCount() {
		return this.totalSensors - this.offlineCount - this.staleCount - this.flappingCount;
	}

	/** Percentage of healthy sensors (0–100). */
	get healthyPercentage() {
		return this.totalSensors > 0 ? Math.round((this.healthyCount / this.totalSensors) * 100) : 100;
	}

	/** True if any sensors are offline, stale, or flapping. */
	get hasIssues() {
		return this.offlineCount > 0 || this.staleCount > 0 || this.flappingCount > 0;
	}
}

// Export singleton instance
export const sensorReliabilityPanelViewModel = new SensorReliabilityPanelViewModel();

/**
 * Hook to access the SensorReliabilityPanelViewModel singleton.
 * @returns The singleton instance of SensorReliabilityPanelViewModel
 */
export function useSensorReliabilityPanelViewModel() {
	return sensorReliabilityPanelViewModel;
}
