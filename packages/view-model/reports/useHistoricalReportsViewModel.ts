import { useEffect, useState } from "react";

import { HistoricalReportsViewModel } from "./HistoricalReportsViewModel";

export function useHistoricalReportsViewModel() {
	const [vm] = useState(() => new HistoricalReportsViewModel());

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
