import { useMemo, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";
import {
	AlertsHistoryTab,
	DashboardShell,
	type DateRangePreset,
	type HistoricalAlert,
	HistoricalFilters,
	type HistoricalReading,
	ReadingsHistoryTab,
} from "~@/views";

import {
	type AlertSeverity,
	getHistoricalAlerts,
	getHistoricalReadings,
	type SensorType,
} from "../../../mock-data/reports";
import { equipment, sites } from "../../../mock-data/sites";

export default function HistoricalReportsPage() {
	const [activeTab, setActiveTab] = useState("readings");
	const [datePreset, setDatePreset] = useState<DateRangePreset>("7d");
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [siteFilter, setSiteFilter] = useState<string>("all");
	const [equipmentFilter, setEquipmentFilter] = useState<string>("all");
	const [sensorTypeFilter, setSensorTypeFilter] = useState<string>("all");
	const [severityFilter, setSeverityFilter] = useState<string>("all");
	const [comparePrevious, setComparePrevious] = useState(false);

	// Calculate date range based on preset
	const dateRange = useMemo(() => {
		const end = endDate || new Date();
		let start: Date;

		if (datePreset === "24h") {
			start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
		} else if (datePreset === "7d") {
			start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
		} else if (datePreset === "30d") {
			start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
		} else {
			start = startDate || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
		}

		return { start, end };
	}, [datePreset, startDate, endDate]);

	// Calculate previous period for comparison
	const previousPeriod = useMemo(() => {
		if (!comparePrevious) return null;

		const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
		return {
			start: new Date(dateRange.start.getTime() - periodLength),
			end: dateRange.start,
		};
	}, [comparePrevious, dateRange]);

	// Get filtered readings
	const readings = useMemo((): HistoricalReading[] => {
		return getHistoricalReadings({
			startDate: dateRange.start,
			endDate: dateRange.end,
			siteId: siteFilter !== "all" ? siteFilter : undefined,
			equipmentId: equipmentFilter !== "all" ? equipmentFilter : undefined,
			sensorType: sensorTypeFilter !== "all" ? (sensorTypeFilter as SensorType) : undefined,
		});
	}, [dateRange, siteFilter, equipmentFilter, sensorTypeFilter]);

	// Get previous period readings for comparison
	const previousReadings = useMemo((): HistoricalReading[] => {
		if (!previousPeriod) return [];
		return getHistoricalReadings({
			startDate: previousPeriod.start,
			endDate: previousPeriod.end,
			siteId: siteFilter !== "all" ? siteFilter : undefined,
			equipmentId: equipmentFilter !== "all" ? equipmentFilter : undefined,
			sensorType: sensorTypeFilter !== "all" ? (sensorTypeFilter as SensorType) : undefined,
		});
	}, [previousPeriod, siteFilter, equipmentFilter, sensorTypeFilter]);

	// Get filtered alerts
	const alerts = useMemo((): HistoricalAlert[] => {
		return getHistoricalAlerts({
			startDate: dateRange.start,
			endDate: dateRange.end,
			equipmentId: equipmentFilter !== "all" ? equipmentFilter : undefined,
			severity: severityFilter !== "all" ? (severityFilter as AlertSeverity) : undefined,
		});
	}, [dateRange, equipmentFilter, severityFilter]);

	// Get previous period alerts for comparison
	const previousAlerts = useMemo((): HistoricalAlert[] => {
		if (!previousPeriod) return [];
		return getHistoricalAlerts({
			startDate: previousPeriod.start,
			endDate: previousPeriod.end,
			equipmentId: equipmentFilter !== "all" ? equipmentFilter : undefined,
			severity: severityFilter !== "all" ? (severityFilter as AlertSeverity) : undefined,
		});
	}, [previousPeriod, equipmentFilter, severityFilter]);

	return (
		<DashboardShell>
			<div className="space-y-6">
				{/* Page Header */}
				<div>
					<h1 className="text-xl font-semibold text-foreground">Historical Data & Reporting</h1>
					<p className="text-sm text-muted-foreground">
						Retrospective analysis of system behavior. Answer: "Has this happened before?" and "Is
						the situation getting better or worse over time?"
					</p>
				</div>

				{/* Global Filters */}
				<HistoricalFilters
					datePreset={datePreset}
					onDatePresetChange={setDatePreset}
					startDate={startDate}
					onStartDateChange={setStartDate}
					endDate={endDate}
					onEndDateChange={setEndDate}
					siteFilter={siteFilter}
					onSiteFilterChange={setSiteFilter}
					equipmentFilter={equipmentFilter}
					onEquipmentFilterChange={setEquipmentFilter}
					sensorTypeFilter={sensorTypeFilter}
					onSensorTypeFilterChange={setSensorTypeFilter}
					severityFilter={severityFilter}
					onSeverityFilterChange={setSeverityFilter}
					comparePrevious={comparePrevious}
					onComparePreviousChange={setComparePrevious}
					sites={sites}
					equipment={equipment}
				/>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="readings">Readings History</TabsTrigger>
						<TabsTrigger value="alerts">Alerts History</TabsTrigger>
					</TabsList>

					<TabsContent value="readings" className="space-y-6">
						<ReadingsHistoryTab
							readings={readings}
							previousReadings={previousReadings}
							comparePrevious={comparePrevious}
						/>
					</TabsContent>

					<TabsContent value="alerts" className="space-y-6">
						<AlertsHistoryTab
							alerts={alerts}
							previousAlerts={previousAlerts}
							comparePrevious={comparePrevious}
							equipment={equipment}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</DashboardShell>
	);
}
