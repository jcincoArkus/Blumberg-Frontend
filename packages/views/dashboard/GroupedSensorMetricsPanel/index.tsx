import { useState } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Badge, Card, CardContent, cn, Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";
import { useGroupedSensorMetricsPanelViewModel } from "~@/view-model";

import { getSensorTypeConfig } from "./constants";
import { PanelHeader } from "./PanelHeader";
import { SensorWidget } from "./SensorWidget";

export type { SensorWithReading } from "./types";

export const GroupedSensorMetricsPanel = observer(function GroupedSensorMetricsPanel() {
	const vm = useGroupedSensorMetricsPanelViewModel();
	const [activeTab, setActiveTab] = useState<string>(vm.orderedTypes[0] ?? "");

	const orderedTypes = vm.orderedTypes;

	if (orderedTypes.length === 0) {
		return (
			<Card>
				<CardContent className="p-6 text-center text-muted-foreground">
					{t`No sensors available`}
				</CardContent>
			</Card>
		);
	}

	// Ensure activeTab is valid when orderedTypes change
	const currentTab = orderedTypes.includes(activeTab) ? activeTab : orderedTypes[0];

	return (
		<Card>
			<CardContent className="p-0">
				<PanelHeader
					totalAlerts={vm.totalAlerts}
					criticalAlerts={vm.criticalAlerts}
					highAlerts={vm.highAlerts}
					sensorCount={vm.sensors.length}
					categoryCount={orderedTypes.length}
				/>

				<Tabs value={currentTab} onValueChange={setActiveTab} className="w-full">
					<div className="border-b px-4 pt-3">
						<TabsList className="w-full justify-start h-auto p-0 bg-transparent border-0">
							<div className="flex gap-1 overflow-x-auto pb-1">
								{orderedTypes.map((type) => {
									const typeConfig = getSensorTypeConfig(type);
									const TypeIcon = typeConfig.icon;
									const sensorCount = vm.sensorsByType[type]?.length ?? 0;
									const alertCount = vm.alertsBySensorType[type] ?? 0;

									return (
										<TabsTrigger
											key={type}
											value={type}
											className={cn(
												"flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-transparent",
												"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary",
												"data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50",
											)}
										>
											<TypeIcon className="size-3.5 shrink-0" />
											<span className="whitespace-nowrap">{typeConfig.label}</span>
											{sensorCount > 0 && (
												<Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px] shrink-0">
													{sensorCount}
												</Badge>
											)}
											{alertCount > 0 && (
												<Badge
													variant="destructive"
													className="ml-1 h-4 px-1.5 text-[10px] shrink-0"
												>
													{alertCount}
												</Badge>
											)}
										</TabsTrigger>
									);
								})}
							</div>
						</TabsList>
					</div>

					{orderedTypes.map((type) => {
						const typeSensors = vm.sensorsByType[type] ?? [];
						const typeConfig = getSensorTypeConfig(type);
						const TypeIcon = typeConfig.icon;
						const alertCount = vm.alertsBySensorType[type] ?? 0;

						return (
							<TabsContent key={type} value={type} className="p-4 m-0">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="flex items-center gap-1.5">
												<TypeIcon className="size-4 text-muted-foreground" />
												<h3 className="text-sm font-semibold text-foreground">
													{typeConfig.label}
												</h3>
											</div>
											{alertCount > 0 && (
												<Badge variant="destructive" className="text-xs">
													{alertCount} {t`Alert`}
													{alertCount > 1 ? "s" : ""}
												</Badge>
											)}
										</div>
										<span className="text-xs text-muted-foreground">
											{typeSensors.length} {typeSensors.length === 1 ? t`sensor` : t`sensors`}
										</span>
									</div>

									<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
										{typeSensors.map((sensor) => (
											<SensorWidget
												key={sensor.id}
												sensor={sensor}
												alertsCount={vm.alertsBySensor[sensor.id] ?? 0}
											/>
										))}
									</div>
								</div>
							</TabsContent>
						);
					})}
				</Tabs>
			</CardContent>
		</Card>
	);
});
