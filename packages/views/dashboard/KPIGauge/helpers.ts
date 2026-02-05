export function getGaugeStyles(size: "sm" | "md" | "lg") {
	const radius = size === "sm" ? 36 : size === "md" ? 44 : 52;
	const strokeWidth = size === "sm" ? 6 : size === "md" ? 7 : 8;
	const circumference = 2 * Math.PI * radius;

	return { radius, strokeWidth, circumference };
}

export function getGaugePercentage(value: number, maxValue: number) {
	return Math.min((value / maxValue) * 100, 100);
}

export const statusColors = {
	success: "stroke-success",
	warning: "stroke-warning",
	danger: "stroke-danger",
	neutral: "stroke-primary",
};

export const bgColors = {
	success: "stroke-success/20",
	warning: "stroke-warning/20",
	danger: "stroke-danger/20",
	neutral: "stroke-muted",
};

export const sizeClasses = {
	sm: { svg: "size-20", value: "text-lg", label: "text-[10px]" },
	md: { svg: "size-28", value: "text-2xl", label: "text-xs" },
	lg: { svg: "size-32", value: "text-3xl", label: "text-sm" },
};
