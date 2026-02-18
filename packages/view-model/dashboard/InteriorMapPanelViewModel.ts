import { makeAutoObservable } from "~@/mobx";
import { dashboardMapLocations, locationZoneStatus, type ZoneStatus } from "~@/mock-data";

/**
 * Singleton ViewModel for InteriorMapPanel.
 * Provides location name lookup and zone status per selected location (map ↔ interior link).
 */
class InteriorMapPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	get locations() {
		return dashboardMapLocations;
	}

	getLocationName(locationId: string | null | undefined): string {
		if (!locationId) return "No Location Selected";
		const loc = this.locations.find((l) => l.id === locationId);
		return loc?.name ?? "Interior Map";
	}

	getZoneStatus(zoneId: string, locationId: string | null | undefined): ZoneStatus {
		if (!locationId) return "ok";
		const byLocation = locationZoneStatus[locationId];
		if (!byLocation) return "ok";
		return byLocation[zoneId] ?? "ok";
	}
}

export const interiorMapPanelViewModel = new InteriorMapPanelViewModel();

export function useInteriorMapPanelViewModel() {
	return interiorMapPanelViewModel;
}
