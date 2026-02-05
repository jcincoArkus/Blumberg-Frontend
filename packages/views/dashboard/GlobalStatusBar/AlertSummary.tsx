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
			{activeAlerts.high > 0 && (
				<button
					type="button"
					onClick={() => onSeverityClick("high")}
					className="cursor-pointer hover:opacity-80 transition-opacity"
					title={t`View high severity alerts`}
				>
					<Badge variant="destructive" className="h-5 px-1.5 text-xs">
						{t`${activeAlerts.high} High`}
					</Badge>
				</button>
			)}
			{activeAlerts.medium > 0 && (
				<button
					type="button"
					onClick={() => onSeverityClick("medium")}
					className="cursor-pointer hover:opacity-80 transition-opacity"
					title={t`View medium severity alerts`}
				>
					<Badge variant="outline" className="h-5 px-1.5 text-xs border-amber-500 text-amber-700">
						{t`${activeAlerts.medium} Medium`}
					</Badge>
				</button>
			)}
			{activeAlerts.low > 0 && (
				<Link to="/alerts?severity=low">
					<Badge
						variant="outline"
						className="h-5 px-1.5 text-xs hover:opacity-80 transition-opacity cursor-pointer"
					>
						{t`${activeAlerts.low} Low`}
					</Badge>
				</Link>
			)}
			{activeAlerts.high === 0 && activeAlerts.medium === 0 && activeAlerts.low === 0 && (
				<span className="text-muted-foreground">{t`None`}</span>
			)}
		</div>
	);
};
