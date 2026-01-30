import { observer } from "~@/mobx";
import {
	agentInsights,
	dashboardAlerts as alerts,
	dashboardSensors as sensors,
	dashboardSites as sites,
} from "~@/mock-data";
import { useDashboardViewModel } from "~@/view-model";
import {
	ActiveAlertsPanel,
	AIInsightsPanel,
	DashboardShell,
	GlobalStatusBar,
	KeyMetricsCards,
	SensorReliabilityPanel,
	TrendsPanel,
	ZonesOverviewPanel,
} from "~@/views";

/**
 * Dashboard/Home page component.
 * Uses DashboardViewModel for all state management and derived computations.
 */
const Home = observer(function Home() {
	const vm = useDashboardViewModel({
		sensors,
		alerts,
		sites,
		insights: agentInsights,
	});

	return (
		<DashboardShell activeDomain={vm.activeDomain} onDomainChange={vm.setActiveDomain}>
			<div className="space-y-4">
				<GlobalStatusBar
					systemStatus={vm.systemStatus}
					activeAlerts={vm.alertsBySeverity}
					sensorsOnline={vm.sensorsOnline}
					totalSensors={vm.domainSensors.length}
					alerts={vm.activeAlerts}
				/>

				<div className="space-y-3 p-4 lg:p-6">
					<div className="grid gap-3 lg:grid-cols-12">
						<div className="lg:col-span-3">
							<ActiveAlertsPanel alerts={vm.activeAlerts} />
						</div>
						<div className="lg:col-span-6 space-y-3">
							<KeyMetricsCards {...vm.keyMetrics} />
							<TrendsPanel data={vm.trendData} />
						</div>
						<div className="lg:col-span-3">
							<AIInsightsPanel insights={vm.displayInsights} />
						</div>
					</div>

					<div className="grid gap-3 lg:grid-cols-12 items-start">
						<div className="lg:col-span-9">
							<ZonesOverviewPanel sites={vm.sites} />
						</div>
						<div className="lg:col-span-3">
							<SensorReliabilityPanel
								offlineCount={vm.sensorReliability.offline}
								staleCount={vm.sensorReliability.stale}
								flappingCount={vm.sensorReliability.flapping}
								totalSensors={vm.domainSensors.length}
								offlineSensors={vm.sensorReliability.offlineSensors}
								staleSensors={vm.sensorReliability.staleSensors}
								flappingSensors={vm.sensorReliability.flappingSensors}
							/>
						</div>
					</div>
				</div>
			</div>
		</DashboardShell>
	);
});

export default Home;
