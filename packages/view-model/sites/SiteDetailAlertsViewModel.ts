import type { AlertResponsePagedResponse } from "~@/api";
import { getAllAlertsV1ObservedQuery } from "~@/api";
import { makeAutoObservable } from "~@/mobx";
import type { Alert } from "~@/models";

import { mapAlertResponseToAlert } from "../alerts/mapAlertResponseToAlert";
import { ALERTS_POLL_INTERVAL_MS } from "../constants";
import type { Disposable } from "../types";

/**
 * Instance ViewModel for Site Detail alerts data.
 * Fetches all alerts scoped to a specific site and derives health/severity info.
 */
export class SiteDetailAlertsViewModel implements Disposable {
	#alertsQuery = getAllAlertsV1ObservedQuery(undefined, {
		refetchInterval: ALERTS_POLL_INTERVAL_MS,
	});

	constructor() {
		makeAutoObservable(this);
	}

	loadForSite(siteId: string) {
		this.#alertsQuery.load({ query: { SiteId: siteId } });
	}

	get alerts(): Alert[] {
		const data = this.#alertsQuery.data as AlertResponsePagedResponse | null | undefined;
		return (data?.items ?? []).map(mapAlertResponseToAlert);
	}

	get activeAlerts(): Alert[] {
		return this.alerts.filter((a) => a.status === "active" || a.status === "acknowledged");
	}

	get recentAlerts(): Alert[] {
		return this.alerts.filter((a) => a.status === "acknowledged" || a.status === "resolved");
	}

	get alertCountBySeverity(): { critical: number; warning: number; info: number } {
		return {
			critical: this.activeAlerts.filter((a) => a.severity === "critical").length,
			warning: this.activeAlerts.filter((a) => a.severity === "warning").length,
			info: this.activeAlerts.filter((a) => a.severity === "info").length,
		};
	}

	get siteHealth(): "healthy" | "degraded" | "critical" {
		const { critical, warning } = this.alertCountBySeverity;

		if (critical > 0) return "critical";
		if (warning > 0) return "degraded";
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
