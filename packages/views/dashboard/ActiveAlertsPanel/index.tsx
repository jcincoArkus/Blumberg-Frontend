import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import type { ColumnDef } from "~@/data-table";
import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { dashboardAlertsViewModel, useActiveAlertsPanelViewModel } from "~@/view-model";

import { AlertDetailsDrawer } from "../../alerts/AlertDetailsDrawer";
import type { Alert } from "../../alerts/types";
import type { AlertItem } from "./ActiveAlertsController";
import { ActiveAlertsController } from "./ActiveAlertsController";
import { ActiveAlertListItem } from "./ActiveAlertsListItem";
import { ActiveAlertsListView } from "./ActiveAlertsListView";

const getColumns = (): ColumnDef<AlertItem>[] => [{ accessorKey: "name", header: t`Alert` }];

export const ActiveAlertsPanel = observer(function ActiveAlertsPanel() {
	const vm = useActiveAlertsPanelViewModel();
	const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const controller = useMemo(() => new ActiveAlertsController(), []);
	const columns = useMemo(() => getColumns(), []);

	// Trigger load when panel mounts (redundant with Home/GlobalStatusBar/DataTable store so at least one runs).
	useEffect(() => {
		dashboardAlertsViewModel.load();
	}, []);

	const alertsForOverview = vm.alertsForOverview;

	const handleAlertClick = (alert: Alert) => {
		setSelectedAlert(alert);
		setIsDrawerOpen(true);
		vm.loadAlertDetail(alert.id);
	};

	const listItem = useMemo(
		() =>
			function ListItem({ data }: { data: AlertItem; index: number }) {
				const zone = vm.getAlertZone(data);
				return <ActiveAlertListItem data={data} zone={zone} />;
			},
		[vm],
	);

	return (
		<>
			<div className="h-full flex flex-col bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
				<div className="px-4 pt-4 pb-0.5 flex-shrink-0">
					<h3 className="text-base font-semibold leading-tight">{t`Active Alerts`}</h3>
				</div>
				<div className="flex-1 min-h-0 overflow-hidden">
					<DataTable
						key={`alerts-${alertsForOverview.length}`}
						controller={controller}
						columns={columns}
						viewMode="list"
						showSearch={false}
						isClickable={true}
						listItem={listItem}
						components={{ ListView: ActiveAlertsListView }}
						onRowClick={handleAlertClick}
						customEmptyState={() => (
							<div className="p-3 text-center text-xs text-muted-foreground">
								{t`No active alerts`}
							</div>
						)}
						renderBottomBar={() => null}
					/>
				</div>
				<div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-border text-center">
					<Link
						to="/alerts"
						className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
					>
						{t`View All →`}
					</Link>
				</div>
			</div>

			{selectedAlert && (
				<AlertDetailsDrawer
					alert={vm.getDetailFor(selectedAlert.id) ?? selectedAlert}
					open={isDrawerOpen}
					onOpenChange={(open) => {
						setIsDrawerOpen(open);
						if (!open) {
							vm.clearAlertDetail();
							setSelectedAlert(null);
						}
					}}
					onAlertUpdate={(alertId, action) => {
						void vm.updateAlert(alertId, action);
					}}
					equipmentName={vm.getEquipmentName(selectedAlert.equipmentId)}
					isDetailLoading={vm.isDetailLoading}
				/>
			)}
		</>
	);
});
