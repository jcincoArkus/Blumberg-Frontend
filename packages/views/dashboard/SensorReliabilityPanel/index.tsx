import { useState } from "react";

import { observer } from "~@/mobx";
import { useSensorReliabilityPanelViewModel } from "~@/view-model";

import { FlappingList } from "./FlappingList";
import { getHealthyStats } from "./helpers";
import { IssueList } from "./IssueList";
import { SensorStatusFooter } from "./SensorStatusFooter";
import { StatusStats } from "./StatusStats";
import { StatusSummary } from "./StatusSummary";

export type { Sensor } from "./types";

export const SensorReliabilityPanel = observer(function SensorReliabilityPanel() {
	const vm = useSensorReliabilityPanelViewModel();
	const [isUnstableOpen, setIsUnstableOpen] = useState(false);
	const { healthyPercentage, hasIssues } = getHealthyStats({
		totalSensors: vm.totalSensors,
		offlineCount: vm.offlineCount,
		staleCount: vm.staleCount,
		flappingCount: vm.flappingCount,
	});

	return (
		<div className="bg-card text-card-foreground rounded-xl border shadow-sm">
			<div className="px-4 pt-4 pb-0.5">
				<StatusSummary healthyPercentage={healthyPercentage} hasIssues={hasIssues} />
			</div>
			<div className="px-4 pb-4 space-y-2">
				<StatusStats
					offlineCount={vm.offlineCount}
					staleCount={vm.staleCount}
					flappingCount={vm.flappingCount}
				/>

				<IssueList offlineSensors={vm.offlineSensors} staleSensors={vm.staleSensors} />

				<FlappingList
					flappingSensors={vm.flappingSensors}
					isOpen={isUnstableOpen}
					onToggle={setIsUnstableOpen}
				/>

				<SensorStatusFooter
					totalSensors={vm.totalSensors}
					hasIssues={hasIssues}
					showViewAll={isUnstableOpen}
				/>
			</div>
		</div>
	);
});
