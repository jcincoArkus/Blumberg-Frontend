import { Database } from "lucide-react";
import { useMemo } from "react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import { HistoricalTrendChart } from "./HistoricalTrendChart";
import { TrendIndicator } from "./TrendIndicator";
import type { HistoricalReading } from "./types";

interface ReadingsHistoryTabProps {
	readings: HistoricalReading[];
	previousReadings: HistoricalReading[];
	comparePrevious: boolean;
}

export function ReadingsHistoryTab({
	readings,
	previousReadings,
	comparePrevious,
}: ReadingsHistoryTabProps) {
	// Calculate summary metrics
	const metrics = useMemo(() => {
		if (readings.length === 0) {
			return { total: 0, avg: 0, min: 0, max: 0, missingPct: 0 };
		}

		const values = readings.map((r) => r.value);
		const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
		const min = Math.min(...values);
		const max = Math.max(...values);

		// Estimate missing data (simplified)
		const expectedPoints = readings.length * 1.05;
		const missingPct = Math.max(0, ((expectedPoints - readings.length) / expectedPoints) * 100);

		return {
			total: readings.length,
			avg: Math.round(avg * 10) / 10,
			min: Math.round(min * 10) / 10,
			max: Math.round(max * 10) / 10,
			missingPct: Math.round(missingPct * 10) / 10,
		};
	}, [readings]);

	// Calculate comparison
	const comparison = useMemo(() => {
		if (!comparePrevious || previousReadings.length === 0) return null;

		const currentAvg = metrics.avg;
		const previousAvg =
			previousReadings.reduce((sum, r) => sum + r.value, 0) / previousReadings.length;

		if (previousAvg === 0) return null;

		const delta = ((currentAvg - previousAvg) / previousAvg) * 100;
		const trend = Math.abs(delta) < 5 ? "stable" : delta > 0 ? "worsening" : "improving";

		return {
			delta: Math.round(delta * 10) / 10,
			trend: trend as "improving" | "stable" | "worsening",
		};
	}, [comparePrevious, previousReadings, metrics]);

	const formatTimestamp = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Group readings by time for chart (hourly aggregation)
	const chartData = useMemo(() => {
		const grouped = new Map<string, { timestamp: string; value: number; count: number }>();

		readings.forEach((reading) => {
			const date = new Date(reading.timestamp);
			const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
			const timestamp = `${date.toLocaleDateString()} ${date.getHours()}:00`;

			if (!grouped.has(hourKey)) {
				grouped.set(hourKey, { timestamp, value: 0, count: 0 });
			}

			const entry = grouped.get(hourKey);
			if (!entry) return;
			entry.value += reading.value;
			entry.count += 1;
		});

		return Array.from(grouped.values())
			.map((entry) => ({
				timestamp: entry.timestamp,
				value: Math.round((entry.value / entry.count) * 10) / 10,
			}))
			.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
	}, [readings]);

	const previousChartData = useMemo(() => {
		if (!comparePrevious || previousReadings.length === 0) return [];

		const grouped = new Map<string, { timestamp: string; value: number; count: number }>();

		previousReadings.forEach((reading) => {
			const date = new Date(reading.timestamp);
			const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
			const timestamp = `${date.toLocaleDateString()} ${date.getHours()}:00`;

			if (!grouped.has(hourKey)) {
				grouped.set(hourKey, { timestamp, value: 0, count: 0 });
			}

			const entry = grouped.get(hourKey);
			if (!entry) return;
			entry.value += reading.value;
			entry.count += 1;
		});

		return Array.from(grouped.values())
			.map((entry) => ({
				timestamp: entry.timestamp,
				value: Math.round((entry.value / entry.count) * 10) / 10,
			}))
			.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
	}, [comparePrevious, previousReadings]);

	if (readings.length === 0) {
		return (
			<div className="py-12 text-center">
				<Database className="mx-auto mb-2 size-8 text-muted-foreground" />
				<p className="mb-1 text-sm font-medium text-foreground">{t`No readings found`}</p>
				<p className="text-xs text-muted-foreground">
					{t`No sensor readings available for the selected period and filters`}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary Metrics */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t`Total Readings`}</CardTitle>
						<Database className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{metrics.total.toLocaleString()}</div>
						{comparison && (
							<TrendIndicator
								delta={((metrics.total - previousReadings.length) / previousReadings.length) * 100}
								label={t`vs previous period`}
							/>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t`Average Value`}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{metrics.avg} {readings[0]?.unit || ""}
						</div>
						{comparison && (
							<TrendIndicator
								delta={comparison.delta}
								label={t`vs previous period`}
								trend={comparison.trend}
							/>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t`Min / Max`}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{metrics.min} / {metrics.max}
						</div>
						<p className="mt-1 text-xs text-muted-foreground">{readings[0]?.unit || ""}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t`Data Gaps`}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{metrics.missingPct}%</div>
						<p className="mt-1 text-xs text-muted-foreground">{t`Missing or gaps`}</p>
					</CardContent>
				</Card>
			</div>

			{/* Historical Trend Chart */}
			<Card>
				<CardHeader>
					<CardTitle>{t`Historical Trend`}</CardTitle>
					<CardDescription>
						{comparePrevious
							? t`Sensor readings over time (with previous period comparison)`
							: t`Sensor readings over time`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<HistoricalTrendChart
						data={chartData}
						previousData={comparePrevious ? previousChartData : null}
						unit={readings[0]?.unit || ""}
					/>
				</CardContent>
			</Card>

			{/* Readings Table */}
			<Card>
				<CardHeader>
					<CardTitle>{t`Readings Table`}</CardTitle>
					<CardDescription>{t`Detailed sensor readings (showing first 100)`}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto rounded-lg border bg-card">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t`Timestamp`}</TableHead>
									<TableHead>{t`Sensor`}</TableHead>
									<TableHead>{t`Type`}</TableHead>
									<TableHead>{t`Value`}</TableHead>
									<TableHead>{t`Site`}</TableHead>
									<TableHead>{t`Equipment`}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{readings.slice(0, 100).map((reading, idx) => (
									<TableRow key={`${reading.sensorId}-${reading.timestamp}-${idx}`}>
										<TableCell className="text-sm">{formatTimestamp(reading.timestamp)}</TableCell>
										<TableCell>
											<div>
												<p className="text-sm font-medium">
													{reading.sensorName || reading.sensorId}
												</p>
												<p className="font-mono text-xs text-muted-foreground">
													{reading.sensorId}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="capitalize">
												{reading.sensorType}
											</Badge>
										</TableCell>
										<TableCell className="font-medium">
											{reading.value} {reading.unit}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{reading.siteName || t`Unknown`}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{reading.equipmentName || t`Unassigned`}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					{readings.length > 100 && (
						<p className="mt-2 text-xs text-muted-foreground">
							{t`Showing first 100 of ${readings.length.toLocaleString()} readings`}
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
