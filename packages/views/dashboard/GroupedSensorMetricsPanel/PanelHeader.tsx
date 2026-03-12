import type { FC } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";

interface PanelHeaderProps {
	totalAlerts: number;
	sensorCount: number;
	categoryCount: number;
}

export const PanelHeader: FC<PanelHeaderProps> = ({ totalAlerts, sensorCount, categoryCount }) => (
	<div className="px-4 pt-4 pb-2 border-b">
		<div className="flex items-center justify-between mb-3">
			<div className="flex items-center gap-3">
				<h2 className="text-lg font-semibold text-foreground">{t`Sensor Metrics`}</h2>
				{totalAlerts > 0 && (
					<Link
						to="/alerts"
						className="text-xs text-muted-foreground hover:underline"
						title={t`View alerts`}
					>
						{totalAlerts} {t`total alerts`}
					</Link>
				)}
			</div>
			<span className="text-xs text-muted-foreground">
				{sensorCount} {sensorCount === 1 ? t`sensor` : t`sensors`} {t`across`} {categoryCount}{" "}
				{categoryCount === 1 ? t`category` : t`categories`}
			</span>
		</div>
	</div>
);
