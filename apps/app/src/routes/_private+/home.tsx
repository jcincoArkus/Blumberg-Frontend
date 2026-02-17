import {
	ActiveAlertsPanel,
	AIInsightsPanel,
	GlobalStatusBar,
	GroupedSensorMetricsPanel,
	KeyMetricsCards,
	SensorReliabilityPanel,
	TrendsPanel,
	ZonesOverviewPanel,
} from "~@/views";

/**
 * Dashboard/Home page component.
 * Layout (sidebar + header) is provided by the parent _private layout.
 */
function Home() {
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
