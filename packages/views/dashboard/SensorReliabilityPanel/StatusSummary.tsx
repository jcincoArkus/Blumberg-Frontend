import type { FC } from "react";

import { t } from "~@/i18n/macro";
import { Badge } from "~@/ui";

interface StatusSummaryProps {
	healthyPercentage: number;
	hasIssues: boolean;
}

export const StatusSummary: FC<StatusSummaryProps> = ({ healthyPercentage }) => {
	return (
		<div className="flex items-center justify-between">
			<h3 className="text-base font-semibold leading-tight">{t`Sensor Status`}</h3>
			<Badge
				variant="outline"
				className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-white dark:bg-card border border-amber-300 dark:border-amber-500 text-amber-800 dark:text-amber-200"
			>
				{healthyPercentage}%
			</Badge>
		</div>
	);
};
