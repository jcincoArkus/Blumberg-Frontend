import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { DashboardPanel } from "~@/ui";
import { useAlertsViewModel } from "~@/view-model";
import { AlertsStatusTabs, AlertsWorkQueueTable, KPIGauge } from "~@/views";

const AlertsPage = observer(function AlertsPage() {
	const vm = useAlertsViewModel();

	if (vm.isLoading && vm.alerts.length === 0) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-sm text-muted-foreground">{t`Loading alerts…`}</p>
			</div>
		);
	}

	if (vm.error && vm.alerts.length === 0) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-xl font-semibold text-foreground">{t`Alerts & Events`}</h1>
					<p className="text-sm text-destructive mt-2">{vm.error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-xl font-semibold text-foreground">{t`Alerts & Events`}</h1>
				<p className="text-sm text-muted-foreground">
					{t`Operational work queue - Track alerts through their lifecycle and review event history`}
				</p>
			</div>

			{/* KPI Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
				<DashboardPanel
					title={t`Active Alerts`}
					className="flex flex-col items-center justify-center py-4"
				>
					<KPIGauge
						label={t`Total Active`}
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

				<DashboardPanel
					title={t`Critical`}
					className="flex flex-col items-center justify-center py-4"
				>
					<KPIGauge
						label={t`Critical`}
						value={vm.criticalAlerts.length}
						unit=""
						maxValue={10}
						status={vm.criticalAlerts.length > 0 ? "danger" : "success"}
						size="sm"
					/>
				</DashboardPanel>

				<DashboardPanel
					title={t`High Priority`}
					className="flex flex-col items-center justify-center py-4"
				>
					<KPIGauge
						label={t`High`}
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
					title={t`Acknowledged`}
					className="flex flex-col items-center justify-center py-4"
				>
					<KPIGauge
						label={t`In Progress`}
						value={vm.acknowledgedAlerts.length}
						unit=""
						maxValue={15}
						status="warning"
						size="sm"
					/>
				</DashboardPanel>

				<DashboardPanel
					title={t`Resolved Today`}
					className="flex flex-col items-center justify-center py-4"
				>
					<KPIGauge
						label={t`Resolved`}
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
				title={t`Alerts Work Queue`}
				description={t`Click on any alert to view details, event history, and notification audit`}
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
						calculateDuration={vm.calculateDuration}
						getEquipmentName={vm.getEquipmentName}
						getSensorType={vm.getSensorType}
						getSensorName={vm.getSensorName}
					/>
				</div>
			</DashboardPanel>
		</div>
	);
});

export default AlertsPage;
