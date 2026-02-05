import type { FC } from "react";

import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

interface StatusSummaryProps {
	healthyPercentage: number;
	hasIssues: boolean;
}

export const StatusSummary: FC<StatusSummaryProps> = ({ healthyPercentage, hasIssues }) => {
	return (
		<div className="flex items-center justify-between">
			<h3 className="text-sm font-semibold leading-tight">{t`Sensor Status`}</h3>
			<Badge
				variant="outline"
				className={cn(
					"text-xs",
					hasIssues ? "border-amber-300 text-amber-700" : "border-emerald-300 text-emerald-700",
				)}
			>
				{healthyPercentage}%
			</Badge>
		</div>
	);
};
