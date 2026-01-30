// Alerting Configuration Mock Data

export type SensorType = "temperature" | "humidity" | "co2" | "o2" | "pressure" | "energy";
export type AlertRuleSeverity = "warning" | "alert";
export type AlertRuleScopeType = "all" | "sites" | "equipment";
export type NotificationChannel = "email" | "sms" | "push" | "webhook";

export interface AlertRuleNotification {
	channel: NotificationChannel;
	recipientName?: string;
	recipientEmail: string;
	reason?: string;
}

export interface AlertRuleScope {
	type: AlertRuleScopeType;
	siteIds?: string[];
	equipmentIds?: string[];
}

export interface AlertRuleThresholds {
	min?: number;
	max?: number;
	unit: string;
}

export interface AlertRule {
	id: string;
	name: string;
	description?: string;
	enabled: boolean;
	sensorTypes: SensorType[];
	scope: AlertRuleScope;
	thresholds: AlertRuleThresholds;
	minOutOfRangeSeconds: number;
	severity: AlertRuleSeverity;
	notifications: AlertRuleNotification[];
	cooldownMinutes?: number;
	createdAt: string;
	updatedAt: string;
}

// Sensor type options for the editor form
export const sensorTypeOptions: { value: SensorType; label: string; unit: string }[] = [
	{ value: "temperature", label: "Temperature", unit: "°C" },
	{ value: "humidity", label: "Humidity", unit: "%" },
	{ value: "co2", label: "CO2", unit: "ppm" },
	{ value: "o2", label: "O2", unit: "%" },
	{ value: "pressure", label: "Pressure", unit: "PSI" },
	{ value: "energy", label: "Energy", unit: "kW" },
];

// Time out of range options
export const timeOptions = [
	{ value: 30, label: "30 seconds" },
	{ value: 60, label: "1 minute" },
	{ value: 120, label: "2 minutes" },
	{ value: 300, label: "5 minutes" },
	{ value: 600, label: "10 minutes" },
];

// Sites data for scope selection
export const sites = [
	{ id: "site-1", name: "North Distribution Center", location: "Chicago, IL" },
	{ id: "site-2", name: "West Coast Warehouse", location: "Los Angeles, CA" },
	{ id: "site-3", name: "East Regional Hub", location: "Atlanta, GA" },
	{ id: "site-4", name: "South Central Facility", location: "Dallas, TX" },
];

// Equipment data for scope selection
export const equipment = [
	{ id: "eq-1", name: "Compressor Unit A", type: "HVAC" },
	{ id: "eq-2", name: "Freezer Bank 1", type: "Refrigeration" },
	{ id: "eq-3", name: "HVAC System B", type: "Climate" },
	{ id: "eq-4", name: "Chiller Unit D", type: "Refrigeration" },
	{ id: "eq-5", name: "Air Handler E", type: "Climate" },
	{ id: "eq-6", name: "Cold Storage F", type: "Refrigeration" },
	{ id: "eq-7", name: "Backup Generator", type: "Energy" },
	{ id: "eq-8", name: "Main Freezer", type: "Refrigeration" },
	{ id: "eq-9", name: "Power Distribution Unit", type: "Energy" },
];

// Mock alert rules
export const alertRules: AlertRule[] = [
	{
		id: "rule-1",
		name: "High Temperature Alert",
		description: "Alert when temperature exceeds safe operating range",
		enabled: true,
		sensorTypes: ["temperature"],
		scope: { type: "all" },
		thresholds: { min: 2, max: 8, unit: "°C" },
		minOutOfRangeSeconds: 120,
		severity: "alert",
		notifications: [
			{
				channel: "email",
				recipientName: "Operations Team",
				recipientEmail: "ops@blumberg.com",
				reason: "Critical threshold exceeded",
			},
		],
		cooldownMinutes: 15,
		createdAt: "2024-01-10T08:00:00Z",
		updatedAt: "2024-01-12T10:30:00Z",
	},
	{
		id: "rule-2",
		name: "CO2 Level Warning",
		description: "Warn when CO2 levels approach unsafe levels",
		enabled: true,
		sensorTypes: ["co2"],
		scope: { type: "sites", siteIds: ["site-1", "site-2"] },
		thresholds: { min: 350, max: 1000, unit: "ppm" },
		minOutOfRangeSeconds: 300,
		severity: "warning",
		notifications: [
			{
				channel: "email",
				recipientName: "Safety Team",
				recipientEmail: "safety@blumberg.com",
				reason: "Air quality concern",
			},
		],
		createdAt: "2024-01-08T09:00:00Z",
		updatedAt: "2024-01-08T09:00:00Z",
	},
	{
		id: "rule-3",
		name: "Humidity Range Monitor",
		description: "Monitor humidity levels in climate-controlled areas",
		enabled: true,
		sensorTypes: ["humidity"],
		scope: { type: "equipment", equipmentIds: ["eq-3", "eq-5"] },
		thresholds: { min: 30, max: 60, unit: "%" },
		minOutOfRangeSeconds: 180,
		severity: "warning",
		notifications: [
			{
				channel: "email",
				recipientName: "Climate Control",
				recipientEmail: "climate@blumberg.com",
			},
		],
		cooldownMinutes: 30,
		createdAt: "2024-01-05T14:00:00Z",
		updatedAt: "2024-01-11T16:20:00Z",
	},
	{
		id: "rule-4",
		name: "Freezer Temperature Critical",
		description: "Critical alert for freezer temperature deviation",
		enabled: true,
		sensorTypes: ["temperature"],
		scope: { type: "equipment", equipmentIds: ["eq-2", "eq-8"] },
		thresholds: { min: -25, max: -18, unit: "°C" },
		minOutOfRangeSeconds: 60,
		severity: "alert",
		notifications: [
			{
				channel: "email",
				recipientName: "Freezer Team",
				recipientEmail: "freezer@blumberg.com",
				reason: "Freezer temp out of range",
			},
			{
				channel: "email",
				recipientName: "Backup Contact",
				recipientEmail: "backup@blumberg.com",
			},
		],
		cooldownMinutes: 5,
		createdAt: "2024-01-02T11:00:00Z",
		updatedAt: "2024-01-15T09:45:00Z",
	},
	{
		id: "rule-5",
		name: "Energy Consumption Warning",
		description: "Alert on unusual energy consumption patterns",
		enabled: false,
		sensorTypes: ["energy"],
		scope: { type: "all" },
		thresholds: { max: 500, unit: "kW" },
		minOutOfRangeSeconds: 600,
		severity: "warning",
		notifications: [
			{
				channel: "email",
				recipientName: "Energy Manager",
				recipientEmail: "energy@blumberg.com",
			},
		],
		createdAt: "2024-01-01T08:00:00Z",
		updatedAt: "2024-01-01T08:00:00Z",
	},
];

// Helper functions
export function getSiteById(id: string) {
	return sites.find((s) => s.id === id);
}

export function getEquipmentById(id: string) {
	return equipment.find((e) => e.id === id);
}

export function getEquipmentName(id: string): string {
	return equipment.find((e) => e.id === id)?.name || id;
}

export function formatDuration(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
	return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function getScopeLabel(scope: AlertRuleScope): string {
	if (scope.type === "all") return "All Equipment";
	if (scope.type === "sites") {
		const siteNames =
			scope.siteIds?.map((id) => getSiteById(id)?.name || id).join(", ") || "Unknown";
		return `Sites: ${siteNames}`;
	}
	if (scope.type === "equipment") {
		const eqNames = scope.equipmentIds?.map((id) => getEquipmentName(id)).join(", ") || "Unknown";
		return `Equipment: ${eqNames}`;
	}
	return "Unknown";
}

export function getThresholdsSummary(thresholds: AlertRuleThresholds): string {
	if (thresholds.min !== undefined && thresholds.max !== undefined) {
		return `${thresholds.min} - ${thresholds.max} ${thresholds.unit}`;
	}
	if (thresholds.min !== undefined) {
		return `≥ ${thresholds.min} ${thresholds.unit}`;
	}
	if (thresholds.max !== undefined) {
		return `≤ ${thresholds.max} ${thresholds.unit}`;
	}
	return "N/A";
}
