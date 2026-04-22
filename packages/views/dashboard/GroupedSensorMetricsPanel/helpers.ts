import { AlertCircle, CheckCircle2 } from "lucide-react";

import type { SensorLimits, SensorStatusInfo, SensorValueStatus, SensorWithReading } from "./types";

export function getSensorLimits(sensor: SensorWithReading): SensorLimits {
	const min = sensor.min ?? 0;
	const max = sensor.max ?? 100;
	return {
		min,
		max,
		warningMin: min + (max - min) * 0.1,
		warningMax: max - (max - min) * 0.1,
	};
}

export function getSensorStatusFromValue(
	sensor: SensorWithReading,
	value: number,
): SensorValueStatus {
	if (sensor.min === undefined || sensor.max === undefined) {
		return "OK";
	}
	const limits = getSensorLimits(sensor);
	if (value < limits.warningMin || value > limits.warningMax) {
		if (value < sensor.min || value > sensor.max) {
			return "Alert";
		}
		return "Warning";
	}
	return "OK";
}

export function getSensorStatus(sensor: SensorWithReading): SensorStatusInfo {
	const value = sensor.value ?? 0;
	const status = getSensorStatusFromValue(sensor, value);
	return statusToInfo(status);
}

/**
 * Status for sensor card: when the sensor has active alerts, show Alert so the card
 * reflects the same reality as the Active Alerts section.
 */
export function getSensorStatusForCard(
	sensor: SensorWithReading,
	alertsCount: number,
): SensorStatusInfo {
	if (alertsCount > 0) {
		return statusToInfo("Alert");
	}
	return getSensorStatus(sensor);
}

function statusToInfo(status: SensorValueStatus): SensorStatusInfo {
	if (status === "Alert") {
		return {
			icon: AlertCircle,
			color: "text-red-600",
			bgColor: "bg-red-50",
			borderColor: "border-red-200",
			label: "Alert",
		};
	}
	if (status === "Warning") {
		return {
			icon: AlertCircle,
			color: "text-amber-600",
			bgColor: "bg-amber-50",
			borderColor: "border-amber-200",
			label: "Warning",
		};
	}
	return {
		icon: CheckCircle2,
		color: "text-emerald-600",
		bgColor: "bg-emerald-50",
		borderColor: "border-emerald-200",
		label: "OK",
	};
}

export function formatTime(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}
