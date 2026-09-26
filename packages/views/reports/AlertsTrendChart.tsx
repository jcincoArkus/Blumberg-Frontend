import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
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

interface AlertsTrendChartProps {
	data: Array<{
		date: string;
		count: number;
		critical: number;
		warning: number;
		info: number;
	}>;
}

export function AlertsTrendChart({ data }: AlertsTrendChartProps) {
	if (data.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-muted-foreground">
				{t`No data available for chart`}
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={400}>
			<BarChart data={data}>
				<CartesianGrid {...chartGridProps} />
				<XAxis {...chartAxisProps} dataKey="date" angle={-45} textAnchor="end" height={80} />
				<YAxis {...chartAxisProps} />
				<Tooltip {...chartTooltipProps} />
				<Legend {...chartLegendProps} />
				<Bar dataKey="critical" stackId="severity" fill={chartColors.danger} name={t`Critical`} />
				<Bar dataKey="warning" stackId="severity" fill={chartColors.warning} name={t`Warning`} />
				<Bar dataKey="info" stackId="severity" fill={chartColors.info} name={t`Info`} />
			</BarChart>
		</ResponsiveContainer>
	);
}
