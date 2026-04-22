export interface KPIGaugeProps {
	label: string;
	value: number;
	unit?: string;
	trend?: number;
	trendLabel?: string;
	status?: "success" | "warning" | "danger" | "neutral";
	size?: "sm" | "md" | "lg";
	maxValue?: number;
}
