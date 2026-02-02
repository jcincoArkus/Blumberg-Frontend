import { useEffect, useState } from "react";

import { AlertRulesViewModel } from "./AlertRulesViewModel";

/**
 * Factory hook that creates and manages an AlertRulesViewModel instance.
 * Handles cleanup on unmount via the dispose method.
 *
 * @returns AlertRulesViewModel instance
 *
 * @example
 * ```tsx
 * const vm = useAlertRulesViewModel();
 *
 * return (
 *   <AlertRulesTable
 *     rules={vm.rules}
 *     onEdit={vm.openEditor}
 *     onDelete={vm.deleteRule}
 *     onToggle={vm.toggleRule}
 *     onDuplicate={vm.duplicateRule}
 *   />
 * );
 * ```
 */
export function useAlertRulesViewModel(): AlertRulesViewModel {
	const [vm] = useState(() => new AlertRulesViewModel());

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
