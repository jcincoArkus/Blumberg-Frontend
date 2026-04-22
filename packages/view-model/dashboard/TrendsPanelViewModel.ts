import { makeAutoObservable } from "~@/mobx";

import { dashboardTrendsViewModel } from "./DashboardTrendsViewModel";

/**
 * Singleton ViewModel for the TrendsPanel component.
 * Provides trend data for AQI, CO2, and Temperature.
 */
class TrendsPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	// Get trend data from DashboardTrendsViewModel
	get data() {
		return dashboardTrendsViewModel.trendData;
	}
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
