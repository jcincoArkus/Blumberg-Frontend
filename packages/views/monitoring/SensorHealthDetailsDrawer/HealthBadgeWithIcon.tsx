import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

type HealthStatus = "healthy" | "stale" | "silent" | "offline" | "warning" | "critical";

const CONFIG: Record<
	HealthStatus,
	{ label: string; className: string; icon: typeof CheckCircle2 }
> = {
	healthy: {
		label: t`Healthy`,
		className:
			"bg-emerald-100 dark:bg-success-subtle text-emerald-700 dark:text-success-foreground border-emerald-200 dark:border-success-border",
		icon: CheckCircle2,
	},
	stale: {
		label: t`Stale`,
		className: "bg-amber-100 dark:bg-warning-subtle text-warning-foreground border-warning-border",
		icon: Clock,
	},
	silent: {
		label: t`Silent`,
		className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
		icon: XCircle,
	},
	offline: {
		label: t`Offline`,
		className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
		icon: XCircle,
	},
	warning: {
		label: t`Warning`,
		className: "bg-amber-100 dark:bg-warning-subtle text-warning-foreground border-warning-border",
		icon: AlertTriangle,
	},
	critical: {
		label: t`Critical`,
		className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
		icon: XCircle,
	},
};

interface HealthBadgeWithIconProps {
	status?: HealthStatus | null;
}

export function HealthBadgeWithIcon({ status }: HealthBadgeWithIconProps) {
	if (!status) {
		return (
			<Badge
				variant="outline"
				className="bg-muted text-slate-700 dark:text-foreground border-border"
			>
				{t`Unknown`}
			</Badge>
		);
	}
	const cfg = CONFIG[status];
	const Icon = cfg.icon;
	return (
		<Badge variant="outline" className={cn("border font-semibold", cfg.className)}>
			<Icon className="size-3 mr-1" />
			{cfg.label}
		</Badge>
	);
}
