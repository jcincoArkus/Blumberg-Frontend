import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { t } from "~@/i18n/macro";
import { Card, CardContent, CardHeader, CardTitle, chartColors, chartTooltipProps } from "~@/ui";

// Generate mock trend data for the last 24 hours
function generateAlertsTrendData() {
	const data = [];
	for (let i = 23; i >= 0; i--) {
		const hour = new Date();
		hour.setHours(hour.getHours() - i);
		data.push({
			time: hour.toLocaleTimeString("en-US", { hour: "2-digit", hour12: true }),
			alerts: Math.floor(Math.random() * 5) + 1,
		});
	}
	return data;
}

function generateHealthTrendData() {
	const data = [];
	for (let i = 23; i >= 0; i--) {
		const hour = new Date();
		hour.setHours(hour.getHours() - i);
		data.push({
			time: hour.toLocaleTimeString("en-US", { hour: "2-digit", hour12: true }),
			health: 85 + Math.floor(Math.random() * 15),
		});
	}
	return data;
}

export function SiteTrendCharts() {
	const alertsTrendData = useMemo(() => generateAlertsTrendData(), []);
	const healthTrendData = useMemo(() => generateHealthTrendData(), []);

	// Calculate trend direction
	const alertsTrend =
		alertsTrendData[alertsTrendData.length - 1].alerts - alertsTrendData[0].alerts;
	const healthTrend =
		healthTrendData[healthTrendData.length - 1].health - healthTrendData[0].health;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{/* Alerts Volume Trend */}
			<Card>
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<CardTitle className="text-sm font-medium">{t`Alerts Volume (24h)`}</CardTitle>
						<div className="flex items-center gap-1">
							{alertsTrend > 0 ? (
								<TrendingUp className="size-4 text-red-500 dark:text-danger" />
							) : alertsTrend < 0 ? (
								<TrendingDown className="size-4 text-success" />
							) : (
								<Minus className="size-4 text-muted-foreground" />
							)}
							<span
								className={`text-xs font-medium ${
									alertsTrend > 0
										? "text-red-500 dark:text-danger"
										: alertsTrend < 0
											? "text-success"
											: "text-muted-foreground"
								}`}
							>
								{alertsTrend > 0 ? `+${alertsTrend}` : alertsTrend}
							</span>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="h-30">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={alertsTrendData}>
								<defs>
									<linearGradient id="alertsGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis
									dataKey="time"
									tick={{ fontSize: 10, fill: chartColors.axis }}
									interval={5}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis hide />
								<Tooltip
									{...chartTooltipProps}
									contentStyle={{ ...chartTooltipProps.contentStyle, borderRadius: "6px" }}
								/>
								<Area
									type="monotone"
									dataKey="alerts"
									stroke="#ef4444"
									strokeWidth={2}
									fill="url(#alertsGradient)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			{/* Site Health Trend */}
			<Card>
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<CardTitle className="text-sm font-medium">{t`Site Health (24h)`}</CardTitle>
						<div className="flex items-center gap-1">
							{healthTrend > 0 ? (
								<TrendingUp className="size-4 text-success" />
							) : healthTrend < 0 ? (
								<TrendingDown className="size-4 text-red-500 dark:text-danger" />
							) : (
								<Minus className="size-4 text-muted-foreground" />
							)}
							<span
								className={`text-xs font-medium ${
									healthTrend > 0
										? "text-success"
										: healthTrend < 0
											? "text-red-500 dark:text-danger"
											: "text-muted-foreground"
								}`}
							>
								{healthTrend > 0 ? `+${healthTrend}%` : `${healthTrend}%`}
							</span>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="h-30">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={healthTrendData}>
								<defs>
									<linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={chartColors.success} stopOpacity={0.3} />
										<stop offset="95%" stopColor={chartColors.success} stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis
									dataKey="time"
									tick={{ fontSize: 10, fill: chartColors.axis }}
									interval={5}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis hide domain={[70, 100]} />
								<Tooltip
									{...chartTooltipProps}
									contentStyle={{ ...chartTooltipProps.contentStyle, borderRadius: "6px" }}
									formatter={(value) => [`${value}%`, t`Health`]}
								/>
								<Area
									type="monotone"
									dataKey="health"
									stroke={chartColors.success}
									strokeWidth={2}
									fill="url(#healthGradient)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
