import { Activity, Leaf, TrendingDown, Zap } from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	chartColors,
	chartTooltipProps,
	formatReading,
} from "~@/ui";
import { useResolvedTheme } from "~@/view-model/theme";

import type { Sensor } from "./SensorsTable";

interface EnergyTabProps {
	sensors: Sensor[];
}

function generateSensorHistory(sensor: Sensor) {
	const min = sensor.min ?? 0;
	const max = sensor.max ?? 100;
	const value = sensor.value ?? 50;
	return Array.from({ length: 24 }, (_, i) => {
		const hour = i.toString().padStart(2, "0") + ":00";
		const variance = (max - min) * 0.3;
		return {
			time: hour,
			value: Math.round((value + (Math.random() - 0.5) * variance) * 10) / 10,
		};
	});
}

function generateWeeklyData(sensor: Sensor) {
	const value = sensor.value ?? 50;
	return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
		day,
		consumption: Math.round(value * 24 * (0.8 + Math.random() * 0.4)),
		target: Math.round(value * 24 * 0.9),
	}));
}

function getStatusBadgeClass(status: string) {
	switch (status) {
		case "warning":
			return "bg-amber-100 dark:bg-warning-subtle text-warning-foreground";
		case "error":
		case "offline":
			return "bg-red-100 dark:bg-danger-subtle text-danger-foreground";
		default:
			return "bg-green-100 dark:bg-success-subtle text-success-foreground";
	}
}

export function EnergyTab({ sensors }: EnergyTabProps) {
	const energySensors = sensors.filter((s) => s.type === "energy");

	if (energySensors.length === 0) {
		return (
			<Card className="border-warning-border bg-warning-subtle">
				<CardContent className="py-12 text-center">
					<Zap
						className="mx-auto mb-4 size-12 text-amber-300 dark:text-warning"
						aria-hidden="true"
					/>
					<h3 className="mb-2 text-lg font-medium text-amber-900 dark:text-warning-foreground">{t`No Energy Sensors`}</h3>
					<p className="text-warning-foreground">
						{t`This equipment does not have energy monitoring sensors installed.`}
					</p>
				</CardContent>
			</Card>
		);
	}

	const primarySensor = energySensors[0];
	const sensorHistory = generateSensorHistory(primarySensor);
	const weeklyData = generateWeeklyData(primarySensor);
	const dailyTotal = Math.round((primarySensor.value ?? 0) * 24);
	const avgEfficiency = Math.round(85 + Math.random() * 10);

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="flex items-center gap-3 rounded-lg border border-warning-border bg-warning-subtle p-4">
				<div className="rounded-lg bg-amber-500 p-3">
					<Zap className="size-6 text-white" aria-hidden="true" />
				</div>
				<div className="flex-1">
					<h2 className="text-lg font-semibold text-amber-900 dark:text-warning-foreground">{t`Energy Monitoring`}</h2>
					<p className="text-sm text-warning-foreground">
						{t`Showing ${energySensors.length} energy sensor${energySensors.length !== 1 ? "s" : ""}: ${energySensors.map((s) => `${s.name} (${formatReading(s.value, s.unit)})`).join(", ")}`}
					</p>
				</div>
			</div>

			{/* Energy Sensors Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{energySensors.map((sensor) => (
					<Card key={sensor.id} className="border-amber-100 dark:border-warning-border">
						<CardHeader className="bg-warning-subtle/50 pb-2">
							<CardTitle className="flex items-center gap-2 text-sm font-medium">
								<Zap className="size-4 text-warning" aria-hidden="true" />
								{sensor.name}
								<Badge
									variant="secondary"
									className={`ml-auto ${getStatusBadgeClass(sensor.status)}`}
								>
									{sensor.status}
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-4">
							<div className="mb-2 text-3xl font-bold text-amber-600 dark:text-warning">
								{sensor.value}{" "}
								<span className="text-lg font-normal text-muted-foreground">{sensor.unit}</span>
							</div>
							<div className="h-2 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-warning-subtle">
								<div
									className="h-full bg-warning transition-all"
									style={{
										width: `${Math.min(((sensor.value ?? 0) / (sensor.max ?? 100)) * 100, 100)}%`,
									}}
								/>
							</div>
							<div className="mt-2 flex justify-between text-xs text-muted-foreground">
								<span>{t`Min: ${sensor.min}`}</span>
								<span>{t`Max: ${sensor.max}`}</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Energy KPIs */}
			<EnergyKPIs
				primarySensor={primarySensor}
				dailyTotal={dailyTotal}
				avgEfficiency={avgEfficiency}
			/>

			{/* Energy Charts */}
			<EnergyCharts sensorHistory={sensorHistory} weeklyData={weeklyData} />
		</div>
	);
}

function EnergyKPIs({
	primarySensor,
	dailyTotal,
	avgEfficiency,
}: {
	primarySensor: Sensor;
	dailyTotal: number;
	avgEfficiency: number;
}) {
	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			<Card className="border-amber-100 dark:border-warning-border bg-warning-subtle">
				<CardContent className="pt-4">
					<Activity className="mb-2 size-8 text-warning" aria-hidden="true" />
					<p className="text-xs text-warning-foreground">{t`Current Load`}</p>
					<p className="text-2xl font-bold text-amber-900 dark:text-warning-foreground">
						{primarySensor.value} {primarySensor.unit}
					</p>
				</CardContent>
			</Card>
			<Card className="border-amber-100 dark:border-warning-border bg-warning-subtle">
				<CardContent className="pt-4">
					<Zap className="mb-2 size-8 text-warning" aria-hidden="true" />
					<p className="text-xs text-warning-foreground">{t`Daily Estimate`}</p>
					<p className="text-2xl font-bold text-amber-900 dark:text-warning-foreground">
						{dailyTotal} kWh
					</p>
				</CardContent>
			</Card>
			<Card className="border-amber-100 dark:border-warning-border bg-warning-subtle">
				<CardContent className="pt-4">
					<TrendingDown className="mb-2 size-8 text-warning" aria-hidden="true" />
					<p className="text-xs text-warning-foreground">{t`Efficiency`}</p>
					<p className="text-2xl font-bold text-amber-900 dark:text-warning-foreground">
						{avgEfficiency}%
					</p>
				</CardContent>
			</Card>
			<Card className="border-amber-100 dark:border-warning-border bg-warning-subtle">
				<CardContent className="pt-4">
					<Leaf className="mb-2 size-8 text-warning" aria-hidden="true" />
					<p className="text-xs text-warning-foreground">{t`CO2 Saved`}</p>
					<p className="text-2xl font-bold text-amber-900 dark:text-warning-foreground">
						{Math.round(dailyTotal * 0.42)} kg
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

function EnergyCharts({
	sensorHistory,
	weeklyData,
}: {
	sensorHistory: { time: string; value: number }[];
	weeklyData: { day: string; consumption: number; target: number }[];
}) {
	// amber-100 grid in light; neutral border token in dark so the grid doesn't glow
	const gridStroke = useResolvedTheme() === "dark" ? chartColors.grid : "#fef3c7";
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-amber-900 dark:text-warning-foreground">
						{t`24h Power Consumption`}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-50">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={sensorHistory}>
								<defs>
									<linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={chartColors.warning} stopOpacity={0.4} />
										<stop offset="95%" stopColor={chartColors.warning} stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
								<XAxis dataKey="time" tick={{ fontSize: 10, fill: chartColors.axis }} />
								<YAxis tick={{ fontSize: 10, fill: chartColors.axis }} />
								<Tooltip {...chartTooltipProps} />
								<Area
									type="monotone"
									dataKey="value"
									stroke={chartColors.warning}
									fill="url(#energyGradient)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-amber-900 dark:text-warning-foreground">
						{t`Weekly Consumption vs Target`}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-50">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={weeklyData}>
								<CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
								<XAxis dataKey="day" tick={{ fontSize: 10, fill: chartColors.axis }} />
								<YAxis tick={{ fontSize: 10, fill: chartColors.axis }} />
								<Tooltip {...chartTooltipProps} />
								<Bar
									dataKey="consumption"
									fill={chartColors.warning}
									radius={[4, 4, 0, 0]}
									name={t`Actual`}
								/>
								<Bar
									dataKey="target"
									fill="var(--warning-border)"
									radius={[4, 4, 0, 0]}
									name={t`Target`}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
