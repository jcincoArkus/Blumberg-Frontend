import type { FC } from "react";

import { t } from "~@/i18n/macro";
import { cn } from "~@/ui";

import { getStatusConfig } from "./helpers";
import type { GlobalStatusBarProps } from "./types";

interface StatusIndicatorProps {
	status: GlobalStatusBarProps["systemStatus"];
}

export const StatusIndicator: FC<StatusIndicatorProps> = ({ status }) => {
	const config = getStatusConfig(status);
	const Icon = config.icon;

	return (
		<div className="flex items-center gap-2">
			<Icon className={cn("size-4", config.className.split(" ")[0])} />
			<span className="font-medium">
				{t`System:`} {config.label}
			</span>
		</div>
	);
};
