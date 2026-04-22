import { makeAutoObservable } from "~@/mobx";

import { dashboardSitesViewModel } from "./DashboardSitesViewModel";

/**
 * Singleton ViewModel for the ZonesOverviewPanel component.
 * Provides site/location data for the zones overview.
 */
class ZonesOverviewPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	// Get sites from DashboardSitesViewModel
	get sites() {
		return dashboardSitesViewModel.sites;
	}
}

// Export singleton instance
export const zonesOverviewPanelViewModel = new ZonesOverviewPanelViewModel();

/**
 * Hook to access the ZonesOverviewPanelViewModel singleton.
 * @returns The singleton instance of ZonesOverviewPanelViewModel
 */
export function useZonesOverviewPanelViewModel() {
	return zonesOverviewPanelViewModel;
}
