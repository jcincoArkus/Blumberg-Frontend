import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, DashboardPanel, EmptyState } from "~@/ui";
import { EquipmentDataTableController, getEquipmentColumns } from "~@/views";

export default observer(function SiteEquipmentListPage() {
	const { id: siteId } = useParams();
	const navigate = useNavigate();
	const controller = useMemo(() => new EquipmentDataTableController(siteId ?? null), [siteId]);

	const columns = useMemo(
		() =>
			getEquipmentColumns({
				siteId: siteId ?? null,
				onDelete: async (eq) => {
					if (!eq.id) return;
					if (window.confirm(t`Delete "${eq.name ?? ""}"?`)) {
						// eslint-disable-line no-alert
						await controller.deleteEquipment(eq.id);
					}
				},
			}),
		[controller, siteId],
	);

	const customEmptyState = () => (
		<EmptyState
			title={t`No equipment at this site`}
			message={t`Add equipment to get started.`}
			showActionButton
			actionButtonText={t`Add Equipment`}
			onAction={() => navigate(`/sites/${siteId}/equipment/new`)}
		/>
	);

	return (
		<div className="space-y-6">
			<DashboardPanel
				title={t`Equipment`}
				description={t`Equipment at this site`}
				action={
					<>
						<Button variant="outline" asChild>
							<Link to={`/sites/${siteId}`}>{t`Back to Site`}</Link>
						</Button>
						<Button asChild>
							<Link to={`/sites/${siteId}/equipment/new`}>{t`Add Equipment`}</Link>
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
