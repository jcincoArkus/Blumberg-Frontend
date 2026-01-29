import { Activity, AlertTriangle, Wifi, WifiOff } from "lucide-react";

import { Card, CardContent } from "~@/ui";

interface SensorHealthStatsProps {
	stats: {
		total: number;
		active: number;
		offline: number;
		warning: number;
		error: number;
		activePercent: number;
	};
}

export function SensorHealthStats({ stats }: SensorHealthStatsProps) {
	const statCards = [
		{
			label: "Total Sensors",
			value: stats.total,
			icon: Activity,
			color: "text-primary",
			bgColor: "bg-primary/10",
		},
		{
			label: "Active",
			value: stats.active,
			subtitle: `${stats.activePercent}% active`,
			icon: Wifi,
			color: "text-green-600",
			bgColor: "bg-green-100",
		},
		{
			label: "Offline/Stale",
			value: stats.offline,
			icon: WifiOff,
			color: "text-red-600",
			bgColor: "bg-red-100",
		},
		{
			label: "Warning",
			value: stats.warning,
			icon: AlertTriangle,
			color: "text-amber-600",
			bgColor: "bg-amber-100",
		},
		{
			label: "Error",
			value: stats.error,
			icon: AlertTriangle,
			color: "text-red-600",
			bgColor: "bg-red-100",
		},
	];

	return (
		<div
			className="grid gap-4 md:grid-cols-3 lg:grid-cols-5"
			role="region"
			aria-label="Sensor health statistics"
		>
			{statCards.map((stat) => (
				<Card key={stat.label}>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className={`rounded-lg p-2 ${stat.bgColor}`} aria-hidden="true">
								<stat.icon className={`h-5 w-5 ${stat.color}`} />
							</div>
							<div>
								<p className="text-2xl font-bold">{stat.value}</p>
								<p className="text-xs text-muted-foreground">{stat.label}</p>
								{stat.subtitle && <p className="text-xs text-muted-foreground">{stat.subtitle}</p>}
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
