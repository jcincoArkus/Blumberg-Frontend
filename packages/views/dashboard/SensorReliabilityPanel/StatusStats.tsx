import type { FC } from "react";

import { t } from "~@/i18n/macro";

interface StatusStatsProps {
	offlineCount: number;
	staleCount: number;
	flappingCount: number;
}

export const StatusStats: FC<StatusStatsProps> = ({ offlineCount, staleCount, flappingCount }) => {
	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex-1 text-center">
				<p className="text-lg font-semibold">{offlineCount}</p>
				<p className="text-xs text-muted-foreground">{t`Offline`}</p>
			</div>
			<div className="w-px h-8 bg-border" />
			<div className="flex-1 text-center">
				<p className="text-lg font-semibold">{staleCount}</p>
				<p className="text-xs text-muted-foreground">{t`Stale`}</p>
			</div>
			<div className="w-px h-8 bg-border" />
			<div className="flex-1 text-center">
				<p className="text-lg font-semibold">{flappingCount}</p>
				<p className="text-xs text-muted-foreground">{t`Unstable`}</p>
			</div>
		</div>
	);
};
