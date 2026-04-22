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
			<Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
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
