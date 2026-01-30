import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { t } from "~@/i18n/macro";

interface HistoricalTrendChartProps {
	data: Array<{ timestamp: string; value: number }>;
	previousData: Array<{ timestamp: string; value: number }> | null;
	unit: string;
}

export function HistoricalTrendChart({ data, previousData, unit }: HistoricalTrendChartProps) {
	if (data.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-muted-foreground">
				{t`No data available for chart`}
			</div>
		);
	}

	// Combine data for chart
	const chartData = data.map((point, idx) => {
		const prevPoint = previousData?.[idx];
		return {
			time: point.timestamp,
			current: point.value,
			previous: prevPoint?.value,
		};
	});

	return (
		<ResponsiveContainer width="100%" height={400}>
			<LineChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
				<YAxis
					tick={{ fontSize: 12 }}
					label={{ value: unit, angle: -90, position: "insideLeft" }}
				/>
				<Tooltip
					formatter={(value: number) => [`${value} ${unit}`, ""]}
					labelFormatter={(label) => t`Time: ${label}`}
				/>
				<Legend />
				<Line
					type="monotone"
					dataKey="current"
					stroke="#3b82f6"
					strokeWidth={2}
					name={t`Current Period`}
					dot={false}
				/>
				{previousData && (
					<Line
						type="monotone"
						dataKey="previous"
						stroke="#94a3b8"
						strokeWidth={2}
						strokeDasharray="5 5"
						name={t`Previous Period`}
						dot={false}
					/>
				)}
			</LineChart>
		</ResponsiveContainer>
	);
}
