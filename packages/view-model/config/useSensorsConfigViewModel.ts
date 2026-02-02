import { useEffect, useState } from "react";

import { SensorsConfigViewModel } from "./SensorsConfigViewModel";

/**
 * Factory hook that creates and manages a SensorsConfigViewModel instance.
 * Handles cleanup on unmount via the dispose method.
 *
 * @returns SensorsConfigViewModel instance
 *
 * @example
 * ```tsx
 * const vm = useSensorsConfigViewModel();
 *
 * return (
 *   <ConfigSensorsTable
 *     sensors={vm.filteredSensors}
 *     searchQuery={vm.searchQuery}
 *     onSearchChange={vm.setSearchQuery}
 *     onEdit={() => vm.openEditor(sensor)}
 *   />
 * );
 * ```
 */
export function useSensorsConfigViewModel(): SensorsConfigViewModel {
	const [vm] = useState(() => new SensorsConfigViewModel());

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
