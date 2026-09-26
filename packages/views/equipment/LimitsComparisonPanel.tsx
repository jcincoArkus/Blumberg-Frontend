import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Badge, Card, CardContent, DashboardPanel, formatNumber, formatReading } from "~@/ui";

import type { Sensor } from "./SensorsTable";

interface LimitsComparisonPanelProps {
	sensors: Sensor[];
}

function getStatusInfo(sensor: Sensor): {
	icon: typeof AlertTriangle | typeof CheckCircle2;
	color: string;
	label: string;
} {
	const outOfRange =
		sensor.value !== undefined &&
		((sensor.min !== undefined && sensor.value < sensor.min) ||
			(sensor.max !== undefined && sensor.value > sensor.max));
	if (sensor.status === "error" || outOfRange) {
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

export function LimitsComparisonPanel({ sensors }: LimitsComparisonPanelProps) {
	// Group sensors by type
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

	if (sensors.length === 0) {
		return (
			<DashboardPanel
				title={t`Sensor Limits Comparison`}
				description={t`Current values compared against defined thresholds`}
			>
				<p className="text-sm text-muted-foreground text-center py-8">
					{t`No sensors available for comparison.`}
				</p>
			</DashboardPanel>
		);
	}

	return (
		<DashboardPanel
			title={t`Sensor Limits Comparison`}
			description={t`Current values compared against defined thresholds`}
		>
			<div className="space-y-4">
				{Object.entries(sensorsByType).map(([type, typeSensors]) => (
					<div key={type} className="space-y-2">
						<h4 className="text-sm font-medium text-foreground capitalize">{t`${type} Sensors`}</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{typeSensors.map((sensor) => {
								const statusInfo = getStatusInfo(sensor);
								const StatusIcon = statusInfo.icon;

								// Allowed range comes from the sensor's threshold (min/max). The "normal" band is
								// the inner 80% of it; the outer 10% on each side is the warning band.
								const hasRange = sensor.min !== undefined && sensor.max !== undefined;
								const lo = sensor.min ?? 0;
								const hi = sensor.max ?? 0;
								const margin = (hi - lo) * 0.1;
								const warningMin = lo + margin;
								const warningMax = hi - margin;

								const hasValue = sensor.value !== undefined;
								const value = sensor.value ?? 0;
								const isInAlertRange = hasRange && hasValue && (value < lo || value > hi);
								const isInNormalRange =
									hasRange && hasValue && value >= warningMin && value <= warningMax;
								const isInWarningRange =
									hasRange && hasValue && !isInAlertRange && !isInNormalRange;

								return (
									<Card key={sensor.id} className="border">
										<CardContent className="p-4">
											<div className="space-y-3">
												{/* Sensor Name and Status */}
												<div className="flex items-center justify-between">
													<h5 className="text-sm font-medium text-foreground truncate flex-1">
														{sensor.name}
													</h5>
													<Badge
														variant="outline"
														className={`ml-2 shrink-0 text-xs border ${statusInfo.color}`}
													>
														<StatusIcon className="size-3 mr-1" aria-hidden="true" />
														{statusInfo.label}
													</Badge>
												</div>

												{/* Current Value */}
												<div className="space-y-2">
													<div className="flex items-baseline gap-2">
														<span className="text-xl font-bold text-foreground">
															{formatNumber(sensor.value)}
														</span>
														<span className="text-xs text-muted-foreground">{sensor.unit}</span>
													</div>

													{/* Limits Display */}
													<div className="space-y-1.5 text-xs">
														{/* Normal Range */}
														<div
															className={`p-2 rounded border ${isInNormalRange ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}
														>
															<div className="flex items-center justify-between">
																<span className="text-muted-foreground">{t`Normal Range:`}</span>
																<span className="font-medium text-foreground">
																	{hasRange
																		? `${formatNumber(warningMin)} – ${formatReading(warningMax, sensor.unit)}`
																		: "—"}
																</span>
															</div>
														</div>

														{/* Warning Thresholds */}
														<div
															className={`p-2 rounded border ${isInWarningRange && !isInAlertRange ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}
														>
															<div className="flex items-center justify-between">
																<span className="text-muted-foreground">{t`Allowed Range:`}</span>
																<span className="font-medium text-foreground">
																	{hasRange
																		? `${formatNumber(lo)} – ${formatReading(hi, sensor.unit)}`
																		: "—"}
																</span>
															</div>
														</div>
													</div>

													{/* Status Message */}
													{isInAlertRange && (
														<div className="flex items-start gap-2 p-2 rounded bg-red-50 border border-red-200">
															<AlertTriangle
																className="size-4 text-red-600 shrink-0 mt-0.5"
																aria-hidden="true"
															/>
															<p className="text-xs text-red-700">
																{t`Current value is outside acceptable range`}
															</p>
														</div>
													)}
													{isInWarningRange && !isInAlertRange && (
														<div className="flex items-start gap-2 p-2 rounded bg-amber-50 border border-amber-200">
															<Info
																className="size-4 text-amber-600 shrink-0 mt-0.5"
																aria-hidden="true"
															/>
															<p className="text-xs text-amber-700">{t`Approaching threshold limits`}</p>
														</div>
													)}
													{isInNormalRange && (
														<div className="flex items-start gap-2 p-2 rounded bg-emerald-50 border border-emerald-200">
															<CheckCircle2
																className="size-4 text-emerald-600 shrink-0 mt-0.5"
																aria-hidden="true"
															/>
															<p className="text-xs text-emerald-700">
																{t`Operating within normal parameters`}
															</p>
														</div>
													)}
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</DashboardPanel>
	);
}
