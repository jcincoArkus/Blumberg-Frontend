import { Activity, Droplets, Gauge, Thermometer, Wind } from "lucide-react";

import type { SensorTypeConfig } from "./types";

export const sensorTypeConfig: Record<string, SensorTypeConfig> = {
	temperature: { icon: Thermometer, label: "Temperature" },
	pressure: { icon: Gauge, label: "Pressure" },
	humidity: { icon: Droplets, label: "Humidity" },
	co2: { icon: Wind, label: "CO₂" },
	o2: { icon: Wind, label: "O₂" },
	energy: { icon: Activity, label: "Energy" },
};

export function getSensorTypeConfig(type: string): SensorTypeConfig {
	return (
		sensorTypeConfig[type] ?? {
			icon: Activity,
			label: type.charAt(0).toUpperCase() + type.slice(1),
		}
	);
}
