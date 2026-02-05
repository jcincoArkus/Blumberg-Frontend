import type { FC } from "react";

import { t } from "~@/i18n/macro";

interface AllHealthyStateProps {
	totalSensors: number;
}

export const AllHealthyState: FC<AllHealthyStateProps> = ({ totalSensors }) => {
	return (
		<div className="text-center py-1">
			<p className="text-xs text-muted-foreground">{t`${totalSensors} sensors operational`}</p>
		</div>
	);
};
