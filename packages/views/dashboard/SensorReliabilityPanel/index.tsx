import { useState } from "react";

import { observer } from "~@/mobx";
import { useSensorReliabilityPanelViewModel } from "~@/view-model";

import { AllHealthyState } from "./AllHealthyState";
import { FlappingList } from "./FlappingList";
import { getHealthyStats } from "./helpers";
import { IssueList } from "./IssueList";
import { StatusStats } from "./StatusStats";
import { StatusSummary } from "./StatusSummary";

export type { Sensor } from "./types";

export const SensorReliabilityPanel = observer(function SensorReliabilityPanel() {
	const vm = useSensorReliabilityPanelViewModel();
	const { healthyPercentage, hasIssues } = getHealthyStats({
		totalSensors: vm.totalSensors,
		offlineCount: vm.offlineCount,
		staleCount: vm.staleCount,
		flappingCount: vm.flappingCount,
	});
	const [isFlappingOpen, setIsFlappingOpen] = useState(false);

	return (
		<div className="bg-card text-card-foreground rounded-xl border shadow-sm">
			<div className="px-3 pt-3 pb-0.5">
				<StatusSummary healthyPercentage={healthyPercentage} hasIssues={hasIssues} />
			</div>
			<div className="px-3 pb-3 space-y-2">
				<StatusStats
					offlineCount={vm.offlineCount}
					staleCount={vm.staleCount}
					flappingCount={vm.flappingCount}
				/>

				<IssueList offlineSensors={vm.offlineSensors} staleSensors={vm.staleSensors} />

				<FlappingList
					flappingSensors={vm.flappingSensors}
					isOpen={isFlappingOpen}
					onToggle={setIsFlappingOpen}
				/>

				{!hasIssues && <AllHealthyState totalSensors={vm.totalSensors} />}
			</div>
		</div>
	);
});
