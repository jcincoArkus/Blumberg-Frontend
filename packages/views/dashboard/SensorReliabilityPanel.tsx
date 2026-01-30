import { AlertTriangle, ChevronDown, ChevronRight, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { Badge, Collapsible, CollapsibleContent, CollapsibleTrigger, cn } from "~@/ui";

export interface Sensor {
	id: string;
	name: string;
	status: "active" | "offline" | "stale" | "warning" | "error";
}

export interface SensorReliabilityPanelProps {
	offlineCount: number;
	staleCount: number;
	flappingCount: number;
	totalSensors: number;
	offlineSensors: Sensor[];
	staleSensors: Sensor[];
	flappingSensors: Sensor[];
}

export function SensorReliabilityPanel({
	offlineCount,
	staleCount,
	flappingCount,
	totalSensors,
	offlineSensors,
	staleSensors,
	flappingSensors,
}: SensorReliabilityPanelProps) {
	const healthyCount = totalSensors - offlineCount - staleCount - flappingCount;
	const healthyPercentage =
		totalSensors > 0 ? Math.round((healthyCount / totalSensors) * 100) : 100;
	const hasIssues = offlineCount > 0 || staleCount > 0 || flappingCount > 0;
	const [isFlappingOpen, setIsFlappingOpen] = useState(false);

	return (
		<div className="bg-card text-card-foreground rounded-xl border shadow-sm">
			<div className="px-3 pt-3 pb-0.5">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold leading-tight">{t`Sensor Status`}</h3>
					<Badge
						variant="outline"
						className={cn(
							"text-xs",
							hasIssues ? "border-amber-300 text-amber-700" : "border-emerald-300 text-emerald-700",
						)}
					>
						{healthyPercentage}%
					</Badge>
				</div>
			</div>
			<div className="px-3 pb-3 space-y-2">
				{/* Compact Horizontal Stats */}
				<div className="flex items-center justify-between gap-2">
					<div className="flex-1 text-center">
						<p className="text-lg font-semibold">{offlineCount}</p>
						<p className="text-xs text-muted-foreground">{t`Offline`}</p>
					</div>
					<div className="w-px h-8 bg-border" />
					<div className="flex-1 text-center">
						<p className="text-lg font-semibold">{staleCount}</p>
						<p className="text-xs text-muted-foreground">{t`Stale`}</p>
					</div>
					<div className="w-px h-8 bg-border" />
					<div className="flex-1 text-center">
						<p className="text-lg font-semibold">{flappingCount}</p>
						<p className="text-xs text-muted-foreground">{t`Flapping`}</p>
					</div>
				</div>

				{/* Critical Issues Only (Offline/Stale) */}
				{(offlineSensors.length > 0 || staleSensors.length > 0) && (
					<div className="space-y-1.5 pt-1.5 border-t">
						{offlineSensors.length > 0 && (
							<div>
								<div className="flex items-center gap-1.5 mb-1">
									<AlertTriangle className="size-3 text-red-600" />
									<p className="text-xs font-medium text-red-700">{t`Offline`}</p>
								</div>
								<div className="space-y-0.5">
									{offlineSensors.slice(0, 2).map((sensor) => (
										<Link
											key={sensor.id}
											to={`/config/sensors?sensor=${sensor.id}`}
											className="block p-1 rounded text-xs border border-red-200 bg-red-50/30 hover:bg-red-100/50 transition-colors"
										>
											<p className="font-medium truncate">{sensor.name}</p>
										</Link>
									))}
									{offlineSensors.length > 2 && (
										<p className="text-xs text-muted-foreground text-center">
											{t`+${offlineSensors.length - 2} more`}
										</p>
									)}
								</div>
							</div>
						)}

						{staleSensors.length > 0 && (
							<div>
								<div className="flex items-center gap-1.5 mb-1">
									<Clock className="size-3 text-amber-600" />
									<p className="text-xs font-medium text-amber-700">{t`Stale`}</p>
								</div>
								<div className="space-y-0.5">
									{staleSensors.slice(0, 2).map((sensor) => (
										<Link
											key={sensor.id}
											to={`/config/sensors?sensor=${sensor.id}`}
											className="block p-1 rounded text-xs border border-amber-200 bg-amber-50/30 hover:bg-amber-100/50 transition-colors"
										>
											<p className="font-medium truncate">{sensor.name}</p>
										</Link>
									))}
									{staleSensors.length > 2 && (
										<p className="text-xs text-muted-foreground text-center">
											{t`+${staleSensors.length - 2} more`}
										</p>
									)}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Flapping Sensors - Collapsible */}
				{flappingSensors.length > 0 && (
					<Collapsible open={isFlappingOpen} onOpenChange={setIsFlappingOpen}>
						<CollapsibleTrigger className="w-full flex items-center justify-between p-1 rounded hover:bg-muted/50 transition-colors">
							<div className="flex items-center gap-1.5">
								<TrendingUp className="size-3 text-orange-600" />
								<p className="text-xs font-medium text-orange-700">
									{t`Flapping`} ({flappingSensors.length})
								</p>
							</div>
							{isFlappingOpen ? (
								<ChevronDown className="size-3 text-muted-foreground" />
							) : (
								<ChevronRight className="size-3 text-muted-foreground" />
							)}
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className="space-y-0.5 pt-1">
								{flappingSensors.slice(0, 3).map((sensor) => (
									<Link
										key={sensor.id}
										to={`/config/sensors?sensor=${sensor.id}`}
										className="block p-1 rounded text-xs border border-orange-200 bg-orange-50/30 hover:bg-orange-100/50 transition-colors"
									>
										<p className="font-medium truncate">{sensor.name}</p>
									</Link>
								))}
								{flappingSensors.length > 3 && (
									<Link
										to="/monitoring/sensor-health"
										className="block text-center text-xs text-primary hover:underline pt-0.5"
									>
										{t`View all →`}
									</Link>
								)}
							</div>
						</CollapsibleContent>
					</Collapsible>
				)}

				{/* All Healthy State */}
				{!hasIssues && (
					<div className="text-center py-1">
						<p className="text-xs text-muted-foreground">{t`${totalSensors} sensors operational`}</p>
					</div>
				)}
			</div>
		</div>
	);
}
