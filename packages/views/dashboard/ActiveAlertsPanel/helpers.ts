import type { LucideIcon } from "lucide-react";
import {
	Activity,
	AlertCircle,
	AlertTriangle,
	Droplets,
	Gauge,
	Info,
	Settings,
	Thermometer,
	Wind,
	Wrench,
} from "lucide-react";

export function formatDuration(createdAt: string): string {
	const now = new Date();
	const created = new Date(createdAt);
	const diffMs = now.getTime() - created.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
	if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
	return `${diffMins}m`;
}

/** Mockup-style relative time, e.g. "2h41m ago" */
export function formatDurationAgo(createdAt: string): string {
	const d = formatDuration(createdAt);
	return d ? `${d} ago` : "";
}

/** Map alert name/type to icon (mockup: thermometer, gauge, cloud, droplet, wrench, etc.) */
export function getSensorIcon(_alertName: string): LucideIcon {
	const name = _alertName.toLowerCase();
	if (name.includes("temperature") || name.includes("temp") || name.includes("freezer"))
		return Thermometer;
	if (name.includes("pressure") || name.includes("compressor")) return Gauge;
	if (
		name.includes("air") ||
		name.includes("climate") ||
		name.includes("aqi") ||
		name.includes("co2") ||
		name.includes("co₂")
	)
		return Wind;
	if (name.includes("humidity") || name.includes("moisture")) return Droplets;
	if (name.includes("maintenance") || name.includes("service") || name.includes("repair"))
		return Wrench;
	if (name.includes("energy") || name.includes("power") || name.includes("consumption"))
		return Activity;
	return Settings;
}

export function getSeverityIcon(severity: string) {
	switch (severity) {
		case "critical":
			return AlertTriangle;
		case "high":
			return AlertCircle;
		default:
			return Info;
	}
}

/** Row styling by severity (backend: Critical, Warning, Info). */
export function getSeverityStyle(severity: string) {
	switch (severity) {
		case "critical":
			return {
				bg: "bg-red-50",
				border: "border-l-4 border-red-600",
				iconBg: "bg-red-100",
				iconColor: "text-red-600",
				badgeBg: "bg-red-600",
				badgeText: "text-white",
			};
		case "warning":
			return {
				bg: "bg-orange-50",
				border: "border-l-4 border-orange-500",
				iconBg: "bg-orange-100",
				iconColor: "text-orange-600",
				badgeBg: "bg-orange-500",
				badgeText: "text-white",
			};
		default:
			// info
			return {
				bg: "bg-slate-50",
				border: "border-l-4 border-slate-400",
				iconBg: "bg-slate-100",
				iconColor: "text-slate-600",
				badgeBg: "bg-blue-500",
				badgeText: "text-white",
			};
	}
}

export function getSeverityColor(severity: string) {
	switch (severity) {
		case "critical":
			return "text-red-700 bg-red-50 border-red-200";
		case "warning":
			return "text-orange-700 bg-orange-50 border-orange-200";
		default:
			return "text-slate-700 bg-slate-50 border-slate-200";
	}
}

export function getBadgeClassName(severity: string) {
	switch (severity) {
		case "critical":
			return "bg-red-600 text-white border-0";
		case "warning":
			return "bg-orange-500 text-white border-0";
		default:
			return "bg-blue-500 text-white border-0";
	}
}

export function getTextColor(severity: string) {
	switch (severity) {
		case "critical":
			return "text-red-700";
		case "warning":
			return "text-orange-700";
		default:
			return "text-slate-700";
	}
}
