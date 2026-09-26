import type { CSSProperties } from "react";

/**
 * Theme-aware recharts styling. Every value is a CSS variable from apps/app/src/app.css, so charts follow
 * light/dark automatically without re-rendering (SVG presentation attributes resolve `var()` at paint time).
 *
 * Usage:
 *   <CartesianGrid {...chartGridProps} />
 *   <XAxis dataKey="t" {...chartAxisProps} />
 *   <YAxis {...chartAxisProps} />
 *   <Tooltip {...chartTooltipProps} />
 *   <Line stroke={chartColors.series[0]} /> · <Bar fill={chartColors.danger} />
 */
export const chartColors = {
	/** Categorical series palette (--chart-1..5). */
	series: [
		"var(--chart-1)",
		"var(--chart-2)",
		"var(--chart-3)",
		"var(--chart-4)",
		"var(--chart-5)",
	] as const,
	primary: "var(--primary)",
	success: "var(--success)",
	warning: "var(--warning)",
	danger: "var(--danger)",
	info: "var(--info)",
	/** De-emphasised series / reference lines. */
	muted: "var(--muted-foreground)",
	grid: "var(--border)",
	axis: "var(--muted-foreground)",
	axisLine: "var(--border)",
	/** Background of the chart surface; use for dot strokes / halo rings. */
	surface: "var(--card)",
} as const;

/** Spread onto <CartesianGrid>. */
export const chartGridProps = {
	stroke: chartColors.grid,
	strokeDasharray: "3 3",
	vertical: false,
} as const;

/** Spread onto <XAxis> / <YAxis>. Override `tick` if you need a different font size. */
export const chartAxisProps = {
	stroke: chartColors.axisLine,
	tick: { fill: chartColors.axis, fontSize: 12 },
	tickLine: false,
	axisLine: { stroke: chartColors.axisLine },
} as const;

const tooltipContentStyle: CSSProperties = {
	backgroundColor: "var(--popover)",
	color: "var(--popover-foreground)",
	border: "1px solid var(--border)",
	borderRadius: "8px",
	fontSize: "12px",
	boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

/** Spread onto recharts <Tooltip>. */
export const chartTooltipProps = {
	contentStyle: tooltipContentStyle,
	labelStyle: { color: "var(--popover-foreground)", fontWeight: 500, marginBottom: 4 },
	itemStyle: { color: "var(--popover-foreground)" },
	cursor: { fill: "var(--muted)", fillOpacity: 0.5, stroke: "var(--border)" },
} as const;

/** Spread onto recharts <Legend> (wrapperStyle). */
export const chartLegendProps = {
	wrapperStyle: { color: "var(--muted-foreground)", fontSize: "12px" },
} as const;
