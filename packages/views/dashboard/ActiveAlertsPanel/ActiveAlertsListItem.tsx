import type { FC } from "react";

import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

import type { AlertItem } from "./ActiveAlertsController";
import {
	formatDuration,
	getBadgeClassName,
	getSeverityColor,
	getSeverityIcon,
	getTextColor,
} from "./helpers";

interface ActiveAlertListItemProps {
	data: AlertItem;
	zone: string;
}

export const ActiveAlertListItem: FC<ActiveAlertListItemProps> = ({ data, zone }) => {
	const Icon = getSeverityIcon(data.severity);
	const duration = formatDuration(data.createdAt);
	const sensorType =
		data.name
			.split(" ")
			.find((word) =>
				["CO₂", "Temp", "Temperature", "Humidity", "Pressure", "Energy", "AQI"].includes(word),
			) ||
		data.name.split(" ")[0] ||
		t`System`;

	return (
		<div
			className={cn(
				"w-full text-left block px-3 py-1.5 transition-colors hover:opacity-90 cursor-pointer",
				getSeverityColor(data.severity),
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-1.5 flex-1 min-w-0">
					<Icon className="size-3.5 shrink-0" />
					<Badge
						variant={data.severity === "critical" ? "destructive" : "outline"}
						className={cn(
							"text-[10px] h-4 px-1.5 font-medium rounded-sm",
							getBadgeClassName(data.severity),
						)}
					>
						{data.severity.toUpperCase()}
					</Badge>
					<span className={cn("text-xs font-medium truncate", getTextColor(data.severity))}>
						{sensorType}
					</span>
				</div>
				<div className="flex flex-col items-end min-w-0">
					<span className="text-[11px] text-muted-foreground truncate">{zone}</span>
					<span className="text-[11px] text-muted-foreground whitespace-nowrap">{duration}</span>
				</div>
			</div>
		</div>
	);
};
