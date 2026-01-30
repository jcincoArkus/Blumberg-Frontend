import { makeAutoObservable } from "~@/mobx";
import type { AgentInsight, Alert, Domain, Sensor, Site } from "~@/views";

import type { Disposable } from "../types";

// Type for sensors with domain filtering capability
interface DashboardSensor extends Sensor {
	type: string;
}

// Domain to sensor type mapping
const DOMAIN_TYPES: Record<string, string[]> = {
	Energy: ["energy"],
	Climate: ["temperature", "humidity", "co2"],
	Refrigeration: ["temperature", "pressure"],
	Equipment: ["temperature", "humidity", "co2", "pressure", "energy"],
};

interface DashboardData {
	sensors: DashboardSensor[];
	alerts: Alert[];
	sites: Site[];
	insights: AgentInsight[];
}

/**
 * ViewModel for the Dashboard/Home page.
 * Manages domain filtering and all derived dashboard metrics.
 */
export class DashboardViewModel implements Disposable {
	// Observable state
	activeDomain: Domain = "All";

	// Raw data (injected via constructor)
	private readonly sensors: DashboardSensor[];
	private readonly alerts: Alert[];
	readonly sites: Site[];
	private readonly insights: AgentInsight[];

	constructor(data: DashboardData) {
		makeAutoObservable(this);
		this.sensors = data.sensors;
		this.alerts = data.alerts;
		this.sites = data.sites;
		this.insights = data.insights;
	}

	// Action: set active domain
	setActiveDomain = (domain: Domain) => {
		this.activeDomain = domain;
	};

	// Computed: sensors filtered by domain
	get domainSensors(): DashboardSensor[] {
		if (this.activeDomain === "All") return this.sensors;
		const types = DOMAIN_TYPES[this.activeDomain] ?? [];
		return this.sensors.filter((s) => types.includes(s.type));
	}

	// Computed: alerts filtered by domain
	get domainAlerts(): Alert[] {
		if (this.activeDomain === "All") return this.alerts;
		const domainSensorIds = new Set(this.domainSensors.map((s) => s.id));
		return this.alerts.filter((a) => !a.sensorId || domainSensorIds.has(a.sensorId));
	}

	// Computed: system health status
	get systemStatus(): "healthy" | "degraded" | "critical" {
		const criticalAlerts = this.domainAlerts.filter(
			(a) => a.severity === "critical" && (a.status === "active" || a.status === "acknowledged"),
		).length;
		const highAlerts = this.domainAlerts.filter(
			(a) => a.severity === "high" && (a.status === "active" || a.status === "acknowledged"),
		).length;
		const offlineSensors = this.domainSensors.filter(
			(s) => s.status === "offline" || s.status === "error",
		).length;
		const totalSensors = this.domainSensors.length;

		if (criticalAlerts > 0 || offlineSensors / totalSensors > 0.2) return "critical";
		if (highAlerts > 0 || offlineSensors / totalSensors > 0.1) return "degraded";
		return "healthy";
	}

	// Computed: active alerts (not resolved)
	get activeAlerts(): Alert[] {
		return this.domainAlerts.filter((a) => a.status === "active" || a.status === "acknowledged");
	}

	// Computed: alerts grouped by severity
	get alertsBySeverity(): { high: number; medium: number; low: number } {
		return {
			high: this.activeAlerts.filter((a) => a.severity === "high" || a.severity === "critical")
				.length,
			medium: this.activeAlerts.filter((a) => a.severity === "medium").length,
			low: this.activeAlerts.filter((a) => a.severity === "low").length,
		};
	}

	// Computed: key metrics (static mock for now)
	get keyMetrics() {
		return {
			aqi: { value: 42, unit: "", trend: "stable" as const, status: "stable" as const },
			co2: { value: 580, unit: "ppm", trend: "down" as const, status: "improving" as const },
			temperature: { value: 21.5, unit: "°C", trend: "stable" as const, status: "stable" as const },
			humidity: { value: 48, unit: "%", trend: "up" as const, status: "rising" as const },
		};
	}

	// Computed: trend data (generates mock sparkline data)
	get trendData() {
		return {
			aqi: this.generateTrendPoints(42, 15, 24),
			co2: this.generateTrendPoints(580, 50, 24),
			temperature: this.generateTrendPoints(21.5, 2, 24),
		};
	}

	private generateTrendPoints(baseValue: number, variance: number, count: number) {
		const points = [];
		const now = new Date();
		for (let i = count - 1; i >= 0; i--) {
			const time = new Date(now.getTime() - i * 60 * 60 * 1000);
			const value = baseValue + (Math.random() - 0.5) * variance;
			points.push({ time: time.toISOString(), value: Math.max(0, value) });
		}
		return points;
	}

	// Computed: sensor reliability metrics
	get sensorReliability() {
		const offlineSensors = this.domainSensors.filter((s) => s.status === "offline");
		const staleSensors = this.domainSensors.filter((s) => s.status === "stale");
		const flappingSensors = this.domainSensors.filter((s) => s.status === "warning");

		return {
			offline: offlineSensors.length,
			stale: staleSensors.length,
			flapping: flappingSensors.length,
			offlineSensors,
			staleSensors,
			flappingSensors,
		};
	}

	// Computed: count of online sensors
	get sensorsOnline(): number {
		return this.domainSensors.filter((s) => s.status === "active").length;
	}

	// Computed: sorted and limited insights for display
	get displayInsights(): AgentInsight[] {
		return [...this.insights]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 4);
	}

	dispose() {
		// No subscriptions to clean up currently
	}
}
