import type { Alert } from "~@/models";
import type { Site } from "~@/views";

// Equipment type for sites
export interface Equipment {
	id: string;
	name: string;
	type: string;
	siteId: string;
	status: "online" | "warning" | "offline" | "maintenance";
	sensorCount: number;
	activeAlerts: number;
	lastUpdate: string;
	utilization?: number;
	model?: string;
	manufacturer?: string;
}

// Extended Site with computed stats
export interface SiteWithStats extends Site {
	equipmentCount: number;
	sensorCount: number;
	activeSensors: number;
	activeAlerts: number;
	sensorsByType: {
		temperature: number;
		humidity: number;
		energy: number;
		pressure: number;
	};
	healthyPercent: number;
}

// Sites data
export const sites: Site[] = [
	{
		id: "site-1",
		name: "North Distribution Center",
		location: "Chicago, IL",
		status: "operational",
	},
	{ id: "site-2", name: "West Coast Warehouse", location: "Los Angeles, CA", status: "warning" },
	{ id: "site-3", name: "East Coast Hub", location: "New York, NY", status: "operational" },
	{ id: "site-4", name: "South Regional DC", location: "Houston, TX", status: "critical" },
];

// Equipment data
export const equipment: Equipment[] = [
	{
		id: "eq-1",
		name: "Compressor Unit A",
		type: "Refrigeration",
		siteId: "site-1",
		status: "online",
		sensorCount: 4,
		activeAlerts: 1,
		lastUpdate: "2024-01-15T10:30:00Z",
	},
	{
		id: "eq-2",
		name: "HVAC System B",
		type: "Climate Control",
		siteId: "site-1",
		status: "online",
		sensorCount: 6,
		activeAlerts: 0,
		lastUpdate: "2024-01-15T10:28:00Z",
	},
	{
		id: "eq-3",
		name: "Dehumidifier C",
		type: "Climate Control",
		siteId: "site-1",
		status: "warning",
		sensorCount: 2,
		activeAlerts: 1,
		lastUpdate: "2024-01-15T10:25:00Z",
	},
	{
		id: "eq-4",
		name: "Freezer Bank 1",
		type: "Refrigeration",
		siteId: "site-2",
		status: "offline",
		sensorCount: 8,
		activeAlerts: 2,
		lastUpdate: "2024-01-15T09:45:00Z",
	},
	{
		id: "eq-5",
		name: "Chiller Unit D",
		type: "Refrigeration",
		siteId: "site-2",
		status: "online",
		sensorCount: 5,
		activeAlerts: 0,
		lastUpdate: "2024-01-15T10:32:00Z",
	},
	{
		id: "eq-6",
		name: "Air Handler E",
		type: "Climate Control",
		siteId: "site-3",
		status: "online",
		sensorCount: 4,
		activeAlerts: 0,
		lastUpdate: "2024-01-15T10:31:00Z",
	},
	{
		id: "eq-7",
		name: "Cold Storage F",
		type: "Refrigeration",
		siteId: "site-3",
		status: "online",
		sensorCount: 6,
		activeAlerts: 0,
		lastUpdate: "2024-01-15T10:29:00Z",
	},
	{
		id: "eq-8",
		name: "Backup Generator",
		type: "Power",
		siteId: "site-3",
		status: "maintenance",
		sensorCount: 3,
		activeAlerts: 0,
		lastUpdate: "2024-01-15T08:00:00Z",
	},
	{
		id: "eq-9",
		name: "Main Freezer",
		type: "Refrigeration",
		siteId: "site-4",
		status: "warning",
		sensorCount: 10,
		activeAlerts: 1,
		lastUpdate: "2024-01-15T10:20:00Z",
	},
	{
		id: "eq-10",
		name: "Power Distribution Unit",
		type: "Power",
		siteId: "site-4",
		status: "online",
		sensorCount: 4,
		activeAlerts: 1,
		lastUpdate: "2024-01-15T10:33:00Z",
	},
];

// Sensors data for sites
interface SiteSensor {
	id: string;
	name: string;
	type: "temperature" | "humidity" | "energy" | "pressure";
	siteId: string;
	equipmentId: string;
	status: "active" | "offline" | "stale" | "warning";
}

export const siteSensors: SiteSensor[] = [
	{
		id: "ss-1",
		name: "Temp Probe 1",
		type: "temperature",
		siteId: "site-1",
		equipmentId: "eq-1",
		status: "active",
	},
	{
		id: "ss-2",
		name: "Pressure Gauge 1",
		type: "pressure",
		siteId: "site-1",
		equipmentId: "eq-1",
		status: "active",
	},
	{
		id: "ss-3",
		name: "Humidity Sensor 1",
		type: "humidity",
		siteId: "site-1",
		equipmentId: "eq-2",
		status: "active",
	},
	{
		id: "ss-4",
		name: "Temp Probe 2",
		type: "temperature",
		siteId: "site-1",
		equipmentId: "eq-2",
		status: "active",
	},
	{
		id: "ss-5",
		name: "Energy Meter 1",
		type: "energy",
		siteId: "site-1",
		equipmentId: "eq-2",
		status: "active",
	},
	{
		id: "ss-6",
		name: "Humidity Sensor 2",
		type: "humidity",
		siteId: "site-1",
		equipmentId: "eq-3",
		status: "warning",
	},
	{
		id: "ss-7",
		name: "Freezer Temp 1",
		type: "temperature",
		siteId: "site-2",
		equipmentId: "eq-4",
		status: "offline",
	},
	{
		id: "ss-8",
		name: "Freezer Temp 2",
		type: "temperature",
		siteId: "site-2",
		equipmentId: "eq-4",
		status: "offline",
	},
	{
		id: "ss-9",
		name: "Chiller Temp",
		type: "temperature",
		siteId: "site-2",
		equipmentId: "eq-5",
		status: "active",
	},
	{
		id: "ss-10",
		name: "Chiller Pressure",
		type: "pressure",
		siteId: "site-2",
		equipmentId: "eq-5",
		status: "active",
	},
	{
		id: "ss-11",
		name: "Air Handler Temp",
		type: "temperature",
		siteId: "site-3",
		equipmentId: "eq-6",
		status: "active",
	},
	{
		id: "ss-12",
		name: "Cold Storage Temp",
		type: "temperature",
		siteId: "site-3",
		equipmentId: "eq-7",
		status: "active",
	},
	{
		id: "ss-13",
		name: "Generator Energy",
		type: "energy",
		siteId: "site-3",
		equipmentId: "eq-8",
		status: "stale",
	},
	{
		id: "ss-14",
		name: "Main Freezer Temp",
		type: "temperature",
		siteId: "site-4",
		equipmentId: "eq-9",
		status: "warning",
	},
	{
		id: "ss-15",
		name: "PDU Energy",
		type: "energy",
		siteId: "site-4",
		equipmentId: "eq-10",
		status: "active",
	},
];

// Alerts for sites (reusing from alerts.ts structure)
export const siteAlerts: Alert[] = [
	{
		id: "sa-1",
		siteId: "site-1",
		equipmentId: "eq-1",
		name: "High Compressor Pressure",
		description: "Pressure approaching critical",
		severity: "high",
		status: "active",
		createdAt: "2024-01-15T08:45:00Z",
	},
	{
		id: "sa-2",
		siteId: "site-1",
		equipmentId: "eq-3",
		name: "High Humidity",
		description: "Humidity above threshold",
		severity: "medium",
		status: "acknowledged",
		createdAt: "2024-01-15T09:15:00Z",
		acknowledgedAt: "2024-01-15T09:20:00Z",
	},
	{
		id: "sa-3",
		siteId: "site-2",
		equipmentId: "eq-4",
		name: "Freezer Temperature Critical",
		description: "Temperature rising",
		severity: "critical",
		status: "active",
		createdAt: "2024-01-15T07:30:00Z",
	},
	{
		id: "sa-4",
		siteId: "site-2",
		equipmentId: "eq-4",
		name: "Freezer Offline",
		description: "Unit not responding",
		severity: "critical",
		status: "active",
		createdAt: "2024-01-15T07:35:00Z",
	},
	{
		id: "sa-5",
		siteId: "site-4",
		equipmentId: "eq-9",
		name: "Freezer Temp Warning",
		description: "Temperature trending up",
		severity: "medium",
		status: "active",
		createdAt: "2024-01-15T09:00:00Z",
	},
	{
		id: "sa-6",
		siteId: "site-4",
		equipmentId: "eq-10",
		name: "Power Spike",
		description: "Unusual consumption",
		severity: "low",
		status: "active",
		createdAt: "2024-01-15T10:00:00Z",
	},
];

// Helper functions
export function getSiteById(id: string): Site | undefined {
	return sites.find((s) => s.id === id);
}

export function getEquipmentBySite(siteId: string): Equipment[] {
	return equipment.filter((e) => e.siteId === siteId);
}

export function getSensorsBySite(siteId: string): SiteSensor[] {
	return siteSensors.filter((s) => s.siteId === siteId);
}

export function getAlertsBySite(siteId: string): Alert[] {
	return siteAlerts.filter((a) => a.siteId === siteId);
}

export function getSiteWithStats(site: Site): SiteWithStats {
	const siteEquipment = getEquipmentBySite(site.id);
	const sensors = getSensorsBySite(site.id);
	const alerts = getAlertsBySite(site.id);
	const activeAlerts = alerts.filter((a) => a.status === "active" || a.status === "acknowledged");
	const activeSensors = sensors.filter((s) => s.status === "active").length;

	return {
		...site,
		equipmentCount: siteEquipment.length,
		sensorCount: sensors.length,
		activeSensors,
		activeAlerts: activeAlerts.length,
		sensorsByType: {
			temperature: sensors.filter((s) => s.type === "temperature").length,
			humidity: sensors.filter((s) => s.type === "humidity").length,
			energy: sensors.filter((s) => s.type === "energy").length,
			pressure: sensors.filter((s) => s.type === "pressure").length,
		},
		healthyPercent: sensors.length > 0 ? Math.round((activeSensors / sensors.length) * 100) : 0,
	};
}

export function getAllSitesWithStats(): SiteWithStats[] {
	return sites.map(getSiteWithStats);
}

export function getEquipmentById(id: string): Equipment | undefined {
	return equipment.find((e) => e.id === id);
}

export function getSensorsByEquipment(equipmentId: string): SiteSensor[] {
	return siteSensors.filter((s) => s.equipmentId === equipmentId);
}

export function getAlertsByEquipment(equipmentId: string): Alert[] {
	return siteAlerts.filter((a) => a.equipmentId === equipmentId);
}

export type { SiteSensor };
