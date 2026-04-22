import type { FC } from "react";

import { cn } from "~@/ui";

import type { InsightItem } from "./AIInsightsController";
import { formatInsightText, getInsightIcon, getInsightIconStyle } from "./helpers";

interface AIInsightsListItemProps {
	data: InsightItem;
}

export const AIInsightsListItem: FC<AIInsightsListItemProps> = ({ data }) => {
	const Icon = getInsightIcon(String(data.severity));
	const { finding, context } = formatInsightText(data);
	const iconStyle = getInsightIconStyle(String(data.severity));

	return (
		<div className="px-4 py-2.5">
			<div className="flex items-start gap-3">
				<div
					className={cn(
						"flex items-center justify-center rounded-full p-1.5 flex-shrink-0 size-8",
						iconStyle.bg,
						iconStyle.text,
					)}
				>
					<Icon className="size-4" />
				</div>
				<div className="flex-1 space-y-0.5 min-w-0">
					<p className="text-sm font-normal leading-snug text-foreground">{finding}</p>
					<p className="text-xs text-muted-foreground italic">{context}</p>
				</div>
			</div>
		</div>
	);
};
