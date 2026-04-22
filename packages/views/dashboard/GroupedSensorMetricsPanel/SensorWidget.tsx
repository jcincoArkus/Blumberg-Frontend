import { AlertCircle, Clock } from "lucide-react";
import type { FC } from "react";

import { Badge, Card, CardContent, cn } from "~@/ui";

import { getSensorTypeConfig } from "./constants";
import { formatTime, getSensorStatusForCard } from "./helpers";
import type { SensorWithReading } from "./types";

interface SensorWidgetProps {
	sensor: SensorWithReading;
	alertsCount?: number;
}

export const SensorWidget: FC<SensorWidgetProps> = ({ sensor, alertsCount = 0 }) => {
	const typeConfig = getSensorTypeConfig(sensor.type);
	const TypeIcon = typeConfig.icon;
	const statusInfo = getSensorStatusForCard(sensor, alertsCount);
	const StatusIcon = statusInfo.icon;

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardContent className="p-3">
				<div className="space-y-2">
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-1.5 flex-1 min-w-0">
							<div
								className={cn(
									"flex items-center justify-center rounded-md p-1.5 shrink-0",
									statusInfo.bgColor,
								)}
							>
								<TypeIcon className={cn("size-3.5", statusInfo.color)} />
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="text-xs font-semibold text-foreground truncate">{sensor.name}</h4>
								<p className="text-[10px] text-muted-foreground capitalize">{sensor.type}</p>
							</div>
						</div>
						<Badge
							variant="outline"
							className={cn(
								"text-[10px] h-4 px-1.5 border shrink-0",
								statusInfo.bgColor,
								statusInfo.borderColor,
							)}
						>
							<StatusIcon className="size-2.5 mr-0.5" />
							{statusInfo.label}
						</Badge>
					</div>

					<div className="flex items-baseline gap-1">
						<span className="text-xl font-bold text-foreground">
							{sensor.value != null ? sensor.value.toFixed(1) : "N/A"}
						</span>
						<span className="text-xs text-muted-foreground">{sensor.unit}</span>
					</div>

					<div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
						<span>
							{sensor.min != null && sensor.max != null
								? `${sensor.min}${sensor.unit} - ${sensor.max}${sensor.unit}`
								: "—"}
						</span>
						<div className="flex items-center gap-1">
							<Clock className="size-2.5" />
							<span>{formatTime(sensor.lastSeen ?? new Date().toISOString())}</span>
						</div>
					</div>

					{alertsCount > 0 && (
						<div className="flex items-center gap-1 text-[10px] text-red-600 pt-0.5">
							<AlertCircle className="size-2.5" />
							<span>
								{alertsCount} alert{alertsCount > 1 ? "s" : ""}
							</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
