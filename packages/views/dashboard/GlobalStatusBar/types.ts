import type { Alert } from "../../alerts/types";

export interface GlobalStatusBarProps {
	systemStatus: "healthy" | "degraded" | "critical";
	activeAlerts: { critical: number; warning: number; info: number };
	sensorsOnline: number;
	totalSensors: number;
	alerts?: Alert[];
}

export type AlertSeverityKey = "critical" | "warning";
