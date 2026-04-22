export interface Sensor {
	id: string;
	name: string;
	status: "active" | "offline" | "stale" | "warning" | "error";
}

export interface SensorReliabilityPanelProps {
	offlineCount: number;
	staleCount: number;
	flappingCount: number;
	totalSensors: number;
	offlineSensors: Sensor[];
	staleSensors: Sensor[];
	flappingSensors: Sensor[];
}
