import type { AlertSeverity } from "~@/models";

import { equipment, siteSensors, sites } from "./sites";

// Types
export type DateRangePreset = "24h" | "7d" | "30d" | "custom";
export type { AlertSeverity };
export type AlertStatus = "active" | "acknowledged" | "resolved";
export type SensorType = "temperature" | "humidity" | "energy" | "pressure";

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

// Generate historical readings for the last 30 days
function generateHistoricalReadings(days: number = 30): HistoricalReading[] {
	const readings: HistoricalReading[] = [];
	const now = new Date();

	// Get sensor type info
	const sensorConfig: Record<SensorType, { min: number; max: number; unit: string }> = {
		temperature: { min: -25, max: 25, unit: "°C" },
		humidity: { min: 30, max: 80, unit: "%" },
		energy: { min: 50, max: 500, unit: "kWh" },
		pressure: { min: 0.8, max: 1.5, unit: "bar" },
	};

	siteSensors.forEach((sensor) => {
		const siteData = sites.find((s) => s.id === sensor.siteId);
		const equipmentData = equipment.find((e) => e.id === sensor.equipmentId);
		const config = sensorConfig[sensor.type];

		const pointsPerDay = 24; // Hourly readings
		for (let d = days - 1; d >= 0; d--) {
			for (let h = 0; h < pointsPerDay; h++) {
				const timestamp = new Date(now);
				timestamp.setDate(timestamp.getDate() - d);
				timestamp.setHours(h, 0, 0, 0);

				// Generate realistic value with some variation
				const range = config.max - config.min;
				const baseValue = config.min + range * 0.5;
				const variance = range * 0.2;
				const value = baseValue + (Math.random() - 0.5) * variance * 2;

				// Add some gaps (5% missing)
				if (Math.random() > 0.05) {
					readings.push({
						sensorId: sensor.id,
						sensorName: sensor.name,
						sensorType: sensor.type,
						timestamp: timestamp.toISOString(),
						value: Math.round(value * 10) / 10,
						unit: config.unit,
						siteId: sensor.siteId,
						siteName: siteData?.name || "Unknown",
						equipmentId: sensor.equipmentId,
						equipmentName: equipmentData?.name || "Unknown",
					});
				}
			}
		}
	});

	return readings;
}

// Generate historical alerts for the last 30 days
function generateHistoricalAlerts(days: number = 30): HistoricalAlert[] {
	const alerts: HistoricalAlert[] = [];
	const now = new Date();

	const alertPatterns: { title: string; severity: AlertSeverity }[] = [
		{ title: "Temperature threshold exceeded", severity: "warning" },
		{ title: "Humidity out of range", severity: "warning" },
		{ title: "Pressure warning", severity: "info" },
		{ title: "Critical temperature failure", severity: "critical" },
		{ title: "Energy consumption spike", severity: "warning" },
		{ title: "Sensor communication lost", severity: "warning" },
	];

	let alertId = 1;
	for (let d = days - 1; d >= 0; d--) {
		// Generate 1-5 alerts per day
		const alertsPerDay = Math.floor(Math.random() * 5) + 1;
		for (let i = 0; i < alertsPerDay; i++) {
			const timestamp = new Date(now);
			timestamp.setDate(timestamp.getDate() - d);
			timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

			const pattern = alertPatterns[Math.floor(Math.random() * alertPatterns.length)];
			const eq = equipment[Math.floor(Math.random() * equipment.length)];
			const status: AlertStatus =
				Math.random() > 0.3 ? "resolved" : Math.random() > 0.5 ? "acknowledged" : "active";

			const alert: HistoricalAlert = {
				id: `ha-${alertId++}`,
				title: pattern.title,
				severity: pattern.severity,
				status,
				equipmentId: eq.id,
				createdAt: timestamp.toISOString(),
			};

			if (status === "acknowledged" || status === "resolved") {
				const ackTime = new Date(timestamp.getTime() + Math.random() * 30 * 60 * 1000);
				alert.acknowledgedAt = ackTime.toISOString();
			}

			if (status === "resolved") {
				const resolveTime = new Date(timestamp.getTime() + Math.random() * 120 * 60 * 1000);
				alert.resolvedAt = resolveTime.toISOString();
				alert.durationSeconds = Math.floor((resolveTime.getTime() - timestamp.getTime()) / 1000);
			}

			alerts.push(alert);
		}
	}

	return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Pre-generate data
export const historicalReadings: HistoricalReading[] = generateHistoricalReadings(30);
export const historicalAlerts: HistoricalAlert[] = generateHistoricalAlerts(30);

// Helper functions for Historical Data
export function getHistoricalReadings(params: {
	startDate?: Date;
	endDate?: Date;
	siteId?: string;
	equipmentId?: string;
	sensorType?: SensorType;
}): HistoricalReading[] {
	let filtered = [...historicalReadings];

	if (params.startDate) {
		const startDate = params.startDate;
		filtered = filtered.filter((r) => new Date(r.timestamp) >= startDate);
	}
	if (params.endDate) {
		const endDate = params.endDate;
		filtered = filtered.filter((r) => new Date(r.timestamp) <= endDate);
	}
	if (params.siteId) {
		filtered = filtered.filter((r) => r.siteId === params.siteId);
	}
	if (params.equipmentId) {
		filtered = filtered.filter((r) => r.equipmentId === params.equipmentId);
	}
	if (params.sensorType) {
		filtered = filtered.filter((r) => r.sensorType === params.sensorType);
	}

	return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getHistoricalAlerts(params: {
	startDate?: Date;
	endDate?: Date;
	equipmentId?: string;
	severity?: AlertSeverity;
}): HistoricalAlert[] {
	let filtered = [...historicalAlerts];

	if (params.startDate) {
		const startDate = params.startDate;
		filtered = filtered.filter((a) => new Date(a.createdAt) >= startDate);
	}
	if (params.endDate) {
		const endDate = params.endDate;
		filtered = filtered.filter((a) => new Date(a.createdAt) <= endDate);
	}
	if (params.equipmentId) {
		filtered = filtered.filter((a) => a.equipmentId === params.equipmentId);
	}
	if (params.severity) {
		filtered = filtered.filter((a) => a.severity === params.severity);
	}

	return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function comparePeriods(
	current: { count: number; avg?: number },
	previous: { count: number; avg?: number },
): { delta: number; trend: "improving" | "stable" | "worsening" } {
	if (previous.count === 0) {
		return {
			delta: current.count > 0 ? 100 : 0,
			trend: current.count > 0 ? "worsening" : "stable",
		};
	}

	// For alerts, fewer is better
	const delta = ((current.count - previous.count) / previous.count) * 100;
	const absDelta = Math.abs(delta);

	let trend: "improving" | "stable" | "worsening";
	if (absDelta < 5) {
		trend = "stable";
	} else if (delta < 0) {
		trend = "improving"; // fewer alerts is better
	} else {
		trend = "worsening";
	}

	return { delta: Math.round(delta * 10) / 10, trend };
}
