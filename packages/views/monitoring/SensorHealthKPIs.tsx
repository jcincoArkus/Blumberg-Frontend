import { Activity, AlertCircle, Clock, Database, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, cn } from "~@/ui";

interface SensorHealthKPIsProps {
	kpis: {
		total: number;
		healthy: number;
		stale: number;
		silent: number;
		ingestionErrors: number;
		qualityIssues: number;
	};
}

function SensorHealthKPIs({ kpis }: SensorHealthKPIsProps) {
	const cards = [
		{
			title: "Total Sensors",
			value: kpis.total,
			icon: Activity,
			className: "border-blue-200 bg-blue-50/50",
			iconClassName: "text-blue-600",
		},
		{
			title: "Healthy Sensors",
			value: kpis.healthy,
			icon: Activity,
			className: "border-emerald-200 bg-emerald-50/50",
			iconClassName: "text-emerald-600",
			subtitle: `${Math.round((kpis.healthy / kpis.total) * 100) || 0}% of total`,
		},
		{
			title: "Stale Sensors",
			value: kpis.stale,
			icon: Clock,
			className: "border-amber-200 bg-amber-50/50",
			iconClassName: "text-amber-600",
			subtitle: "Late / delayed",
		},
		{
			title: "Silent Sensors",
			value: kpis.silent,
			icon: XCircle,
			className: "border-red-200 bg-red-50/50",
			iconClassName: "text-red-600",
			subtitle: "No data beyond threshold",
		},
		{
			title: "Ingestion Errors",
			value: kpis.ingestionErrors,
			icon: AlertCircle,
			className: "border-orange-200 bg-orange-50/50",
			iconClassName: "text-orange-600",
			subtitle: "Last 24h",
		},
		{
			title: "Data Quality Issues",
			value: kpis.qualityIssues,
			icon: Database,
			className: "border-purple-200 bg-purple-50/50",
			iconClassName: "text-purple-600",
			subtitle: "Missing / inconsistent",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<Card key={card.title} className={cn("border", card.className)}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{card.title}
							</CardTitle>
							<Icon className={cn("h-4 w-4", card.iconClassName)} />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-foreground">{card.value}</div>
							{card.subtitle && (
								<p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

export { SensorHealthKPIs, type SensorHealthKPIsProps };
