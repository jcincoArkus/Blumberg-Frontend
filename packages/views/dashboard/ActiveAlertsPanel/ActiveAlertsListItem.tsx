import type { FC } from "react";

import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

import type { AlertItem } from "./ActiveAlertsController";
import { formatDurationAgo, getSensorIcon, getSeverityStyle, getTextColor } from "./helpers";

interface ActiveAlertListItemProps {
	data: AlertItem;
	zone: string;
}

export const ActiveAlertListItem: FC<ActiveAlertListItemProps> = ({ data, zone }) => {
	const SensorIcon = getSensorIcon(data.name);
	const durationAgo = formatDurationAgo(data.createdAt);
	const style = getSeverityStyle(data.severity);
	const sensorType =
		data.name
			.split(" ")
			.find((word) =>
				[
					"CO₂",
					"Temp",
					"Temperature",
					"Humidity",
					"Pressure",
					"Energy",
					"AQI",
					"Climate",
					"Air",
					"Maintenance",
				].includes(word),
			) ||
		data.name.split(" ")[0] ||
		t`System`;

	return (
		<div
			className={cn(
				"w-full text-left block px-3 py-2 transition-colors hover:opacity-90 cursor-pointer",
				style.bg,
				style.border,
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-1.5 flex-1 min-w-0">
					<div
						className={cn(
							"flex items-center justify-center rounded-full p-1.5 flex-shrink-0",
							style.iconBg,
						)}
					>
						<SensorIcon className={cn("size-3.5", style.iconColor)} />
					</div>
					<Badge
						variant="outline"
						className={cn(
							"text-[10px] h-4 px-1.5 font-bold rounded-sm border-0",
							style.badgeBg,
							style.badgeText,
						)}
					>
						{data.severity.toUpperCase()}
					</Badge>
					<span className={cn("text-xs font-bold truncate", getTextColor(data.severity))}>
						{sensorType}
					</span>
				</div>
				<div className="flex flex-col items-end min-w-0 shrink-0">
					<span className="text-[11px] text-muted-foreground truncate max-w-[120px]">{zone}</span>
					<span className="text-[11px] text-muted-foreground whitespace-nowrap">{durationAgo}</span>
				</div>
			</div>
		</div>
	);
};
