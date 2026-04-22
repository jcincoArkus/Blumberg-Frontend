import { AlertTriangle, CheckCircle2, Droplets, Thermometer, Wind } from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { t } from "~@/i18n/macro";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "~@/ui";

import type { Sensor } from "./SensorsTable";

interface ClimateTabProps {
	sensors: Sensor[];
}

function generateSensorHistory(sensor: Sensor) {
	const min = sensor.min ?? 0;
	const max = sensor.max ?? 100;
	const value = sensor.value ?? 50;
	return Array.from({ length: 24 }, (_, i) => {
		const hour = i.toString().padStart(2, "0") + ":00";
		const variance = (max - min) * 0.2;
		return {
			time: hour,
			value: Math.round((value + (Math.random() - 0.5) * variance) * 10) / 10,
		};
	});
}

function getSensorIcon(type: string) {
	switch (type) {
		case "temperature":
			return Thermometer;
		case "humidity":
			return Droplets;
		case "co2":
			return Wind;
		default:
			return Thermometer;
	}
}

function getSensorColor(type: string) {
	switch (type) {
		case "temperature":
			return { bg: "bg-blue-100", text: "text-blue-600" };
		case "humidity":
			return { bg: "bg-cyan-100", text: "text-cyan-600" };
		case "co2":
			return { bg: "bg-purple-100", text: "text-purple-600" };
		default:
			return { bg: "bg-gray-100", text: "text-gray-600" };
	}
}

function getSensorStatusColor(status: string) {
	switch (status) {
		case "active":
			return "bg-green-100 text-green-700";
		case "warning":
			return "bg-amber-100 text-amber-700";
		case "error":
		case "offline":
			return "bg-red-100 text-red-700";
		default:
			return "bg-gray-100 text-gray-700";
	}
}

export function ClimateTab({ sensors }: ClimateTabProps) {
	const climateSensors = sensors.filter(
		(s) => s.type === "temperature" || s.type === "humidity" || s.type === "co2",
	);

	if (climateSensors.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<Thermometer
						className="mx-auto mb-4 size-12 text-muted-foreground/50"
						aria-hidden="true"
					/>
					<h3 className="mb-2 text-lg font-medium">{t`No Climate Sensors`}</h3>
					<p className="text-muted-foreground">
						{t`This equipment does not have climate monitoring sensors installed.`}
					</p>
				</CardContent>
			</Card>
		);
	}

	const temperatureSensors = climateSensors.filter((s) => s.type === "temperature");
	const humiditySensors = climateSensors.filter((s) => s.type === "humidity");
	const co2Sensors = climateSensors.filter((s) => s.type === "co2");

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
				<div className="rounded-lg bg-teal-500 p-2">
					<Thermometer className="size-6 text-white" aria-hidden="true" />
				</div>
				<div>
					<h2 className="text-lg font-semibold text-teal-900">{t`Climate Control`}</h2>
					<p className="text-sm text-teal-700">
						{t`Showing ${climateSensors.length} climate sensor${climateSensors.length !== 1 ? "s" : ""} - Temperature (${temperatureSensors.length}), Humidity (${humiditySensors.length}), CO2 (${co2Sensors.length})`}
					</p>
				</div>
			</div>

			{/* Climate Sensors Summary */}
			<ClimateSummaryCards
				temperatureSensors={temperatureSensors}
				humiditySensors={humiditySensors}
				co2Sensors={co2Sensors}
			/>

			{/* All Climate Sensors List */}
			<ClimateSensorsList sensors={climateSensors} />

			{/* Temperature Charts */}
			{temperatureSensors.length > 0 && <TemperatureChart sensors={temperatureSensors} />}

			{/* Humidity Charts */}
			{humiditySensors.length > 0 && <HumidityChart sensor={humiditySensors[0]} />}

			{/* Climate Alerts */}
			<ClimateAlerts sensors={climateSensors} />
		</div>
	);
}

// Helper Components
function ClimateSummaryCards({
	temperatureSensors,
	humiditySensors,
	co2Sensors,
}: {
	temperatureSensors: Sensor[];
	humiditySensors: Sensor[];
	co2Sensors: Sensor[];
}) {
	const calcAvg = (sensors: Sensor[]) =>
		sensors.length > 0
			? (sensors.reduce((a, s) => a + (s.value ?? 0), 0) / sensors.length).toFixed(1)
			: null;

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-blue-100 p-2">
							<Thermometer className="size-5 text-blue-600" aria-hidden="true" />
						</div>
						<div className="flex-1">
							<p className="text-sm text-muted-foreground">{t`Temperature Sensors`}</p>
							<p className="text-2xl font-semibold">{temperatureSensors.length}</p>
						</div>
						{temperatureSensors.length > 0 && (
							<div className="text-right">
								<p className="text-xs text-muted-foreground">{t`Avg`}</p>
								<p className="font-semibold">
									{calcAvg(temperatureSensors)}
									{temperatureSensors[0]?.unit}
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-cyan-100 p-2">
							<Droplets className="size-5 text-cyan-600" aria-hidden="true" />
						</div>
						<div className="flex-1">
							<p className="text-sm text-muted-foreground">{t`Humidity Sensors`}</p>
							<p className="text-2xl font-semibold">{humiditySensors.length}</p>
						</div>
						{humiditySensors.length > 0 && (
							<div className="text-right">
								<p className="text-xs text-muted-foreground">{t`Avg`}</p>
								<p className="font-semibold">
									{calcAvg(humiditySensors)}
									{humiditySensors[0]?.unit}
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-purple-100 p-2">
							<Wind className="size-5 text-purple-600" aria-hidden="true" />
						</div>
						<div className="flex-1">
							<p className="text-sm text-muted-foreground">{t`CO2 Sensors`}</p>
							<p className="text-2xl font-semibold">{co2Sensors.length}</p>
						</div>
						{co2Sensors.length > 0 && (
							<div className="text-right">
								<p className="text-xs text-muted-foreground">{t`Avg`}</p>
								<p className="font-semibold">
									{Math.round(
										co2Sensors.reduce((a, s) => a + (s.value ?? 0), 0) / co2Sensors.length,
									)}
									{co2Sensors[0]?.unit}
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function ClimateSensorsList({ sensors }: { sensors: Sensor[] }) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-medium">
					{t`Climate Sensors Detail (${sensors.length})`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{sensors.map((sensor) => {
						const Icon = getSensorIcon(sensor.type);
						const colors = getSensorColor(sensor.type);
						const min = sensor.min ?? 0;
						const max = sensor.max ?? 100;
						const value = sensor.value ?? 0;
						const percentage = ((value - min) / (max - min)) * 100;
						const isInRange = sensor.threshold ? value < sensor.threshold.warning : true;

						return (
							<div
								key={sensor.id}
								className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
							>
								<div className={`rounded-lg p-2 ${colors.bg}`}>
									<Icon className={`size-5 ${colors.text}`} aria-hidden="true" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center gap-2">
										<span className="text-sm font-medium">{sensor.name}</span>
										<Badge variant="secondary" className={getSensorStatusColor(sensor.status)}>
											{sensor.status}
										</Badge>
										<span className="text-xs capitalize text-muted-foreground">
											({sensor.type})
										</span>
									</div>
									<div className="flex items-center gap-4">
										<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
											<div
												className={`h-full transition-all ${
													sensor.threshold && value >= sensor.threshold.critical
														? "bg-red-500"
														: sensor.threshold && value >= sensor.threshold.warning
															? "bg-amber-500"
															: "bg-green-500"
												}`}
												style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
											/>
										</div>
										<div className="w-32 text-xs text-muted-foreground">
											{t`Range: ${min} - ${max} ${sensor.unit}`}
										</div>
									</div>
								</div>
								<div className="text-right">
									<div className="flex items-center gap-2">
										{isInRange ? (
											<CheckCircle2 className="size-4 text-green-500" aria-hidden="true" />
										) : (
											<AlertTriangle className="size-4 text-amber-500" aria-hidden="true" />
										)}
										<span className="text-xl font-semibold">{value}</span>
										<span className="text-sm text-muted-foreground">{sensor.unit}</span>
									</div>
									{sensor.threshold && (
										<p className="text-xs text-muted-foreground">
											{t`Warning: ${sensor.threshold.warning} | Critical: ${sensor.threshold.critical}`}
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

function TemperatureChart({ sensors }: { sensors: Sensor[] }) {
	const colors = ["#0d7377", "#14919b", "#06b6d4", "#22d3ee"];
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium">
					<Thermometer className="size-5 text-blue-500" aria-hidden="true" />
					{t`Temperature Trends (24h)`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-62.5">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis
								dataKey="time"
								tick={{ fontSize: 11 }}
								tickLine={false}
								axisLine={false}
								allowDuplicatedCategory={false}
							/>
							<YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="°C" />
							<Tooltip
								contentStyle={{
									backgroundColor: "#fff",
									border: "1px solid #e2e8f0",
									borderRadius: "8px",
								}}
							/>
							{sensors.map((sensor, idx) => {
								const history = generateSensorHistory(sensor);
								return (
									<Line
										key={sensor.id}
										data={history}
										type="monotone"
										dataKey="value"
										stroke={colors[idx % colors.length]}
										strokeWidth={2}
										dot={false}
										name={sensor.name}
									/>
								);
							})}
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className="mt-3 flex flex-wrap justify-center gap-4">
					{sensors.map((sensor, idx) => (
						<div key={sensor.id} className="flex items-center gap-2 text-xs">
							<div className="h-0.5 w-3" style={{ backgroundColor: colors[idx % colors.length] }} />
							<span className="text-muted-foreground">{sensor.name}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function HumidityChart({ sensor }: { sensor: Sensor }) {
	const history = generateSensorHistory(sensor);
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium">
					<Droplets className="size-5 text-cyan-500" aria-hidden="true" />
					{t`Humidity Trends (24h)`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-55">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={history}>
							<defs>
								<linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
							<YAxis
								tick={{ fontSize: 11 }}
								tickLine={false}
								axisLine={false}
								unit="%"
								domain={[0, 100]}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#fff",
									border: "1px solid #e2e8f0",
									borderRadius: "8px",
								}}
								formatter={(value: number) => [`${value}%`, t`Humidity`]}
							/>
							<Area
								type="monotone"
								dataKey="value"
								stroke="#06b6d4"
								fill="url(#humidityGradient)"
								strokeWidth={2}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}

function ClimateAlerts({ sensors }: { sensors: Sensor[] }) {
	const alertSensors = sensors.filter((s) => s.status === "warning" || s.status === "error");
	if (alertSensors.length === 0) return null;

	return (
		<Card className="border-amber-200 bg-amber-50/50">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium text-amber-700">
					<AlertTriangle className="size-5" aria-hidden="true" />
					{t`Climate Alerts`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{alertSensors.map((sensor) => {
						const Icon = getSensorIcon(sensor.type);
						return (
							<div
								key={sensor.id}
								className="flex items-center gap-3 rounded-lg border border-amber-100 bg-white p-3"
							>
								<Icon className="size-5 text-amber-600" aria-hidden="true" />
								<div className="flex-1">
									<p className="text-sm font-medium">{sensor.name}</p>
									<p className="text-xs text-muted-foreground">
										{t`Current: ${sensor.value} ${sensor.unit}`}
										{sensor.threshold &&
											t` | Threshold: ${sensor.threshold.warning} ${sensor.unit}`}
									</p>
								</div>
								<Badge
									variant="secondary"
									className={
										sensor.status === "error"
											? "bg-red-100 text-red-700"
											: "bg-amber-100 text-amber-700"
									}
								>
									{sensor.status === "error" ? t`Critical` : t`Warning`}
								</Badge>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
