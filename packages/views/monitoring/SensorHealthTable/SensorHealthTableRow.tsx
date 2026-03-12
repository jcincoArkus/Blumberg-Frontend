import { Eye, MapPin } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Badge, Button, cn, TableCell, TableRow } from "~@/ui";

import type { SensorHealthData } from "../types";
import { HealthBadge } from "./HealthBadge";
import { formatTimestamp } from "./helpers";
import { IngestionBadge } from "./IngestionBadge";

// import { QualityBadge } from "./QualityBadge";

interface SensorHealthTableRowProps {
	item: SensorHealthData;
	onViewDetails: (data: SensorHealthData) => void;
}

export function SensorHealthTableRow({ item, onViewDetails }: SensorHealthTableRowProps) {
	const healthStatus = item.health?.healthStatus;
	const isCritical =
		healthStatus === "offline" || healthStatus === "silent" || healthStatus === "critical";
	const isWarning = healthStatus === "stale" || healthStatus === "warning";

	return (
		<TableRow
			className={cn(
				"cursor-pointer hover:bg-muted/50",
				isCritical && "bg-red-50/30",
				isWarning && "bg-amber-50/30",
			)}
			onClick={() => onViewDetails(item)}
		>
			<TableCell>
				<div>
					<p className="font-medium text-foreground">{item.sensor.name}</p>
					<p className="text-xs text-muted-foreground font-mono">{item.sensor.id}</p>
				</div>
			</TableCell>
			<TableCell>
				<Badge variant="outline" className="capitalize">
					{item.sensor.type}
				</Badge>
			</TableCell>
			<TableCell>
				<div className="flex items-center gap-1.5">
					<MapPin className="size-3.5 text-muted-foreground" />
					<span className="text-sm">{item.sensor.siteName || t`Unknown`}</span>
				</div>
			</TableCell>
			<TableCell>
				<span className="text-sm text-muted-foreground">
					{item.sensor.equipmentName || t`Unassigned`}
				</span>
			</TableCell>
			<TableCell>
				<p className="text-xs text-muted-foreground">
					{formatTimestamp(item.health?.lastReportedAt)}
				</p>
			</TableCell>
			<TableCell>
				<HealthBadge status={item.health?.healthStatus} />
			</TableCell>
			{/* <TableCell>
				<QualityBadge status={item.quality?.qualityStatus} />
			</TableCell> */}
			<TableCell>
				<IngestionBadge source={item.ingestionSource} />
			</TableCell>
			<TableCell>
				<p className="text-xs text-muted-foreground max-w-xs truncate">{item.issueSummary}</p>
			</TableCell>
			<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
				<Button variant="ghost" size="sm" onClick={() => onViewDetails(item)} className="h-8">
					<Eye className="h-4 w-4" />
					<span className="sr-only">{t`View details`}</span>
				</Button>
			</TableCell>
		</TableRow>
	);
}
