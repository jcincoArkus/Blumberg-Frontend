import { MapPin } from "lucide-react";
import { lazy, Suspense } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useLocationPanelViewModel } from "~@/view-model";

import type { LocationPanelProps } from "./types";

const RealMap = lazy(() => import("./RealMap").then((m) => ({ default: m.RealMap })));

export type { MapLocation } from "./types";

export const LocationPanel = observer(function LocationPanel({
	selectedLocation,
	onLocationSelect,
}: LocationPanelProps) {
	const vm = useLocationPanelViewModel();
	const locations = vm.locations;

	return (
		<Card className="flex flex-col w-full h-full">
			<CardHeader className="pb-1.5 px-4 pt-4 flex-shrink-0">
				<CardTitle className="text-base font-semibold flex items-center gap-2">
					<MapPin className="w-4 h-4" />
					{t`Location`}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 p-0 flex flex-col min-h-0">
				{/* Map grows to fill card; absolute inset so height chain reaches MapContainer */}
				<div className="relative w-full flex-1 min-h-[320px] overflow-hidden">
					<div className="absolute inset-0 flex flex-col">
						<Suspense
							fallback={
								<div className="w-full h-full min-h-[320px] bg-muted/30 flex items-center justify-center">
									<span className="text-sm text-muted-foreground">{t`Loading map...`}</span>
								</div>
							}
						>
							<RealMap
								locations={locations}
								selectedLocation={selectedLocation}
								onLocationSelect={onLocationSelect}
							/>
						</Suspense>
					</div>
				</div>
				<div className="p-3 border-t bg-card/50 flex-shrink-0">
					<div className="text-xs text-muted-foreground space-y-1">
						<p className="font-medium text-foreground">{t`Site Information`}</p>
						<p>
							{locations.length} {t`locations across North America`}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
});
