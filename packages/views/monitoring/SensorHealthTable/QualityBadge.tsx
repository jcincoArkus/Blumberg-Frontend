import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

import { QUALITY_BADGE_CONFIG } from "./constants";

type QualityStatus = keyof typeof QUALITY_BADGE_CONFIG;

interface QualityBadgeProps {
	status?: QualityStatus | null;
}

export function QualityBadge({ status }: QualityBadgeProps) {
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
	const cfg = QUALITY_BADGE_CONFIG[status];
	return (
		<Badge variant="outline" className={cn("border", cfg.className)}>
			{cfg.label}
		</Badge>
	);
}
