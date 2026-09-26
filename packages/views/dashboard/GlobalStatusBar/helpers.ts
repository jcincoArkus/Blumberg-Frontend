import { AlertCircle, CheckCircle2 } from "lucide-react";

import { t } from "~@/i18n/macro";

import type { Alert } from "../../alerts/types";
import type { AlertSeverityKey } from "./types";

export function getStatusConfig(status: "healthy" | "degraded" | "critical") {
	const configs = {
		healthy: {
			icon: CheckCircle2,
			label: t`Healthy`,
			iconClassName: "text-emerald-600 dark:text-success",
			className:
				"text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-success dark:bg-success-subtle dark:border-success-border",
		},
		degraded: {
			icon: AlertCircle,
			label: t`Degraded`,
			iconClassName: "text-amber-600 dark:text-warning",
			className:
				"text-amber-600 bg-amber-50 border-amber-200 dark:text-warning dark:bg-warning-subtle dark:border-warning-border",
		},
		critical: {
			icon: AlertCircle,
			label: t`Critical`,
			iconClassName: "text-danger",
			className: "text-danger bg-danger-subtle border-danger-border",
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
