import { makeAutoObservable } from "~@/mobx";
import { dashboardAlerts } from "~@/mock-data";
import type { Alert, Domain } from "~@/views";

/**
 * Singleton ViewModel for Dashboard Alerts data.
 * Will use hey-api ObservedQuery when endpoints are ready.
 * Currently uses mock data.
 */
class DashboardAlertsViewModel {
	// TODO: Replace with ObservedQuery when hey-api endpoint is ready
	// alertsQuery = new ObservedQuery(getAlertsQuery, {});
	private readonly _alerts: Alert[];

	// Observable state for domain filtering
	activeDomain: Domain = "All";
	domainSensorIds: Set<string> = new Set();

	constructor() {
		makeAutoObservable(this);
		this._alerts = dashboardAlerts;
	}

	/**
	 * Set active domain filter and sensor IDs for filtering
	 */
	setActiveDomain = (domain: Domain, sensorIds: Set<string>) => {
		this.activeDomain = domain;
		this.domainSensorIds = sensorIds;
	};

	/**
	 * Get all alerts (unfiltered)
	 */
	get allAlerts(): Alert[] {
		// return this.alertsQuery.data ?? [];
		return this._alerts;
	}

	/**
	 * Get alerts filtered by domain
	 */
	get alerts(): Alert[] {
		if (this.activeDomain === "All") return this.allAlerts;
		return this.allAlerts.filter((a) => !a.sensorId || this.domainSensorIds.has(a.sensorId));
	}

	/**
	 * Get active alerts (not resolved)
	 */
	get activeAlerts(): Alert[] {
		return this.alerts.filter((a) => a.status === "active" || a.status === "acknowledged");
	}

	/**
	 * Get alerts grouped by severity
	 */
	get alertsBySeverity(): { high: number; medium: number; low: number } {
		return {
			high: this.activeAlerts.filter((a) => a.severity === "high" || a.severity === "critical")
				.length,
			medium: this.activeAlerts.filter((a) => a.severity === "medium").length,
			low: this.activeAlerts.filter((a) => a.severity === "low").length,
		};
	}

	/**
	 * Get system health status based on alerts
	 */
	get systemStatus(): "healthy" | "degraded" | "critical" {
		const criticalAlerts = this.alerts.filter(
			(a) => a.severity === "critical" && (a.status === "active" || a.status === "acknowledged"),
		).length;
		const highAlerts = this.alerts.filter(
			(a) => a.severity === "high" && (a.status === "active" || a.status === "acknowledged"),
		).length;

		if (criticalAlerts > 0) return "critical";
		if (highAlerts > 0) return "degraded";
		return "healthy";
	}

	/**
	 * Load alerts from API
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// load = () => {
	// 	this.alertsQuery.load();
	// };

	/**
	 * Dispose of resources
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// dispose = () => {
	// 	this.alertsQuery.dispose();
	// };
}

// Export singleton instance
export const dashboardAlertsViewModel = new DashboardAlertsViewModel();

export function useDashboardAlertsViewModel() {
	return dashboardAlertsViewModel;
}
