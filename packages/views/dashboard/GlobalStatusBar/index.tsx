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
		// z-30: stay above page content but below the mobile sidebar overlay (z-40) and drawer (z-50)
		<div className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 dark:supports-backdrop-filter:bg-background/90 -mx-4 lg:-mx-6">
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 lg:px-6 py-2.5 text-sm whitespace-nowrap">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 lg:gap-x-6">
					<StatusIndicator status={vm.systemStatus} />
					<AlertSummary activeAlerts={vm.activeAlerts} />
					<CurrentTime />
				</div>
				<SensorsOnline sensorsOnline={vm.sensorsOnline} totalSensors={vm.totalSensors} />
			</div>
		</div>
	);
});
