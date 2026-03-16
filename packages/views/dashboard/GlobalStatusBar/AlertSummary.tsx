import { AlertCircle } from "lucide-react";
import type { FC } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { Badge } from "~@/ui";

import type { GlobalStatusBarProps } from "./types";

interface AlertSummaryProps {
	activeAlerts: GlobalStatusBarProps["activeAlerts"];
}

export const AlertSummary: FC<AlertSummaryProps> = ({ activeAlerts }) => {
	const badgeClass = "h-5 px-1.5 text-xs hover:opacity-80 transition-opacity cursor-pointer";
	return (
		<div className="flex items-center gap-2">
			<AlertCircle className="size-4 text-muted-foreground" />
			<span className="text-muted-foreground">{t`Alerts:`}</span>
			{activeAlerts.critical > 0 && (
				<Link to="/alerts?severity=critical" title={t`View critical alerts`}>
					<Badge variant="destructive" className={badgeClass}>
						{t`${activeAlerts.critical} Critical`}
					</Badge>
				</Link>
			)}
			{activeAlerts.warning > 0 && (
				<Link to="/alerts?severity=warning" title={t`View warning alerts`}>
					<Badge variant="outline" className={`${badgeClass} border-amber-500 text-amber-700`}>
						{t`${activeAlerts.warning} Warning`}
					</Badge>
				</Link>
			)}
			{activeAlerts.info > 0 && (
				<Link to="/alerts?severity=info" title={t`View info alerts`}>
					<Badge variant="outline" className={badgeClass}>
						{t`${activeAlerts.info} Info`}
					</Badge>
				</Link>
			)}
			{activeAlerts.critical === 0 && activeAlerts.warning === 0 && activeAlerts.info === 0 && (
				<span className="text-muted-foreground">{t`None`}</span>
			)}
		</div>
	);
};
