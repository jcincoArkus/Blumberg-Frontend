import { makeAutoObservable } from "~@/mobx";
import {
	equipment,
	getAllIngestionErrorsLast24h,
	getDataQualityRecord,
	getIngestionErrorsForSensor,
	getSensorHealthRecord,
	sensorHealthRecords,
	sensors,
	sites,
} from "~@/mock-data";
import type { Equipment, QualityWindow, SensorHealthData, Site } from "~@/views";

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

	constructor() {
		makeAutoObservable(this);
	}

	get sensorHealthData(): SensorHealthData[] {
		const sensorIds = sensorHealthRecords.map((record) => record.sensorId);
		const relevantSensors = sensors.filter((sensor) => sensorIds.includes(sensor.id));

		return relevantSensors.map((sensor) => {
			const health = getSensorHealthRecord(sensor.id);
			const quality = getDataQualityRecord(sensor.id, this.timeWindow);
			const errors = getIngestionErrorsForSensor(sensor.id, true);

			let ingestionStatus: "ok" | "api_error" | "csv_error" = "ok";
			if (errors.length > 0) {
				const hasApiError = errors.some((error) => error.source === "api");
				const hasCsvError = errors.some((error) => error.source === "csv");
				if (hasApiError) {
					ingestionStatus = "api_error";
				} else if (hasCsvError) {
					ingestionStatus = "csv_error";
				}
			}

			const issues: string[] = [];
			if (quality?.missingPoints && quality.missingPoints > 0) {
				issues.push(`${quality.missingPoints} missing points`);
			}
			if (quality?.inconsistentPoints && quality.inconsistentPoints > 0) {
				issues.push(`${quality.inconsistentPoints} inconsistent`);
			}
			if (errors.length > 0) {
				issues.push(`${errors.length} ingestion error${errors.length > 1 ? "s" : ""}`);
			}
			if (quality?.notes) {
				issues.push(quality.notes);
			}
			const issueSummary = issues.length > 0 ? issues.join(", ") : "No issues";

			const site = sites.find((entry) => entry.id === sensor.siteId);
			const eq = equipment.find((entry) => entry.id === sensor.equipmentId);

			return {
				sensor: {
					id: sensor.id,
					name: sensor.name,
					type: sensor.type,
					siteId: sensor.siteId,
					siteName: site?.name,
					equipmentId: sensor.equipmentId,
					equipmentName: eq?.name,
				},
				health: health
					? {
							lastReportedAt: health.lastReportedAt,
							expectedIntervalSeconds: health.expectedIntervalSeconds,
							warningThresholdSeconds: health.warningThresholdSeconds,
							criticalThresholdSeconds: health.criticalThresholdSeconds,
							healthStatus: health.healthStatus,
						}
					: undefined,
				quality: quality
					? {
							window: quality.window,
							expectedPoints: quality.expectedPoints,
							receivedPoints: quality.receivedPoints,
							missingPoints: quality.missingPoints,
							inconsistentPoints: quality.inconsistentPoints,
							completenessPct: quality.completenessPct,
							consistencyPct: quality.consistencyPct,
							freshnessPct: quality.freshnessPct,
							qualityStatus: quality.qualityStatus,
							notes: quality.notes,
						}
					: undefined,
				ingestionErrors: errors.map((error) => ({
					id: error.id,
					timestamp: error.timestamp,
					source: error.source,
					errorCode: error.errorCode,
					message: error.message,
					severity: error.severity,
				})),
				ingestionStatus,
				issueSummary,
			};
		});
	}

	get filteredData(): SensorHealthData[] {
		return this.sensorHealthData.filter((data) => {
			if (this.searchQuery) {
				const query = this.searchQuery.toLowerCase();
				const matchesSearch =
					data.sensor.id.toLowerCase().includes(query) ||
					data.sensor.name.toLowerCase().includes(query) ||
					data.sensor.siteName?.toLowerCase().includes(query) ||
					data.sensor.equipmentName?.toLowerCase().includes(query) ||
					data.sensor.type.toLowerCase().includes(query);
				if (!matchesSearch) return false;
			}
			if (this.healthFilter !== "all") {
				if (!data.health || data.health.healthStatus !== this.healthFilter) return false;
			}
			if (this.qualityFilter !== "all") {
				if (!data.quality || data.quality.qualityStatus !== this.qualityFilter) return false;
			}
			if (this.ingestionFilter !== "all" && data.ingestionStatus !== this.ingestionFilter)
				return false;
			if (this.typeFilter !== "all" && data.sensor.type !== this.typeFilter) return false;
			if (this.siteFilter !== "all" && data.sensor.siteId !== this.siteFilter) return false;
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
			const healthPriority = { silent: 3, stale: 2, healthy: 1 };
			const aHealthPriority = a.health ? healthPriority[a.health.healthStatus] : 0;
			const bHealthPriority = b.health ? healthPriority[b.health.healthStatus] : 0;

			if (aHealthPriority !== bHealthPriority) {
				return bHealthPriority - aHealthPriority;
			}

			const aQualityIssues =
				a.quality?.qualityStatus === "inconsistent"
					? 2
					: a.quality?.qualityStatus === "missing"
						? 1
						: 0;
			const bQualityIssues =
				b.quality?.qualityStatus === "inconsistent"
					? 2
					: b.quality?.qualityStatus === "missing"
						? 1
						: 0;

			if (aQualityIssues !== bQualityIssues) {
				return bQualityIssues - aQualityIssues;
			}

			if (a.ingestionErrors.length !== b.ingestionErrors.length) {
				return b.ingestionErrors.length - a.ingestionErrors.length;
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
		const total = this.sensorHealthData.length;
		const healthy = this.sensorHealthData.filter(
			(data) => data.health?.healthStatus === "healthy",
		).length;
		const stale = this.sensorHealthData.filter(
			(data) => data.health?.healthStatus === "stale",
		).length;
		const silent = this.sensorHealthData.filter(
			(data) => data.health?.healthStatus === "silent",
		).length;
		const last24hErrors = getAllIngestionErrorsLast24h();
		const qualityIssues = this.sensorHealthData.filter(
			(data) =>
				data.quality &&
				(data.quality.qualityStatus === "missing" || data.quality.qualityStatus === "inconsistent"),
		).length;

		return {
			total,
			healthy,
			stale,
			silent,
			ingestionErrors: last24hErrors.length,
			qualityIssues,
		};
	}

	get monitoringSites(): Site[] {
		return sites.map((site) => ({ id: site.id, name: site.name, location: site.location }));
	}

	get monitoringEquipment(): Equipment[] {
		return equipment.map((entry) => ({
			id: entry.id,
			siteId: entry.siteId,
			name: entry.name,
			type: entry.type,
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
		// No subscriptions to clean up.
	}
}
