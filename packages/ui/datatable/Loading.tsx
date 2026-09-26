import type { FC } from "react";

import type { DataTableLoadingProps } from "~@/data-table";
import { t } from "~@/i18n/macro";

import { LoadingState } from "../LoadingState";

/**
 * Loading Component
 * Displays the standard loading state for data tables
 */
export const Loading: FC<DataTableLoadingProps> = ({ message = t`Loading…` }) => {
	return <LoadingState variant="section" label={message} />;
};
