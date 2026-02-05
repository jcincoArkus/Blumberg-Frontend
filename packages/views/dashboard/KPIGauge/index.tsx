import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { t } from "~@/i18n/macro";
import { cn } from "~@/ui";

import { bgColors, getGaugePercentage, getGaugeStyles, sizeClasses, statusColors } from "./helpers";
import type { KPIGaugeProps } from "./types";

export type { KPIGaugeProps } from "./types";

export function KPIGauge({
	label,
	value,
	unit = "%",
	trend,
	trendLabel = t`vs last period`,
	status = "neutral",
	size = "md",
	maxValue = 100,
}: KPIGaugeProps) {
	const percentage = getGaugePercentage(value, maxValue);
	const { radius, strokeWidth, circumference } = getGaugeStyles(size);
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<div className="flex flex-col items-center">
			<div className="relative">
				<svg
					className={cn(sizeClasses[size].svg, "-rotate-90")}
					viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
					aria-hidden="true"
				>
					<circle
						cx={radius + strokeWidth}
						cy={radius + strokeWidth}
						r={radius}
						fill="none"
						className={bgColors[status]}
						strokeWidth={strokeWidth}
					/>
					<circle
						cx={radius + strokeWidth}
						cy={radius + strokeWidth}
						r={radius}
						fill="none"
						className={statusColors[status]}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className={cn("font-semibold text-foreground", sizeClasses[size].value)}>
						{value.toLocaleString()}
						<span className="text-muted-foreground text-xs font-normal">{unit}</span>
					</span>
				</div>
			</div>

			<p className={cn("mt-2 text-center font-medium text-foreground", sizeClasses[size].label)}>
				{label}
			</p>

			{trend !== undefined && (
				<div
					className={cn(
						"mt-1 flex items-center gap-1",
						trend > 0 ? "text-success" : trend < 0 ? "text-danger" : "text-muted-foreground",
					)}
				>
					{trend > 0 ? (
						<TrendingUp className="size-3" aria-hidden="true" />
					) : trend < 0 ? (
						<TrendingDown className="size-3" aria-hidden="true" />
					) : (
						<Minus className="size-3" aria-hidden="true" />
					)}
					<span className="text-[10px]">
						{trend > 0 ? "+" : ""}
						{trend}% {trendLabel}
					</span>
				</div>
			)}
		</div>
	);
}
