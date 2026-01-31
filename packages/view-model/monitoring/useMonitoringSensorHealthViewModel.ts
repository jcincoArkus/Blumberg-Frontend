import { useEffect, useState } from "react";

import { MonitoringSensorHealthViewModel } from "./MonitoringSensorHealthViewModel";

export function useMonitoringSensorHealthViewModel() {
	const [vm] = useState(() => new MonitoringSensorHealthViewModel());

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
