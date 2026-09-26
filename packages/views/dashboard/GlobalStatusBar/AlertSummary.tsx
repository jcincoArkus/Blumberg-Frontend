import { AlertCircle } from "lucide-react";
import type { FC } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { Badge, Spinner } from "~@/ui";

import type { GlobalStatusBarProps } from "./types";

interface AlertSummaryProps {
	activeAlerts: GlobalStatusBarProps["activeAlerts"];
	isLoading?: boolean;
}

export const AlertSummary: FC<AlertSummaryProps> = ({ activeAlerts, isLoading = false }) => {
	const badgeClass = "h-5 px-1.5 text-xs hover:opacity-80 transition-opacity cursor-pointer";
	return (
		<div className="flex items-center gap-2">
			<AlertCircle className="size-4 text-muted-foreground" />
			<span className="text-muted-foreground">{t`Alerts:`}</span>
			{isLoading && <Spinner aria-label={t`Loading alerts…`} className="text-primary" />}
			{!isLoading && activeAlerts.critical > 0 && (
				<Link to="/alerts?severity=critical" title={t`View critical alerts`}>
					<Badge variant="destructive" className={badgeClass}>
						{t`${activeAlerts.critical} Critical`}
					</Badge>
				</Link>
			)}
			{!isLoading && activeAlerts.warning > 0 && (
				<Link to="/alerts?severity=warning" title={t`View warning alerts`}>
					<Badge
						variant="outline"
						className={`${badgeClass} border-warning text-warning-foreground`}
					>
						{t`${activeAlerts.warning} Warning`}
					</Badge>
				</Link>
			)}
			{!isLoading && activeAlerts.info > 0 && (
				<Link to="/alerts?severity=info" title={t`View info alerts`}>
					<Badge variant="outline" className={badgeClass}>
						{t`${activeAlerts.info} Info`}
					</Badge>
				</Link>
			)}
			{!isLoading &&
				activeAlerts.critical === 0 &&
				activeAlerts.warning === 0 &&
				activeAlerts.info === 0 && <span className="text-muted-foreground">{t`None`}</span>}
		</div>
	);
};
