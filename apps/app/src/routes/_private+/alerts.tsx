import { observer } from "~@/mobx";
import {
	alertsData,
	calculateAlertDuration,
	getAlertsEquipmentName as getEquipmentName,
	getSensorName,
	getSensorType,
} from "~@/mock-data";
import { useAlertsViewModel } from "~@/view-model";
import { AlertsStatusTabs, AlertsWorkQueueTable, DashboardPanel, KPIGauge } from "~@/views";

const AlertsPage = observer(function AlertsPage() {
	const vm = useAlertsViewModel(alertsData);

	return (
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
						value={vm.activeAlerts.length}
						unit=""
						maxValue={20}
						status={
							vm.activeAlerts.length > 5
								? "danger"
								: vm.activeAlerts.length > 2
									? "warning"
									: "success"
						}
						size="sm"
					/>
				</DashboardPanel>

				<DashboardPanel title="Critical" className="flex flex-col items-center justify-center py-4">
					<KPIGauge
						label="Critical"
						value={vm.criticalAlerts.length}
						unit=""
						maxValue={10}
						status={vm.criticalAlerts.length > 0 ? "danger" : "success"}
						size="sm"
					/>
				</DashboardPanel>

				<DashboardPanel
					title="High Priority"
					className="flex flex-col items-center justify-center py-4"
				>
					<KPIGauge
						label="High"
						value={vm.highAlerts.length}
						unit=""
						maxValue={10}
						status={
							vm.highAlerts.length > 2 ? "danger" : vm.highAlerts.length > 0 ? "warning" : "success"
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
						value={vm.acknowledgedAlerts.length}
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
						value={vm.resolvedToday.length}
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
						activeTab={vm.activeTab}
						onTabChange={vm.setActiveTab}
						counts={vm.statusCounts}
					/>
					<AlertsWorkQueueTable
						alerts={vm.filteredAlerts}
						onAlertUpdate={vm.updateAlert}
						calculateDuration={calculateAlertDuration}
						getEquipmentName={getEquipmentName}
						getSensorType={getSensorType}
						getSensorName={getSensorName}
					/>
				</div>
			</DashboardPanel>
		</div>
	);
});

export default AlertsPage;
