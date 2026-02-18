import { useMemo } from "react";

import type { ColumnDef } from "~@/data-table";
import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { useAIInsightsPanelViewModel } from "~@/view-model";

import type { InsightItem } from "./AIInsightsController";
import { AIInsightsController } from "./AIInsightsController";
import { AIInsightsListItem } from "./AIInsightsListItem";
import { AIInsightsListView } from "./AIInsightsListView";

export type { AgentInsight } from "./types";

const getColumns = (): ColumnDef<InsightItem>[] => [
	{
		accessorKey: "description",
		header: t`Insight`,
	},
];

export const AIInsightsPanel = observer(function AIInsightsPanel() {
	const vm = useAIInsightsPanelViewModel();
	const controller = useMemo(
		() => new AIInsightsController(vm.insights as InsightItem[]),
		[vm.insights],
	);
	const columns = useMemo(() => getColumns(), []);

	const listItem = useMemo(
		() =>
			function ListItem({ data }: { data: InsightItem; index: number }) {
				return <AIInsightsListItem data={data} />;
			},
		[],
	);

	return (
		<div className="h-full flex flex-col bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
			<div className="px-4 pt-4 pb-0.5 flex-shrink-0">
				<h3 className="text-base font-semibold leading-tight">{t`AI Insights`}</h3>
			</div>
			<DataTable
				controller={controller}
				columns={columns}
				viewMode="list"
				showSearch={false}
				isClickable={false}
				listItem={listItem}
				components={{ ListView: AIInsightsListView }}
				customEmptyState={() => (
					<div className="p-3 text-center text-xs text-muted-foreground">
						{t`No insights available`}
					</div>
				)}
				renderBottomBar={() => null}
			/>
		</div>
	);
});
