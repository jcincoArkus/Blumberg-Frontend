import type { Alert, AlertEvent, AlertNotification } from "~@/models";
import type { AgentInsight, Sensor, Site } from "~@/views";

/** Map location for dashboard Location panel (geo map) */
export interface MapLocation {
	id: string;
	name: string;
	city: string;
	lat: number;
	lng: number;
	status: "ok" | "warning" | "alert";
}

/** Mock map locations for Location panel (North America) */
export const mapLocations: MapLocation[] = [
	{
		id: "1",
		name: "West Coast Warehouse",
		city: "Los Angeles, CA",
		lat: 34.0522,
		lng: -118.2437,
		status: "ok",
	},
	{
		id: "2",
		name: "Pacific Northwest Hub",
		city: "Seattle, WA",
		lat: 47.6062,
		lng: -122.3321,
		status: "alert",
	},
	{
		id: "3",
		name: "South Central Facility",
		city: "Dallas, TX",
		lat: 32.7767,
		lng: -96.797,
		status: "warning",
	},
];

/** Zone status per location (links Interior Map to selected map location) */
export type ZoneStatus = "alert" | "warning" | "ok";

export const locationZoneStatus: Record<string, Record<string, ZoneStatus>> = {
	"1": {
		"cold-room-1": "alert",
		"aisle-b": "warning",
		"storage-area": "alert",
	},
	"2": {
		"storage-area": "alert",
	},
	"3": {
		"aisle-b": "warning",
	},
};

// Mock Sites
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

// Mock Events and Notifications
const mockEvents: AlertEvent[] = [
	{
		id: "evt-1",
		type: "triggered",
		description: "Temperature exceeded 8°C threshold",
		timestamp: "2024-01-15T08:45:00Z",
		actor: "system",
	},
	{
		id: "evt-2",
		type: "escalated",
		description: "Alert escalated after 30 minutes",
		timestamp: "2024-01-15T09:15:00Z",
		actor: "system",
	},
];

const mockNotifications: AlertNotification[] = [
	{
		id: "notif-1",
		channel: "email",
		recipientName: "John Smith",
		recipientEmail: "j.smith@company.com",
		timestamp: "2024-01-15T08:45:30Z",
		reason: "initial",
		deliveryStatus: "sent",
	},
];

// Mock Alerts
export const alerts: Alert[] = [
	{
		id: "alert-1",
		siteId: "site-1",
		equipmentId: "eq-1",
		sensorId: "s-4",
		name: "High Compressor Pressure",
		description: "Compressor pressure approaching critical threshold",
		severity: "high",
		status: "active",
		createdAt: "2024-01-15T08:45:00Z",
		events: mockEvents,
		notifications: mockNotifications,
	},
	{
		id: "alert-2",
		siteId: "site-1",
		equipmentId: "eq-3",
		sensorId: "s-10",
		name: "High Humidity Warning",
		description: "Humidity levels above optimal range",
		severity: "medium",
		status: "acknowledged",
		createdAt: "2024-01-15T09:15:00Z",
		acknowledgedAt: "2024-01-15T09:20:00Z",
	},
	{
		id: "alert-3",
		siteId: "site-2",
		equipmentId: "eq-4",
		sensorId: "s-13",
		name: "Freezer Temperature Critical",
		description: "Freezer temperature rising above safe limits",
		severity: "critical",
		status: "active",
		createdAt: "2024-01-15T07:30:00Z",
	},
	{
		id: "alert-4",
		siteId: "site-4",
		equipmentId: "eq-10",
		name: "Power Consumption Spike",
		description: "Unusual power consumption pattern detected",
		severity: "low",
		status: "active",
		createdAt: "2024-01-15T10:00:00Z",
	},
];

// Type for sensors in the mock data (extended for Sensor Metrics and filtering)
export type DashboardSensorType = "temperature" | "humidity" | "co2" | "pressure" | "energy" | "o2";

export interface MockSensor extends Sensor {
	type: DashboardSensorType;
	value?: number;
	unit: string;
	min?: number;
	max?: number;
	lastSeen?: string;
}

// Mock Sensors for reliability panel and Sensor Metrics (with readings for dashboard)
export const sensors: MockSensor[] = [
	{
		id: "s-1",
		name: "Internal Temp",
		status: "active",
		type: "temperature",
		value: -18.2,
		unit: "°C",
		min: -25,
		max: -15,
		lastSeen: "2024-01-15T02:30:00Z",
	},
	{
		id: "s-2",
		name: "Internal Temp",
		status: "active",
		type: "temperature",
		value: -19.1,
		unit: "°C",
		min: -25,
		max: -15,
		lastSeen: "2024-01-15T02:28:00Z",
	},
	{
		id: "s-3",
		name: "Supply Air Temp",
		status: "active",
		type: "temperature",
		value: 22.5,
		unit: "°C",
		min: 18,
		max: 28,
		lastSeen: "2024-01-15T02:25:00Z",
	},
	{
		id: "s-4",
		name: "Freezer Temp",
		status: "active",
		type: "temperature",
		value: -22.8,
		unit: "°C",
		min: -30,
		max: -20,
		lastSeen: "2024-01-15T02:20:00Z",
	},
	{
		id: "s-5",
		name: "Zone Temp",
		status: "active",
		type: "temperature",
		value: 21.2,
		unit: "°C",
		min: 18,
		max: 26,
		lastSeen: "2024-01-15T02:22:00Z",
	},
	{
		id: "s-6",
		name: "Chamber Temp",
		status: "active",
		type: "temperature",
		value: 4.2,
		unit: "°C",
		min: 2,
		max: 8,
		lastSeen: "2024-01-15T02:15:00Z",
	},
	{
		id: "s-7",
		name: "Chamber Temp",
		status: "active",
		type: "temperature",
		value: 4.8,
		unit: "°C",
		min: 2,
		max: 8,
		lastSeen: "2024-01-15T02:18:00Z",
	},
	{
		id: "s-8",
		name: "Panel Temp",
		status: "active",
		type: "temperature",
		value: 32.5,
		unit: "°C",
		min: 20,
		max: 45,
		lastSeen: "2024-01-15T02:12:00Z",
	},
	{
		id: "s-9",
		name: "Unmapped Temp Sensor",
		status: "active",
		type: "temperature",
		unit: "°C",
		lastSeen: "2024-01-15T12:06:00Z",
	},
	{
		id: "s-10",
		name: "Zone Temp 2",
		status: "active",
		type: "temperature",
		value: 20.8,
		unit: "°C",
		min: 18,
		max: 26,
		lastSeen: "2024-01-15T02:20:00Z",
	},
	{
		id: "s-11",
		name: "Humidity Sensor A",
		status: "active",
		type: "humidity",
		value: 52,
		unit: "%",
		min: 30,
		max: 70,
		lastSeen: "2024-01-15T02:18:00Z",
	},
	{
		id: "s-12",
		name: "Humidity Sensor B",
		status: "active",
		type: "humidity",
		value: 48,
		unit: "%",
		min: 30,
		max: 70,
		lastSeen: "2024-01-15T02:20:00Z",
	},
	{
		id: "s-13",
		name: "Pressure Sensor A",
		status: "active",
		type: "pressure",
		value: 101.3,
		unit: "kPa",
		min: 95,
		max: 110,
		lastSeen: "2024-01-15T02:25:00Z",
	},
	{
		id: "s-14",
		name: "CO₂ Sensor A",
		status: "active",
		type: "co2",
		value: 450,
		unit: "ppm",
		min: 350,
		max: 1000,
		lastSeen: "2024-01-15T02:22:00Z",
	},
	{
		id: "s-15",
		name: "Energy Meter E",
		status: "warning",
		type: "energy",
		value: 12.5,
		unit: "kW",
		min: 0,
		max: 20,
		lastSeen: "2024-01-15T02:10:00Z",
	},
	{
		id: "s-16",
		name: "O₂ Sensor",
		status: "active",
		type: "o2",
		value: 20.9,
		unit: "%",
		min: 19.5,
		max: 23,
		lastSeen: "2024-01-15T02:28:00Z",
	},
];

// Mock AI Insights
export const agentInsights: AgentInsight[] = [
	{
		id: "insight-1",
		description: "Freezer Bank 1 shows indicators of compressor degradation.",
		severity: "critical",
		timeHorizon: "24-48 hours",
		createdAt: "2024-01-15T06:00:00Z",
	},
	{
		id: "insight-2",
		description: "Energy consumption at North DC trending 15% above baseline.",
		severity: "high",
		timeHorizon: "7 days",
		createdAt: "2024-01-15T05:30:00Z",
	},
	{
		id: "insight-3",
		description: "Humidity sensors in Zone B showing calibration drift.",
		severity: "medium",
		createdAt: "2024-01-14T22:00:00Z",
	},
	{
		id: "insight-4",
		description: "All refrigeration units operating within optimal parameters.",
		severity: "low",
		createdAt: "2024-01-14T18:00:00Z",
	},
];
