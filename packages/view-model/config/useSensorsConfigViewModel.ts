import { useEffect, useState } from "react";

import type { ConfigEquipment, ConfigSensor, ConfigSite } from "~@/views";

import { SensorsConfigViewModel } from "./SensorsConfigViewModel";

interface SensorsConfigViewModelData {
	sensors: ConfigSensor[];
	sites: ConfigSite[];
	equipment: ConfigEquipment[];
}

/**
 * Factory hook that creates and manages a SensorsConfigViewModel instance.
 * Handles cleanup on unmount via the dispose method.
 *
 * @param data - Sensors configuration data (sensors, sites, equipment)
 * @returns SensorsConfigViewModel instance
 *
 * @example
 * ```tsx
 * const vm = useSensorsConfigViewModel({
 *   sensors: getAllSensorsEnriched(),
 *   sites,
 *   equipment,
 * });
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
export function useSensorsConfigViewModel(
	data: SensorsConfigViewModelData,
): SensorsConfigViewModel {
	const [vm] = useState(() => new SensorsConfigViewModel(data));

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
