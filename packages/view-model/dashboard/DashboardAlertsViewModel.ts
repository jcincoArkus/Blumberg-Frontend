import type { ActiveAlertResponse } from "~@/api";
import { getActiveAlertsV1ObservedQuery } from "~@/api";
import { makeAutoObservable } from "~@/mobx";
import type { Alert, Domain } from "~@/views";

import { ALERTS_POLL_INTERVAL_MS } from "../constants";
import type { Disposable } from "../types";
import { mapActiveAlertResponseToAlert } from "./mapActiveAlertResponseToAlert";

/**
 * Singleton ViewModel for Dashboard Alerts data.
 * Auto-refreshes via refetchInterval (polling) so new alerts appear without reload.
 */
class DashboardAlertsViewModel implements Disposable {
	#alertsQuery = getActiveAlertsV1ObservedQuery(undefined, {
		refetchInterval: ALERTS_POLL_INTERVAL_MS,
	});

	// Observable state for domain filtering
	activeDomain: Domain = "All";
	domainSensorIds: Set<string> = new Set();

	constructor() {
		makeAutoObservable(this);
		this.#alertsQuery.load();
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
		const data = this.#alertsQuery.data as ActiveAlertResponse[] | null | undefined;
		return (data ?? []).map(mapActiveAlertResponseToAlert);
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

	get isLoading(): boolean {
		return this.#alertsQuery.isLoading;
	}

	get isFetching(): boolean {
		return this.#alertsQuery.isFetching;
	}

	get hasError(): boolean {
		return this.#alertsQuery.hasError;
	}

	dispose() {
		this.#alertsQuery.dispose();
	}
}

// Export singleton instance
export const dashboardAlertsViewModel = new DashboardAlertsViewModel();

export function useDashboardAlertsViewModel() {
	return dashboardAlertsViewModel;
}
