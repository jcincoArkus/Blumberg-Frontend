import { useState } from "react";

import { t } from "~@/i18n/macro";
import { Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";

import { SparklineRow } from "./SparklineRow";
import type { TrendsPanelProps } from "./types";

export type { TrendPoint, TrendsPanelProps } from "./types";

export function TrendsPanel({ data }: TrendsPanelProps) {
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
					<SparklineRow label={t`AQI`} color="#ef4444" data={data.aqi} />
					<SparklineRow label={t`CO₂`} color="#f97316" data={data.co2} unit="ppm" />
					<SparklineRow label={t`Temperature`} color="#3b82f6" data={data.temperature} unit="°C" />
				</div>
			</CardContent>
		</Card>
	);
}
