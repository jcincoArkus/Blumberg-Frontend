import { useEffect, useState } from "react";

import { SensorHealthViewModel } from "./SensorHealthViewModel";

export function useSensorHealthViewModel() {
	const [vm] = useState(() => new SensorHealthViewModel());

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
