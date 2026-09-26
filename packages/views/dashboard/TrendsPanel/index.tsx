import { useEffect } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Card, CardContent, CardHeader, CardTitle, cn } from "~@/ui";
import { useTrendsPanelViewModel } from "~@/view-model";

import { SparklineRow } from "./SparklineRow";

export type { TrendPoint } from "./types";

export const TrendsPanel = observer(function TrendsPanel() {
	const vm = useTrendsPanelViewModel();
	const timeRange = vm.range;
	const setTimeRange = vm.setRange;

	useEffect(() => {
		vm.load();
	}, [vm]);

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-semibold">{t`Trends`}</CardTitle>
					<div className="flex gap-1">
						<button
							type="button"
							onClick={() => setTimeRange("24h")}
							className={cn(
								"h-7 px-3 text-xs font-medium rounded-md transition-colors",
								timeRange === "24h"
									? "bg-primary text-primary-foreground hover:bg-primary/90"
									: "bg-muted text-muted-foreground hover:bg-muted/80",
							)}
						>
							{t`24h`}
						</button>
						<button
							type="button"
							onClick={() => setTimeRange("7d")}
							className={cn(
								"h-7 px-3 text-xs font-medium rounded-md transition-colors",
								timeRange === "7d"
									? "bg-primary text-primary-foreground hover:bg-primary/90"
									: "bg-muted text-muted-foreground hover:bg-muted/80",
							)}
						>
							{t`7d`}
						</button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-3">
					<SparklineRow
						label={t`Temperature`}
						color="#3b82f6"
						data={vm.data.temperature}
						unit="°C"
						idealMin={18}
						idealMax={26}
						sources={vm.sources.temperature}
						isLoading={vm.isLoading}
						showDots
					/>
					<SparklineRow
						label={t`Humidity`}
						color="#8b5cf6"
						data={vm.data.humidity}
						unit="%"
						idealMin={30}
						idealMax={60}
						sources={vm.sources.humidity}
						isLoading={vm.isLoading}
					/>
					<SparklineRow
						label={t`CO₂`}
						color="#f97316"
						data={vm.data.co2}
						unit="ppm"
						idealMin={350}
						idealMax={1000}
						sources={vm.sources.co2}
						isLoading={vm.isLoading}
					/>
				</div>
			</CardContent>
		</Card>
	);
});
