export type SensorType = "temperature" | "humidity" | "co2" | "o2" | "pressure" | "energy";
export type SensorStatus = "active" | "warning" | "stale" | "offline" | "error" | "inactive";
export type DataMappingTransformType = "none" | "scale" | "offset";

export interface DataMappingTransform {
	type: DataMappingTransformType;
	factor?: number;
	offset?: number;
}

export interface DataMapping {
	id: string;
	incomingField: string;
	mapsTo: SensorType;
	unitOverride?: string;
	transform?: DataMappingTransform;
}

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
	dataMapping?: DataMapping[];
	siteName?: string;
	equipmentName?: string;
}

export interface Site {
	id: string;
	name: string;
	location: string;
}

export interface Equipment {
	id: string;
	siteId: string;
	name: string;
	type: string;
}

export interface SensorTypeOption {
	value: SensorType;
	label: string;
	unit: string;
}

export interface TransformTypeOption {
	value: DataMappingTransformType;
	label: string;
}
