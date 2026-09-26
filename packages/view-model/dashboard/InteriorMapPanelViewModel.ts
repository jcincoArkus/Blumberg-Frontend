import { t } from "~@/i18n/macro";
import { makeAutoObservable } from "~@/mobx";

import { alertsViewModel } from "../alerts";
import { locationPanelViewModel } from "./LocationPanelViewModel";

export type ZoneStatus = "alert" | "warning" | "ok";

/** Zones of the generic warehouse floor plan, by the kind of equipment they host. */
const ZONES_BY_EQUIPMENT_TYPE: Record<string, string[]> = {
	refrigeration: ["cold-room-1", "cold-room-2", "cold-room-3"],
	"climate control": ["aisle-a", "aisle-b", "aisle-c"],
	power: ["loading-zone", "office"],
};
const FALLBACK_ZONES = ["storage-area"];

/**
 * Singleton ViewModel for InteriorMapPanel.
 * Places each real equipment of the selected site into a zone of the floor plan
 * (refrigeration → cold rooms, climate → aisles, power → loading/office) and colors
 * zones by that equipment's unresolved alerts.
 */
class InteriorMapPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	get locations() {
		return locationPanelViewModel.locations;
	}

	getLocationName(locationId: string | null | undefined): string {
		if (!locationId) return t`No Location Selected`;
		const loc = this.locations.find((l) => l.id === locationId);
		return loc?.name ?? t`Interior Map`;
	}

	/** zoneId → equipment ids placed in it, for one site. */
	zoneAssignments(siteId: string): Record<string, string[]> {
		const bySite = locationPanelViewModel.equipment
			.filter((e) => e.siteId === siteId && e.id)
			.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
		const used: Record<string, number> = {};
		const out: Record<string, string[]> = {};
		for (const e of bySite) {
			const type = (e.equipmentType ?? "").toLowerCase();
			const pool = ZONES_BY_EQUIPMENT_TYPE[type] ?? FALLBACK_ZONES;
			const idx = used[type] ?? 0;
			used[type] = idx + 1;
			const zone = pool[idx % pool.length];
			out[zone] = [...(out[zone] ?? []), e.id as string];
		}
		return out;
	}

	getZoneStatus(zoneId: string, locationId: string | null | undefined): ZoneStatus {
		if (!locationId) return "ok";
		const equipmentIds = this.zoneAssignments(locationId)[zoneId];
		if (!equipmentIds?.length) return "ok";
		let status: ZoneStatus = "ok";
		for (const a of alertsViewModel.unresolvedAlerts) {
			if (!a.equipmentId || !equipmentIds.includes(a.equipmentId)) continue;
			if (a.severity === "critical") return "alert";
			status = "warning";
		}
		return status;
	}
}

export const interiorMapPanelViewModel = new InteriorMapPanelViewModel();

export function useInteriorMapPanelViewModel() {
	return interiorMapPanelViewModel;
}
