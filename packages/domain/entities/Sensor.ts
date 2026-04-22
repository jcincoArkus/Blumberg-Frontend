export type SensorType = "temperature" | "humidity" | "co2" | "o2" | "pressure" | "energy";
export type SensorStatus = "active" | "warning" | "stale" | "offline" | "error" | "inactive";

export interface Sensor {
	id: string;
	equipmentId?: string;
	siteId: string;
	type: SensorType;
	name: string;
	value?: number;
	unit: string;
	status: SensorStatus;
	lastSeen?: string;
	min?: number;
	max?: number;
	threshold?: { warning: number; critical: number };
	description?: string;
	physicalLocation?: string;
}
