import { useMemo } from "react";
import { Link, useNavigate } from "react-router";

import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, DashboardPanel, EmptyState } from "~@/ui";
import { getSensorColumns, SensorsDataTableController } from "~@/views";

export default observer(function SensorsListPage() {
	const navigate = useNavigate();
	const controller = useMemo(() => new SensorsDataTableController(), []);

	const columns = useMemo(
		() =>
			getSensorColumns({
				onDelete: async (sensor) => {
					if (!sensor.id) return;
					if (window.confirm(t`Delete sensor "${sensor.serial ?? ""}"?`)) {
						// eslint-disable-line no-alert
						await controller.deleteSensor(sensor.id);
					}
				},
			}),
		[controller],
	);

	const customEmptyState = () => (
		<EmptyState
			title={t`No sensors yet`}
			message={t`Add sensors to equipment to get started.`}
			showActionButton
			actionButtonText={t`Add Sensor`}
			onAction={() => navigate("/sensors/new")}
		/>
	);

	return (
		<div className="space-y-6">
			<DashboardPanel
				title={t`Sensors`}
				description={t`Manage sensors across equipment`}
				action={
					<Button asChild>
						<Link to="/sensors/new">{t`Add Sensor`}</Link>
					</Button>
				}
			>
				<DataTable
					controller={controller}
					columns={columns}
					showSearch
					customEmptyState={customEmptyState}
				/>
			</DashboardPanel>
		</div>
	);
});
