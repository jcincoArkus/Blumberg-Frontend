import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

import { HEALTH_BADGE_CONFIG } from "./constants";

type HealthStatus = keyof typeof HEALTH_BADGE_CONFIG;

interface HealthBadgeProps {
	status?: HealthStatus | null;
}

export function HealthBadge({ status }: HealthBadgeProps) {
	if (!status) {
		return (
			<Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
				{t`Unknown`}
			</Badge>
		);
	}
	const cfg = HEALTH_BADGE_CONFIG[status];
	return (
		<Badge variant="outline" className={cn("border font-semibold", cfg.className)}>
			{cfg.label}
		</Badge>
	);
}
