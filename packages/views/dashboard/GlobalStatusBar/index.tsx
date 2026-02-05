import { useState } from "react";

import { observer } from "~@/mobx";
import { useGlobalStatusBarViewModel } from "~@/view-model";

import { AlertDetailsDrawer } from "../../alerts/AlertDetailsDrawer";
import { AlertSummary } from "./AlertSummary";
import { CurrentTime } from "./CurrentTime";
import { getFirstAlertBySeverity } from "./helpers";
import { SensorsOnline } from "./SensorsOnline";
import { StatusIndicator } from "./StatusIndicator";
import type { AlertSeverityKey } from "./types";

export const GlobalStatusBar = observer(function GlobalStatusBar() {
	const vm = useGlobalStatusBarViewModel();
	const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverityKey | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const handleSeverityClick = (severity: AlertSeverityKey) => {
		const firstAlert = getFirstAlertBySeverity(vm.alerts, severity);
		if (firstAlert) {
			setSelectedSeverity(severity);
			setIsDrawerOpen(true);
		}
	};

	const selectedAlert = selectedSeverity
		? getFirstAlertBySeverity(vm.alerts, selectedSeverity)
		: null;

	return (
		<>
			<div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 -mx-4 lg:-mx-6">
				<div className="flex items-center justify-between px-4 lg:px-6 py-2.5 text-sm">
					<div className="flex items-center gap-6">
						<StatusIndicator status={vm.systemStatus} />
						<AlertSummary activeAlerts={vm.activeAlerts} onSeverityClick={handleSeverityClick} />
						<CurrentTime />
					</div>
					<SensorsOnline sensorsOnline={vm.sensorsOnline} totalSensors={vm.totalSensors} />
				</div>
			</div>

			{selectedAlert && (
				<AlertDetailsDrawer
					alert={selectedAlert}
					open={isDrawerOpen}
					onOpenChange={(open) => {
						setIsDrawerOpen(open);
						if (!open) {
							setSelectedSeverity(null);
						}
					}}
				/>
			)}
		</>
	);
});
