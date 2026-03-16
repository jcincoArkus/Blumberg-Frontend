import { Clock } from "lucide-react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { getSeverityConfig } from "~@/models";
import { Badge } from "~@/ui";

import type { Alert } from "../types";
import { calculateDuration, formatTimestamp } from "./helpers";

interface AlertSummarySectionProps {
	alert: Alert;
	equipmentName: string;
	sensorName: string;
	siteName?: string;
	siteLocation?: string;
}

export function AlertSummarySection({
	alert,
	equipmentName,
	sensorName,
	siteName,
	siteLocation,
}: AlertSummarySectionProps) {
	const severityConfig = getSeverityConfig();
	const severityInfo = severityConfig[alert.severity] ?? severityConfig.info;
	const SeverityIcon = severityInfo.icon;
	const duration = calculateDuration(alert.createdAt, alert.resolvedAt);

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold text-foreground">{t`Alert Summary`}</h3>
			<div className="space-y-3">
				<div className="flex items-center gap-3">
					<Badge variant="outline" className={`${severityInfo.className} border-2 font-semibold`}>
						<span className={`size-2 rounded-full ${severityInfo.dot} mr-1.5`} />
						<SeverityIcon className="mr-1 h-3 w-3" />
						{severityInfo.label}
					</Badge>
					<Badge
						variant="outline"
						className={
							alert.status === "active"
								? "bg-red-100 text-red-700 border-red-200"
								: alert.status === "acknowledged"
									? "bg-amber-100 text-amber-700 border-amber-200"
									: "bg-emerald-100 text-emerald-700 border-emerald-200"
						}
					>
						{alert.status}
					</Badge>
				</div>

				<div>
					<h4 className="font-semibold text-foreground mb-1">{alert.name}</h4>
					<p className="text-sm text-muted-foreground">{alert.description}</p>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xs text-muted-foreground mb-1">{t`Equipment`}</p>
						<Link
							to={`/equipment/${alert.equipmentId}`}
							className="text-sm font-medium text-primary hover:underline"
						>
							{equipmentName}
						</Link>
					</div>
					<div>
						<p className="text-xs text-muted-foreground mb-1">{t`Sensor`}</p>
						<p className="text-sm font-medium text-foreground">{sensorName}</p>
					</div>
				</div>

				{siteName && alert.siteId && (
					<div>
						<p className="text-xs text-muted-foreground mb-1">{t`Site`}</p>
						<Link
							to={`/site/${alert.siteId}`}
							className="text-sm font-medium text-primary hover:underline"
						>
							{siteName}
						</Link>
						{siteLocation && <p className="text-xs text-muted-foreground">{siteLocation}</p>}
					</div>
				)}

				<div className="grid grid-cols-2 gap-4 pt-2 border-t">
					<div>
						<p className="text-xs text-muted-foreground mb-1">{t`Created`}</p>
						<div className="flex items-center gap-1.5 text-sm">
							<Clock className="size-3.5 text-muted-foreground" />
							<span>{formatTimestamp(alert.createdAt)}</span>
						</div>
					</div>
					<div>
						<p className="text-xs text-muted-foreground mb-1">{t`Duration`}</p>
						<div className="flex items-center gap-1.5 text-sm font-medium">
							<Clock className="size-3.5 text-muted-foreground" />
							<span>{duration}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
