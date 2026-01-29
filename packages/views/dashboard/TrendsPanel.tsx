import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

import { Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";

export interface TrendsPanelProps {
	data: {
		aqi: { time: string; value: number }[];
		co2: { time: string; value: number }[];
		temperature: { time: string; value: number }[];
	};
}

export function TrendsPanel({ data }: TrendsPanelProps) {
	const [timeRange, setTimeRange] = useState<"24h" | "7d">("24h");

	const formatSparklineData = (dataPoints: { time: string; value: number }[]) => {
		return dataPoints.map((d, i) => ({
			index: i,
			value: d.value,
		}));
	};

	const aqiData = formatSparklineData(data.aqi);
	const co2Data = formatSparklineData(data.co2);
	const tempData = formatSparklineData(data.temperature);

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-semibold">Trends</CardTitle>
					<div className="flex gap-1">
						<Button
							variant={timeRange === "24h" ? "default" : "ghost"}
							size="sm"
							className="h-7 px-3 text-xs"
							onClick={() => setTimeRange("24h")}
						>
							24h
						</Button>
						<Button
							variant={timeRange === "7d" ? "default" : "ghost"}
							size="sm"
							className="h-7 px-3 text-xs"
							onClick={() => setTimeRange("7d")}
						>
							7d
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-3">
					{/* AQI Sparkline */}
					<div>
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs font-medium text-muted-foreground">AQI</span>
							<span className="text-xs text-muted-foreground">
								{data.aqi[data.aqi.length - 1]?.value || 0}
							</span>
						</div>
						<div className="h-12">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={aqiData}>
									<Line
										type="monotone"
										dataKey="value"
										stroke="#ef4444"
										strokeWidth={2}
										dot={false}
									/>
									<Tooltip content={() => null} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* CO₂ Sparkline */}
					<div>
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs font-medium text-muted-foreground">CO₂</span>
							<span className="text-xs text-muted-foreground">
								{data.co2[data.co2.length - 1]?.value || 0} ppm
							</span>
						</div>
						<div className="h-12">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={co2Data}>
									<Line
										type="monotone"
										dataKey="value"
										stroke="#f97316"
										strokeWidth={2}
										dot={false}
									/>
									<Tooltip content={() => null} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Temperature Sparkline */}
					<div>
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs font-medium text-muted-foreground">Temperature</span>
							<span className="text-xs text-muted-foreground">
								{data.temperature[data.temperature.length - 1]?.value || 0}°C
							</span>
						</div>
						<div className="h-12">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={tempData}>
									<Line
										type="monotone"
										dataKey="value"
										stroke="#3b82f6"
										strokeWidth={2}
										dot={false}
									/>
									<Tooltip content={() => null} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
