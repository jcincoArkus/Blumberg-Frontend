import { useEffect, useState } from "react";

import type { Alert } from "~@/views";

import { ActiveAlertsViewModel } from "./ActiveAlertsViewModel";

interface ActiveAlertsViewModelOptions {
	alerts: Alert[];
	getEquipmentName?: (equipmentId?: string) => string;
	getSiteName?: (siteId?: string) => string;
}

export function useActiveAlertsViewModel(options: ActiveAlertsViewModelOptions) {
	const [vm] = useState(() => new ActiveAlertsViewModel(options));

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
