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
import {
	chartAxisProps,
	chartColors,
	chartGridProps,
	chartLegendProps,
	chartTooltipProps,
} from "~@/ui";

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
				<CartesianGrid {...chartGridProps} />
				<XAxis {...chartAxisProps} dataKey="time" angle={-45} textAnchor="end" height={80} />
				<YAxis
					{...chartAxisProps}
					label={{ value: unit, angle: -90, position: "insideLeft", fill: chartColors.axis }}
				/>
				<Tooltip
					{...chartTooltipProps}
					formatter={(value: number) => [`${value} ${unit}`, ""]}
					labelFormatter={(label) => t`Time: ${label}`}
				/>
				<Legend {...chartLegendProps} />
				<Line
					type="monotone"
					dataKey="current"
					stroke={chartColors.info}
					strokeWidth={2}
					name={t`Current Period`}
					dot={false}
				/>
				{previousData && (
					<Line
						type="monotone"
						dataKey="previous"
						stroke={chartColors.muted}
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
