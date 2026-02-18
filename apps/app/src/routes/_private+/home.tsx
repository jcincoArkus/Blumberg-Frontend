import { useState } from "react";

import {
	ActiveAlertsPanel,
	AIInsightsPanel,
	GlobalStatusBar,
	GroupedSensorMetricsPanel,
	InteriorMapPanel,
	KeyMetricsCards,
	LocationPanel,
	SensorReliabilityPanel,
	TrendsPanel,
	ZonesOverviewPanel,
} from "~@/views";

/**
 * Dashboard/Home page component.
 * Layout (sidebar + header) is provided by the parent _private layout.
 */
function Home() {
	const [selectedLocation, setSelectedLocation] = useState<string | null>("1");

	return (
		<div className="space-y-4">
			<GlobalStatusBar />

			<div className="space-y-3 p-4 lg:p-6">
				<div className="grid gap-3 lg:grid-cols-12">
					<div className="lg:col-span-3">
						<ActiveAlertsPanel />
					</div>
					<div className="lg:col-span-6 space-y-3">
						<KeyMetricsCards />
						<TrendsPanel />
					</div>
					<div className="lg:col-span-3">
						<AIInsightsPanel />
					</div>
				</div>

				<GroupedSensorMetricsPanel />

				{/* 50/50 grid: taller row so map and interior map have room */}
				<div className="grid gap-4 lg:grid-cols-12 items-stretch min-h-[min(720px,70vh)]">
					<div className="lg:col-span-6 min-w-0 flex flex-col min-h-0">
						<InteriorMapPanel selectedLocation={selectedLocation} />
					</div>
					<div className="lg:col-span-6 min-w-0 flex flex-col min-h-0">
						<LocationPanel
							selectedLocation={selectedLocation}
							onLocationSelect={(id) => setSelectedLocation(id || null)}
						/>
					</div>
				</div>

				<div className="grid gap-3 lg:grid-cols-12 items-start">
					<div className="lg:col-span-9">
						<ZonesOverviewPanel />
					</div>
					<div className="lg:col-span-3">
						<SensorReliabilityPanel />
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
