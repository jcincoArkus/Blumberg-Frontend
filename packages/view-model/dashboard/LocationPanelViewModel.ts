import { makeAutoObservable } from "~@/mobx";
import { dashboardMapLocations } from "~@/mock-data";

/**
 * Singleton ViewModel for LocationPanel (geo map).
 * Provides map locations for the dashboard.
 */
class LocationPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	get locations() {
		return dashboardMapLocations;
	}
}

export const locationPanelViewModel = new LocationPanelViewModel();

export function useLocationPanelViewModel() {
	return locationPanelViewModel;
}
