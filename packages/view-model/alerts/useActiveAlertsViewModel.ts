import { activeAlertsViewModel } from "./ActiveAlertsViewModel";

/**
 * Hook that returns the singleton ActiveAlertsViewModel instance.
 * The ViewModel gets data from the DashboardAlertsViewModel singleton.
 *
 * @returns ActiveAlertsViewModel singleton instance
 *
 * @example
 * ```tsx
 * const vm = useActiveAlertsViewModel();
 *
 * return (
 *   <div>
 *     {vm.sortedAlerts.map(alert => <AlertItem key={alert.id} alert={alert} />)}
 *   </div>
 * );
 * ```
 */
export function useActiveAlertsViewModel() {
	return activeAlertsViewModel;
}
