import { AlertTriangle, Clock } from "lucide-react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { getAlertDuration } from "~@/models";
import { Badge } from "~@/ui";

import type { Alert } from "../alerts";

interface RecentAlertsProps {
	alerts: Alert[];
}

function getStatusBadgeConfig(status: string) {
	switch (status) {
		case "active":
			return { label: t`Active`, className: "bg-red-100 text-red-700 border-red-200" };
		case "acknowledged":
			return { label: t`Acknowledged`, className: "bg-amber-100 text-amber-700 border-amber-200" };
		case "resolved":
			return {
				label: t`Resolved`,
				className: "bg-emerald-100 text-emerald-700 border-emerald-200",
			};
		default:
			return { label: status, className: "bg-slate-100 text-slate-700 border-slate-200" };
	}
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
	if (alerts.length === 0) {
		return (
			<div className="py-8 text-center">
				<div className="mb-2 flex justify-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-muted">
						<AlertTriangle className="size-6 text-muted-foreground" aria-hidden="true" />
					</div>
				</div>
				<p className="text-sm text-muted-foreground">{t`No recent alerts`}</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{alerts.map((alert) => {
				const statusConfig = getStatusBadgeConfig(alert.status);
				return (
					<div
						key={alert.id}
						className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30"
					>
						<div
							className={`mt-0.5 size-2 shrink-0 rounded-full ${
								alert.severity === "critical"
									? "bg-red-500"
									: alert.severity === "warning"
										? "bg-amber-500"
										: "bg-muted-foreground"
							}`}
							aria-hidden="true"
						/>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-foreground">{alert.name}</p>
							<p className="mt-0.5 truncate text-xs text-muted-foreground">{alert.description}</p>
							<div className="mt-2 flex items-center gap-2">
								<Badge variant="outline" className={statusConfig.className}>
									{statusConfig.label}
								</Badge>
								<span className="flex items-center gap-1 text-xs text-muted-foreground">
									<Clock className="size-3" aria-hidden="true" />
									{getAlertDuration(alert)}
								</span>
							</div>
						</div>
					</div>
				);
			})}

			{alerts.length > 0 && (
				<Link to="/alerts" className="block py-2 text-center text-xs text-primary hover:underline">
					{t`View all alerts`}
				</Link>
			)}
		</div>
	);
}
