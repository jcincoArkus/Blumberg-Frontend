import { AlertTriangle, Clock } from "lucide-react";
import type { FC } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";

import type { Sensor } from "./types";

interface IssueListProps {
	offlineSensors: Sensor[];
	staleSensors: Sensor[];
}

export const IssueList: FC<IssueListProps> = ({ offlineSensors, staleSensors }) => {
	if (offlineSensors.length === 0 && staleSensors.length === 0) return null;

	return (
		<div className="space-y-1.5 pt-1.5 border-t">
			{offlineSensors.length > 0 && (
				<div>
					<div className="flex items-center gap-1.5 mb-1">
						<AlertTriangle className="size-3 text-danger" />
						<p className="text-xs font-medium text-danger-foreground">{t`Offline`}</p>
					</div>
					<div className="space-y-0.5">
						{offlineSensors.slice(0, 2).map((sensor) => (
							<Link
								key={sensor.id}
								to={`/config/sensors?sensor=${sensor.id}`}
								className="block p-1 rounded text-xs border border-danger-border bg-danger-subtle/30 hover:bg-red-100/50 dark:hover:bg-danger-subtle/50 transition-colors"
							>
								<p className="font-medium truncate">{sensor.name}</p>
							</Link>
						))}
						{offlineSensors.length > 2 && (
							<p className="text-xs text-muted-foreground text-center">
								{t`+${offlineSensors.length - 2} more`}
							</p>
						)}
					</div>
				</div>
			)}

			{staleSensors.length > 0 && (
				<div>
					<div className="flex items-center gap-1.5 mb-1">
						<Clock className="size-3 text-amber-600 dark:text-warning" />
						<p className="text-xs font-medium text-warning-foreground">{t`Stale`}</p>
					</div>
					<div className="space-y-0.5">
						{staleSensors.slice(0, 2).map((sensor) => (
							<Link
								key={sensor.id}
								to={`/config/sensors?sensor=${sensor.id}`}
								className="block p-1 rounded text-xs border border-warning-border bg-warning-subtle/30 hover:bg-amber-100/50 dark:hover:bg-warning-subtle/50 transition-colors"
							>
								<p className="font-medium truncate">{sensor.name}</p>
							</Link>
						))}
						{staleSensors.length > 2 && (
							<p className="text-xs text-muted-foreground text-center">
								{t`+${staleSensors.length - 2} more`}
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
