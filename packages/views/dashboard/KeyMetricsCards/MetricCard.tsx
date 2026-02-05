import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "~@/ui";

import type { MetricData } from "./types";

interface MetricCardProps {
	label: string;
	metric: MetricData;
	statusLabel: string;
}

export function MetricCard({ label, metric, statusLabel }: MetricCardProps) {
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
						<span className={cn("text-xs font-medium", statusColor)}>{statusLabel}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
