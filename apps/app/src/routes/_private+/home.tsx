import { useMemo, useState } from "react";

import type { Domain } from "~@/views";
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

import { agentInsights, alerts, sensors, sites } from "../../mock-data/dashboard";

// Helper function to filter sensors by domain
function filterSensorsByDomain(sensorList: typeof sensors, domain: string) {
	if (domain === "All") return sensorList;
	const domainTypes: Record<string, string[]> = {
		Energy: ["energy"],
		Climate: ["temperature", "humidity", "co2"],
		Refrigeration: ["temperature", "pressure"],
		Equipment: ["temperature", "humidity", "co2", "pressure", "energy"],
	};
	return sensorList.filter((s) => domainTypes[domain]?.includes(s.type));
}

// Helper function to filter alerts by domain
function filterAlertsByDomain(
	alertList: typeof alerts,
	domain: string,
	sensorList: typeof sensors,
) {
	if (domain === "All") return alertList;
	const domainSensorIds = filterSensorsByDomain(sensorList, domain).map((s) => s.id);
	return alertList.filter((a) => !a.sensorId || domainSensorIds.includes(a.sensorId));
}

export default function Home() {
	// Local state for domain - will be replaced with MobX ViewModel
	const [activeDomain, setActiveDomain] = useState<Domain>("All");

	// Filter data based on active domain
	const domainSensors = useMemo(() => filterSensorsByDomain(sensors, activeDomain), [activeDomain]);
	const domainAlerts = useMemo(
		() => filterAlertsByDomain(alerts, activeDomain, sensors),
		[activeDomain],
	);

	// Calculate system status
	const systemStatus = useMemo((): "healthy" | "degraded" | "critical" => {
		const criticalAlerts = domainAlerts.filter(
			(a) => a.severity === "critical" && (a.status === "active" || a.status === "acknowledged"),
		).length;
		const highAlerts = domainAlerts.filter(
			(a) => a.severity === "high" && (a.status === "active" || a.status === "acknowledged"),
		).length;
		const offlineSensors = domainSensors.filter(
			(s) => s.status === "offline" || s.status === "error",
		).length;
		const totalSensors = domainSensors.length;

		if (criticalAlerts > 0 || offlineSensors / totalSensors > 0.2) return "critical";
		if (highAlerts > 0 || offlineSensors / totalSensors > 0.1) return "degraded";
		return "healthy";
	}, [domainAlerts, domainSensors]);

	// Get active alerts
	const activeAlerts = useMemo(
		() => domainAlerts.filter((a) => a.status === "active" || a.status === "acknowledged"),
		[domainAlerts],
	);

	const alertsBySeverity = useMemo(
		() => ({
			high: activeAlerts.filter((a) => a.severity === "high" || a.severity === "critical").length,
			medium: activeAlerts.filter((a) => a.severity === "medium").length,
			low: activeAlerts.filter((a) => a.severity === "low").length,
		}),
		[activeAlerts],
	);

	// Key metrics (simplified mock)
	const keyMetrics = useMemo(
		() => ({
			aqi: { value: 42, unit: "", trend: "stable" as const, status: "stable" as const },
			co2: { value: 580, unit: "ppm", trend: "down" as const, status: "improving" as const },
			temperature: { value: 21.5, unit: "°C", trend: "stable" as const, status: "stable" as const },
			humidity: { value: 48, unit: "%", trend: "up" as const, status: "rising" as const },
		}),
		[],
	);

	// Generate trend data (mock sparkline data)
	const trendData = useMemo(() => {
		const generatePoints = (baseValue: number, variance: number, count: number) => {
			const points = [];
			const now = new Date();
			for (let i = count - 1; i >= 0; i--) {
				const time = new Date(now.getTime() - i * 60 * 60 * 1000);
				const value = baseValue + (Math.random() - 0.5) * variance;
				points.push({ time: time.toISOString(), value: Math.max(0, value) });
			}
			return points;
		};

		return {
			aqi: generatePoints(42, 15, 24),
			co2: generatePoints(580, 50, 24),
			temperature: generatePoints(21.5, 2, 24),
		};
	}, []);

	// Sensor reliability
	const sensorReliability = useMemo(() => {
		const offlineSensors = domainSensors.filter((s) => s.status === "offline");
		const staleSensors = domainSensors.filter((s) => s.status === "stale");
		const flappingSensors = domainSensors.filter((s) => s.status === "warning");

		return {
			offline: offlineSensors.length,
			stale: staleSensors.length,
			flapping: flappingSensors.length,
			offlineSensors,
			staleSensors,
			flappingSensors,
		};
	}, [domainSensors]);

	const sensorsOnline = useMemo(
		() => domainSensors.filter((s) => s.status === "active").length,
		[domainSensors],
	);

	const displayInsights = useMemo(
		() =>
			agentInsights
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 4),
		[],
	);

	return (
		<DashboardShell activeDomain={activeDomain} onDomainChange={setActiveDomain}>
			<div className="space-y-4">
				<GlobalStatusBar
					systemStatus={systemStatus}
					activeAlerts={alertsBySeverity}
					sensorsOnline={sensorsOnline}
					totalSensors={domainSensors.length}
					alerts={activeAlerts}
				/>

				<div className="space-y-3 p-4 lg:p-6">
					<div className="grid gap-3 lg:grid-cols-12">
						<div className="lg:col-span-3">
							<ActiveAlertsPanel alerts={activeAlerts} />
						</div>
						<div className="lg:col-span-6 space-y-3">
							<KeyMetricsCards {...keyMetrics} />
							<TrendsPanel data={trendData} />
						</div>
						<div className="lg:col-span-3">
							<AIInsightsPanel insights={displayInsights} />
						</div>
					</div>

					<div className="grid gap-3 lg:grid-cols-12 items-start">
						<div className="lg:col-span-9">
							<ZonesOverviewPanel sites={sites} />
						</div>
						<div className="lg:col-span-3">
							<SensorReliabilityPanel
								offlineCount={sensorReliability.offline}
								staleCount={sensorReliability.stale}
								flappingCount={sensorReliability.flapping}
								totalSensors={domainSensors.length}
								offlineSensors={sensorReliability.offlineSensors}
								staleSensors={sensorReliability.staleSensors}
								flappingSensors={sensorReliability.flappingSensors}
							/>
						</div>
					</div>
				</div>
			</div>
		</DashboardShell>
	);
}
