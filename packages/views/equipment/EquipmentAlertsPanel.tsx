import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";

import { t } from "~@/i18n/macro";
import { getSeverityConfig } from "~@/models";
import { Badge, Button, cn, DashboardPanel, Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";

import type { Alert } from "../alerts";

interface EquipmentAlertsPanelProps {
	activeAlerts: Alert[];
	recentAlerts: Alert[];
}

function formatTimestamp(dateStr: string) {
	const date = new Date(dateStr);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getSeverityBadge(severity: string) {
	const config = getSeverityConfig();
	const severityKey = severity.toLowerCase();
	const cfg = config[severityKey as keyof typeof config] ?? config.info;

	return (
		<Badge variant="outline" className={cn("border text-xs", cfg.className)}>
			{cfg.label}
		</Badge>
	);
}

function getStatusIcon(status: string) {
	if (status === "resolved") {
		return <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />;
	}
	if (status === "acknowledged") {
		return <AlertCircle className="size-4 text-amber-600" aria-hidden="true" />;
	}
	return <AlertTriangle className="size-4 text-red-600" aria-hidden="true" />;
}

export function EquipmentAlertsPanel({ activeAlerts, recentAlerts }: EquipmentAlertsPanelProps) {
	const [severityFilter, setSeverityFilter] = useState<"all" | "Warning" | "Alert">("all");

	const filteredActiveAlerts =
		severityFilter === "all"
			? activeAlerts
			: activeAlerts.filter((alert) => {
					if (severityFilter === "Warning") {
						return alert.severity === "info";
					}
					return alert.severity === "critical" || alert.severity === "warning";
				});

	const resolvedAlerts = recentAlerts.filter((a) => a.status === "resolved");
	const acknowledgedAlerts = recentAlerts.filter((a) => a.status === "acknowledged");

	return (
		<DashboardPanel title={t`Alerts`} description={t`Active and recent alerts for this equipment`}>
			<Tabs defaultValue="active" className="w-full">
				<TabsList className="mb-4 grid w-full grid-cols-2">
					<TabsTrigger value="active" className="text-xs">
						{t`Active (${activeAlerts.length})`}
					</TabsTrigger>
					<TabsTrigger value="recent" className="text-xs">
						{t`Recent (${recentAlerts.length})`}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="active" className="space-y-3">
					{activeAlerts.length > 0 && (
						<div className="mb-3 flex items-center gap-2">
							<span className="text-xs text-muted-foreground">{t`Filter:`}</span>
							<Button
								variant={severityFilter === "all" ? "default" : "outline"}
								size="sm"
								onClick={() => setSeverityFilter("all")}
								className="h-6 text-xs"
							>
								{t`All`}
							</Button>
							<Button
								variant={severityFilter === "Alert" ? "default" : "outline"}
								size="sm"
								onClick={() => setSeverityFilter("Alert")}
								className="h-6 text-xs"
							>
								{t`Alert`}
							</Button>
							<Button
								variant={severityFilter === "Warning" ? "default" : "outline"}
								size="sm"
								onClick={() => setSeverityFilter("Warning")}
								className="h-6 text-xs"
							>
								{t`Warning`}
							</Button>
						</div>
					)}

					{filteredActiveAlerts.length === 0 ? (
						<EmptyState
							icon={<CheckCircle2 className="size-6 text-muted-foreground" />}
							message={
								activeAlerts.length === 0
									? t`No active alerts`
									: t`No alerts match the selected filter`
							}
						/>
					) : (
						<AlertsList alerts={filteredActiveAlerts} showDuration />
					)}
				</TabsContent>

				<TabsContent value="recent" className="space-y-3">
					{recentAlerts.length === 0 ? (
						<EmptyState
							icon={<AlertTriangle className="size-6 text-muted-foreground" />}
							message={t`No recent alerts`}
						/>
					) : (
						<div className="max-h-100 space-y-3 overflow-y-auto">
							{acknowledgedAlerts.length > 0 && (
								<AlertGroup
									title={t`Acknowledged (${acknowledgedAlerts.length})`}
									alerts={acknowledgedAlerts}
									borderClass="border-amber-200 bg-amber-50"
								/>
							)}
							{resolvedAlerts.length > 0 && (
								<AlertGroup
									title={t`Resolved (${resolvedAlerts.length})`}
									alerts={resolvedAlerts}
									borderClass="border-slate-200 bg-slate-50"
								/>
							)}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</DashboardPanel>
	);
}

// Helper components
function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
	return (
		<div className="py-8 text-center">
			<div className="mb-2 flex justify-center">
				<div className="flex size-12 items-center justify-center rounded-full bg-muted">{icon}</div>
			</div>
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	);
}

function AlertCard({
	alert,
	borderClass,
	showDuration,
}: {
	alert: Alert;
	borderClass: string;
	showDuration?: boolean;
}) {
	return (
		<div className={cn("rounded-lg border p-3 transition-colors", borderClass)}>
			<div className="flex items-start gap-2">
				<div className="mt-0.5 shrink-0">{getStatusIcon(alert.status)}</div>
				<div className="min-w-0 flex-1 space-y-1.5">
					<div className="flex items-start justify-between gap-2">
						<h4 className="text-sm font-medium text-foreground">{alert.name}</h4>
						{getSeverityBadge(alert.severity)}
					</div>
					<p className="text-xs text-muted-foreground">{alert.description}</p>
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Clock className="size-3" aria-hidden="true" />
							{formatTimestamp(alert.createdAt)}
						</span>
						{showDuration && <span>{t`Duration: ${alert.duration}`}</span>}
						{alert.acknowledgedAt && (
							<span>{t`Acknowledged: ${formatTimestamp(alert.acknowledgedAt)}`}</span>
						)}
						{alert.resolvedAt && <span>{t`Resolved: ${formatTimestamp(alert.resolvedAt)}`}</span>}
					</div>
				</div>
			</div>
		</div>
	);
}

function AlertsList({ alerts, showDuration }: { alerts: Alert[]; showDuration?: boolean }) {
	return (
		<div className="max-h-100 space-y-2 overflow-y-auto">
			{alerts.map((alert) => (
				<AlertCard
					key={alert.id}
					alert={alert}
					borderClass={
						alert.severity === "critical" || alert.severity === "warning"
							? "border-red-200 bg-red-50"
							: "border-amber-200 bg-amber-50"
					}
					showDuration={showDuration}
				/>
			))}
		</div>
	);
}

function AlertGroup({
	title,
	alerts,
	borderClass,
}: {
	title: string;
	alerts: Alert[];
	borderClass: string;
}) {
	return (
		<div>
			<h4 className="mb-2 text-xs font-medium text-muted-foreground">{title}</h4>
			<div className="space-y-2">
				{alerts.map((alert) => (
					<AlertCard key={alert.id} alert={alert} borderClass={borderClass} />
				))}
			</div>
		</div>
	);
}
