import { AlertCircle, AlertTriangle, Info } from "lucide-react";

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

export function getSeverityColor(severity: string) {
	switch (severity) {
		case "critical":
			return "text-red-700 bg-red-50 border-red-200";
		case "high":
			return "text-orange-700 bg-orange-50 border-orange-200";
		case "medium":
			return "text-amber-700 bg-amber-50 border-amber-200";
		default:
			return "text-slate-700 bg-slate-50 border-slate-200";
	}
}

export function getBadgeClassName(severity: string) {
	switch (severity) {
		case "critical":
			return "bg-red-600 text-white border-0";
		case "high":
			return "bg-orange-100 text-orange-900 border-0";
		case "medium":
			return "bg-amber-100 text-amber-900 border-0";
		default:
			return "bg-slate-100 text-slate-900 border-0";
	}
}

export function getTextColor(severity: string) {
	switch (severity) {
		case "critical":
			return "text-red-700";
		case "high":
			return "text-orange-700";
		case "medium":
			return "text-amber-700";
		default:
			return "text-slate-700";
	}
}
