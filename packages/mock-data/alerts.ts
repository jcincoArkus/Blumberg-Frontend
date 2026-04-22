import type { Alert, AlertEvent, AlertNotification } from "~@/models";

// Equipment lookup
const equipmentMap: Record<string, string> = {
	"eq-1": "Compressor Unit A",
	"eq-2": "HVAC System B",
	"eq-3": "Dehumidifier C",
	"eq-4": "Freezer Bank 1",
	"eq-5": "Chiller Unit D",
	"eq-10": "Power Distribution Unit",
};

// Sensor lookup
const sensorMap: Record<string, { name: string; type: string }> = {
	"s-1": { name: "Temp Sensor A", type: "temperature" },
	"s-2": { name: "Humidity Sensor B", type: "humidity" },
	"s-3": { name: "CO2 Sensor C", type: "co2" },
	"s-4": { name: "Pressure Sensor D", type: "pressure" },
	"s-5": { name: "Energy Meter E", type: "energy" },
	"s-10": { name: "Humidity Sensor Zone B", type: "humidity" },
	"s-13": { name: "Freezer Temp Probe", type: "temperature" },
};

// Helper functions
export function getEquipmentName(equipmentId: string): string {
	return equipmentMap[equipmentId] || "Unknown Equipment";
}

export function getSensorName(sensorId: string): string {
	return sensorMap[sensorId]?.name || "Unknown Sensor";
}

export function getSensorType(sensorId: string): string {
	return sensorMap[sensorId]?.type || "unknown";
}

export function calculateAlertDuration(alert: Alert): string {
	const start = new Date(alert.createdAt);
	const end = alert.resolvedAt ? new Date(alert.resolvedAt) : new Date();
	const diffMs = end.getTime() - start.getTime();

	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

// Mock Events and Notifications for more detailed alerts
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
	{
		id: "evt-3",
		type: "acknowledged",
		description: "Alert acknowledged by operator",
		timestamp: "2024-01-15T09:20:00Z",
		actor: "John Smith",
	},
];

const mockNotifications: AlertNotification[] = [
	{
		id: "notif-1",
		channel: "email",
		recipientName: "John Smith",
		recipientEmail: "j.smith@company.com",
		timestamp: "2024-01-15T08:45:30Z",
		reason: "Initial alert notification",
		deliveryStatus: "delivered",
	},
	{
		id: "notif-2",
		channel: "sms",
		recipientName: "Jane Doe",
		recipientEmail: "j.doe@company.com",
		timestamp: "2024-01-15T09:15:30Z",
		reason: "Escalation notification",
		deliveryStatus: "delivered",
	},
];

// Extended alerts for the work queue
export const alertsData: Alert[] = [
	{
		id: "alert-1",
		siteId: "site-1",
		equipmentId: "eq-1",
		sensorId: "s-4",
		name: "High Compressor Pressure",
		description:
			"Compressor pressure approaching critical threshold - immediate attention required",
		severity: "warning",
		status: "active",
		createdAt: "2024-01-15T08:45:00Z",
		events: mockEvents.slice(0, 2),
		notifications: mockNotifications.slice(0, 1),
	},
	{
		id: "alert-2",
		siteId: "site-1",
		equipmentId: "eq-3",
		sensorId: "s-10",
		name: "High Humidity Warning",
		description: "Humidity levels above optimal range in Zone B storage area",
		severity: "warning",
		status: "acknowledged",
		createdAt: "2024-01-15T09:15:00Z",
		acknowledgedAt: "2024-01-15T09:20:00Z",
		events: mockEvents,
		notifications: mockNotifications,
	},
	{
		id: "alert-3",
		siteId: "site-2",
		equipmentId: "eq-4",
		sensorId: "s-13",
		name: "Freezer Temperature Critical",
		description: "Freezer Bank 1 temperature rising above safe limits - potential product loss",
		severity: "critical",
		status: "active",
		createdAt: "2024-01-15T07:30:00Z",
		events: mockEvents.slice(0, 1),
		notifications: mockNotifications.slice(0, 1),
	},
	{
		id: "alert-4",
		siteId: "site-4",
		equipmentId: "eq-10",
		sensorId: "s-5",
		name: "Power Consumption Spike",
		description: "Unusual power consumption pattern detected on PDU main circuit",
		severity: "info",
		status: "active",
		createdAt: "2024-01-15T10:00:00Z",
	},
	{
		id: "alert-5",
		siteId: "site-1",
		equipmentId: "eq-2",
		sensorId: "s-1",
		name: "HVAC Temperature Variance",
		description: "HVAC system showing temperature control variance beyond normal range",
		severity: "warning",
		status: "resolved",
		createdAt: "2024-01-14T14:30:00Z",
		acknowledgedAt: "2024-01-14T14:45:00Z",
		resolvedAt: "2024-01-14T16:00:00Z",
	},
];
