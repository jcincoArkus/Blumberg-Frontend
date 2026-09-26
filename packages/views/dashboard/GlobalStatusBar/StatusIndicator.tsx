import type { FC } from "react";

import { t } from "~@/i18n/macro";
import { cn, Spinner } from "~@/ui";

import { getStatusConfig } from "./helpers";
import type { GlobalStatusBarProps } from "./types";

interface StatusIndicatorProps {
	status: GlobalStatusBarProps["systemStatus"];
	/** Data not in yet: show a spinner instead of a (possibly wrong) "operational" status. */
	isLoading?: boolean;
}

export const StatusIndicator: FC<StatusIndicatorProps> = ({ status, isLoading = false }) => {
	const config = getStatusConfig(status);
	const Icon = config.icon;

	if (isLoading) {
		return (
			<div className="flex items-center gap-2">
				<Spinner aria-hidden="true" className="text-primary" />
				<span className="font-medium">
					{t`System:`} <span className="font-normal text-muted-foreground">{t`Checking…`}</span>
				</span>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Icon className={cn("size-4", config.iconClassName)} />
			<span className="font-medium">
				{t`System:`} {config.label}
			</span>
		</div>
	);
};
