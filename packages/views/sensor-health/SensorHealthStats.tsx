import { Activity, AlertTriangle, Wifi, WifiOff } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Card, CardContent, Spinner } from "~@/ui";

interface SensorHealthStatsProps {
	stats: {
		total: number;
		active: number;
		offline: number;
		warning: number;
		error: number;
		activePercent: number;
	};
	/** First load in flight: show spinners instead of 0 counts. */
	isLoading?: boolean;
}

export function SensorHealthStats({ stats, isLoading = false }: SensorHealthStatsProps) {
	const getStatCards = () => [
		{
			label: t`Total Sensors`,
			value: stats.total,
			icon: Activity,
			color: "text-primary",
			bgColor: "bg-primary/10",
		},
		{
			label: t`Active`,
			value: stats.active,
			subtitle: t`${stats.activePercent}% active`,
			icon: Wifi,
			color: "text-green-600 dark:text-success",
			bgColor: "bg-green-100 dark:bg-success-subtle",
		},
		{
			label: t`Offline/Stale`,
			value: stats.offline,
			icon: WifiOff,
			color: "text-danger",
			bgColor: "bg-red-100 dark:bg-danger-subtle",
		},
		{
			label: t`Warning`,
			value: stats.warning,
			icon: AlertTriangle,
			color: "text-amber-600 dark:text-warning",
			bgColor: "bg-amber-100 dark:bg-warning-subtle",
		},
		{
			label: t`Error`,
			value: stats.error,
			icon: AlertTriangle,
			color: "text-danger",
			bgColor: "bg-red-100 dark:bg-danger-subtle",
		},
	];

	const statCards = getStatCards();

	return (
		<div
			className="grid gap-4 md:grid-cols-3 lg:grid-cols-5"
			role="region"
			aria-label={t`Sensor health statistics`}
		>
			{statCards.map((stat) => (
				<Card key={stat.label}>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className={`rounded-lg p-2 ${stat.bgColor}`} aria-hidden="true">
								<stat.icon className={`h-5 w-5 ${stat.color}`} />
							</div>
							<div>
								{isLoading ? (
									<div className="flex h-8 items-center">
										<Spinner aria-label={t`Loading…`} className="size-5 text-primary" />
									</div>
								) : (
									<p className="text-2xl font-bold">{stat.value}</p>
								)}
								<p className="text-xs text-muted-foreground">{stat.label}</p>
								{!isLoading && stat.subtitle && (
									<p className="text-xs text-muted-foreground">{stat.subtitle}</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
