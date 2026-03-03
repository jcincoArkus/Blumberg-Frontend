import type { FC } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";

interface SensorStatusFooterProps {
	totalSensors: number;
	hasIssues: boolean;
	showViewAll: boolean;
}

export const SensorStatusFooter: FC<SensorStatusFooterProps> = ({
	totalSensors,
	hasIssues,
	showViewAll,
}) => {
	if (!hasIssues) {
		return (
			<div className="pt-2 border-t border-border">
				<p className="text-xs text-muted-foreground">{t`${totalSensors} sensors operational`}</p>
			</div>
		);
	}

	if (!showViewAll) {
		return null;
	}

	return (
		<div className="pt-2 border-t border-border text-center">
			<Link
				to="/monitoring/sensor-health"
				className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
			>
				{t`View all →`}
			</Link>
		</div>
	);
};
