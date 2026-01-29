import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";

import { Badge, cn } from "~@/ui";

import { AlertDetailsDrawer } from "../alerts/AlertDetailsDrawer";
import type { Alert } from "../alerts/types";

interface ActiveAlertsPanelProps {
	alerts: Alert[];
	getEquipmentName?: (equipmentId?: string) => string;
	getSiteName?: (siteId?: string) => string;
}

function formatDuration(createdAt: string): string {
	const now = new Date();
	const created = new Date(createdAt);
	const diffMs = now.getTime() - created.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
	if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
	return `${diffMins}m`;
}

function getSeverityIcon(severity: string) {
	switch (severity) {
		case "critical":
			return AlertTriangle;
		case "high":
			return AlertCircle;
		default:
			return Info;
	}
}

function getSeverityColor(severity: string) {
	switch (severity) {
		case "critical":
			return "text-red-700 bg-red-50 border-red-200";
		case "high":
			return "text-orange-700 bg-orange-50 border-orange-200";
		case "medium":
			return "text-amber-700 bg-amber-50 border-amber-200";
		default:
			return "text-slate-700 bg-slate-50 border-slate-200";
	}
}

function getBadgeClassName(severity: string) {
	switch (severity) {
		case "critical":
			return "bg-red-600 text-white border-0";
		case "high":
			return "bg-orange-100 text-orange-900 border-0";
		case "medium":
			return "bg-amber-100 text-amber-900 border-0";
		default:
			return "bg-slate-100 text-slate-900 border-0";
	}
}

function getTextColor(severity: string) {
	switch (severity) {
		case "critical":
			return "text-red-700";
		case "high":
			return "text-orange-700";
		case "medium":
			return "text-amber-700";
		default:
			return "text-slate-700";
	}
}

export function ActiveAlertsPanel({
	alerts,
	getEquipmentName = () => "Unknown",
	getSiteName = () => "Unknown",
}: ActiveAlertsPanelProps) {
	const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const sortedAlerts = [...alerts].sort((a, b) => {
		const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
		const aOrder = severityOrder[a.severity] ?? 3;
		const bOrder = severityOrder[b.severity] ?? 3;

		if (aOrder !== bOrder) return aOrder - bOrder;

		const aTime = new Date(a.createdAt).getTime();
		const bTime = new Date(b.createdAt).getTime();
		return aTime - bTime;
	});

	const handleAlertClick = (alert: Alert) => {
		setSelectedAlert(alert);
		setIsDrawerOpen(true);
	};

	return (
		<>
			<div className="h-full flex flex-col bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
				<div className="px-3 pt-3 pb-0.5">
					<h3 className="text-base font-semibold leading-tight">Active Alerts</h3>
				</div>
				<div className="flex-1 divide-y overflow-y-auto">
					{sortedAlerts.length === 0 ? (
						<div className="p-3 text-center text-xs text-muted-foreground">No active alerts</div>
					) : (
						sortedAlerts.map((alert) => {
							const Icon = getSeverityIcon(alert.severity);
							const duration = formatDuration(alert.createdAt);
							const sensorType =
								alert.name
									.split(" ")
									.find((word) =>
										[
											"CO₂",
											"Temp",
											"Temperature",
											"Humidity",
											"Pressure",
											"Energy",
											"AQI",
										].includes(word),
									) ||
								alert.name.split(" ")[0] ||
								"System";
							const zone = getEquipmentName(alert.equipmentId) || getSiteName(alert.siteId);

							return (
								<button
									key={alert.id}
									type="button"
									onClick={() => handleAlertClick(alert)}
									className={cn(
										"w-full text-left block px-3 py-1.5 transition-colors hover:opacity-90 cursor-pointer",
										getSeverityColor(alert.severity),
									)}
								>
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-1.5 flex-1 min-w-0">
											<Icon className="size-3.5 shrink-0" />
											<Badge
												variant={alert.severity === "critical" ? "destructive" : "outline"}
												className={cn(
													"text-[10px] h-4 px-1.5 font-medium rounded-sm",
													getBadgeClassName(alert.severity),
												)}
											>
												{alert.severity.toUpperCase()}
											</Badge>
											<span
												className={cn("text-xs font-medium truncate", getTextColor(alert.severity))}
											>
												{sensorType}
											</span>
										</div>
										<div className="flex flex-col items-end min-w-0">
											<span className="text-[11px] text-muted-foreground truncate">{zone}</span>
											<span className="text-[11px] text-muted-foreground whitespace-nowrap">
												{duration}
											</span>
										</div>
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>

			{selectedAlert && (
				<AlertDetailsDrawer
					alert={selectedAlert}
					open={isDrawerOpen}
					onOpenChange={(open) => {
						setIsDrawerOpen(open);
						if (!open) setSelectedAlert(null);
					}}
					equipmentName={getEquipmentName(selectedAlert.equipmentId)}
				/>
			)}
		</>
	);
}
