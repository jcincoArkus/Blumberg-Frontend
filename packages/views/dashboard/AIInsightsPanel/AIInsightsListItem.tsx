import type { FC } from "react";

import { cn } from "~@/ui";

import type { InsightItem } from "./AIInsightsController";
import { formatInsightText, getInsightIcon } from "./helpers";

interface AIInsightsListItemProps {
	data: InsightItem;
}

export const AIInsightsListItem: FC<AIInsightsListItemProps> = ({ data }) => {
	const Icon = getInsightIcon(String(data.severity));
	const { finding, context } = formatInsightText(data);

	return (
		<div className="px-3 py-2">
			<div className="flex items-start gap-2">
				<Icon
					className={cn(
						"size-4 mt-0.5 flex-shrink-0",
						data.severity === "critical" || data.severity === "high"
							? "text-amber-600"
							: "text-slate-600",
					)}
				/>
				<div className="flex-1 space-y-0.5 min-w-0">
					<p className="text-sm leading-snug">{finding}</p>
					<p className="text-xs text-muted-foreground">{context}</p>
				</div>
			</div>
		</div>
	);
};
