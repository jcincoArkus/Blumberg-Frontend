import { useMemo } from "react";
import { Link, useNavigate } from "react-router";

import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, DashboardPanel, EmptyState } from "~@/ui";
import { getSiteColumns, SitesDataTableController } from "~@/views";

export default observer(function SitesListPage() {
	const navigate = useNavigate();
	const controller = useMemo(() => new SitesDataTableController(), []);
	const columns = useMemo(
		() =>
			getSiteColumns({
				onDelete: async (site) => {
					if (!site.id) return;
					if (window.confirm(t`Delete site "${site.name ?? ""}"?`)) {
						// eslint-disable-line no-alert
						await controller.deleteSite(site.id);
					}
				},
			}),
		[controller],
	);

	const customEmptyState = () => (
		<EmptyState
			title={t`No sites yet`}
			message={t`Create your first site to get started.`}
			showActionButton
			actionButtonText={t`Add Site`}
			onAction={() => navigate("/sites/new")}
		/>
	);

	return (
		<div className="space-y-6">
			<DashboardPanel
				title={t`Sites`}
				description={t`Manage facility locations`}
				action={
					<Button asChild>
						<Link to="/sites/new">{t`Add Site`}</Link>
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
