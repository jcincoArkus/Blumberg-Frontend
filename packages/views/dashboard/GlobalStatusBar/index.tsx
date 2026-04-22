import { useEffect } from "react";

import { observer } from "~@/mobx";
import {
	dashboardAlertsViewModel,
	dashboardSensorsViewModel,
	useGlobalStatusBarViewModel,
} from "~@/view-model";
import { authViewModel } from "~@/view-model/auth";

import { AlertSummary } from "./AlertSummary";
import { CurrentTime } from "./CurrentTime";
import { SensorsOnline } from "./SensorsOnline";
import { StatusIndicator } from "./StatusIndicator";

export const GlobalStatusBar = observer(function GlobalStatusBar() {
	const vm = useGlobalStatusBarViewModel();
	const isAuthenticated = authViewModel.isAuthenticated;

	useEffect(() => {
		if (!isAuthenticated) return;
		dashboardAlertsViewModel.load();
		dashboardSensorsViewModel.load();
	}, [isAuthenticated]);

	return (
		<div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 -mx-4 lg:-mx-6">
			<div className="flex items-center justify-between px-4 lg:px-6 py-2.5 text-sm">
				<div className="flex items-center gap-6">
					<StatusIndicator status={vm.systemStatus} />
					<AlertSummary activeAlerts={vm.activeAlerts} />
					<CurrentTime />
				</div>
				<SensorsOnline sensorsOnline={vm.sensorsOnline} totalSensors={vm.totalSensors} />
			</div>
		</div>
	);
});
