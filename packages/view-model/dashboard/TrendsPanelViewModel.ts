import { makeAutoObservable } from "~@/mobx";

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

	get isLoading() {
		return dashboardTrendsViewModel.isLoading && !dashboardTrendsViewModel.hasLoaded;
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
