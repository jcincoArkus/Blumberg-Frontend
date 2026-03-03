import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

import { INGESTION_BADGE_CONFIG } from "./constants";

type IngestionSource = keyof typeof INGESTION_BADGE_CONFIG;

interface IngestionBadgeProps {
	source?: IngestionSource | null;
}

export function IngestionBadge({ source }: IngestionBadgeProps) {
	if (!source) {
		return (
			<Badge variant="outline" className="border bg-muted/50 text-muted-foreground">
				{t`—`}
			</Badge>
		);
	}
	const cfg = INGESTION_BADGE_CONFIG[source];
	return (
		<Badge variant="outline" className={cn("border", cfg.className)}>
			{cfg.label}
		</Badge>
	);
}
