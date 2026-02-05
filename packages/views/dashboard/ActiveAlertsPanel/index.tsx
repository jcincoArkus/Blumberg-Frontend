import { useMemo, useState } from "react";

import type { ColumnDef } from "~@/data-table";
import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { useActiveAlertsPanelViewModel } from "~@/view-model";

import { AlertDetailsDrawer } from "../../alerts/AlertDetailsDrawer";
import type { Alert } from "../../alerts/types";
import type { AlertItem } from "./ActiveAlertsController";
import { ActiveAlertsController } from "./ActiveAlertsController";
import { ActiveAlertListItem } from "./ActiveAlertsListItem";
import { ActiveAlertsListView } from "./ActiveAlertsListView";

const getColumns = (): ColumnDef<AlertItem>[] => [
	{
		accessorKey: "name",
		header: t`Alert`,
	},
];

export const ActiveAlertsPanel = observer(function ActiveAlertsPanel() {
	const vm = useActiveAlertsPanelViewModel();
	const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const sortedAlerts = useMemo((): AlertItem[] => {
		return vm.sortedAlerts.map((alert) => ({ ...alert }));
	}, [vm.sortedAlerts]);

	const controller = useMemo(() => new ActiveAlertsController(sortedAlerts), [sortedAlerts]);
	const columns = useMemo(() => getColumns(), []);

	const handleAlertClick = (alert: Alert) => {
		setSelectedAlert(alert);
		setIsDrawerOpen(true);
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
				<div className="px-3 pt-3 pb-0.5">
					<h3 className="text-base font-semibold leading-tight">{t`Active Alerts`}</h3>
				</div>
				<DataTable
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

			{selectedAlert && (
				<AlertDetailsDrawer
					alert={selectedAlert}
					open={isDrawerOpen}
					onOpenChange={(open) => {
						setIsDrawerOpen(open);
						if (!open) setSelectedAlert(null);
					}}
					equipmentName={vm.getEquipmentName(selectedAlert.equipmentId)}
				/>
			)}
		</>
	);
});
