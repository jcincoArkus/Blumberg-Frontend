import type { FC } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatSparklineData, getLastValue } from "./helpers";
import type { TrendPoint } from "./types";

interface SparklineRowProps {
	label: string;
	color: string;
	data: TrendPoint[];
	unit?: string;
}

export const SparklineRow: FC<SparklineRowProps> = ({ label, color, data, unit }) => {
	const sparklineData = formatSparklineData(data);
	const lastValue = getLastValue(data);

	return (
		<div>
			<div className="flex items-center justify-between mb-1">
				<span className="text-xs font-medium text-muted-foreground">{label}</span>
				<span className="text-xs text-muted-foreground">
					{lastValue}
					{unit ? ` ${unit}` : ""}
				</span>
			</div>
			<div className="h-12">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={sparklineData}>
						<Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
						<Tooltip content={() => null} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};
