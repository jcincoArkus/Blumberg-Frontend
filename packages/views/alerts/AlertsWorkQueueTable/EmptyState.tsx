import { CheckCircle2 } from "lucide-react";

import { t } from "~@/i18n/macro";

export function EmptyState() {
	return (
		<div className="py-12 text-center">
			<div className="flex justify-center mb-4">
				<div className="size-16 rounded-full bg-muted flex items-center justify-center">
					<CheckCircle2 className="size-8 text-muted-foreground" />
				</div>
			</div>
			<p className="text-sm font-medium text-foreground mb-1">{t`No alerts found`}</p>
			<p className="text-xs text-muted-foreground">{t`All systems operating normally`}</p>
		</div>
	);
}
