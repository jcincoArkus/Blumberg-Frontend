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
		className: "border-info-border bg-info-subtle/50",
		iconClassName: "text-info",
	},
	{
		key: "healthy",
		title: t`Healthy Sensors`,
		icon: Activity,
		className:
			"border-emerald-200 dark:border-success-border bg-emerald-50/50 dark:bg-success-subtle/50",
		iconClassName: "text-emerald-600 dark:text-success",
		subtitle: (kpis) => t`${Math.round((kpis.healthy / kpis.total) * 100) || 0}% of total`,
	},
	{
		key: "stale",
		title: t`Stale Sensors`,
		icon: Clock,
		className: "border-warning-border bg-warning-subtle/50",
		iconClassName: "text-amber-600 dark:text-warning",
		subtitle: () => t`Late / delayed`,
	},
	{
		key: "silent",
		title: t`Silent Sensors`,
		icon: XCircle,
		className: "border-danger-border bg-danger-subtle/50",
		iconClassName: "text-danger",
		subtitle: () => t`No data beyond threshold`,
	},
	{
		key: "ingestionErrors",
		title: t`Ingestion Errors`,
		icon: AlertCircle,
		className: "border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-500/10",
		iconClassName: "text-orange-600 dark:text-orange-400",
		subtitle: () => t`Last 24h`,
	},
	// {
	// 	key: "qualityIssues",
	// 	title: t`Data Quality Issues`,
	// 	icon: Database,
	// 	className: "border-purple-200 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-500/10",
	// 	iconClassName: "text-purple-600 dark:text-purple-400",
	// 	subtitle: () => t`Missing / inconsistent`,
	// },
];
