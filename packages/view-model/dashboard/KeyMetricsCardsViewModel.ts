import { makeAutoObservable } from "~@/mobx";

/**
 * Singleton ViewModel for the KeyMetricsCards component.
 * Provides key environmental metrics (AQI, CO2, Temperature, Humidity).
 * TODO: Calculate metrics from sensor data when API is ready
 */
class KeyMetricsCardsViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	// Get key metrics (static mock for now)
	// TODO: Calculate from dashboardSensorsViewModel.sensors when API is ready
	get metrics() {
		return {
			aqi: { value: 42, unit: "", trend: "stable" as const, status: "stable" as const },
			co2: { value: 580, unit: "ppm", trend: "down" as const, status: "improving" as const },
			temperature: { value: 21.5, unit: "°C", trend: "stable" as const, status: "stable" as const },
			humidity: { value: 48, unit: "%", trend: "up" as const, status: "rising" as const },
		};
	}

	// Individual metric getters for convenience
	get aqi() {
		return this.metrics.aqi;
	}

	get co2() {
		return this.metrics.co2;
	}

	get temperature() {
		return this.metrics.temperature;
	}

	get humidity() {
		return this.metrics.humidity;
	}
}

// Export singleton instance
export const keyMetricsCardsViewModel = new KeyMetricsCardsViewModel();

/**
 * Hook to access the KeyMetricsCardsViewModel singleton.
 * @returns The singleton instance of KeyMetricsCardsViewModel
 */
export function useKeyMetricsCardsViewModel() {
	return keyMetricsCardsViewModel;
}
