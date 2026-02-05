import { makeAutoObservable } from "~@/mobx";
import { dashboardSites } from "~@/mock-data";
import type { Site } from "~@/views";

/**
 * Singleton ViewModel for Dashboard Sites data.
 * Will use hey-api ObservedQuery when endpoints are ready.
 * Currently uses mock data.
 */
class DashboardSitesViewModel {
	// TODO: Replace with ObservedQuery when hey-api endpoint is ready
	// sitesQuery = new ObservedQuery(getSitesQuery, {});
	private readonly _sites: Site[];

	constructor() {
		makeAutoObservable(this);
		this._sites = dashboardSites;
	}

	/**
	 * Get all sites
	 */
	get sites(): Site[] {
		// return this.sitesQuery.data ?? [];
		return this._sites;
	}

	/**
	 * Load sites from API
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// load = () => {
	// 	this.sitesQuery.load();
	// };

	/**
	 * Dispose of resources
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// dispose = () => {
	// 	this.sitesQuery.dispose();
	// };
}

// Export singleton instance
export const dashboardSitesViewModel = new DashboardSitesViewModel();

export function useDashboardSitesViewModel() {
	return dashboardSitesViewModel;
}
