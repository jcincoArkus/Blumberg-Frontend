import type { AlertSeverity } from "~@/models";

export type AlertStatus = "active" | "acknowledged" | "resolved";

export type { AlertSeverity };

export interface AlertEvent {
	id: string;
	type: "triggered" | "escalated" | "acknowledged" | "resolved" | "note" | "system_update";
	timestamp: string;
	description: string;
	actor?: string;
}

export interface AlertNotification {
	id: string;
	recipientName?: string;
	recipientEmail: string;
	channel: "email" | "sms" | "push";
	reason: string;
	timestamp: string;
	deliveryStatus?: "pending" | "sent" | "delivered" | "failed";
}

export interface Alert {
	id: string;
	name: string;
	description: string;
	severity: AlertSeverity;
	status: AlertStatus;
	createdAt: string;
	acknowledgedAt?: string;
	resolvedAt?: string;
	equipmentId?: string;
	sensorId?: string;
	siteId?: string;
	events?: AlertEvent[];
	notifications?: AlertNotification[];
}
