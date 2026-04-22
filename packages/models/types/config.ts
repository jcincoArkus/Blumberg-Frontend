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

export interface SensorTypeOption {
	value: SensorType;
	label: string;
	unit: string;
}

export interface TimeOption {
	value: number;
	label: string;
}

export interface AlertingSite {
	id: string;
	name: string;
	location: string;
}

export interface AlertingEquipment {
	id: string;
	name: string;
	type: string;
}
