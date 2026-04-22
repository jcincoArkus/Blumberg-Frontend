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
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
				<YAxis tick={{ fontSize: 12 }} />
				<Tooltip />
				<Legend />
				<Bar dataKey="critical" stackId="severity" fill="#ef4444" name={t`Critical`} />
				<Bar dataKey="warning" stackId="severity" fill="#f97316" name={t`Warning`} />
				<Bar dataKey="info" stackId="severity" fill="#3b82f6" name={t`Info`} />
			</BarChart>
		</ResponsiveContainer>
	);
}
