import type { ActiveAlertResponse } from "~@/api";
import { getActiveAlertsV1ObservedQuery } from "~@/api";
import { makeAutoObservable, reaction } from "~@/mobx";
import { authViewModel } from "~@/view-model/auth";
import type { Alert, Domain } from "~@/views";

import { ALERTS_POLL_INTERVAL_MS } from "../constants";
import type { Disposable } from "../types";
import { mapActiveAlertResponseToAlert } from "./mapActiveAlertResponseToAlert";

type AlertsQuery = ReturnType<typeof getActiveAlertsV1ObservedQuery>;

/**
 * Singleton ViewModel for Dashboard Alerts data.
 * Query is created only on first load() so login page never triggers active requests.
 */
/** Debounce window: skip load() if last load was within this ms (avoids duplicate requests from multiple triggers). */
const LOAD_DEBOUNCE_MS = 800;

class DashboardAlertsViewModel implements Disposable {
	#alertsQuery: AlertsQuery | null = null;
	#lastLoadAt = 0;

	// Observable state for domain filtering
	activeDomain: Domain = "All";
	domainSensorIds: Set<string> = new Set();

	#authDisposer: (() => void) | null = null;

	constructor() {
		makeAutoObservable(this);
		// Stop polling when user logs out so active requests don't keep firing on login page
		this.#authDisposer = reaction(
			() => authViewModel.isAuthenticated,
			(authenticated) => {
				if (!authenticated) this.dispose();
			},
			{ fireImmediately: false },
		);
	}

	#ensureQuery(): AlertsQuery {
		if (this.#alertsQuery) return this.#alertsQuery;
		this.#alertsQuery = getActiveAlertsV1ObservedQuery(undefined, {
			refetchInterval: ALERTS_POLL_INTERVAL_MS,
		});
		return this.#alertsQuery;
	}

	/** Load active alerts. Deduped so multiple triggers (Home, GlobalStatusBar, Panel, DataTable) don't all fire. */
	load = () => {
		const now = Date.now();
		if (now - this.#lastLoadAt < LOAD_DEBOUNCE_MS) return;
		this.#lastLoadAt = now;
		this.#ensureQuery().load();
	};

	/**
	 * Set active domain filter and sensor IDs for filtering
	 */
	setActiveDomain = (domain: Domain, sensorIds: Set<string>) => {
		this.activeDomain = domain;
		this.domainSensorIds = sensorIds;
	};

	/**
	 * Get all alerts (unfiltered). Handles array or { items: [] } from API.
	 */
	get allAlerts(): Alert[] {
		const raw = this.#alertsQuery?.data;
		const items = Array.isArray(raw)
			? raw
			: ((raw as { items?: ActiveAlertResponse[] } | null)?.items ?? []);
		return (items as ActiveAlertResponse[]).map(mapActiveAlertResponseToAlert);
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
	get alertsBySeverity(): { critical: number; warning: number; info: number } {
		return {
			critical: this.activeAlerts.filter((a) => a.severity === "critical").length,
			warning: this.activeAlerts.filter((a) => a.severity === "warning").length,
			info: this.activeAlerts.filter((a) => a.severity === "info").length,
		};
	}

	/**
	 * Get system health status based on alerts
	 */
	get systemStatus(): "healthy" | "degraded" | "critical" {
		const criticalAlerts = this.alerts.filter(
			(a) => a.severity === "critical" && (a.status === "active" || a.status === "acknowledged"),
		).length;
		const warningAlerts = this.alerts.filter(
			(a) => a.severity === "warning" && (a.status === "active" || a.status === "acknowledged"),
		).length;

		if (criticalAlerts > 0) return "critical";
		if (warningAlerts > 0) return "degraded";
		return "healthy";
	}

	get isLoading(): boolean {
		return this.#alertsQuery?.isLoading ?? false;
	}

	get isFetching(): boolean {
		return this.#alertsQuery?.isFetching ?? false;
	}

	get hasError(): boolean {
		return this.#alertsQuery?.hasError ?? false;
	}

	/** Refetch active alerts (e.g. after ack/resolve from dashboard drawer). */
	refresh = async () => {
		const q = this.#alertsQuery;
		if (!q) return;
		q.invalidate();
		await q.refetch();
	};

	dispose() {
		this.#authDisposer?.();
		this.#authDisposer = null;
		this.#alertsQuery?.dispose();
		this.#alertsQuery = null;
		this.#lastLoadAt = 0;
	}
}

// Export singleton instance
export const dashboardAlertsViewModel = new DashboardAlertsViewModel();

export function useDashboardAlertsViewModel() {
	return dashboardAlertsViewModel;
}
