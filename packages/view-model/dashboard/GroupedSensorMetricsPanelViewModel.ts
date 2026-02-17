import { makeAutoObservable } from "~@/mobx";

import { dashboardAlertsViewModel } from "./DashboardAlertsViewModel";
import { dashboardSensorsViewModel } from "./DashboardSensorsViewModel";

/** Sensor shape with reading fields used by GroupedSensorMetricsPanel (mock/API) */
export interface SensorWithReading {
	id: string;
	name: string;
	type: string;
	status: string;
	value?: number;
	unit: string;
	min?: number;
	max?: number;
	lastSeen?: string;
}

const TYPE_ORDER = ["temperature", "humidity", "pressure", "co2", "energy", "o2"] as const;

/**
 * Singleton ViewModel for GroupedSensorMetricsPanel.
 * Delegates to DashboardSensorsViewModel and DashboardAlertsViewModel.
 */
class GroupedSensorMetricsPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	get sensors(): SensorWithReading[] {
		return dashboardSensorsViewModel.sensors as unknown as SensorWithReading[];
	}

	get alerts() {
		return dashboardAlertsViewModel.activeAlerts;
	}

	/** Sensors grouped by type */
	get sensorsByType(): Record<string, SensorWithReading[]> {
		const grouped: Record<string, SensorWithReading[]> = {};
		for (const sensor of this.sensors) {
			const t = sensor.type ?? "other";
			if (!grouped[t]) grouped[t] = [];
			grouped[t].push(sensor);
		}
		return grouped;
	}

	/** Alert count per sensor type (from active alerts with sensorId) */
	get alertsBySensorType(): Record<string, number> {
		const counts: Record<string, number> = {};
		for (const alert of this.alerts) {
			if (!alert.sensorId) continue;
			const sensor = this.sensors.find((s) => s.id === alert.sensorId);
			if (sensor) {
				const t = sensor.type ?? "other";
				counts[t] = (counts[t] ?? 0) + 1;
			}
		}
		return counts;
	}

	/** Alert count per sensor id */
	get alertsBySensor(): Record<string, number> {
		const counts: Record<string, number> = {};
		for (const alert of this.alerts) {
			if (alert.sensorId) {
				counts[alert.sensorId] = (counts[alert.sensorId] ?? 0) + 1;
			}
		}
		return counts;
	}

	/** Ordered list of sensor types (priority order, then rest) */
	get orderedTypes(): string[] {
		const byType = this.sensorsByType;
		const ordered = TYPE_ORDER.filter((t) => (byType[t]?.length ?? 0) > 0);
		const rest = Object.keys(byType)
			.filter((t) => !TYPE_ORDER.includes(t as (typeof TYPE_ORDER)[number]))
			.sort();
		return [...ordered, ...rest];
	}

	get totalAlerts(): number {
		return this.alerts.length;
	}

	get criticalAlerts(): number {
		return this.alerts.filter(
			(a) => a.severity === "critical" && (a.status === "active" || a.status === "acknowledged"),
		).length;
	}

	get highAlerts(): number {
		return this.alerts.filter(
			(a) =>
				(a.severity === "high" || a.severity === "critical") &&
				(a.status === "active" || a.status === "acknowledged"),
		).length;
	}
}

export const groupedSensorMetricsPanelViewModel = new GroupedSensorMetricsPanelViewModel();

export function useGroupedSensorMetricsPanelViewModel() {
	return groupedSensorMetricsPanelViewModel;
}
