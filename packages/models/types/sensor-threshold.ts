export type SensorThresholdSeverity = "low" | "medium" | "high" | "critical";

export interface SensorThreshold {
	id: string;
	sensorId: string;
	min: number;
	max: number;
	unit: string;
	minOutOfRangeSeconds: number;
	severity: SensorThresholdSeverity;
	createdAt: string;
	updatedAt: string;
}
