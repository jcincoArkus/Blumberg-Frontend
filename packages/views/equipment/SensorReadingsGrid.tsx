import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Badge, Card, CardContent } from "~@/ui";

import type { Sensor } from "./SensorsTable";

interface SensorReadingsGridProps {
	sensors: Sensor[];
}

function formatTimestamp(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getStatusIndicator(sensor: Sensor): {
	icon: typeof AlertTriangle | typeof CheckCircle2;
	color: string;
	label: string;
} {
	if (sensor.status === "error") {
		return {
			icon: AlertTriangle,
			color: "text-red-600 bg-red-50 border-red-200",
			label: t`Alert`,
		};
	}
	if (sensor.status === "warning") {
		return {
			icon: AlertTriangle,
			color: "text-amber-600 bg-amber-50 border-amber-200",
			label: t`Warning`,
		};
	}
	return {
		icon: CheckCircle2,
		color: "text-emerald-600 bg-emerald-50 border-emerald-200",
		label: t`OK`,
	};
}

export function SensorReadingsGrid({ sensors }: SensorReadingsGridProps) {
	// Group sensors by type for better organization
	const sensorsByType = sensors.reduce(
		(acc, sensor) => {
			if (!acc[sensor.type]) {
				acc[sensor.type] = [];
			}
			acc[sensor.type].push(sensor);
			return acc;
		},
		{} as Record<string, Sensor[]>,
	);

	// Priority order for sensor types
	const typeOrder = ["temperature", "humidity", "co2", "pressure", "energy"];
	const orderedTypes = typeOrder.filter((type) => sensorsByType[type]);
	const otherTypes = Object.keys(sensorsByType).filter((type) => !typeOrder.includes(type));

	const allSensors = [...orderedTypes, ...otherTypes].flatMap((type) => sensorsByType[type]);

	if (allSensors.length === 0) {
		return (
			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-foreground">{t`Current Sensor Readings`}</h2>
				<p className="text-sm text-muted-foreground text-center py-8">
					{t`No sensors available for this equipment.`}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-foreground">{t`Current Sensor Readings`}</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{allSensors.map((sensor) => {
					const statusInfo = getStatusIndicator(sensor);
					const StatusIcon = statusInfo.icon;
					const warningThreshold = sensor.threshold?.warning ?? sensor.max * 0.8;
					const isAboveWarning = sensor.value !== undefined && sensor.value > warningThreshold;
					const isBelowMin = sensor.value !== undefined && sensor.value < sensor.min;
					const isAboveMax = sensor.value !== undefined && sensor.value > sensor.max;

					return (
						<Card key={sensor.id} className="hover:shadow-md transition-shadow">
							<CardContent className="p-4">
								<div className="space-y-3">
									{/* Sensor Name and Status */}
									<div className="flex items-start justify-between">
										<div className="flex-1 min-w-0">
											<h3 className="text-sm font-medium text-foreground truncate">
												{sensor.name}
											</h3>
											<p className="text-xs text-muted-foreground mt-0.5 capitalize">
												{sensor.type}
											</p>
										</div>
										<Badge
											variant="outline"
											className={`ml-2 shrink-0 text-xs border ${statusInfo.color}`}
										>
											<StatusIcon className="size-3 mr-1" aria-hidden="true" />
											{statusInfo.label}
										</Badge>
									</div>

									{/* Value Display */}
									<div className="space-y-1">
										<div className="flex items-baseline gap-2">
											<span className="text-2xl font-bold text-foreground">
												{sensor.value?.toFixed(1) ?? "—"}
											</span>
											<span className="text-sm text-muted-foreground">{sensor.unit}</span>
										</div>

										{/* Limits Comparison */}
										<div className="text-xs text-muted-foreground space-y-0.5">
											<div className="flex items-center justify-between">
												<span>{t`Range:`}</span>
												<span className="font-medium text-foreground">
													{sensor.min}
													{sensor.unit} - {sensor.max}
													{sensor.unit}
												</span>
											</div>
											{isAboveWarning && !isAboveMax && (
												<div className="text-amber-600">
													{t`Above warning threshold (${warningThreshold}${sensor.unit})`}
												</div>
											)}
											{isBelowMin && (
												<div className="text-red-600 font-medium">
													{t`Below minimum (${sensor.min}${sensor.unit})`}
												</div>
											)}
											{isAboveMax && (
												<div className="text-red-600 font-medium">
													{t`Above maximum (${sensor.max}${sensor.unit})`}
												</div>
											)}
										</div>
									</div>

									{/* Timestamp */}
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
										<Clock className="size-3" aria-hidden="true" />
										<span>{formatTimestamp(sensor.lastSeen)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
