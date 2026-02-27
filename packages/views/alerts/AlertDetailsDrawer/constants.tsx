import { Activity, AlertCircle, AlertTriangle, CheckCircle2, Info, Server } from "lucide-react";

import { t } from "~@/i18n/macro";

export const getSeverityConfig = () => ({
	critical: {
		icon: AlertCircle,
		label: t`Critical`,
		className: "bg-red-100 text-red-700 border-red-300",
		dot: "bg-red-600",
	},
	high: {
		icon: AlertTriangle,
		label: t`Alert`,
		className: "bg-orange-100 text-orange-700 border-orange-300",
		dot: "bg-orange-600",
	},
	medium: {
		icon: AlertTriangle,
		label: t`Warning`,
		className: "bg-amber-100 text-amber-700 border-amber-300",
		dot: "bg-amber-600",
	},
	low: {
		icon: Info,
		label: t`Warning`,
		className: "bg-blue-100 text-blue-700 border-blue-300",
		dot: "bg-blue-600",
	},
});

export const getEventTypeConfig = () => ({
	triggered: { icon: Activity, label: t`Triggered`, color: "text-red-600" },
	escalated: { icon: AlertTriangle, label: t`Escalated`, color: "text-orange-600" },
	acknowledged: { icon: CheckCircle2, label: t`Acknowledged`, color: "text-amber-600" },
	resolved: { icon: CheckCircle2, label: t`Resolved`, color: "text-emerald-600" },
	note: { icon: Info, label: t`Note`, color: "text-blue-600" },
	system_update: { icon: Server, label: t`System Update`, color: "text-slate-600" },
});

export const getNotificationReasonLabels = (): Record<string, string> => ({
	escalation_rule: t`Escalation Rule`,
	severity_threshold: t`Severity Threshold`,
	on_call_rotation: t`On-Call Rotation`,
	manual_notify: t`Manual Notification`,
	system_alert: t`System Alert`,
});
