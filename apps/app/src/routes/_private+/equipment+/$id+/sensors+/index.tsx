import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, DashboardPanel, EmptyState } from "~@/ui";
import { getSensorColumns, SensorsDataTableController } from "~@/views";

export default observer(function EquipmentSensorsListPage() {
	const { id: equipmentId } = useParams();
	const navigate = useNavigate();
	const controller = useMemo(
		() => new SensorsDataTableController(equipmentId ?? null),
		[equipmentId],
	);

	const columns = useMemo(
		() =>
			getSensorColumns({
				equipmentId: equipmentId ?? null,
				onDelete: async (sensor) => {
					if (!sensor.id) return;
					if (window.confirm(t`Delete sensor "${sensor.serial ?? ""}"?`)) {
						// eslint-disable-line no-alert
						await controller.deleteSensor(sensor.id);
					}
				},
			}),
		[controller, equipmentId],
	);

	const customEmptyState = () => (
		<EmptyState
			title={t`No sensors on this equipment`}
			message={t`Add a sensor to get started.`}
			showActionButton
			actionButtonText={t`Add Sensor`}
			onAction={() => navigate(`/equipment/${equipmentId}/sensors/new`)}
		/>
	);

	return (
		<div className="space-y-6">
			<DashboardPanel
				title={t`Sensors`}
				description={t`Sensors on this equipment`}
				action={
					<>
						<Button variant="outline" asChild>
							<Link to={`/equipment/${equipmentId}`}>{t`Back to Equipment`}</Link>
						</Button>
						<Button asChild>
							<Link to={`/equipment/${equipmentId}/sensors/new`}>{t`Add Sensor`}</Link>
						</Button>
					</>
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
