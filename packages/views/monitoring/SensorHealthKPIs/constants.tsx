import { Activity, AlertCircle, Clock, XCircle } from "lucide-react";

import { t } from "~@/i18n/macro";

export type KPICardKey =
	| "total"
	| "healthy"
	| "stale"
	| "silent"
	| "ingestionErrors"
	| "qualityIssues";

export interface KPICardConfig {
	key: KPICardKey;
	title: string;
	icon: typeof Activity;
	className: string;
	iconClassName: string;
	subtitle?: (kpis: { total: number; healthy: number }) => string;
}

export const KPI_CARDS_CONFIG: KPICardConfig[] = [
	{
		key: "total",
		title: t`Total Sensors`,
		icon: Activity,
		className: "border-blue-200 bg-blue-50/50",
		iconClassName: "text-blue-600",
	},
	{
		key: "healthy",
		title: t`Healthy Sensors`,
		icon: Activity,
		className: "border-emerald-200 bg-emerald-50/50",
		iconClassName: "text-emerald-600",
		subtitle: (kpis) => t`${Math.round((kpis.healthy / kpis.total) * 100) || 0}% of total`,
	},
	{
		key: "stale",
		title: t`Stale Sensors`,
		icon: Clock,
		className: "border-amber-200 bg-amber-50/50",
		iconClassName: "text-amber-600",
		subtitle: () => t`Late / delayed`,
	},
	{
		key: "silent",
		title: t`Silent Sensors`,
		icon: XCircle,
		className: "border-red-200 bg-red-50/50",
		iconClassName: "text-red-600",
		subtitle: () => t`No data beyond threshold`,
	},
	{
		key: "ingestionErrors",
		title: t`Ingestion Errors`,
		icon: AlertCircle,
		className: "border-orange-200 bg-orange-50/50",
		iconClassName: "text-orange-600",
		subtitle: () => t`Last 24h`,
	},
	// {
	// 	key: "qualityIssues",
	// 	title: t`Data Quality Issues`,
	// 	icon: Database,
	// 	className: "border-purple-200 bg-purple-50/50",
	// 	iconClassName: "text-purple-600",
	// 	subtitle: () => t`Missing / inconsistent`,
	// },
];
