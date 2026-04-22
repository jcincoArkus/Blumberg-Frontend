import {
	IngestionSource as ApiIngestionSource,
	type GetSensorHealthListV1Data,
	getAllEquipmentV1ObservedQuery,
	getAllSitesV1ObservedQuery,
	getIngestionStatsV1ObservedQuery,
	getSensorHealthByIdV1ObservedQuery,
	getSensorHealthListV1ObservedQuery,
	getSensorRejectionCount,
	type SensorHealthDetailResponse,
	SensorHealthStatus,
	type SensorRejectionCountResponse,
} from "~@/api";
import { makeAutoObservable, reaction, runInAction } from "~@/mobx";
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

/** Map API ingestion source enum to label (0=Api, 1=Csv, 2=Simulated → api). UI shows only api/csv. */
const ingestionSourceLabel: Record<ApiIngestionSource, "api" | "csv"> = {
	[ApiIngestionSource._0]: "api",
	[ApiIngestionSource._1]: "csv",
	[ApiIngestionSource._2]: "api",
};

// Constants matching backend SensorService (global expected interval 300s; Stale > 2×, Offline > 5×)
const EXPECTED_INTERVAL_SECONDS = 300;
const WARNING_STALE_SECONDS = 2 * EXPECTED_INTERVAL_SECONDS; // 600s = 10 min
const CRITICAL_STALE_SECONDS = 5 * EXPECTED_INTERVAL_SECONDS; // 1500s = 25 min

/** Last 24h window for per-sensor ingestion error count */
const REJECTION_COUNT_FROM_HOURS = 24;

class MonitoringSensorHealthViewModel {
	timeWindow: QualityWindow = "24h";
	/** Sensor ID for which we last loaded rejection count (one-off API); value in rejectionCountValue */
	rejectionCountSensorId: string | null = null;
	rejectionCountValue: number | null = null;

	searchQuery = "";
	healthFilter = "all";
	// qualityFilter = "all";
	ingestionFilter = "all";
	typeFilter = "all";
	siteFilter = "all";
	equipmentFilter = "all";

	#healthQuery = getSensorHealthListV1ObservedQuery();
	#detailQuery = getSensorHealthByIdV1ObservedQuery();
	#sitesQuery = getAllSitesV1ObservedQuery();
	#equipmentQuery = getAllEquipmentV1ObservedQuery();
	#stats24hQuery = getIngestionStatsV1ObservedQuery();
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
		this.#loadIngestionStats24h();
	}

	#loadIngestionStats24h() {
		const from = new Date(Date.now() - REJECTION_COUNT_FROM_HOURS * 60 * 60 * 1000).toISOString();
		const to = new Date().toISOString();
		this.#stats24hQuery.load({
			query: { From: from as unknown as Date, To: to as unknown as Date },
		});
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
		this.#loadIngestionStats24h();
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
					lastReportedAt: item.lastSeenAt?.toISOString(),
					expectedIntervalSeconds: EXPECTED_INTERVAL_SECONDS,
					warningThresholdSeconds: WARNING_STALE_SECONDS,
					criticalThresholdSeconds: CRITICAL_STALE_SECONDS,
					healthStatus: status,
					reliabilityScore: item.reliabilityScore ?? 0,
				},
				quality: undefined,
				ingestionErrors: [],
				ingestionStatus: "ok" as const,
				ingestionSource:
					item.ingestionSource != null ? ingestionSourceLabel[item.ingestionSource] : undefined,
				issueSummary:
					status === "offline" || status === "silent"
						? "Sensor not reporting"
						: status === "stale"
							? "Late / delayed"
							: status === "critical"
								? "Low reliability"
								: status === "warning"
									? "Reduced reliability"
									: "No issues",
			};
		});
	}

	get filteredData(): SensorHealthData[] {
		return this.sensorHealthData.filter((data) => {
			// Health and search filters are server-side; remaining filters are client-side
			// if (this.qualityFilter !== "all") {
			// 	if (!data.quality || data.quality.qualityStatus !== this.qualityFilter) return false;
			// }
			if (this.ingestionFilter !== "all" && data.ingestionSource !== this.ingestionFilter)
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
				offline: 5,
				silent: 4,
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
				const aTime = a.health.lastReportedAt ? new Date(a.health.lastReportedAt).getTime() : 0;
				const bTime = b.health.lastReportedAt ? new Date(b.health.lastReportedAt).getTime() : 0;
				return bTime - aTime;
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
			(d) =>
				d.health?.healthStatus === "offline" ||
				d.health?.healthStatus === "silent" ||
				d.health?.healthStatus === "critical",
		).length;

		const ingestionErrors =
			(this.#stats24hQuery.data as { rejectedRecords?: number } | undefined)?.rejectedRecords ?? 0;

		return {
			total,
			healthy,
			stale,
			silent: offline,
			ingestionErrors,
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

	// setQualityFilter = (value: string) => {
	// 	this.qualityFilter = value;
	// };

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

	/** Load detail and rejection count for a sensor (e.g. when opening the details drawer). Call from page when user selects a row. */
	loadDetailFor = (sensorId: string) => {
		this.rejectionCountSensorId = sensorId;
		this.rejectionCountValue = null;
		this.#detailQuery.load({ path: { id: sensorId } });
		this.#loadRejectionCount(sensorId);
	};

	#loadRejectionCount(sensorId: string) {
		const to = new Date();
		const from = new Date(to.getTime() - REJECTION_COUNT_FROM_HOURS * 60 * 60 * 1000);
		getSensorRejectionCount(sensorId, { from, to })
			.then((r: SensorRejectionCountResponse) => {
				runInAction(() => {
					this.rejectionCountSensorId = sensorId;
					this.rejectionCountValue = r.count;
				});
			})
			.catch(() => {
				runInAction(() => {
					this.rejectionCountSensorId = sensorId;
					this.rejectionCountValue = 0;
				});
			});
	}

	/** Returns detail response if it was loaded for the given sensorId (for use with local drawer state). */
	getDetailFor(sensorId: string | null): SensorHealthDetailResponse | undefined {
		const data = this.#detailQuery.data;
		if (!data || !sensorId || data.sensorId !== sensorId) return undefined;
		return data;
	}

	/** Returns rejection count if it was loaded for the given sensorId (null = loading or not loaded for this sensor). */
	getRejectionCountFor(sensorId: string | null): number | null {
		if (!sensorId || this.rejectionCountSensorId !== sensorId) return null;
		return this.rejectionCountValue;
	}

	get isDetailLoading(): boolean {
		return this.#detailQuery.isLoading;
	}

	dispose() {
		this.#filterDisposer?.();
		this.#healthQuery.dispose();
		this.#detailQuery.dispose();
		this.#sitesQuery.dispose();
		this.#equipmentQuery.dispose();
		this.#stats24hQuery.dispose();
	}
}

export const monitoringSensorHealthViewModel = new MonitoringSensorHealthViewModel();

export function useMonitoringSensorHealthViewModel() {
	return monitoringSensorHealthViewModel;
}
