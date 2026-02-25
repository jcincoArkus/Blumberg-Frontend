import { X } from "lucide-react";

import { t } from "~@/i18n/macro";

interface EmptyStateProps {
	hasSearchOrFilters: boolean;
}

export function EmptyState({ hasSearchOrFilters }: EmptyStateProps) {
	return (
		<div className="py-12 text-center">
			<div className="flex justify-center mb-4">
				<div className="size-16 rounded-full bg-muted flex items-center justify-center">
					<X className="size-8 text-muted-foreground" />
				</div>
			</div>
			<p className="text-sm font-medium text-foreground mb-1">{t`No sensors found`}</p>
			<p className="text-xs text-muted-foreground">
				{hasSearchOrFilters ? t`Try adjusting your search or filters` : t`No sensor data available`}
			</p>
		</div>
	);
}
