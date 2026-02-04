import type { FC } from "react";

import type { DataTableEmptyStateProps } from "~@/data-table";
import { t } from "~@/i18n/macro";

import { Button } from "../Button";

/**
 * EmptyState Component
 * Displays when no data is available
 */
export const EmptyState: FC<DataTableEmptyStateProps> = ({
	title = t`No data found`,
	message = t`Try adjusting your search or filter criteria.`,
	icon = "🔍",
	showActionButton = false,
	actionButtonText = t`Add New`,
	onAction,
}) => {
	return (
		<div className="flex flex-col items-center justify-center p-12 text-center">
			<div className="text-6xl mb-4">{icon}</div>
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-muted-foreground mb-4">{message}</p>
			{showActionButton && onAction && <Button onClick={onAction}>{actionButtonText}</Button>}
		</div>
	);
};
