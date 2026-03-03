import { useState } from "react";

import { observer } from "~@/mobx";
import { useSensorReliabilityPanelViewModel } from "~@/view-model";

import { FlappingList } from "./FlappingList";
import { IssueList } from "./IssueList";
import { SensorStatusFooter } from "./SensorStatusFooter";
import { StatusStats } from "./StatusStats";
import { StatusSummary } from "./StatusSummary";

export type { Sensor } from "./types";

export const SensorReliabilityPanel = observer(function SensorReliabilityPanel() {
	const vm = useSensorReliabilityPanelViewModel();
	const [isUnstableOpen, setIsUnstableOpen] = useState(false);

	return (
		<div className="bg-card text-card-foreground rounded-xl border shadow-sm">
			<div className="px-4 pt-4 pb-0.5">
				<StatusSummary healthyPercentage={vm.healthyPercentage} hasIssues={vm.hasIssues} />
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
					hasIssues={vm.hasIssues}
					showViewAll={isUnstableOpen}
				/>
			</div>
		</div>
	);
});
