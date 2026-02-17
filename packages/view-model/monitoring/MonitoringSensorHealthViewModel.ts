import {
	type GetSensorHealthListV1Data,
	getAllEquipmentV1ObservedQuery,
	getAllSitesV1ObservedQuery,
	getSensorHealthListV1ObservedQuery,
	SensorHealthStatus,
} from "~@/api";
import { makeAutoObservable, reaction } from "~@/mobx";
import type {
	MonitoringEquipment as Equipment,
	HealthStatus,
	QualityWindow,
	SensorHealthData,
	MonitoringSite as Site,
} from "~@/views";

/** Map numeric enum to display-friendly health status strings. */
const healthStatusLabel: Record<SensorHealthStatus, HealthStatus> = {
	[SensorHealthStatus._0]: "healthy",
	[SensorHealthStatus._1]: "warning",
	[SensorHealthStatus._2]: "critical",
	[SensorHealthStatus._3]: "stale",
	[SensorHealthStatus._4]: "offline",
};

/** Reverse lookup: display string to enum value. */
const healthStatusFromLabel: Record<string, SensorHealthStatus> = {
	healthy: SensorHealthStatus._0,
	warning: SensorHealthStatus._1,
	critical: SensorHealthStatus._2,
	stale: SensorHealthStatus._3,
	offline: SensorHealthStatus._4,
};

// Constants matching backend SensorService
const WARNING_STALE_SECONDS = 600;
const CRITICAL_STALE_SECONDS = 1800;
const EXPECTED_INTERVAL_SECONDS = 300;

export class MonitoringSensorHealthViewModel {
	selectedSensor: SensorHealthData | null = null;
	isDetailsOpen = false;
	timeWindow: QualityWindow = "24h";

	searchQuery = "";
	healthFilter = "all";
	qualityFilter = "all";
	ingestionFilter = "all";
	typeFilter = "all";
	siteFilter = "all";
	equipmentFilter = "all";

	#healthQuery = getSensorHealthListV1ObservedQuery();
	#sitesQuery = getAllSitesV1ObservedQuery();
	#equipmentQuery = getAllEquipmentV1ObservedQuery();
	#filterDisposer: (() => void) | null = null;

	constructor() {
		makeAutoObservable(this);
		this.#loadInitialData();

		// Re-fetch when server-side filters change
		this.#filterDisposer = reaction(
			() => ({
				health: this.healthFilter,
				site: this.siteFilter,
				search: this.searchQuery,
			}),
			() => this.#loadHealthList(),
			{ delay: 300 },
		);
	}

	#loadInitialData() {
		this.#sitesQuery.load({ query: { Page: 1, PageSize: 200 } });
		this.#equipmentQuery.load({ query: { Page: 1, PageSize: 500 } });
		this.#loadHealthList();
	}

	#loadHealthList() {
		const query: GetSensorHealthListV1Data["query"] = {
			Page: 1,
			PageSize: 200,
		};

		if (this.siteFilter !== "all") {
			query.SiteId = this.siteFilter;
		}

		const enumVal = healthStatusFromLabel[this.healthFilter];
		if (enumVal !== undefined) {
			query.HealthStatus = enumVal;
		}

		if (this.searchQuery.trim()) {
			query.Search = this.searchQuery.trim();
		}

		this.#healthQuery.load({ query });
	}

	get isLoading(): boolean {
		return this.#healthQuery.isLoading;
	}

	get hasError(): boolean {
		return this.#healthQuery.hasError;
	}

	get sensorHealthData(): SensorHealthData[] {
		const items = this.#healthQuery.data?.items ?? [];

		return items.map((item) => {
			const status = healthStatusLabel[item.healthStatus ?? SensorHealthStatus._0];

			return {
				sensor: {
					id: item.id ?? "",
					name: item.name ?? "",
					type: (item.sensorType ?? "").toLowerCase(),
					siteId: item.siteId ?? "",
					siteName: item.siteName ?? undefined,
					equipmentId: item.equipmentId ?? "",
					equipmentName: item.equipmentName ?? undefined,
				},
				health: {
					lastReportedAt: item.lastSeenAt
						? item.lastSeenAt.toISOString()
						: new Date().toISOString(),
					expectedIntervalSeconds: EXPECTED_INTERVAL_SECONDS,
					warningThresholdSeconds: WARNING_STALE_SECONDS,
					criticalThresholdSeconds: CRITICAL_STALE_SECONDS,
					healthStatus: status,
					reliabilityScore: item.reliabilityScore ?? 0,
				},
				quality: undefined,
				ingestionErrors: [],
				ingestionStatus: "ok" as const,
				issueSummary:
					status === "offline" || status === "critical"
						? "Sensor not reporting"
						: status === "stale"
							? "Late / delayed"
							: "No issues",
			};
		});
	}

	get filteredData(): SensorHealthData[] {
		return this.sensorHealthData.filter((data) => {
			// Health and search filters are server-side; remaining filters are client-side
			if (this.qualityFilter !== "all") {
				if (!data.quality || data.quality.qualityStatus !== this.qualityFilter) return false;
			}
			if (this.ingestionFilter !== "all" && data.ingestionStatus !== this.ingestionFilter)
				return false;
			if (this.typeFilter !== "all" && data.sensor.type !== this.typeFilter) return false;
			if (this.equipmentFilter !== "all") {
				if (this.equipmentFilter === "unassigned" && data.sensor.equipmentId) return false;
				if (
					this.equipmentFilter !== "unassigned" &&
					data.sensor.equipmentId !== this.equipmentFilter
				)
					return false;
			}
			return true;
		});
	}

	get sortedData(): SensorHealthData[] {
		return [...this.filteredData].sort((a, b) => {
			const healthPriority: Record<string, number> = {
				offline: 4,
				critical: 3,
				stale: 2,
				warning: 1,
				healthy: 0,
			};
			const aHealthPriority = a.health ? (healthPriority[a.health.healthStatus] ?? 0) : 0;
			const bHealthPriority = b.health ? (healthPriority[b.health.healthStatus] ?? 0) : 0;

			if (aHealthPriority !== bHealthPriority) {
				return bHealthPriority - aHealthPriority;
			}

			if (a.health && b.health) {
				return (
					new Date(b.health.lastReportedAt).getTime() - new Date(a.health.lastReportedAt).getTime()
				);
			}

			return 0;
		});
	}

	get kpis() {
		const data = this.sensorHealthData;
		const total = this.#healthQuery.data?.totalCount ?? data.length;
		const healthy = data.filter((d) => d.health?.healthStatus === "healthy").length;
		const stale = data.filter((d) => d.health?.healthStatus === "stale").length;
		const offline = data.filter(
			(d) => d.health?.healthStatus === "offline" || d.health?.healthStatus === "critical",
		).length;

		return {
			total,
			healthy,
			stale,
			silent: offline,
			ingestionErrors: 0,
			qualityIssues: 0,
		};
	}

	get monitoringSites(): Site[] {
		const items = this.#sitesQuery.data?.items ?? [];
		return items.map((site) => ({
			id: site.id ?? "",
			name: site.name ?? "",
			location: [site.city, site.state].filter(Boolean).join(", ") || undefined,
		}));
	}

	get monitoringEquipment(): Equipment[] {
		const items = this.#equipmentQuery.data?.items ?? [];
		return items.map((eq) => ({
			id: eq.id ?? "",
			siteId: eq.siteId ?? "",
			name: eq.name ?? "",
			type: eq.equipmentType ?? undefined,
		}));
	}

	setSearchQuery = (value: string) => {
		this.searchQuery = value;
	};

	setHealthFilter = (value: string) => {
		this.healthFilter = value;
	};

	setQualityFilter = (value: string) => {
		this.qualityFilter = value;
	};

	setIngestionFilter = (value: string) => {
		this.ingestionFilter = value;
	};

	setTypeFilter = (value: string) => {
		this.typeFilter = value;
	};

	setSiteFilter = (value: string) => {
		this.siteFilter = value;
	};

	setEquipmentFilter = (value: string) => {
		this.equipmentFilter = value;
	};

	setTimeWindow = (value: QualityWindow) => {
		this.timeWindow = value;
	};

	viewDetails = (data: SensorHealthData) => {
		this.selectedSensor = data;
		this.isDetailsOpen = true;
	};

	setDetailsOpen = (open: boolean) => {
		this.isDetailsOpen = open;
	};

	dispose() {
		this.#filterDisposer?.();
		this.#healthQuery.dispose();
		this.#sitesQuery.dispose();
		this.#equipmentQuery.dispose();
	}
}

export const monitoringSensorHealthViewModel = new MonitoringSensorHealthViewModel();

export function useMonitoringSensorHealthViewModel() {
	return monitoringSensorHealthViewModel;
}
