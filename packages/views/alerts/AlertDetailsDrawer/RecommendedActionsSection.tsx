import { ListChecks } from "lucide-react";

import { t } from "~@/i18n/macro";
import { cn } from "~@/ui";

import type { RecommendedAction } from "../types";

interface RecommendedActionsSectionProps {
	actions: RecommendedAction[];
}

/**
 * Displays recommended actions for the alert. Only render this section when actions exist.
 * Shows action title and description per the spec; works for Critical and Warning alerts (backend severities).
 */
export function RecommendedActionsSection({ actions }: RecommendedActionsSectionProps) {
	if (!actions || actions.length === 0) return null;

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold text-foreground">{t`Recommended Actions`}</h3>
			<div className="space-y-3">
				{actions.map((action) => (
					<div
						key={action.id}
						className={cn(
							"flex gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground",
							"transition-colors hover:bg-muted/50",
						)}
					>
						<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
							<ListChecks className="size-4" />
						</div>
						<div className="min-w-0 flex-1 space-y-1">
							<p className="text-sm font-medium text-foreground">{action.title}</p>
							<p className="text-sm text-muted-foreground">{action.description}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
