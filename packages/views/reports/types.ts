import type { AlertSeverity } from "~@/models";

export type DateRangePreset = "24h" | "7d" | "30d" | "custom";

export type { AlertSeverity };
export type AlertStatus = "active" | "acknowledged" | "resolved";
export type SensorType = "temperature" | "humidity" | "energy" | "pressure";

export interface Site {
	id: string;
	name: string;
	location: string;
	status: "operational" | "warning" | "critical";
}

export interface Equipment {
	id: string;
	name: string;
	type: string;
	siteId: string;
	status: "online" | "warning" | "offline" | "maintenance";
	sensorCount: number;
	activeAlerts: number;
	lastUpdate: string;
	utilization?: number;
}

export interface HistoricalReading {
	sensorId: string;
	sensorName: string;
	sensorType: SensorType;
	timestamp: string;
	value: number;
	unit: string;
	siteId: string;
	siteName: string;
	equipmentId: string;
	equipmentName: string;
}

export interface HistoricalAlert {
	id: string;
	title: string;
	severity: AlertSeverity;
	status: AlertStatus;
	equipmentId: string;
	sensorId?: string;
	createdAt: string;
	acknowledgedAt?: string;
	resolvedAt?: string;
	durationSeconds?: number;
}

export interface DateRange {
	start: Date;
	end: Date;
}
