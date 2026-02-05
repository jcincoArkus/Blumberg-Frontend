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
