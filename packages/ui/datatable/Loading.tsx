import type { FC } from "react";

import type { DataTableLoadingProps } from "~@/data-table";
import { t } from "~@/i18n/macro";

import { Skeleton } from "../Skeleton";

/**
 * Loading Component
 * Displays loading state with skeleton rows
 */
export const Loading: FC<DataTableLoadingProps> = ({ message = t`Loading...` }) => {
	return (
		<div className="space-y-4 p-4">
			<div className="text-center text-muted-foreground">{message}</div>
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</div>
		</div>
	);
};
