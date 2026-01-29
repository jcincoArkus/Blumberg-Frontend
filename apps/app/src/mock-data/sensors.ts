// Sensor Management Mock Data

// Types
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

// Sensor Type Options for forms
export const sensorTypeOptions: { value: SensorType; label: string; unit: string }[] = [
	{ value: "temperature", label: "Temperature", unit: "°C" },
	{ value: "humidity", label: "Humidity", unit: "%" },
	{ value: "co2", label: "CO2", unit: "ppm" },
	{ value: "o2", label: "O2", unit: "%" },
	{ value: "pressure", label: "Pressure", unit: "PSI" },
	{ value: "energy", label: "Energy", unit: "kW" },
];

export const transformTypeOptions: { value: DataMappingTransformType; label: string }[] = [
	{ value: "none", label: "None" },
	{ value: "scale", label: "Scale (multiply)" },
	{ value: "offset", label: "Offset (add/subtract)" },
];

// Mock Sites
export const sites: Site[] = [
	{ id: "site-1", name: "Main Distribution Center", location: "Chicago, IL" },
	{ id: "site-2", name: "West Coast Warehouse", location: "Los Angeles, CA" },
	{ id: "site-3", name: "East Regional Hub", location: "Atlanta, GA" },
	{ id: "site-4", name: "South Central Facility", location: "Dallas, TX" },
];

// Mock Equipment
export const equipment: Equipment[] = [
	{ id: "eq-1", siteId: "site-1", name: "Cold Storage Unit A", type: "Refrigeration" },
	{ id: "eq-2", siteId: "site-1", name: "Cold Storage Unit B", type: "Refrigeration" },
	{ id: "eq-3", siteId: "site-1", name: "HVAC System Main", type: "Climate Control" },
	{ id: "eq-4", siteId: "site-2", name: "Freezer Bank 1", type: "Deep Freeze" },
	{ id: "eq-5", siteId: "site-2", name: "Climate Control West", type: "Climate Control" },
	{ id: "eq-6", siteId: "site-3", name: "Refrigeration Unit 1", type: "Refrigeration" },
	{ id: "eq-7", siteId: "site-3", name: "Refrigeration Unit 2", type: "Refrigeration" },
	{ id: "eq-8", siteId: "site-3", name: "Energy Management System", type: "Power Distribution" },
	{ id: "eq-9", siteId: "site-4", name: "Main HVAC", type: "Climate Control" },
];

// Helper functions
export function getSiteById(siteId: string): Site | undefined {
	return sites.find((s) => s.id === siteId);
}

export function getEquipmentById(equipmentId: string): Equipment | undefined {
	return equipment.find((e) => e.id === equipmentId);
}

export function getEquipmentBySite(siteId: string): Equipment[] {
	return equipment.filter((e) => e.siteId === siteId);
}

export function getUnitForSensorType(type: SensorType): string {
	return sensorTypeOptions.find((o) => o.value === type)?.unit || "";
}

// Mock Sensors (40 sensors)
export const sensors: Sensor[] = [
	// Equipment 1 Sensors (site-1)
	{
		id: "s-1",
		equipmentId: "eq-1",
		siteId: "site-1",
		type: "temperature",
		name: "Internal Temp",
		value: -18.2,
		unit: "°C",
		status: "active",
		lastSeen: "2024-01-15T10:30:00Z",
		min: -25,
		max: -15,
		threshold: { warning: -16, critical: -14 },
	},
	{
		id: "s-2",
		equipmentId: "eq-1",
		siteId: "site-1",
		type: "humidity",
		name: "Humidity Sensor",
		value: 45,
		unit: "%",
		status: "active",
		lastSeen: "2024-01-15T10:30:00Z",
		min: 30,
		max: 60,
		threshold: { warning: 55, critical: 65 },
	},
	{
		id: "s-3",
		equipmentId: "eq-1",
		siteId: "site-1",
		type: "energy",
		name: "Power Consumption",
		value: 12.5,
		unit: "kW",
		status: "active",
		lastSeen: "2024-01-15T10:30:00Z",
		min: 0,
		max: 20,
		threshold: { warning: 16, critical: 18 },
	},
	{
		id: "s-4",
		equipmentId: "eq-1",
		siteId: "site-1",
		type: "pressure",
		name: "Compressor Pressure",
		value: 145,
		unit: "PSI",
		status: "warning",
		lastSeen: "2024-01-15T10:30:00Z",
		min: 100,
		max: 160,
		threshold: { warning: 150, critical: 165 },
	},
	// Equipment 2 Sensors (site-1)
	{
		id: "s-5",
		equipmentId: "eq-2",
		siteId: "site-1",
		type: "temperature",
		name: "Internal Temp",
		value: -19.1,
		unit: "°C",
		status: "active",
		lastSeen: "2024-01-15T10:28:00Z",
		min: -25,
		max: -15,
		threshold: { warning: -16, critical: -14 },
	},
	{
		id: "s-6",
		equipmentId: "eq-2",
		siteId: "site-1",
		type: "humidity",
		name: "Humidity Sensor",
		value: 42,
		unit: "%",
		status: "active",
		lastSeen: "2024-01-15T10:28:00Z",
		min: 30,
		max: 60,
		threshold: { warning: 55, critical: 65 },
	},
	{
		id: "s-7",
		equipmentId: "eq-2",
		siteId: "site-1",
		type: "energy",
		name: "Power Consumption",
		value: 11.8,
		unit: "kW",
		status: "active",
		lastSeen: "2024-01-15T10:28:00Z",
		min: 0,
		max: 20,
		threshold: { warning: 16, critical: 18 },
	},
	{
		id: "s-8",
		equipmentId: "eq-2",
		siteId: "site-1",
		type: "pressure",
		name: "Compressor Pressure",
		value: 138,
		unit: "PSI",
		status: "active",
		lastSeen: "2024-01-15T10:28:00Z",
		min: 100,
		max: 160,
		threshold: { warning: 150, critical: 165 },
	},
	// Equipment 3 Sensors (site-1)
	{
		id: "s-9",
		equipmentId: "eq-3",
		siteId: "site-1",
		type: "temperature",
		name: "Supply Air Temp",
		value: 22.5,
		unit: "°C",
		status: "active",
		lastSeen: "2024-01-15T10:25:00Z",
		min: 18,
		max: 28,
		threshold: { warning: 26, critical: 30 },
	},
	{
		id: "s-10",
		equipmentId: "eq-3",
		siteId: "site-1",
		type: "humidity",
		name: "Zone Humidity",
		value: 58,
		unit: "%",
		status: "warning",
		lastSeen: "2024-01-15T10:25:00Z",
		min: 30,
		max: 60,
		threshold: { warning: 55, critical: 65 },
	},
	{
		id: "s-11",
		equipmentId: "eq-3",
		siteId: "site-1",
		type: "co2",
		name: "CO2 Level",
		value: 650,
		unit: "ppm",
		status: "active",
		lastSeen: "2024-01-15T10:25:00Z",
		min: 350,
		max: 1000,
		threshold: { warning: 800, critical: 1000 },
	},
	{
		id: "s-12",
		equipmentId: "eq-3",
		siteId: "site-1",
		type: "energy",
		name: "HVAC Power",
		value: 8.2,
		unit: "kW",
		status: "active",
		lastSeen: "2024-01-15T10:25:00Z",
		min: 0,
		max: 15,
		threshold: { warning: 12, critical: 14 },
	},
	// Equipment 4 Sensors (site-2)
	{
		id: "s-13",
		equipmentId: "eq-4",
		siteId: "site-2",
		type: "temperature",
		name: "Freezer Temp",
		value: -22.8,
		unit: "°C",
		status: "warning",
		lastSeen: "2024-01-15T10:20:00Z",
		min: -30,
		max: -20,
		threshold: { warning: -21, critical: -18 },
	},
	{
		id: "s-14",
		equipmentId: "eq-4",
		siteId: "site-2",
		type: "humidity",
		name: "Internal Humidity",
		value: 35,
		unit: "%",
		status: "active",
		lastSeen: "2024-01-15T10:20:00Z",
		min: 20,
		max: 50,
		threshold: { warning: 45, critical: 55 },
	},
	{
		id: "s-15",
		equipmentId: "eq-4",
		siteId: "site-2",
		type: "energy",
		name: "Power Draw",
		value: 18.5,
		unit: "kW",
		status: "warning",
		lastSeen: "2024-01-15T10:20:00Z",
		min: 0,
		max: 25,
		threshold: { warning: 18, critical: 22 },
	},
	{
		id: "s-16",
		equipmentId: "eq-4",
		siteId: "site-2",
		type: "pressure",
		name: "System Pressure",
		value: 155,
		unit: "PSI",
		status: "active",
		lastSeen: "2024-01-15T10:20:00Z",
		min: 120,
		max: 180,
		threshold: { warning: 165, critical: 175 },
	},
	// Equipment 5 Sensors (site-2)
	{
		id: "s-17",
		equipmentId: "eq-5",
		siteId: "site-2",
		type: "temperature",
		name: "Zone Temp",
		value: 21.2,
		unit: "°C",
		status: "active",
		lastSeen: "2024-01-15T10:22:00Z",
		min: 18,
		max: 26,
		threshold: { warning: 24, critical: 28 },
	},
	{
		id: "s-18",
		equipmentId: "eq-5",
		siteId: "site-2",
		type: "humidity",
		name: "Zone Humidity",
		value: 52,
		unit: "%",
		status: "active",
		lastSeen: "2024-01-15T10:22:00Z",
		min: 35,
		max: 65,
		threshold: { warning: 60, critical: 70 },
	},
	{
		id: "s-19",
		equipmentId: "eq-5",
		siteId: "site-2",
		type: "co2",
		name: "CO2 Monitor",
		value: 720,
		unit: "ppm",
		status: "active",
		lastSeen: "2024-01-15T10:22:00Z",
		min: 350,
		max: 1000,
		threshold: { warning: 800, critical: 1000 },
	},
	{
		id: "s-20",
		equipmentId: "eq-5",
		siteId: "site-2",
		type: "energy",
		name: "Climate Power",
		value: 6.8,
		unit: "kW",
		status: "active",
		lastSeen: "2024-01-15T10:22:00Z",
		min: 0,
		max: 12,
		threshold: { warning: 9, critical: 11 },
	},
	// Equipment 6 Sensors (site-3)
	{
		id: "s-21",
		equipmentId: "eq-6",
		siteId: "site-3",
		type: "temperature",
		name: "Chamber Temp",
		value: 4.2,
		unit: "°C",
		status: "active",
		lastSeen: "2024-01-15T10:15:00Z",
		min: 2,
		max: 8,
		threshold: { warning: 6, critical: 8 },
	},
	{
		id: "s-22",
		equipmentId: "eq-6",
		siteId: "site-3",
		type: "humidity",
		name: "Chamber Humidity",
		value: 48,
		unit: "%",
		status: "active",
		lastSeen: "2024-01-15T10:15:00Z",
		min: 35,
		max: 55,
		threshold: { warning: 52, critical: 58 },
	},
	{
		id: "s-23",
		equipmentId: "eq-6",
		siteId: "site-3",
		type: "energy",
		name: "Unit Power",
		value: 9.5,
		unit: "kW",
		status: "active",
		lastSeen: "2024-01-15T10:15:00Z",
		min: 0,
		max: 15,
		threshold: { warning: 12, critical: 14 },
	},
	{
		id: "s-24",
		equipmentId: "eq-6",
		siteId: "site-3",
		type: "pressure",
		name: "Refrigerant Pressure",
		value: 128,
		unit: "PSI",
		status: "active",
		lastSeen: "2024-01-15T10:15:00Z",
		min: 100,
		max: 150,
		threshold: { warning: 140, critical: 155 },
	},
	{
		id: "s-25",
		equipmentId: "eq-6",
		siteId: "site-3",
		type: "co2",
		name: "Ambient CO2",
		value: 480,
		unit: "ppm",
		status: "active",
		lastSeen: "2024-01-15T10:15:00Z",
		min: 350,
		max: 800,
		threshold: { warning: 700, critical: 850 },
	},
	// Equipment 7 Sensors (site-3)
	{
		id: "s-26",
		equipmentId: "eq-7",
		siteId: "site-3",
		type: "temperature",
		name: "Chamber Temp",
		value: 4.8,
		unit: "°C",
		status: "active",
		lastSeen: "2024-01-15T10:18:00Z",
		min: 2,
		max: 8,
		threshold: { warning: 6, critical: 8 },
	},
	{
		id: "s-27",
		equipmentId: "eq-7",
		siteId: "site-3",
		type: "humidity",
		name: "Chamber Humidity",
		value: 51,
		unit: "%",
		status: "active",
		lastSeen: "2024-01-15T10:18:00Z",
		min: 35,
		max: 55,
		threshold: { warning: 52, critical: 58 },
	},
	{
		id: "s-28",
		equipmentId: "eq-7",
		siteId: "site-3",
		type: "energy",
		name: "Unit Power",
		value: 10.2,
		unit: "kW",
		status: "active",
		lastSeen: "2024-01-15T10:18:00Z",
		min: 0,
		max: 15,
		threshold: { warning: 12, critical: 14 },
	},
	{
		id: "s-29",
		equipmentId: "eq-7",
		siteId: "site-3",
		type: "pressure",
		name: "Refrigerant Pressure",
		value: 142,
		unit: "PSI",
		status: "warning",
		lastSeen: "2024-01-15T10:18:00Z",
		min: 100,
		max: 150,
		threshold: { warning: 140, critical: 155 },
	},
	{
		id: "s-30",
		equipmentId: "eq-7",
		siteId: "site-3",
		type: "co2",
		name: "Ambient CO2",
		value: 510,
		unit: "ppm",
		status: "active",
		lastSeen: "2024-01-15T10:18:00Z",
		min: 350,
		max: 800,
		threshold: { warning: 700, critical: 850 },
	},
	// Equipment 8 Sensors (site-3)
	{
		id: "s-31",
		equipmentId: "eq-8",
		siteId: "site-3",
		type: "energy",
		name: "Main Power",
		value: 45.2,
		unit: "kW",
		status: "active",
		lastSeen: "2024-01-15T10:12:00Z",
		min: 0,
		max: 80,
		threshold: { warning: 65, critical: 75 },
	},
	{
		id: "s-32",
		equipmentId: "eq-8",
		siteId: "site-3",
		type: "energy",
		name: "Backup Power",
		value: 0,
		unit: "kW",
		status: "active",
		lastSeen: "2024-01-15T10:12:00Z",
		min: 0,
		max: 60,
		threshold: { warning: 50, critical: 58 },
	},
	{
		id: "s-33",
		equipmentId: "eq-8",
		siteId: "site-3",
		type: "temperature",
		name: "Panel Temp",
		value: 32.5,
		unit: "°C",
		status: "active",
		lastSeen: "2024-01-15T10:12:00Z",
		min: 20,
		max: 45,
		threshold: { warning: 40, critical: 48 },
	},
	{
		id: "s-34",
		equipmentId: "eq-8",
		siteId: "site-3",
		type: "humidity",
		name: "Panel Humidity",
		value: 38,
		unit: "%",
		status: "active",
		lastSeen: "2024-01-15T10:12:00Z",
		min: 20,
		max: 50,
		threshold: { warning: 45, critical: 55 },
	},
	// Additional sensors for demo (unmapped, inactive, with mappings)
	{
		id: "s-35",
		siteId: "site-1",
		type: "temperature",
		name: "Unmapped Temp Sensor",
		unit: "°C",
		status: "inactive",
		description: "Sensor registered but not yet mapped to data source",
	},
	{
		id: "s-36",
		equipmentId: "eq-2",
		siteId: "site-1",
		type: "o2",
		name: "Oxygen Monitor",
		value: 21.2,
		unit: "%",
		status: "active",
		lastSeen: "2024-01-15T09:45:00Z",
		min: 19.5,
		max: 23.5,
		threshold: { warning: 20, critical: 19 },
		physicalLocation: "Storage area, north wall",
		dataMapping: [{ id: "m-1", incomingField: "o2_level", mapsTo: "o2", unitOverride: "%" }],
	},
	{
		id: "s-37",
		siteId: "site-2",
		type: "co2",
		name: "Warehouse CO2",
		unit: "ppm",
		status: "inactive",
		description: "Deactivated sensor - maintenance required",
	},
	{
		id: "s-38",
		equipmentId: "eq-5",
		siteId: "site-2",
		type: "temperature",
		name: "Zone Temp 2",
		value: 20.8,
		unit: "°C",
		status: "active",
		lastSeen: "2024-01-15T10:20:00Z",
		min: 18,
		max: 26,
		threshold: { warning: 24, critical: 28 },
		physicalLocation: "West zone, ceiling mount",
		dataMapping: [
			{
				id: "m-2",
				incomingField: "temp",
				mapsTo: "temperature",
				transform: { type: "scale", factor: 1.0 },
			},
		],
	},
	{
		id: "s-39",
		siteId: "site-3",
		type: "pressure",
		name: "Unassigned Pressure",
		unit: "PSI",
		status: "active",
		lastSeen: "2024-01-15T08:30:00Z",
		min: 100,
		max: 150,
		threshold: { warning: 140, critical: 155 },
		description: "Sensor not assigned to equipment",
		dataMapping: [{ id: "m-3", incomingField: "pressure_reading", mapsTo: "pressure" }],
	},
	{
		id: "s-40",
		equipmentId: "eq-7",
		siteId: "site-3",
		type: "humidity",
		name: "Humidity Sensor B",
		value: 49,
		unit: "%",
		status: "warning",
		lastSeen: "2024-01-15T09:00:00Z",
		min: 35,
		max: 55,
		threshold: { warning: 52, critical: 58 },
		physicalLocation: "Secondary chamber",
		dataMapping: [
			{
				id: "m-4",
				incomingField: "humidity",
				mapsTo: "humidity",
				transform: { type: "offset", offset: 0 },
			},
		],
	},
];

// Enrich sensors with site and equipment names
export function getAllSensorsEnriched(): Sensor[] {
	return sensors.map((sensor) => ({
		...sensor,
		siteName: getSiteById(sensor.siteId)?.name,
		equipmentName: sensor.equipmentId ? getEquipmentById(sensor.equipmentId)?.name : undefined,
	}));
}
