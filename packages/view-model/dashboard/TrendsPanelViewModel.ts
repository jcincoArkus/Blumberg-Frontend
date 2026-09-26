import { makeAutoObservable } from "~@/mobx";

import { dashboardSensorsViewModel } from "./DashboardSensorsViewModel";
import { dashboardTrendsViewModel, type TrendRange } from "./DashboardTrendsViewModel";

/**
 * Singleton ViewModel for the TrendsPanel component.
 * Provides real sensor-reading trends for Temperature, Humidity and CO₂.
 */
class TrendsPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	get data() {
		return dashboardTrendsViewModel.trendData;
	}

	get sources() {
		return dashboardTrendsViewModel.sources;
	}

	get range(): TrendRange {
		return dashboardTrendsViewModel.range;
	}

	/** Initial load: waiting for the sensor list and then for the first batch of readings. */
	get isLoading() {
		if (dashboardTrendsViewModel.hasLoaded) return false;
		return dashboardTrendsViewModel.isLoading || dashboardSensorsViewModel.isSensorsInitialLoading;
	}

	/** Re-fetching after the user switched range (data for the previous range still on screen). */
	get isRefreshing() {
		const trends = dashboardTrendsViewModel;
		return trends.isLoading && trends.hasLoaded && trends.loadedRange !== trends.range;
	}

	setRange = (range: TrendRange) => {
		dashboardTrendsViewModel.setRange(range);
	};

	load = () => {
		dashboardTrendsViewModel.load();
	};
}

// Export singleton instance
export const trendsPanelViewModel = new TrendsPanelViewModel();

/**
 * Hook to access the TrendsPanelViewModel singleton.
 * @returns The singleton instance of TrendsPanelViewModel
 */
export function useTrendsPanelViewModel() {
	return trendsPanelViewModel;
}
