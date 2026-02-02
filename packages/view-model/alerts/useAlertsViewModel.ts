import { useEffect, useState } from "react";

import { AlertsViewModel } from "./AlertsViewModel";

/**
 * Factory hook that creates and manages an AlertsViewModel instance.
 * Handles cleanup on unmount via the dispose method.
 *
 * @returns AlertsViewModel instance
 *
 * @example
 * ```tsx
 * const vm = useAlertsViewModel();
 *
 * return (
 *   <div>
 *     <p>Active: {vm.statusCounts.active}</p>
 *     <AlertList alerts={vm.filteredAlerts} />
 *   </div>
 * );
 * ```
 */
export function useAlertsViewModel(): AlertsViewModel {
	const [vm] = useState(() => new AlertsViewModel());

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
