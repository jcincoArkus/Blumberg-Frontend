import type { Alert } from "../../alerts/types";

export interface GlobalStatusBarProps {
	systemStatus: "healthy" | "degraded" | "critical";
	activeAlerts: { high: number; medium: number; low: number };
	sensorsOnline: number;
	totalSensors: number;
	alerts?: Alert[];
}

export type AlertSeverityKey = "high" | "medium";
