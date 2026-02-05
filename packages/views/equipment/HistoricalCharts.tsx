import { useState } from "react";

import { t } from "~@/i18n/macro";
import { Button, DashboardPanel } from "~@/ui";

import { SensorChart } from "./SensorChart";
import type { Sensor } from "./SensorsTable";

interface HistoricalChartsProps {
	equipmentId: string;
	sensors: Sensor[];
	generateTimeSeriesData?: (
		sensorId: string,
		hours: number,
	) => { timestamp: string; value: number }[];
}

type TimeRange = "24h" | "7d";

const KEY_SENSOR_TYPES = ["temperature", "humidity", "co2"] as const;

// Default mock data generator
function defaultGenerateTimeSeriesData(
	sensorId: string,
	hours: number,
): { timestamp: string; value: number }[] {
	const data: { timestamp: string; value: number }[] = [];
	const now = new Date();
	const baseValue = 20 + Math.random() * 10;

	for (let i = hours; i >= 0; i--) {
		const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
		const variation = Math.sin(i / 4) * 3 + (Math.random() - 0.5) * 2;
		data.push({
			timestamp: timestamp.toISOString(),
			value: baseValue + variation,
		});
	}

	return data;
}

export function HistoricalCharts({
	equipmentId: _equipmentId,
	sensors,
	generateTimeSeriesData = defaultGenerateTimeSeriesData,
}: HistoricalChartsProps) {
	const [timeRange, setTimeRange] = useState<TimeRange>("24h");

	// Get primary sensor of each type
	const primarySensors = KEY_SENSOR_TYPES.map((type) => sensors.find((s) => s.type === type))
		.filter((s): s is Sensor => s !== undefined)
		.slice(0, 3);

	const hours = timeRange === "24h" ? 24 : 168; // 7 days = 168 hours

	const getColorForType = (type: Sensor["type"]): string => {
		switch (type) {
			case "temperature":
				return "#ef4444";
			case "humidity":
				return "#3b82f6";
			case "co2":
				return "#10b981";
			default:
				return "#6366f1";
		}
	};

	return (
		<DashboardPanel
			title={t`Historical Sensor Readings`}
			description={
				timeRange === "24h"
					? t`Showing data for the last 24 hours`
					: t`Showing data for the last 7 days`
			}
			action={
				<div className="flex items-center gap-2">
					<Button
						variant={timeRange === "24h" ? "default" : "outline"}
						size="sm"
						onClick={() => setTimeRange("24h")}
						className="h-7 text-xs"
					>
						{t`Last 24h`}
					</Button>
					<Button
						variant={timeRange === "7d" ? "default" : "outline"}
						size="sm"
						onClick={() => setTimeRange("7d")}
						className="h-7 text-xs"
					>
						{t`Last 7d`}
					</Button>
				</div>
			}
		>
			<div className="space-y-6">
				{primarySensors.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<p>{t`No sensor data available for charting`}</p>
					</div>
				) : (
					primarySensors.map((sensor) => {
						const chartData = generateTimeSeriesData(sensor.id, hours);
						const color = getColorForType(sensor.type);

						return (
							<div key={sensor.id} className="space-y-2">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="text-sm font-medium text-foreground">{sensor.name}</h4>
										<p className="text-xs capitalize text-muted-foreground">{sensor.type}</p>
									</div>
									<div className="text-right">
										<span className="text-sm font-semibold text-foreground">
											{sensor.value !== undefined
												? `${sensor.value.toFixed(1)}${sensor.unit}`
												: "—"}
										</span>
										<p className="text-xs text-muted-foreground">{t`Current`}</p>
									</div>
								</div>
								<SensorChart
									data={chartData}
									unit={sensor.unit}
									color={color}
									warningThreshold={sensor.threshold?.warning}
									criticalThreshold={sensor.threshold?.critical}
									height={200}
								/>
							</div>
						);
					})
				)}
			</div>
		</DashboardPanel>
	);
}
