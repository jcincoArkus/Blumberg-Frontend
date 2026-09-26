import {
	type EquipmentResponse,
	getAllEquipmentV1ObservedQuery,
	getAllSitesV1ObservedQuery,
	type SiteResponse,
} from "~@/api";
import { makeAutoObservable } from "~@/mobx";

import { alertsViewModel } from "../alerts";

export type SiteStatus = "ok" | "warning" | "alert";

export interface DashboardMapLocation {
	id: string;
	name: string;
	city: string;
	lat: number;
	lng: number;
	status: SiteStatus;
}

/**
 * The sites API has no coordinates yet, so pin sites by city.
 * Unknown cities fall back to the state centroid, and otherwise are omitted from the map.
 */
const CITY_COORDS: Record<string, [number, number]> = {
	"chicago,il": [41.8781, -87.6298],
	"new york,ny": [40.7128, -74.006],
	"los angeles,ca": [34.0522, -118.2437],
	"houston,tx": [29.7604, -95.3698],
	"dallas,tx": [32.7767, -96.797],
	"seattle,wa": [47.6062, -122.3321],
	"atlanta,ga": [33.749, -84.388],
	"miami,fl": [25.7617, -80.1918],
	"denver,co": [39.7392, -104.9903],
	"phoenix,az": [33.4484, -112.074],
	"boston,ma": [42.3601, -71.0589],
	"san francisco,ca": [37.7749, -122.4194],
	"ciudad de mexico,cdmx": [19.4326, -99.1332],
	"guadalajara,jal": [20.6597, -103.3496],
	"monterrey,nl": [25.6866, -100.3161],
};

const STATE_COORDS: Record<string, [number, number]> = {
	il: [40.0, -89.0],
	ny: [42.9, -75.5],
	ca: [36.8, -119.4],
	tx: [31.0, -99.0],
	wa: [47.4, -120.5],
	fl: [28.0, -81.7],
};

function normalize(s: string | null | undefined): string {
	return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

function coordsFor(site: SiteResponse): [number, number] | null {
	const key = `${normalize(site.city)},${normalize(site.state)}`;
	return CITY_COORDS[key] ?? STATE_COORDS[normalize(site.state)] ?? null;
}

const PAGE = { Page: 1, PageSize: 100 };

/**
 * Singleton ViewModel for LocationPanel (geo map) and the interior map.
 * Sites and equipment come from the API; each site's status is derived from its
 * unresolved alerts (critical → alert, warning → warning).
 */
class LocationPanelViewModel {
	#sitesQuery = getAllSitesV1ObservedQuery();
	#equipmentQuery = getAllEquipmentV1ObservedQuery();
	#loaded = false;

	constructor() {
		makeAutoObservable(this);
	}

	load = () => {
		if (this.#loaded) return;
		this.#loaded = true;
		this.#sitesQuery.load({ query: PAGE });
		this.#equipmentQuery.load({ query: PAGE });
		alertsViewModel.load();
	};

	get sites(): SiteResponse[] {
		const data = this.#sitesQuery.data as { items?: SiteResponse[] | null } | undefined;
		return data?.items ?? [];
	}

	get equipment(): EquipmentResponse[] {
		const data = this.#equipmentQuery.data as { items?: EquipmentResponse[] | null } | undefined;
		return data?.items ?? [];
	}

	get isLoading(): boolean {
		return this.#sitesQuery.isLoading;
	}

	/** Worst unresolved alert severity per site id. */
	get statusBySite(): Record<string, SiteStatus> {
		const out: Record<string, SiteStatus> = {};
		for (const a of alertsViewModel.unresolvedAlerts) {
			if (!a.siteId) continue;
			const s: SiteStatus = a.severity === "critical" ? "alert" : "warning";
			if (out[a.siteId] !== "alert") out[a.siteId] = s;
		}
		return out;
	}

	get locations(): DashboardMapLocation[] {
		const statuses = this.statusBySite;
		const out: DashboardMapLocation[] = [];
		for (const site of this.sites) {
			const c = coordsFor(site);
			if (!c || !site.id) continue;
			out.push({
				id: site.id,
				name: site.name ?? "",
				city: [site.city, site.state].filter(Boolean).join(", "),
				lat: c[0],
				lng: c[1],
				status: statuses[site.id] ?? "ok",
			});
		}
		return out;
	}
}

export const locationPanelViewModel = new LocationPanelViewModel();

export function useLocationPanelViewModel() {
	locationPanelViewModel.load();
	return locationPanelViewModel;
}
