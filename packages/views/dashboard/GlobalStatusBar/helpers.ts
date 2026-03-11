import { AlertCircle, CheckCircle2 } from "lucide-react";

import { t } from "~@/i18n/macro";

import type { Alert } from "../../alerts/types";
import type { AlertSeverityKey } from "./types";

export function getStatusConfig(status: "healthy" | "degraded" | "critical") {
	const configs = {
		healthy: {
			icon: CheckCircle2,
			label: t`Healthy`,
			className: "text-emerald-600 bg-emerald-50 border-emerald-200",
		},
		degraded: {
			icon: AlertCircle,
			label: t`Degraded`,
			className: "text-amber-600 bg-amber-50 border-amber-200",
		},
		critical: {
			icon: AlertCircle,
			label: t`Critical`,
			className: "text-red-600 bg-red-50 border-red-200",
		},
	};
	return configs[status];
}

export function getCurrentTime() {
	return new Date().toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

export function getFirstAlertBySeverity(alerts: Alert[], severity: AlertSeverityKey): Alert | null {
	const severityAlerts = alerts.filter(
		(a) => (a.status === "active" || a.status === "acknowledged") && a.severity === severity,
	);
	return severityAlerts.length > 0 ? severityAlerts[0] : null;
}
