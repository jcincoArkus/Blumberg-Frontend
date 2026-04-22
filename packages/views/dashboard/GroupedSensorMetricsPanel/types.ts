import type { ComponentType } from "react";

export interface SensorWithReading {
	id: string;
	name: string;
	type: string;
	status: string;
	value?: number;
	unit: string;
	min?: number;
	max?: number;
	lastSeen?: string;
}

export type SensorValueStatus = "OK" | "Warning" | "Alert";

export interface SensorStatusInfo {
	icon: ComponentType<{ className?: string }>;
	color: string;
	bgColor: string;
	borderColor: string;
	label: string;
}

export interface SensorLimits {
	min: number;
	max: number;
	warningMin: number;
	warningMax: number;
}

export interface SensorTypeConfig {
	icon: ComponentType<{ className?: string }>;
	label: string;
}
