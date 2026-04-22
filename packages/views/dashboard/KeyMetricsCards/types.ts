export interface MetricData {
	value: number;
	unit: string;
	trend: "up" | "down" | "stable";
	status: "stable" | "rising" | "improving";
}

export interface KeyMetricsCardsProps {
	aqi: MetricData;
	co2: MetricData;
	temperature: MetricData;
	humidity: MetricData;
}

export type StatusKey = "stable" | "rising" | "improving";
