import type { AgentInsight, Alert, AlertEvent, AlertNotification, Sensor, Site } from "~@/views";

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

// Type for sensors in the mock data (extended for filtering)
type SensorType = "temperature" | "humidity" | "co2" | "pressure" | "energy";

interface MockSensor extends Sensor {
	type: SensorType;
}

// Mock Sensors for reliability panel
export const sensors: MockSensor[] = [
	{ id: "s-1", name: "Temp Sensor A", status: "active", type: "temperature" },
	{ id: "s-2", name: "Humidity Sensor B", status: "active", type: "humidity" },
	{ id: "s-3", name: "CO2 Sensor C", status: "offline", type: "co2" },
	{ id: "s-4", name: "Pressure Sensor D", status: "stale", type: "pressure" },
	{ id: "s-5", name: "Energy Meter E", status: "warning", type: "energy" },
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
