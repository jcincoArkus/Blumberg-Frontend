import { useEffect, useState } from "react";

import { observer } from "~@/mobx";
import {
	alertsViewModel,
	dashboardAlertsViewModel,
	dashboardSensorsViewModel,
} from "~@/view-model";
import {
	ActiveAlertsPanel,
	AIInsightsPanel,
	GlobalStatusBar,
	GroupedSensorMetricsPanel,
	InteriorMapPanel,
	LocationPanel,
	SensorReliabilityPanel,
	TrendsPanel,
} from "~@/views";

/**
 * Dashboard/Home page component.
 * Layout (sidebar + header) is provided by the parent _private layout.
 */
const Home = observer(function Home() {
	const [selectedLocation, setSelectedLocation] = useState<string | null>("1");

	// Trigger alerts + sensors load when dashboard home mounts. Stop sensor health polling on unmount so /alerts (and other pages) don't keep firing health requests.
	useEffect(() => {
		// Ensure all dashboard data sources start loading/polling when Home mounts.
		alertsViewModel.load();
		dashboardAlertsViewModel.load();
		dashboardSensorsViewModel.load();
		return () => {
			dashboardSensorsViewModel.dispose();
		};
	}, []);

	return (
		<div className="space-y-4">
			<GlobalStatusBar />

			<div className="space-y-3 p-4 lg:p-6">
				<div className="grid gap-3 lg:grid-cols-12">
					<div className="lg:col-span-3">
						<ActiveAlertsPanel />
					</div>
					<div className="lg:col-span-4">
						<TrendsPanel />
					</div>
					<div className="lg:col-span-5">
						<AIInsightsPanel />
					</div>
				</div>

				<GroupedSensorMetricsPanel />

				<div className="grid gap-4 lg:grid-cols-12 items-stretch min-h-[min(600px,70vh)]">
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

				<SensorReliabilityPanel />
			</div>
		</div>
	);
});

export default Home;
