import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	Gauge,
	Snowflake,
	ThermometerSnowflake,
} from "lucide-react";
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

interface RefrigerationTabProps {
	sensors: Sensor[];
}

function generateSensorHistory(sensor: Sensor) {
	const min = sensor.min ?? 0;
	const max = sensor.max ?? 100;
	const value = sensor.value ?? 50;
	return Array.from({ length: 24 }, (_, i) => {
		const hour = i.toString().padStart(2, "0") + ":00";
		const variance = (max - min) * 0.15;
		return {
			time: hour,
			value: Math.round((value + (Math.random() - 0.5) * variance) * 10) / 10,
		};
	});
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

export function RefrigerationTab({ sensors }: RefrigerationTabProps) {
	const refrigerationSensors = sensors.filter(
		(s) => s.type === "temperature" || s.type === "pressure",
	);

	if (refrigerationSensors.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<Snowflake className="mx-auto mb-4 size-12 text-muted-foreground/50" aria-hidden="true" />
					<h3 className="mb-2 text-lg font-medium">{t`No Refrigeration Sensors`}</h3>
					<p className="text-muted-foreground">
						{t`This equipment does not have refrigeration monitoring sensors installed.`}
					</p>
				</CardContent>
			</Card>
		);
	}

	const temperatureSensors = refrigerationSensors.filter((s) => s.type === "temperature");
	const pressureSensors = refrigerationSensors.filter((s) => s.type === "pressure");

	// Calculate refrigeration KPIs from actual sensor data
	const avgTemp =
		temperatureSensors.length > 0
			? temperatureSensors.reduce((a, s) => a + (s.value ?? 0), 0) / temperatureSensors.length
			: 0;
	const avgPressure =
		pressureSensors.length > 0
			? pressureSensors.reduce((a, s) => a + (s.value ?? 0), 0) / pressureSensors.length
			: 0;
	const sensorsInRange = refrigerationSensors.filter(
		(s) => s.threshold && (s.value ?? 0) < s.threshold.warning,
	).length;
	const efficiencyRate = Math.round((sensorsInRange / refrigerationSensors.length) * 100);

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="flex items-center gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
				<div className="rounded-lg bg-cyan-500 p-2">
					<Snowflake className="size-6 text-white" aria-hidden="true" />
				</div>
				<div>
					<h2 className="text-lg font-semibold text-cyan-900">{t`Refrigeration System`}</h2>
					<p className="text-sm text-cyan-700">
						{t`Showing ${refrigerationSensors.length} refrigeration sensor${refrigerationSensors.length !== 1 ? "s" : ""} - Temperature (${temperatureSensors.length}), Pressure (${pressureSensors.length})`}
					</p>
				</div>
			</div>

			{/* Refrigeration KPIs */}
			<RefrigerationKPIs
				tempCount={temperatureSensors.length}
				avgTemp={avgTemp}
				avgPressure={avgPressure}
				efficiencyRate={efficiencyRate}
			/>

			{/* Temperature Sensors */}
			{temperatureSensors.length > 0 && <TemperatureSensorsList sensors={temperatureSensors} />}

			{/* Pressure Sensors */}
			{pressureSensors.length > 0 && <PressureSensorsList sensors={pressureSensors} />}

			{/* Temperature Trend Chart */}
			{temperatureSensors.length > 0 && <TemperatureTrendChart sensors={temperatureSensors} />}

			{/* Pressure Trend Chart */}
			{pressureSensors.length > 0 && <PressureTrendChart sensor={pressureSensors[0]} />}

			{/* Refrigeration Alerts */}
			<RefrigerationAlerts sensors={refrigerationSensors} />
		</div>
	);
}

// Helper Components
function RefrigerationKPIs({
	tempCount,
	avgTemp,
	avgPressure,
	efficiencyRate,
}: {
	tempCount: number;
	avgTemp: number;
	avgPressure: number;
	efficiencyRate: number;
}) {
	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-cyan-100 p-2">
							<Snowflake className="size-5 text-cyan-600" aria-hidden="true" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t`Temp Sensors`}</p>
							<p className="text-2xl font-semibold">{tempCount}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-blue-100 p-2">
							<ThermometerSnowflake className="size-5 text-blue-600" aria-hidden="true" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t`Avg Temp`}</p>
							<p className="text-2xl font-semibold">
								{avgTemp.toFixed(1)}
								<span className="text-sm font-normal text-muted-foreground">°C</span>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-indigo-100 p-2">
							<Gauge className="size-5 text-indigo-600" aria-hidden="true" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t`Avg Pressure`}</p>
							<p className="text-2xl font-semibold">
								{avgPressure.toFixed(0)}
								<span className="text-sm font-normal text-muted-foreground"> psi</span>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-green-100 p-2">
							<Activity className="size-5 text-green-600" aria-hidden="true" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t`Efficiency`}</p>
							<p className="text-2xl font-semibold">
								{efficiencyRate}
								<span className="text-sm font-normal text-muted-foreground">%</span>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function SensorCard({ sensor, colorClass }: { sensor: Sensor; colorClass: string }) {
	const min = sensor.min ?? 0;
	const max = sensor.max ?? 100;
	const value = sensor.value ?? 0;
	const percentage = ((value - min) / (max - min)) * 100;
	const isInRange = sensor.threshold ? value < sensor.threshold.warning : true;

	return (
		<div className="rounded-lg border bg-card p-4">
			<div className="mb-3 flex items-start justify-between">
				<div>
					<div className="flex items-center gap-2">
						<p className="text-sm font-medium">{sensor.name}</p>
						{isInRange ? (
							<CheckCircle2 className="size-4 text-green-500" aria-hidden="true" />
						) : (
							<AlertTriangle className="size-4 text-amber-500" aria-hidden="true" />
						)}
					</div>
					<p className="text-xs text-muted-foreground">{t`ID: ${sensor.id}`}</p>
				</div>
				<Badge variant="secondary" className={getSensorStatusColor(sensor.status)}>
					{sensor.status}
				</Badge>
			</div>
			<div className="mb-3 flex items-baseline gap-1">
				<span className="text-3xl font-semibold">{value}</span>
				<span className="text-sm text-muted-foreground">{sensor.unit}</span>
			</div>
			<div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
				<div
					className={`h-full transition-all ${
						sensor.threshold && value >= sensor.threshold.critical
							? "bg-red-500"
							: sensor.threshold && value >= sensor.threshold.warning
								? "bg-amber-500"
								: colorClass
					}`}
					style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
				/>
			</div>
			<div className="flex justify-between text-xs text-muted-foreground">
				<span>
					{t`Min:`} {min}
					{sensor.unit}
				</span>
				{sensor.threshold && (
					<span className="text-amber-600">
						{t`Warn:`} {sensor.threshold.warning}
						{sensor.unit}
					</span>
				)}
				<span>
					{t`Max:`} {max}
					{sensor.unit}
				</span>
			</div>
		</div>
	);
}

function TemperatureSensorsList({ sensors }: { sensors: Sensor[] }) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium">
					<ThermometerSnowflake className="size-5 text-blue-500" aria-hidden="true" />
					{t`Temperature Sensors (${sensors.length})`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 md:grid-cols-2">
					{sensors.map((sensor) => (
						<SensorCard key={sensor.id} sensor={sensor} colorClass="bg-cyan-500" />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function PressureSensorsList({ sensors }: { sensors: Sensor[] }) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium">
					<Gauge className="size-5 text-indigo-500" aria-hidden="true" />
					{t`Pressure Sensors (${sensors.length})`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 md:grid-cols-2">
					{sensors.map((sensor) => (
						<SensorCard key={sensor.id} sensor={sensor} colorClass="bg-indigo-500" />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function TemperatureTrendChart({ sensors }: { sensors: Sensor[] }) {
	const colors = ["#0d7377", "#06b6d4", "#22d3ee", "#67e8f9"];
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-medium">{t`Temperature Trend (24h)`}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-55">
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

function PressureTrendChart({ sensor }: { sensor: Sensor }) {
	const history = generateSensorHistory(sensor);
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-medium">{t`Pressure Trend (24h)`}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-55">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={history}>
							<defs>
								<linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
							<YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit=" psi" />
							<Tooltip
								contentStyle={{
									backgroundColor: "#fff",
									border: "1px solid #e2e8f0",
									borderRadius: "8px",
								}}
								formatter={(value: number) => [`${value} psi`, t`Pressure`]}
							/>
							<Area
								type="monotone"
								dataKey="value"
								stroke="#6366f1"
								fill="url(#pressureGradient)"
								strokeWidth={2}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}

function RefrigerationAlerts({ sensors }: { sensors: Sensor[] }) {
	const alertSensors = sensors.filter((s) => s.status === "warning" || s.status === "error");
	if (alertSensors.length === 0) return null;

	return (
		<Card className="border-amber-200 bg-amber-50/50">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium text-amber-700">
					<AlertTriangle className="size-5" aria-hidden="true" />
					{t`Refrigeration Alerts`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{alertSensors.map((sensor) => (
						<div
							key={sensor.id}
							className="flex items-center gap-3 rounded-lg border border-amber-100 bg-white p-3"
						>
							{sensor.type === "temperature" ? (
								<ThermometerSnowflake className="size-5 text-amber-600" aria-hidden="true" />
							) : (
								<Gauge className="size-5 text-amber-600" aria-hidden="true" />
							)}
							<div className="flex-1">
								<p className="text-sm font-medium">{sensor.name}</p>
								<p className="text-xs text-muted-foreground">
									{t`Current:`} {sensor.value} {sensor.unit}
									{sensor.threshold && t` | Threshold: ${sensor.threshold.warning} ${sensor.unit}`}
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
					))}
				</div>
			</CardContent>
		</Card>
	);
}
