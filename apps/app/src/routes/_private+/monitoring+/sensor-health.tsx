import { useMemo, useState } from "react";

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
import {
	DashboardPanel,
	MonitoringSensorHealthTable,
	type QualityWindow,
	type SensorHealthData,
	SensorHealthDetailsDrawer,
	SensorHealthKPIs,
} from "~@/views";

export default function SensorHealthPage() {
	const [selectedSensor, setSelectedSensor] = useState<SensorHealthData | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [timeWindow, setTimeWindow] = useState<QualityWindow>("24h");

	// Search and filter state
	const [searchQuery, setSearchQuery] = useState("");
	const [healthFilter, setHealthFilter] = useState<string>("all");
	const [qualityFilter, setQualityFilter] = useState<string>("all");
	const [ingestionFilter, setIngestionFilter] = useState<string>("all");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [siteFilter, setSiteFilter] = useState<string>("all");
	const [equipmentFilter, setEquipmentFilter] = useState<string>("all");

	// Build sensor health data from sensors and health records
	const sensorHealthData = useMemo(() => {
		// Get sensors that have health records
		const sensorIds = sensorHealthRecords.map((r) => r.sensorId);
		const relevantSensors = sensors.filter((s) => sensorIds.includes(s.id));

		return relevantSensors.map((sensor) => {
			const health = getSensorHealthRecord(sensor.id);
			const quality = getDataQualityRecord(sensor.id, timeWindow);
			const errors = getIngestionErrorsForSensor(sensor.id, true);

			// Determine ingestion status
			let ingestionStatus: "ok" | "api_error" | "csv_error" = "ok";
			if (errors.length > 0) {
				const hasApiError = errors.some((e) => e.source === "api");
				const hasCsvError = errors.some((e) => e.source === "csv");
				if (hasApiError) {
					ingestionStatus = "api_error";
				} else if (hasCsvError) {
					ingestionStatus = "csv_error";
				}
			}

			// Build issue summary
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

			// Get site and equipment names
			const site = sites.find((s) => s.id === sensor.siteId);
			const eq = equipment.find((e) => e.id === sensor.equipmentId);

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
				ingestionErrors: errors.map((e) => ({
					id: e.id,
					timestamp: e.timestamp,
					source: e.source,
					errorCode: e.errorCode,
					message: e.message,
					severity: e.severity,
				})),
				ingestionStatus,
				issueSummary,
			};
		});
	}, [timeWindow]);

	// Filtered data
	const filteredData = useMemo(() => {
		return sensorHealthData.filter((data) => {
			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesSearch =
					data.sensor.id.toLowerCase().includes(query) ||
					data.sensor.name.toLowerCase().includes(query) ||
					data.sensor.siteName?.toLowerCase().includes(query) ||
					data.sensor.equipmentName?.toLowerCase().includes(query) ||
					data.sensor.type.toLowerCase().includes(query);
				if (!matchesSearch) return false;
			}
			// Health filter
			if (healthFilter !== "all") {
				if (!data.health || data.health.healthStatus !== healthFilter) return false;
			}
			// Quality filter
			if (qualityFilter !== "all") {
				if (!data.quality || data.quality.qualityStatus !== qualityFilter) return false;
			}
			// Ingestion filter
			if (ingestionFilter !== "all" && data.ingestionStatus !== ingestionFilter) return false;
			// Type filter
			if (typeFilter !== "all" && data.sensor.type !== typeFilter) return false;
			// Site filter
			if (siteFilter !== "all" && data.sensor.siteId !== siteFilter) return false;
			// Equipment filter
			if (equipmentFilter !== "all") {
				if (equipmentFilter === "unassigned" && data.sensor.equipmentId) return false;
				if (equipmentFilter !== "unassigned" && data.sensor.equipmentId !== equipmentFilter)
					return false;
			}
			return true;
		});
	}, [
		sensorHealthData,
		searchQuery,
		healthFilter,
		qualityFilter,
		ingestionFilter,
		typeFilter,
		siteFilter,
		equipmentFilter,
	]);

	// Sort by criticality (Silent > Stale > Quality/Ingestion issues > Healthy)
	const sortedData = useMemo(() => {
		return [...filteredData].sort((a, b) => {
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
	}, [filteredData]);

	// KPI calculations
	const kpis = useMemo(() => {
		const total = sensorHealthData.length;
		const healthy = sensorHealthData.filter((d) => d.health?.healthStatus === "healthy").length;
		const stale = sensorHealthData.filter((d) => d.health?.healthStatus === "stale").length;
		const silent = sensorHealthData.filter((d) => d.health?.healthStatus === "silent").length;
		const last24hErrors = getAllIngestionErrorsLast24h();
		const qualityIssues = sensorHealthData.filter(
			(d) =>
				d.quality &&
				(d.quality.qualityStatus === "missing" || d.quality.qualityStatus === "inconsistent"),
		).length;

		return {
			total,
			healthy,
			stale,
			silent,
			ingestionErrors: last24hErrors.length,
			qualityIssues,
		};
	}, [sensorHealthData]);

	const handleViewDetails = (data: SensorHealthData) => {
		setSelectedSensor(data);
		setIsDetailsOpen(true);
	};

	// Map data to monitoring types
	const monitoringSites = sites.map((s) => ({ id: s.id, name: s.name, location: s.location }));
	const monitoringEquipment = equipment.map((e) => ({
		id: e.id,
		siteId: e.siteId,
		name: e.name,
		type: e.type,
	}));

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-xl font-semibold text-foreground">Sensor Health & Data Quality</h1>
				<p className="text-sm text-muted-foreground">
					Monitor sensor health, data quality, and ingestion status. Identify technical issues
					affecting data reliability.
				</p>
			</div>

			{/* KPI Summary Cards */}
			<SensorHealthKPIs kpis={kpis} />

			{/* Sensor Health Table */}
			<DashboardPanel
				title="Sensor Health & Quality Work Table"
				description="Search and filter sensors by health status, data quality, ingestion source, site, equipment, or type"
			>
				<MonitoringSensorHealthTable
					data={sortedData}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					healthFilter={healthFilter}
					onHealthFilterChange={setHealthFilter}
					qualityFilter={qualityFilter}
					onQualityFilterChange={setQualityFilter}
					ingestionFilter={ingestionFilter}
					onIngestionFilterChange={setIngestionFilter}
					typeFilter={typeFilter}
					onTypeFilterChange={setTypeFilter}
					siteFilter={siteFilter}
					onSiteFilterChange={setSiteFilter}
					equipmentFilter={equipmentFilter}
					onEquipmentFilterChange={setEquipmentFilter}
					timeWindow={timeWindow}
					onTimeWindowChange={setTimeWindow}
					sites={monitoringSites}
					equipment={monitoringEquipment}
					onViewDetails={handleViewDetails}
				/>
			</DashboardPanel>

			{/* Sensor Details Drawer */}
			{selectedSensor && (
				<SensorHealthDetailsDrawer
					data={selectedSensor}
					open={isDetailsOpen}
					onOpenChange={setIsDetailsOpen}
					timeWindow={timeWindow}
					onTimeWindowChange={setTimeWindow}
				/>
			)}
		</div>
	);
}
