import type { SensorThreshold, SensorThresholdSeverity } from "~@/models";

// Severity options for threshold editor
export const sensorThresholdSeverityOptions: { value: SensorThresholdSeverity; label: string }[] = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
	{ value: "critical", label: "Critical" },
];

// Time out of range options (reuse same values as alerting)
export const timeOptions = [
	{ value: 30, label: "30 seconds" },
	{ value: 60, label: "1 minute" },
	{ value: 120, label: "2 minutes" },
	{ value: 300, label: "5 minutes" },
	{ value: 600, label: "10 minutes" },
];

// Mock sensor thresholds tied to existing sensor IDs
export const sensorThresholds: SensorThreshold[] = [
	{
		id: "threshold-1",
		sensorId: "s-1",
		min: -25,
		max: -15,
		unit: "°C",
		minOutOfRangeSeconds: 120,
		severity: "high",
		createdAt: "2024-01-10T08:00:00Z",
		updatedAt: "2024-01-12T10:30:00Z",
	},
	{
		id: "threshold-2",
		sensorId: "s-2",
		min: 30,
		max: 60,
		unit: "%",
		minOutOfRangeSeconds: 300,
		severity: "medium",
		createdAt: "2024-01-08T09:00:00Z",
		updatedAt: "2024-01-08T09:00:00Z",
	},
	{
		id: "threshold-3",
		sensorId: "s-11",
		min: 350,
		max: 1000,
		unit: "ppm",
		minOutOfRangeSeconds: 300,
		severity: "high",
		createdAt: "2024-01-05T14:00:00Z",
		updatedAt: "2024-01-11T16:20:00Z",
	},
	{
		id: "threshold-4",
		sensorId: "s-13",
		min: -30,
		max: -20,
		unit: "°C",
		minOutOfRangeSeconds: 60,
		severity: "critical",
		createdAt: "2024-01-02T11:00:00Z",
		updatedAt: "2024-01-15T09:45:00Z",
	},
	{
		id: "threshold-5",
		sensorId: "s-4",
		min: 100,
		max: 160,
		unit: "PSI",
		minOutOfRangeSeconds: 120,
		severity: "medium",
		createdAt: "2024-01-03T12:00:00Z",
		updatedAt: "2024-01-03T12:00:00Z",
	},
];
