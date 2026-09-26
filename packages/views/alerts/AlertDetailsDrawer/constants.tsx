import { Activity, AlertTriangle, CheckCircle2, Info, Server } from "lucide-react";

import { t } from "~@/i18n/macro";

export const getEventTypeConfig = () => ({
	triggered: { icon: Activity, label: t`Triggered`, color: "text-danger" },
	escalated: {
		icon: AlertTriangle,
		label: t`Escalated`,
		color: "text-orange-600 dark:text-orange-400",
	},
	acknowledged: {
		icon: CheckCircle2,
		label: t`Acknowledged`,
		color: "text-amber-600 dark:text-warning",
	},
	resolved: { icon: CheckCircle2, label: t`Resolved`, color: "text-emerald-600 dark:text-success" },
	note: { icon: Info, label: t`Note`, color: "text-info" },
	system_update: { icon: Server, label: t`System Update`, color: "text-muted-foreground" },
});

export const getNotificationReasonLabels = (): Record<string, string> => ({
	escalation_rule: t`Escalation Rule`,
	severity_threshold: t`Severity Threshold`,
	on_call_rotation: t`On-Call Rotation`,
	manual_notify: t`Manual Notification`,
	system_alert: t`System Alert`,
});
