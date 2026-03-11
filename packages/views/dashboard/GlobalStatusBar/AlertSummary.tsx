import { AlertCircle } from "lucide-react";
import type { FC } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { Badge } from "~@/ui";

import type { AlertSeverityKey, GlobalStatusBarProps } from "./types";

interface AlertSummaryProps {
	activeAlerts: GlobalStatusBarProps["activeAlerts"];
	onSeverityClick: (severity: AlertSeverityKey) => void;
}

export const AlertSummary: FC<AlertSummaryProps> = ({ activeAlerts, onSeverityClick }) => {
	return (
		<div className="flex items-center gap-2">
			<AlertCircle className="size-4 text-muted-foreground" />
			<span className="text-muted-foreground">{t`Alerts:`}</span>
			{activeAlerts.critical > 0 && (
				<button
					type="button"
					onClick={() => onSeverityClick("critical")}
					className="cursor-pointer hover:opacity-80 transition-opacity"
					title={t`View critical alerts`}
				>
					<Badge variant="destructive" className="h-5 px-1.5 text-xs">
						{t`${activeAlerts.critical} Critical`}
					</Badge>
				</button>
			)}
			{activeAlerts.warning > 0 && (
				<button
					type="button"
					onClick={() => onSeverityClick("warning")}
					className="cursor-pointer hover:opacity-80 transition-opacity"
					title={t`View warning alerts`}
				>
					<Badge variant="outline" className="h-5 px-1.5 text-xs border-amber-500 text-amber-700">
						{t`${activeAlerts.warning} Warning`}
					</Badge>
				</button>
			)}
			{activeAlerts.info > 0 && (
				<Link to="/alerts?severity=info">
					<Badge
						variant="outline"
						className="h-5 px-1.5 text-xs hover:opacity-80 transition-opacity cursor-pointer"
					>
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
