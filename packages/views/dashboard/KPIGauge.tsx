import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "~@/ui";

interface KPIGaugeProps {
	label: string;
	value: number;
	unit?: string;
	trend?: number;
	trendLabel?: string;
	status?: "success" | "warning" | "danger" | "neutral";
	size?: "sm" | "md" | "lg";
	maxValue?: number;
}

export function KPIGauge({
	label,
	value,
	unit = "%",
	trend,
	trendLabel = "vs last period",
	status = "neutral",
	size = "md",
	maxValue = 100,
}: KPIGaugeProps) {
	const percentage = Math.min((value / maxValue) * 100, 100);
	const radius = size === "sm" ? 36 : size === "md" ? 44 : 52;
	const strokeWidth = size === "sm" ? 6 : size === "md" ? 7 : 8;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	const statusColors = {
		success: "stroke-success",
		warning: "stroke-warning",
		danger: "stroke-danger",
		neutral: "stroke-primary",
	};

	const bgColors = {
		success: "stroke-success/20",
		warning: "stroke-warning/20",
		danger: "stroke-danger/20",
		neutral: "stroke-muted",
	};

	const sizeClasses = {
		sm: { svg: "size-20", value: "text-lg", label: "text-[10px]" },
		md: { svg: "size-28", value: "text-2xl", label: "text-xs" },
		lg: { svg: "size-32", value: "text-3xl", label: "text-sm" },
	};

	return (
		<div className="flex flex-col items-center">
			<div className="relative">
				<svg
					className={cn(sizeClasses[size].svg, "-rotate-90")}
					viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
					aria-hidden="true"
				>
					{/* Background circle */}
					<circle
						cx={radius + strokeWidth}
						cy={radius + strokeWidth}
						r={radius}
						fill="none"
						className={bgColors[status]}
						strokeWidth={strokeWidth}
					/>
					{/* Progress circle */}
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
				{/* Value in center */}
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className={cn("font-semibold text-foreground", sizeClasses[size].value)}>
						{value.toLocaleString()}
						<span className="text-muted-foreground text-xs font-normal">{unit}</span>
					</span>
				</div>
			</div>

			{/* Label */}
			<p className={cn("mt-2 text-center font-medium text-foreground", sizeClasses[size].label)}>
				{label}
			</p>

			{/* Trend */}
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
