import { AlertCircle, CheckCircle2, Clock, Radio } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

import { AlertDetailsDrawer } from "../alerts/AlertDetailsDrawer";
import type { Alert } from "../alerts/types";

interface GlobalStatusBarProps {
	systemStatus: "healthy" | "degraded" | "critical";
	activeAlerts: { high: number; medium: number; low: number };
	sensorsOnline: number;
	totalSensors: number;
	alerts?: Alert[];
}

function getStatusConfig(status: "healthy" | "degraded" | "critical") {
	const configs = {
		healthy: {
			icon: CheckCircle2,
			label: t`Healthy`,
			className: "text-emerald-600 bg-emerald-50 border-emerald-200",
		},
		degraded: {
			icon: AlertCircle,
			label: t`Degraded`,
			className: "text-amber-600 bg-amber-50 border-amber-200",
		},
		critical: {
			icon: AlertCircle,
			label: t`Critical`,
			className: "text-red-600 bg-red-50 border-red-200",
		},
	};
	return configs[status];
}

export function GlobalStatusBar({
	systemStatus,
	activeAlerts,
	sensorsOnline,
	totalSensors,
	alerts = [],
}: GlobalStatusBarProps) {
	const [selectedSeverity, setSelectedSeverity] = useState<"high" | "medium" | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const config = getStatusConfig(systemStatus);
	const Icon = config.icon;
	const currentTime = new Date().toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	const getFirstAlertBySeverity = (severity: "high" | "medium") => {
		const severityAlerts = alerts.filter(
			(a) =>
				(a.status === "active" || a.status === "acknowledged") &&
				(severity === "high"
					? a.severity === "high" || a.severity === "critical"
					: a.severity === severity),
		);
		return severityAlerts.length > 0 ? severityAlerts[0] : null;
	};

	const handleSeverityClick = (severity: "high" | "medium") => {
		const firstAlert = getFirstAlertBySeverity(severity);
		if (firstAlert) {
			setSelectedSeverity(severity);
			setIsDrawerOpen(true);
		}
	};

	const selectedAlert = selectedSeverity ? getFirstAlertBySeverity(selectedSeverity) : null;

	return (
		<>
			<div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 lg:-mx-6">
				<div className="flex items-center justify-between px-4 lg:px-6 py-2.5 text-sm">
					<div className="flex items-center gap-6">
						{/* System Status */}
						<div className="flex items-center gap-2">
							<Icon className={cn("size-4", config.className.split(" ")[0])} />
							<span className="font-medium">
								{t`System:`} {config.label}
							</span>
						</div>

						{/* Active Alerts Summary */}
						<div className="flex items-center gap-2">
							<AlertCircle className="size-4 text-muted-foreground" />
							<span className="text-muted-foreground">{t`Alerts:`}</span>
							{activeAlerts.high > 0 && (
								<button
									type="button"
									onClick={() => handleSeverityClick("high")}
									className="cursor-pointer hover:opacity-80 transition-opacity"
									title={t`View high severity alerts`}
								>
									<Badge variant="destructive" className="h-5 px-1.5 text-xs">
										{t`${activeAlerts.high} High`}
									</Badge>
								</button>
							)}
							{activeAlerts.medium > 0 && (
								<button
									type="button"
									onClick={() => handleSeverityClick("medium")}
									className="cursor-pointer hover:opacity-80 transition-opacity"
									title={t`View medium severity alerts`}
								>
									<Badge
										variant="outline"
										className="h-5 px-1.5 text-xs border-amber-500 text-amber-700"
									>
										{t`${activeAlerts.medium} Medium`}
									</Badge>
								</button>
							)}
							{activeAlerts.low > 0 && (
								<Link to="/alerts?severity=low">
									<Badge
										variant="outline"
										className="h-5 px-1.5 text-xs hover:opacity-80 transition-opacity cursor-pointer"
									>
										{t`${activeAlerts.low} Low`}
									</Badge>
								</Link>
							)}
							{activeAlerts.high === 0 && activeAlerts.medium === 0 && activeAlerts.low === 0 && (
								<span className="text-muted-foreground">{t`None`}</span>
							)}
						</div>

						{/* Current Time */}
						<div className="flex items-center gap-2">
							<Clock className="size-4 text-muted-foreground" />
							<span className="text-muted-foreground">{currentTime}</span>
						</div>
					</div>

					{/* Sensors Online */}
					<Link
						to="/monitoring/sensor-health"
						className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer"
						title={t`View sensor health details`}
					>
						<Radio className="size-4 text-muted-foreground" />
						<span className="text-muted-foreground hover:text-foreground">
							{t`${sensorsOnline} / ${totalSensors} sensors online`}
						</span>
					</Link>
				</div>
			</div>

			{selectedAlert && (
				<AlertDetailsDrawer
					alert={selectedAlert}
					open={isDrawerOpen}
					onOpenChange={(open) => {
						setIsDrawerOpen(open);
						if (!open) {
							setSelectedSeverity(null);
						}
					}}
				/>
			)}
		</>
	);
}
