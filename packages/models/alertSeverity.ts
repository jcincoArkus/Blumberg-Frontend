import type { LucideIcon } from "lucide-react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import { t } from "~@/i18n/macro";

/**
 * Single source of truth for alert severity.
 * When the backend adds a new AlertSeverity enum value:
 * 1. Add its lowercase key here to SEVERITY_ORDER (position = sort order, 0 = most severe).
 * 2. Add an entry in getSeverityConfig() with the same key (label, icon, className, dot).
 * No other frontend changes should be needed: type, normalize, sort order, and UI config all derive from this file.
 */

/** Display order (0 = most severe). Add new backend severities here. */
export const SEVERITY_ORDER = ["critical", "warning", "info"] as const;

export type AlertSeverity = (typeof SEVERITY_ORDER)[number];

export interface SeverityConfigItem {
	icon: LucideIcon;
	label: string;
	className: string;
	dot: string;
}

/** UI config per severity. Add new backend severities here with the same key as in SEVERITY_ORDER. */
export function getSeverityConfig(): Record<AlertSeverity, SeverityConfigItem> {
	return {
		critical: {
			icon: AlertCircle,
			label: t`Critical`,
			className: "bg-red-100 text-red-700 border-red-300",
			dot: "bg-red-600",
		},
		warning: {
			icon: AlertTriangle,
			label: t`Warning`,
			className: "bg-orange-100 text-orange-700 border-orange-300",
			dot: "bg-orange-600",
		},
		info: {
			icon: Info,
			label: t`Info`,
			className: "bg-blue-100 text-blue-700 border-blue-300",
			dot: "bg-blue-600",
		},
	};
}

/** Sort order (lower = more severe). Unknown severities sort last. */
export function getSeverityOrder(severity: string): number {
	const i = SEVERITY_ORDER.indexOf(severity as AlertSeverity);
	return i >= 0 ? i : SEVERITY_ORDER.length;
}

/** Backend enum value (e.g. "Critical") → frontend AlertSeverity. Unknown values map to "info". */
export function normalizeSeverity(apiValue: string | null | undefined): AlertSeverity {
	const s = (apiValue ?? "").toLowerCase();
	if (SEVERITY_ORDER.includes(s as AlertSeverity)) return s as AlertSeverity;
	return "info";
}
