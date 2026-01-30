import { useEffect, useState } from "react";

import { type AlertRule, AlertRulesViewModel } from "./AlertRulesViewModel";

interface AlertRulesViewModelData {
	rules: AlertRule[];
}

/**
 * Factory hook that creates and manages an AlertRulesViewModel instance.
 * Handles cleanup on unmount via the dispose method.
 *
 * @param data - Alert rules data (rules array)
 * @returns AlertRulesViewModel instance
 *
 * @example
 * ```tsx
 * const vm = useAlertRulesViewModel({ rules: initialRules });
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
export function useAlertRulesViewModel(data: AlertRulesViewModelData): AlertRulesViewModel {
	const [vm] = useState(() => new AlertRulesViewModel(data));

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
