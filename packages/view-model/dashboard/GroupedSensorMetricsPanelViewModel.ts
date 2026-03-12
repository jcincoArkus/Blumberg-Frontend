import { makeAutoObservable } from "~@/mobx";

import { alertsViewModel } from "../alerts";
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

/** Backend health list uses name = sensor.Serial; alerts use sensorSerial. Use name for matching. */
function sensorKey(sensor: SensorWithReading): string {
	return sensor.name ?? sensor.id;
}

/**
 * Singleton ViewModel for GroupedSensorMetricsPanel.
 * Uses alertsViewModel (same as Active Alerts panel) for per-sensor alert counts; sensors from DashboardSensorsViewModel.
 */
class GroupedSensorMetricsPanelViewModel {
	constructor() {
		makeAutoObservable(this);
	}

	get sensors(): SensorWithReading[] {
		return dashboardSensorsViewModel.sensors as unknown as SensorWithReading[];
	}

	get isSensorsLoading(): boolean {
		return dashboardSensorsViewModel.isSensorsLoading;
	}

	get hasSensorsError(): boolean {
		return dashboardSensorsViewModel.hasSensorsError;
	}

	get alerts() {
		return alertsViewModel.unresolvedAlerts;
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

	/** Alert count per sensor type (from active alerts with sensorId = sensor serial) */
	get alertsBySensorType(): Record<string, number> {
		const counts: Record<string, number> = {};
		for (const alert of this.alerts) {
			if (!alert.sensorId) continue;
			const sensor = this.sensors.find((s) => sensorKey(s) === alert.sensorId);
			if (sensor) {
				const t = sensor.type ?? "other";
				counts[t] = (counts[t] ?? 0) + 1;
			}
		}
		return counts;
	}

	/**
	 * Alert count per sensor, keyed by sensor serial (name).
	 * Backend: alerts use sensorSerial, health list uses id (Guid) and name (= serial).
	 * We key by serial so the panel can look up by sensor.name.
	 */
	get alertsBySensor(): Record<string, number> {
		const counts: Record<string, number> = {};
		for (const alert of this.alerts) {
			if (alert.sensorId) {
				counts[alert.sensorId] = (counts[alert.sensorId] ?? 0) + 1;
			}
		}
		return counts;
	}

	/** Alert count for a sensor (use sensor.name = serial to match alerts). */
	getAlertCountForSensor(sensor: SensorWithReading): number {
		return this.alertsBySensor[sensorKey(sensor)] ?? 0;
	}

	/**
	 * Sensors for a type, sorted by alert count (sensors with alerts first), limited to `limit`.
	 * Use from the panel with SENSORS_DISPLAY_LIMIT so sorting/filtering stays in ViewModel (component-pattern).
	 */
	getVisibleSensorsForType(type: string, limit: number): SensorWithReading[] {
		const typeSensors = this.sensorsByType[type] ?? [];
		return [...typeSensors]
			.sort((a, b) => this.getAlertCountForSensor(b) - this.getAlertCountForSensor(a))
			.slice(0, limit);
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
		return this.alerts.filter((a) => a.severity === "critical").length;
	}

	get highAlerts(): number {
		return this.alerts.filter((a) => a.severity === "warning").length;
	}
}

export const groupedSensorMetricsPanelViewModel = new GroupedSensorMetricsPanelViewModel();

export function useGroupedSensorMetricsPanelViewModel() {
	return groupedSensorMetricsPanelViewModel;
}
