import type { FC } from "react";
import {
	Line,
	LineChart,
	ReferenceArea,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	YAxis,
} from "recharts";

import { t } from "~@/i18n/macro";
import { formatReading, Skeleton } from "~@/ui";

import { formatSparklineData, getLastValue, getSparklineDomain } from "./helpers";
import type { TrendPoint } from "./types";

const IDEAL_FILL = "#10b981";
const IDEAL_FILL_OPACITY = 0.15;
const IDEAL_LINE_OPACITY = 0.6;

interface SparklineRowProps {
	label: string;
	color: string;
	data: TrendPoint[];
	unit?: string;
	/** Ideal range: green band and dotted baseline (mockup) */
	idealMin?: number;
	idealMax?: number;
	/** Show circular data points on the line */
	showDots?: boolean;
	/** Sensor names the series was built from (shown as tooltip) */
	sources?: string[];
	isLoading?: boolean;
}

export const SparklineRow: FC<SparklineRowProps> = ({
	label,
	color,
	data,
	unit,
	idealMin,
	idealMax,
	showDots = false,
	sources,
	isLoading = false,
}) => {
	const sparklineData = formatSparklineData(data);
	const lastValue = getLastValue(data);
	const values = data.map((p) => p.value);
	const domain = getSparklineDomain(values, idealMin, idealMax);
	const hasIdeal = idealMin !== undefined && idealMax !== undefined;
	const idealMid = hasIdeal ? (idealMin + idealMax) / 2 : undefined;

	return (
		<div>
			<div className="flex items-center justify-between mb-1">
				<span
					className="text-xs font-medium text-muted-foreground"
					title={sources && sources.length > 0 ? sources.join(", ") : undefined}
				>
					{label}
				</span>
				<span className="text-xs font-medium tabular-nums text-foreground">
					{data.length > 0 ? formatReading(lastValue, unit) : "—"}
				</span>
			</div>
			<div className="h-12">
				{isLoading ? (
					<Skeleton className="h-full w-full" />
				) : data.length === 0 ? (
					<div className="flex h-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
						{t`No readings in this period`}
					</div>
				) : (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
							<YAxis domain={domain} hide />
							{hasIdeal && (
								<ReferenceArea
									y1={idealMin}
									y2={idealMax}
									fill={IDEAL_FILL}
									fillOpacity={IDEAL_FILL_OPACITY}
								/>
							)}
							{idealMid !== undefined && (
								<ReferenceLine
									y={idealMid}
									stroke={IDEAL_FILL}
									strokeDasharray="3 3"
									strokeWidth={1.5}
									strokeOpacity={IDEAL_LINE_OPACITY}
								/>
							)}
							<Line
								type="monotone"
								dataKey="value"
								stroke={color}
								strokeWidth={2}
								dot={showDots ? { fill: color, r: 2.5, strokeWidth: 0 } : false}
							/>
							<Tooltip content={() => null} />
						</LineChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	);
};
