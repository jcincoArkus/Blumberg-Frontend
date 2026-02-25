import {
	type GetSensorHealthListV1Data,
	getAllSitesV1ObservedQuery,
	getSensorHealthListV1ObservedQuery,
	SensorHealthStatus,
} from "~@/api";
import { makeAutoObservable, reaction } from "~@/mobx";

/** Map numeric enum to display-friendly status strings. */
export const healthStatusLabel: Record<SensorHealthStatus, string> = {
	[SensorHealthStatus._0]: "healthy",
	[SensorHealthStatus._1]: "warning",
	[SensorHealthStatus._2]: "critical",
	[SensorHealthStatus._3]: "stale",
	[SensorHealthStatus._4]: "silent",
	[SensorHealthStatus._5]: "offline",
};

/** Reverse lookup: display string to enum value. */
const healthStatusFromLabel: Record<string, SensorHealthStatus> = {
	healthy: SensorHealthStatus._0,
	warning: SensorHealthStatus._1,
	critical: SensorHealthStatus._2,
	stale: SensorHealthStatus._3,
	silent: SensorHealthStatus._4,
	offline: SensorHealthStatus._5,
};

const PAGE_SIZE = 50;

class SensorHealthViewModel {
	statusFilter = "all";
	siteFilter = "all";
	typeFilter = "all";

	#healthQuery = getSensorHealthListV1ObservedQuery();
	#sitesQuery = getAllSitesV1ObservedQuery();
	#filterDisposer: (() => void) | null = null;

	constructor() {
		makeAutoObservable(this);
		this.#loadSites();
		this.#loadHealthList();

		// Re-fetch when server-side filters change
		this.#filterDisposer = reaction(
			() => ({ status: this.statusFilter, site: this.siteFilter }),
			() => this.#loadHealthList(),
		);
	}

	#loadSites() {
		this.#sitesQuery.load({ query: { Page: 1, PageSize: 200 } });
	}

	#loadHealthList() {
		const query: GetSensorHealthListV1Data["query"] = {
			Page: 1,
			PageSize: PAGE_SIZE,
		};

		if (this.siteFilter !== "all") {
			query.SiteId = this.siteFilter;
		}

		const enumVal = healthStatusFromLabel[this.statusFilter];
		if (enumVal !== undefined) {
			query.HealthStatus = enumVal;
		}

		this.#healthQuery.load({ query });
	}

	get isLoading(): boolean {
		return this.#healthQuery.isLoading;
	}

	get hasError(): boolean {
		return this.#healthQuery.hasError;
	}

	get error(): Error | null {
		return this.#healthQuery.error ?? null;
	}

	get enrichedSensors() {
		const items = this.#healthQuery.data?.items ?? [];
		return items.map((item) => ({
			id: item.id ?? "",
			name: item.name ?? "",
			type: (item.sensorType ?? "").toLowerCase(),
			status: healthStatusLabel[item.healthStatus ?? SensorHealthStatus._0] as string,
			equipmentId: item.equipmentId ?? "",
			equipmentName: item.equipmentName ?? "Unknown",
			siteId: item.siteId ?? "",
			siteName: item.siteName ?? "Unknown",
			value: item.lastValue ?? 0,
			unit: item.unit ?? "",
			lastSeen: item.lastSeenAt ? item.lastSeenAt.toISOString() : new Date().toISOString(),
			reliabilityScore: item.reliabilityScore ?? 0,
		}));
	}

	get filteredSensors() {
		// Status and site filters are server-side; only type filter is client-side
		return this.enrichedSensors.filter((sensor) => {
			if (this.typeFilter !== "all" && sensor.type !== this.typeFilter) return false;
			return true;
		});
	}

	get stats() {
		const sensors = this.enrichedSensors;
		const total = this.#healthQuery.data?.totalCount ?? sensors.length;
		const healthy = sensors.filter((s) => s.status === "healthy").length;
		const offline = sensors.filter((s) => s.status === "offline" || s.status === "stale").length;
		const warning = sensors.filter((s) => s.status === "warning").length;
		const critical = sensors.filter((s) => s.status === "critical").length;

		return {
			total,
			active: healthy,
			offline,
			warning,
			error: critical,
			activePercent: total > 0 ? Math.round((healthy / total) * 100) : 0,
		};
	}

	get sensorTypes() {
		return [...new Set(this.enrichedSensors.map((sensor) => sensor.type).filter(Boolean))];
	}

	setStatusFilter = (value: string) => {
		this.statusFilter = value;
	};

	setSiteFilter = (value: string) => {
		this.siteFilter = value;
	};

	setTypeFilter = (value: string) => {
		this.typeFilter = value;
	};

	get sites() {
		const items = this.#sitesQuery.data?.items ?? [];
		return items.map((site) => ({ id: site.id ?? "", name: site.name ?? "" }));
	}

	dispose() {
		this.#filterDisposer?.();
		this.#healthQuery.dispose();
		this.#sitesQuery.dispose();
	}
}

export const sensorHealthViewModel = new SensorHealthViewModel();

export function useSensorHealthViewModel() {
	return sensorHealthViewModel;
}
