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
		className: "bg-emerald-100 text-emerald-700 border-emerald-200",
		icon: CheckCircle2,
	},
	stale: {
		label: t`Stale`,
		className: "bg-amber-100 text-amber-700 border-amber-200",
		icon: Clock,
	},
	silent: {
		label: t`Silent`,
		className: "bg-red-100 text-red-700 border-red-200",
		icon: XCircle,
	},
	offline: {
		label: t`Offline`,
		className: "bg-red-100 text-red-700 border-red-200",
		icon: XCircle,
	},
	warning: {
		label: t`Warning`,
		className: "bg-amber-100 text-amber-700 border-amber-200",
		icon: AlertTriangle,
	},
	critical: {
		label: t`Critical`,
		className: "bg-red-100 text-red-700 border-red-200",
		icon: XCircle,
	},
};

interface HealthBadgeWithIconProps {
	status?: HealthStatus | null;
}

export function HealthBadgeWithIcon({ status }: HealthBadgeWithIconProps) {
	if (!status) {
		return (
			<Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
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
