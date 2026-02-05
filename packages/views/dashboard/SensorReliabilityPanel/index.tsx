import { useState } from "react";

import { AllHealthyState } from "./AllHealthyState";
import { FlappingList } from "./FlappingList";
import { getHealthyStats } from "./helpers";
import { IssueList } from "./IssueList";
import { StatusStats } from "./StatusStats";
import { StatusSummary } from "./StatusSummary";
import type { SensorReliabilityPanelProps } from "./types";

export type { Sensor, SensorReliabilityPanelProps } from "./types";

export function SensorReliabilityPanel({
	offlineCount,
	staleCount,
	flappingCount,
	totalSensors,
	offlineSensors,
	staleSensors,
	flappingSensors,
}: SensorReliabilityPanelProps) {
	const { healthyPercentage, hasIssues } = getHealthyStats({
		totalSensors,
		offlineCount,
		staleCount,
		flappingCount,
	});
	const [isFlappingOpen, setIsFlappingOpen] = useState(false);

	return (
		<div className="bg-card text-card-foreground rounded-xl border shadow-sm">
			<div className="px-3 pt-3 pb-0.5">
				<StatusSummary healthyPercentage={healthyPercentage} hasIssues={hasIssues} />
			</div>
			<div className="px-3 pb-3 space-y-2">
				<StatusStats
					offlineCount={offlineCount}
					staleCount={staleCount}
					flappingCount={flappingCount}
				/>

				<IssueList offlineSensors={offlineSensors} staleSensors={staleSensors} />

				<FlappingList
					flappingSensors={flappingSensors}
					isOpen={isFlappingOpen}
					onToggle={setIsFlappingOpen}
				/>

				{!hasIssues && <AllHealthyState totalSensors={totalSensors} />}
			</div>
		</div>
	);
}
