import { makeAutoObservable } from "~@/mobx";
import {
	type ReportAlertSeverity as AlertSeverity,
	getHistoricalAlerts,
	getHistoricalReadings,
	type ReportSensorType as SensorType,
} from "~@/mock-data";
import type { DateRangePreset, HistoricalAlert, HistoricalReading } from "~@/views";

class HistoricalReportsViewModel {
	activeTab: "readings" | "alerts" = "readings";
	datePreset: DateRangePreset = "7d";
	startDate: Date | null = null;
	endDate: Date | null = null;
	siteFilter = "all";
	equipmentFilter = "all";
	sensorTypeFilter = "all";
	severityFilter = "all";
	comparePrevious = false;

	constructor() {
		makeAutoObservable(this);
	}

	get dateRange() {
		const end = this.endDate || new Date();
		let start: Date;

		if (this.datePreset === "24h") {
			start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
		} else if (this.datePreset === "7d") {
			start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
		} else if (this.datePreset === "30d") {
			start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
		} else {
			start = this.startDate || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
		}

		return { start, end };
	}

	get previousPeriod() {
		if (!this.comparePrevious) return null;
		const periodLength = this.dateRange.end.getTime() - this.dateRange.start.getTime();
		return {
			start: new Date(this.dateRange.start.getTime() - periodLength),
			end: this.dateRange.start,
		};
	}

	get readings(): HistoricalReading[] {
		return getHistoricalReadings({
			startDate: this.dateRange.start,
			endDate: this.dateRange.end,
			siteId: this.siteFilter !== "all" ? this.siteFilter : undefined,
			equipmentId: this.equipmentFilter !== "all" ? this.equipmentFilter : undefined,
			sensorType:
				this.sensorTypeFilter !== "all" ? (this.sensorTypeFilter as SensorType) : undefined,
		});
	}

	get previousReadings(): HistoricalReading[] {
		if (!this.previousPeriod) return [];
		return getHistoricalReadings({
			startDate: this.previousPeriod.start,
			endDate: this.previousPeriod.end,
			siteId: this.siteFilter !== "all" ? this.siteFilter : undefined,
			equipmentId: this.equipmentFilter !== "all" ? this.equipmentFilter : undefined,
			sensorType:
				this.sensorTypeFilter !== "all" ? (this.sensorTypeFilter as SensorType) : undefined,
		});
	}

	get alerts(): HistoricalAlert[] {
		return getHistoricalAlerts({
			startDate: this.dateRange.start,
			endDate: this.dateRange.end,
			equipmentId: this.equipmentFilter !== "all" ? this.equipmentFilter : undefined,
			severity: this.severityFilter !== "all" ? (this.severityFilter as AlertSeverity) : undefined,
		});
	}

	get previousAlerts(): HistoricalAlert[] {
		if (!this.previousPeriod) return [];
		return getHistoricalAlerts({
			startDate: this.previousPeriod.start,
			endDate: this.previousPeriod.end,
			equipmentId: this.equipmentFilter !== "all" ? this.equipmentFilter : undefined,
			severity: this.severityFilter !== "all" ? (this.severityFilter as AlertSeverity) : undefined,
		});
	}

	setActiveTab = (tab: "readings" | "alerts") => {
		this.activeTab = tab;
	};

	setDatePreset = (preset: DateRangePreset) => {
		this.datePreset = preset;
	};

	setStartDate = (date: Date | null) => {
		this.startDate = date;
	};

	setEndDate = (date: Date | null) => {
		this.endDate = date;
	};

	setSiteFilter = (value: string) => {
		this.siteFilter = value;
	};

	setEquipmentFilter = (value: string) => {
		this.equipmentFilter = value;
	};

	setSensorTypeFilter = (value: string) => {
		this.sensorTypeFilter = value;
	};

	setSeverityFilter = (value: string) => {
		this.severityFilter = value;
	};

	setComparePrevious = (value: boolean) => {
		this.comparePrevious = value;
	};

	dispose() {
		// No subscriptions to clean up.
	}
}

export const historicalReportsViewModel = new HistoricalReportsViewModel();

export function useHistoricalReportsViewModel() {
	return historicalReportsViewModel;
}
