import type { FC } from "react";

import type { DataTableListViewProps } from "~@/data-table";

import type { InsightItem } from "./AIInsightsController";

export const AIInsightsListView: FC<DataTableListViewProps<InsightItem>> = ({
	data,
	ItemComponent,
	onItemClick,
	onItemDoubleClick,
}) => {
	return (
		<div className="flex-1 divide-y overflow-y-auto">
			{data.map((item, index) => (
				<div
					key={String(item.id ?? index)}
					onClick={() => onItemClick?.(item, index)}
					onDoubleClick={() => onItemDoubleClick?.(item, index)}
				>
					<ItemComponent data={item} index={index} />
				</div>
			))}
		</div>
	);
};
