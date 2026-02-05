import { useState } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useTrendsPanelViewModel } from "~@/view-model";

import { SparklineRow } from "./SparklineRow";

export type { TrendPoint } from "./types";

export const TrendsPanel = observer(function TrendsPanel() {
	const vm = useTrendsPanelViewModel();
	const [timeRange, setTimeRange] = useState<"24h" | "7d">("24h");

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-semibold">{t`Trends`}</CardTitle>
					<div className="flex gap-1">
						<Button
							variant={timeRange === "24h" ? "default" : "ghost"}
							size="sm"
							className="h-7 px-3 text-xs"
							onClick={() => setTimeRange("24h")}
						>
							{t`24h`}
						</Button>
						<Button
							variant={timeRange === "7d" ? "default" : "ghost"}
							size="sm"
							className="h-7 px-3 text-xs"
							onClick={() => setTimeRange("7d")}
						>
							{t`7d`}
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-3">
					<SparklineRow label={t`AQI`} color="#ef4444" data={vm.data.aqi} />
					<SparklineRow label={t`CO₂`} color="#f97316" data={vm.data.co2} unit="ppm" />
					<SparklineRow
						label={t`Temperature`}
						color="#3b82f6"
						data={vm.data.temperature}
						unit="°C"
					/>
				</div>
			</CardContent>
		</Card>
	);
});
