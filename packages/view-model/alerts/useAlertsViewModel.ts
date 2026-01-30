import { useEffect, useState } from "react";

import type { Alert } from "~@/views";

import { AlertsViewModel } from "./AlertsViewModel";

/**
 * Factory hook that creates and manages an AlertsViewModel instance.
 * Handles cleanup on unmount via the dispose method.
 *
 * @param initialAlerts - Initial alerts data to populate the ViewModel
 * @returns AlertsViewModel instance
 *
 * @example
 * ```tsx
 * const vm = useAlertsViewModel(alertsData);
 *
 * return (
 *   <div>
 *     <p>Active: {vm.statusCounts.active}</p>
 *     <AlertList alerts={vm.filteredAlerts} />
 *   </div>
 * );
 * ```
 */
export function useAlertsViewModel(initialAlerts: Alert[]): AlertsViewModel {
	const [vm] = useState(() => new AlertsViewModel(initialAlerts));

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
