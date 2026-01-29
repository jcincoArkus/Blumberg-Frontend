import { useCallback, useState } from "react";

import type { Alert, AlertStatus } from "~@/views";
import {
	AlertsStatusTabs,
	AlertsWorkQueueTable,
	DashboardPanel,
	DashboardShell,
	KPIGauge,
} from "~@/views";

import {
	alertsData,
	calculateAlertDuration,
	getEquipmentName,
	getSensorName,
	getSensorType,
} from "../../mock-data/alerts";

export default function AlertsPage() {
	const [activeTab, setActiveTab] = useState<AlertStatus | "all">("all");
	const [alertsState, setAlertsState] = useState<Alert[]>(alertsData);

	// Filter alerts based on active tab
	const filteredAlerts =
		activeTab === "all" ? alertsState : alertsState.filter((a) => a.status === activeTab);

	// Handler to update alert status
	const handleAlertUpdate = useCallback((alertId: string, action: "acknowledge" | "resolve") => {
		setAlertsState((prev) =>
			prev.map((alert) => {
				if (alert.id !== alertId) return alert;

				if (action === "acknowledge" && alert.status === "active") {
					return {
						...alert,
						status: "acknowledged" as const,
						acknowledgedAt: new Date().toISOString(),
					};
				}

				if (action === "resolve" && alert.status !== "resolved") {
					return {
						...alert,
						status: "resolved" as const,
						resolvedAt: new Date().toISOString(),
					};
				}

				return alert;
			}),
		);
	}, []);

	// Calculate counts for tabs
	const activeAlerts = alertsState.filter((a) => a.status === "active");
	const criticalAlerts = alertsState.filter(
		(a) => a.severity === "critical" && a.status === "active",
	);
	const highAlerts = alertsState.filter((a) => a.severity === "high" && a.status === "active");
	const acknowledgedAlerts = alertsState.filter((a) => a.status === "acknowledged");
	const resolvedAlerts = alertsState.filter((a) => a.status === "resolved");
	const resolvedToday = alertsState.filter((a) => {
		if (a.status !== "resolved" || !a.resolvedAt) return false;
		const resolved = new Date(a.resolvedAt);
		const today = new Date();
		return resolved.toDateString() === today.toDateString();
	});

	const statusCounts = {
		all: alertsState.length,
		active: activeAlerts.length,
		acknowledged: acknowledgedAlerts.length,
		resolved: resolvedAlerts.length,
	};

	return (
		<DashboardShell>
			<div className="space-y-6">
				{/* Page Header */}
				<div>
					<h1 className="text-xl font-semibold text-foreground">Alerts & Events</h1>
					<p className="text-sm text-muted-foreground">
						Operational work queue - Track alerts through their lifecycle and review event history
					</p>
				</div>

				{/* KPI Row */}
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
					<DashboardPanel
						title="Active Alerts"
						className="flex flex-col items-center justify-center py-4"
					>
						<KPIGauge
							label="Total Active"
							value={activeAlerts.length}
							unit=""
							maxValue={20}
							status={
								activeAlerts.length > 5 ? "danger" : activeAlerts.length > 2 ? "warning" : "success"
							}
							size="sm"
						/>
					</DashboardPanel>

					<DashboardPanel
						title="Critical"
						className="flex flex-col items-center justify-center py-4"
					>
						<KPIGauge
							label="Critical"
							value={criticalAlerts.length}
							unit=""
							maxValue={10}
							status={criticalAlerts.length > 0 ? "danger" : "success"}
							size="sm"
						/>
					</DashboardPanel>

					<DashboardPanel
						title="High Priority"
						className="flex flex-col items-center justify-center py-4"
					>
						<KPIGauge
							label="High"
							value={highAlerts.length}
							unit=""
							maxValue={10}
							status={
								highAlerts.length > 2 ? "danger" : highAlerts.length > 0 ? "warning" : "success"
							}
							size="sm"
						/>
					</DashboardPanel>

					<DashboardPanel
						title="Acknowledged"
						className="flex flex-col items-center justify-center py-4"
					>
						<KPIGauge
							label="In Progress"
							value={acknowledgedAlerts.length}
							unit=""
							maxValue={15}
							status="warning"
							size="sm"
						/>
					</DashboardPanel>

					<DashboardPanel
						title="Resolved Today"
						className="flex flex-col items-center justify-center py-4"
					>
						<KPIGauge
							label="Resolved"
							value={resolvedToday.length}
							unit=""
							maxValue={10}
							status="success"
							size="sm"
						/>
					</DashboardPanel>
				</div>

				{/* Alerts Work Queue */}
				<DashboardPanel
					title="Alerts Work Queue"
					description="Click on any alert to view details, event history, and notification audit"
				>
					<div className="space-y-4">
						<AlertsStatusTabs
							activeTab={activeTab}
							onTabChange={setActiveTab}
							counts={statusCounts}
						/>
						<AlertsWorkQueueTable
							alerts={filteredAlerts}
							onAlertUpdate={handleAlertUpdate}
							calculateDuration={calculateAlertDuration}
							getEquipmentName={getEquipmentName}
							getSensorType={getSensorType}
							getSensorName={getSensorName}
						/>
					</div>
				</DashboardPanel>
			</div>
		</DashboardShell>
	);
}
