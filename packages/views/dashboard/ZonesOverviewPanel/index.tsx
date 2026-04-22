import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { useZonesOverviewPanelViewModel } from "~@/view-model";

import { SiteTile } from "./SiteTile";

export type { Site } from "./types";

export const ZonesOverviewPanel = observer(function ZonesOverviewPanel() {
	const vm = useZonesOverviewPanelViewModel();
	const locationCount = vm.sites.length;

	return (
		<div className="bg-card text-card-foreground rounded-xl border shadow-sm">
			<div className="px-3 pt-3 pb-0.5">
				<div className="flex items-center justify-between">
					<h3 className="text-base font-semibold leading-tight">{t`Locations`}</h3>
					{locationCount > 6 && (
						<span className="text-xs text-muted-foreground font-normal">{t`${locationCount} total`}</span>
					)}
				</div>
			</div>
			<div className="px-3 pb-3">
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
					{vm.sites.map((site) => (
						<SiteTile key={site.id} site={site} />
					))}
				</div>
			</div>
		</div>
	);
});
