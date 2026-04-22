import { Clock } from "lucide-react";
import type { FC } from "react";

import { getCurrentTime } from "./helpers";

export const CurrentTime: FC = () => {
	const currentTime = getCurrentTime();

	return (
		<div className="flex items-center gap-2">
			<Clock className="size-4 text-muted-foreground" />
			<span className="text-muted-foreground">{currentTime}</span>
		</div>
	);
};
