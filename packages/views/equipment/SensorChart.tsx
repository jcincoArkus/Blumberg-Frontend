import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { t } from "~@/i18n/macro";
import { chartColors, chartGridProps, chartTooltipProps, formatReading } from "~@/ui";

interface SensorChartProps {
	data: { timestamp: string; value: number }[];
	unit: string;
	color?: string;
	warningThreshold?: number;
	criticalThreshold?: number;
	height?: number;
}

export function SensorChart({
	data,
	unit,
	color = chartColors.primary,
	warningThreshold,
	criticalThreshold,
	height = 200,
}: SensorChartProps) {
	const formattedData = data.map((d) => ({
		...d,
		time: new Date(d.timestamp).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
		}),
	}));

	const values = data.map((d) => d.value);
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const padding = (maxValue - minValue) * 0.1 || 5;
	const yMin = Math.floor(minValue - padding);
	const yMax = Math.ceil(maxValue + padding);

	return (
		<ResponsiveContainer width="100%" height={height}>
			<LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
				<CartesianGrid {...chartGridProps} />
				<XAxis
					dataKey="time"
					tick={{ fontSize: 10, fill: chartColors.axis }}
					tickLine={false}
					axisLine={{ stroke: chartColors.axisLine }}
					interval="preserveStartEnd"
				/>
				<YAxis
					tick={{ fontSize: 10, fill: chartColors.axis }}
					tickLine={false}
					axisLine={false}
					domain={[yMin, yMax]}
					tickFormatter={(value) => formatReading(value, unit, { compact: true })}
					width={50}
				/>
				<Tooltip
					{...chartTooltipProps}
					formatter={(value: number) => [formatReading(value, unit), t`Value`]}
				/>
				{warningThreshold && (
					<ReferenceLine
						y={warningThreshold}
						stroke={chartColors.warning}
						strokeDasharray="3 3"
						label={{
							value: t`Warning`,
							position: "right",
							fontSize: 10,
							fill: chartColors.warning,
						}}
					/>
				)}
				{criticalThreshold && (
					<ReferenceLine
						y={criticalThreshold}
						stroke={chartColors.danger}
						strokeDasharray="3 3"
						label={{
							value: t`Critical`,
							position: "right",
							fontSize: 10,
							fill: chartColors.danger,
						}}
					/>
				)}
				<Line
					type="monotone"
					dataKey="value"
					stroke={color}
					strokeWidth={2}
					dot={false}
					activeDot={{ r: 4, fill: color }}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
