import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "~@/ui";

interface MetricData {
	value: number;
	unit: string;
	trend: "up" | "down" | "stable";
	status: "stable" | "rising" | "improving";
}

export interface KeyMetricsCardsProps {
	aqi: MetricData;
	co2: MetricData;
	temperature: MetricData;
	humidity: MetricData;
}

function MetricCard({ label, metric }: { label: string; metric: MetricData }) {
	const trendConfig = {
		up: { icon: TrendingUp, color: "text-red-600" },
		down: { icon: TrendingDown, color: "text-emerald-600" },
		stable: { icon: Minus, color: "text-slate-500" },
	};

	const statusConfig = {
		stable: "text-slate-600",
		rising: "text-amber-600",
		improving: "text-emerald-600",
	};

	const { icon: TrendIcon, color: trendColor } = trendConfig[metric.trend];
	const statusColor = statusConfig[metric.status];

	return (
		<div className="bg-card text-card-foreground rounded-xl border shadow-sm">
			<div className="p-2.5">
				<div className="space-y-0.5 text-center">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						{label}
					</p>
					<div className="flex items-baseline justify-center gap-1.5">
						<p className="text-3xl font-bold tracking-tight">{metric.value}</p>
						{metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
					</div>
					<div className="flex items-center justify-center gap-1.5 pt-0.5">
						<TrendIcon className={cn("size-3", trendColor)} />
						<span className={cn("text-xs font-medium", statusColor)}>
							{metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export function KeyMetricsCards({ aqi, co2, temperature, humidity }: KeyMetricsCardsProps) {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
			<MetricCard label="AQI" metric={aqi} />
			<MetricCard label="CO₂" metric={co2} />
			<MetricCard label="Temperature" metric={temperature} />
			<MetricCard label="Humidity" metric={humidity} />
		</div>
	);
}
