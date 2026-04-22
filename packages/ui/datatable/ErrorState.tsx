import type { FC } from "react";

import type { DataTableErrorStateProps } from "~@/data-table";
import { Trans, t } from "~@/i18n/macro";

import { Button } from "../Button";

/**
 * ErrorState Component
 * Displays error state with retry option
 */
export const ErrorState: FC<DataTableErrorStateProps> = ({
	error,
	title = t`Something went wrong`,
	message,
	icon = "⚠️",
	showRetryButton = true,
	retryButtonText = t`Try Again`,
	onRetry,
}) => {
	const errorMessage = message || error?.message || t`An unexpected error occurred.`;

	return (
		<div className="flex flex-col items-center justify-center p-12 text-center">
			<div className="text-6xl mb-4">{icon}</div>
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-muted-foreground mb-4">{errorMessage}</p>
			{error?.code && (
				<p className="text-sm text-muted-foreground mb-4">
					<Trans>Error code: {error.code}</Trans>
				</p>
			)}
			{showRetryButton && onRetry && (
				<Button onClick={onRetry} variant="outline">
					{retryButtonText}
				</Button>
			)}
		</div>
	);
};
