import { useEffect, useState } from "react";

import { IngestionViewModel } from "./IngestionViewModel";

export function useIngestionViewModel() {
	const [vm] = useState(() => new IngestionViewModel());

	useEffect(() => {
		return () => vm.dispose();
	}, [vm]);

	return vm;
}
