import type { FC } from "react";

import type { DataTableListViewProps } from "~@/data-table";

import type { AlertItem } from "./ActiveAlertsController";

export const ActiveAlertsListView: FC<DataTableListViewProps<AlertItem>> = ({
	data,
	ItemComponent,
	onItemClick,
	onItemDoubleClick,
}) => {
	return (
		<div className="flex-1 divide-y overflow-y-auto">
			{data.map((item, index) => (
				<div
					key={item.id ?? index}
					onClick={() => onItemClick?.(item, index)}
					onDoubleClick={() => onItemDoubleClick?.(item, index)}
				>
					<ItemComponent data={item} index={index} />
				</div>
			))}
		</div>
	);
};
