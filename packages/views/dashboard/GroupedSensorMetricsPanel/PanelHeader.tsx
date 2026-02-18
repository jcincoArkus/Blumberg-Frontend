import type { FC } from "react";

import { t } from "~@/i18n/macro";
import { Badge } from "~@/ui";

interface PanelHeaderProps {
	totalAlerts: number;
	criticalAlerts: number;
	highAlerts: number;
	sensorCount: number;
	categoryCount: number;
}

export const PanelHeader: FC<PanelHeaderProps> = ({
	totalAlerts,
	criticalAlerts,
	highAlerts,
	sensorCount,
	categoryCount,
}) => (
	<div className="px-4 pt-4 pb-2 border-b">
		<div className="flex items-center justify-between mb-3">
			<div className="flex items-center gap-3">
				<h2 className="text-lg font-semibold text-foreground">{t`Sensor Metrics`}</h2>
				{totalAlerts > 0 && (
					<div className="flex items-center gap-2">
						{criticalAlerts > 0 && (
							<Badge variant="destructive" className="text-xs">
								{criticalAlerts} {t`Critical`}
							</Badge>
						)}
						{highAlerts > criticalAlerts && (
							<Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
								{highAlerts} {t`High`}
							</Badge>
						)}
						{totalAlerts > highAlerts && (
							<span className="text-xs text-muted-foreground">
								{totalAlerts} {t`total alerts`}
							</span>
						)}
					</div>
				)}
			</div>
			<span className="text-xs text-muted-foreground">
				{sensorCount} {sensorCount === 1 ? t`sensor` : t`sensors`} {t`across`} {categoryCount}{" "}
				{categoryCount === 1 ? t`category` : t`categories`}
			</span>
		</div>
	</div>
);
