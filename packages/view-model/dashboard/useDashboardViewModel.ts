import { useEffect, useState } from "react";

import type { AgentInsight, Alert, Sensor, Site } from "~@/views";

import { DashboardViewModel } from "./DashboardViewModel";

interface DashboardSensor extends Sensor {
	type: string;
}

interface DashboardData {
	sensors: DashboardSensor[];
	alerts: Alert[];
	sites: Site[];
	insights: AgentInsight[];
}

/**
 * Factory hook that creates and manages a DashboardViewModel instance.
 * Handles cleanup on unmount via the dispose method.
 *
 * @param data - Dashboard data (sensors, alerts, sites, insights)
 * @returns DashboardViewModel instance
 *
 * @example
 * ```tsx
 * const vm = useDashboardViewModel({ sensors, alerts, sites, insights });
 *
 * return (
 *   <DashboardShell activeDomain={vm.activeDomain} onDomainChange={vm.setActiveDomain}>
 *     <GlobalStatusBar systemStatus={vm.systemStatus} />
 *   </DashboardShell>
 * );
 * ```
 */
export function useDashboardViewModel(data: DashboardData): DashboardViewModel {
	const [vm] = useState(() => new DashboardViewModel(data));

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
