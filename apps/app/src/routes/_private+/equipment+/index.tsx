import { useMemo } from "react";
import { Link, useNavigate } from "react-router";

import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, DashboardPanel, EmptyState } from "~@/ui";
import { EquipmentDataTableController, getEquipmentColumns } from "~@/views";

export default observer(function EquipmentListPage() {
	const navigate = useNavigate();
	const controller = useMemo(() => new EquipmentDataTableController(), []);

	const columns = useMemo(
		() =>
			getEquipmentColumns({
				onDelete: async (eq) => {
					if (!eq.id) return;
					if (window.confirm(t`Delete "${eq.name ?? ""}"?`)) {
						// eslint-disable-line no-alert
						await controller.deleteEquipment(eq.id);
					}
				},
			}),
		[controller],
	);

	const customEmptyState = () => (
		<EmptyState
			title={t`No equipment yet`}
			message={t`Add equipment to a site to get started.`}
			showActionButton
			actionButtonText={t`Add Equipment`}
			onAction={() => navigate("/equipment/new")}
		/>
	);

	return (
		<div className="space-y-6">
			<DashboardPanel
				title={t`Equipment`}
				description={t`Manage equipment across sites`}
				action={
					<Button asChild>
						<Link to="/equipment/new">{t`Add Equipment`}</Link>
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
