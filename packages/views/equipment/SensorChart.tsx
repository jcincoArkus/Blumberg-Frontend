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
	color = "#0d7377",
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
				<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
				<XAxis
					dataKey="time"
					tick={{ fontSize: 10, fill: "#64748b" }}
					tickLine={false}
					axisLine={{ stroke: "#e2e8f0" }}
					interval="preserveStartEnd"
				/>
				<YAxis
					tick={{ fontSize: 10, fill: "#64748b" }}
					tickLine={false}
					axisLine={false}
					domain={[yMin, yMax]}
					tickFormatter={(value) => `${value}${unit}`}
					width={50}
				/>
				<Tooltip
					contentStyle={{
						backgroundColor: "#fff",
						border: "1px solid #e2e8f0",
						borderRadius: "8px",
						fontSize: "12px",
						boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
					}}
					formatter={(value: number) => [`${value}${unit}`, t`Value`]}
					labelStyle={{ fontWeight: 500, marginBottom: 4 }}
				/>
				{warningThreshold && (
					<ReferenceLine
						y={warningThreshold}
						stroke="#f59e0b"
						strokeDasharray="3 3"
						label={{ value: t`Warning`, position: "right", fontSize: 10, fill: "#f59e0b" }}
					/>
				)}
				{criticalThreshold && (
					<ReferenceLine
						y={criticalThreshold}
						stroke="#dc2626"
						strokeDasharray="3 3"
						label={{ value: t`Critical`, position: "right", fontSize: 10, fill: "#dc2626" }}
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
