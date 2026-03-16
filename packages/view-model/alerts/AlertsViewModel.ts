import type { AlertResponse, AlertResponsePagedResponse } from "~@/api";
import {
	acknowledgeAlertV1ObservedMutation,
	getAlertByIdV1ObservedQuery,
	getAllAlertsV1ObservedQuery,
	resolveAlertV1ObservedMutation,
} from "~@/api";
import { makeAutoObservable, reaction } from "~@/mobx";
import type { Alert, AlertStatus } from "~@/models";
import { getAlertDuration, getSeverityOrder } from "~@/models";

import { authViewModel } from "../auth";
import { ALERTS_POLL_INTERVAL_MS } from "../constants";
import type { Disposable } from "../types";
import { mapAlertResponseToAlert } from "./mapAlertResponseToAlert";

const DEFAULT_PAGE_SIZE = 500;
type AlertsQuery = ReturnType<typeof getAllAlertsV1ObservedQuery>;

/**
 * ViewModel for the Alerts & Events page.
 * Auto-refreshes via refetchInterval (polling) so new alerts appear without reload.
 */
class AlertsViewModel implements Disposable {
	activeTab: AlertStatus | "all" = "all";

	#alertsQuery: AlertsQuery;
	#hasLoaded = false;
	#detailQuery = getAlertByIdV1ObservedQuery();
	#detailAlertId: string | null = null;
	#ackMutation = acknowledgeAlertV1ObservedMutation();
	#resolveMutation = resolveAlertV1ObservedMutation();
	#authDisposer: (() => void) | null = null;

	readonly calculateDuration = getAlertDuration;
	getEquipmentName = (id: string): string => this.equipmentNames[id] ?? "Unknown Equipment";
	getSensorName = (id: string): string => this.sensorNames[id] ?? "Unknown Sensor";
	getSensorType = (id: string): string => this.sensorTypes[id] ?? "unknown";

	constructor() {
		// Create the observed query up front so MobX can track its data,
		// but don't start network loading until load() is called.
		this.#alertsQuery = getAllAlertsV1ObservedQuery(
			{ query: { Page: 1, PageSize: DEFAULT_PAGE_SIZE } },
			{ refetchInterval: ALERTS_POLL_INTERVAL_MS },
		);
		makeAutoObservable(this);
		// Stop alerts polling when user logs out.
		this.#authDisposer = reaction(
			() => authViewModel.isAuthenticated,
			(isAuthenticated) => {
				if (!isAuthenticated) {
					this.dispose();
				}
			},
			{ fireImmediately: false },
		);
	}

	load = () => {
		if (this.#hasLoaded) return;
		this.#hasLoaded = true;
		this.#alertsQuery.load();
	};

	private get rawItems(): AlertResponse[] {
		const raw = this.#alertsQuery.data as
			| AlertResponsePagedResponse
			| AlertResponse[]
			| null
			| undefined;
		// The alerts API may return either a paged response ({ items: [] }) or a bare array.
		if (Array.isArray(raw)) return raw;
		return raw?.items ?? [];
	}

	get alerts(): Alert[] {
		return this.rawItems.map(mapAlertResponseToAlert);
	}

	get equipmentNames(): Record<string, string> {
		const acc: Record<string, string> = {};
		const raw = this.rawItems as Array<Record<string, unknown>>;
		for (const r of raw) {
			const id = r.equipmentId as string | undefined;
			const name = (r.equipmentName ?? r.EquipmentName) as string | undefined;
			if (id && name) acc[id] = name;
		}
		return acc;
	}

	get sensorNames(): Record<string, string> {
		const acc: Record<string, string> = {};
		const raw = this.rawItems as Array<Record<string, unknown>>;
		for (const r of raw) {
			const id = r.sensorId as string | undefined;
			const serial = (r.sensorSerial ?? r.SensorSerial) as string | undefined;
			const displayName = serial ?? id ?? "";
			if (serial) acc[serial] = displayName; // key by serial (alert.sensorId is serial when present)
			if (id) acc[id] = displayName; // also key by Guid for backward compatibility
		}
		return acc;
	}

	get sensorTypes(): Record<string, string> {
		const acc: Record<string, string> = {};
		const raw = this.rawItems as Array<Record<string, unknown>>;
		for (const r of raw) {
			const id = r.sensorId as string | undefined;
			const serial = (r.sensorSerial ?? r.SensorSerial) as string | undefined;
			const name = (r.sensorTypeName ?? r.SensorTypeName) as string | undefined;
			if (name) {
				if (serial) acc[serial] = name; // key by serial (alert.sensorId is serial when present)
				if (id) acc[id] = name; // also key by Guid for backward compatibility
			}
		}
		return acc;
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

	get error(): string | null {
		const err = this.#alertsQuery.error;
		return err instanceof Error ? err.message : err ? String(err) : null;
	}

	// Computed: filtered by tab, sorted for display (spec: "insert in correct severity position")
	get filteredAlerts(): Alert[] {
		const list =
			this.activeTab === "all"
				? this.alerts
				: this.alerts.filter((alert) => alert.status === this.activeTab);
		return AlertsViewModel.sortAlertsForDisplay(list);
	}

	/** Sort order: status (active → acknowledged → resolved), then severity (critical → warning → info), then newest first. */
	private static sortAlertsForDisplay(alerts: Alert[]): Alert[] {
		const statusOrder: Record<AlertStatus, number> = {
			active: 0,
			acknowledged: 1,
			resolved: 2,
		};
		return [...alerts].sort((a, b) => {
			const statusA = statusOrder[a.status] ?? 2;
			const statusB = statusOrder[b.status] ?? 2;
			if (statusA !== statusB) return statusA - statusB;

			const sevA = getSeverityOrder(a.severity);
			const sevB = getSeverityOrder(b.severity);
			if (sevA !== sevB) return sevA - sevB;

			const timeA = new Date(a.createdAt).getTime();
			const timeB = new Date(b.createdAt).getTime();
			return timeB - timeA; // newest first
		});
	}

	get statusCounts(): Record<AlertStatus | "all", number> {
		return {
			all: this.alerts.length,
			active: this.alerts.filter((a) => a.status === "active").length,
			acknowledged: this.alerts.filter((a) => a.status === "acknowledged").length,
			resolved: this.alerts.filter((a) => a.status === "resolved").length,
		};
	}

	get activeAlerts(): Alert[] {
		return this.alerts.filter((a) => a.status === "active");
	}

	get criticalAlerts(): Alert[] {
		return this.alerts.filter((a) => a.severity === "critical" && a.status === "active");
	}

	get warningAlerts(): Alert[] {
		return this.alerts.filter((a) => a.severity === "warning" && a.status === "active");
	}

	/** Alias for warningAlerts (backend Warning = "high priority" in UI). */
	get highAlerts(): Alert[] {
		return this.warningAlerts;
	}

	get acknowledgedAlerts(): Alert[] {
		return this.alerts.filter((a) => a.status === "acknowledged");
	}

	/** Active + acknowledged (unresolved) — for dashboard status bar and sensor metrics. */
	get unresolvedAlerts(): Alert[] {
		return [...this.activeAlerts, ...this.acknowledgedAlerts];
	}

	/** Counts by severity for unresolved alerts (dashboard status bar). */
	get alertsBySeverity(): { critical: number; warning: number; info: number } {
		const list = this.unresolvedAlerts;
		return {
			critical: list.filter((a) => a.severity === "critical").length,
			warning: list.filter((a) => a.severity === "warning").length,
			info: list.filter((a) => a.severity === "info").length,
		};
	}

	/** System health from unresolved alerts (dashboard status bar). */
	get systemStatus(): "healthy" | "degraded" | "critical" {
		const { critical, warning } = this.alertsBySeverity;
		if (critical > 0) return "critical";
		if (warning > 0) return "degraded";
		return "healthy";
	}

	get resolvedToday(): Alert[] {
		const today = new Date();
		return this.alerts.filter((a) => {
			if (a.status !== "resolved" || !a.resolvedAt) return false;
			return new Date(a.resolvedAt).toDateString() === today.toDateString();
		});
	}

	/** Id of the alert currently loaded for detail (drawer). */
	get selectedAlertId(): string | null {
		return this.#detailAlertId;
	}

	/**
	 * Returns full alert with events when loaded for the given alertId (for use with drawer).
	 * Same pattern as monitoring's getDetailFor(sensorId) — caller passes selected id so observer tracks the query.
	 */
	getDetailFor(alertId: string | null): Alert | null {
		if (!alertId || !this.#detailQuery.data) return null;
		const d = this.#detailQuery.data as AlertResponse & { Id?: string };
		const responseId = d.id ?? d.Id ?? "";
		if (String(responseId) !== String(alertId)) return null;
		return mapAlertResponseToAlert(d);
	}

	get isDetailLoading(): boolean {
		return this.#detailQuery.isLoading;
	}

	/** Load full alert by ID (includes events) for the details drawer. */
	loadAlertDetail = (alertId: string) => {
		this.#detailAlertId = alertId;
		this.#detailQuery.load({ path: { id: alertId } });
	};

	clearAlertDetail = () => {
		this.#detailAlertId = null;
	};

	setActiveTab = (tab: AlertStatus | "all") => {
		this.activeTab = tab;
	};

	refresh = async () => {
		// Ensure initial load has been triggered before attempting an async reload.
		this.#hasLoaded = true;
		await this.#alertsQuery.loadAsync({
			query: { Page: 1, PageSize: DEFAULT_PAGE_SIZE },
		});
	};

	acknowledgeAlert = async (alertId: string) => {
		try {
			await this.#ackMutation.mutateAsync({ path: { id: alertId } });
			const q = this.#alertsQuery;
			if (q) {
				q.invalidate();
				await q.refetch();
			}
			if (this.#detailAlertId === alertId) {
				this.#detailQuery.invalidate();
				await this.#detailQuery.refetch();
			}
		} catch {
			// Error surfaced via #ackMutation.error; invalidation only on success per api-pattern
		}
	};

	resolveAlert = async (alertId: string) => {
		try {
			await this.#resolveMutation.mutateAsync({ path: { id: alertId } });
			const q = this.#alertsQuery;
			if (q) {
				q.invalidate();
				await q.refetch();
			}
			if (this.#detailAlertId === alertId) {
				this.#detailQuery.invalidate();
				await this.#detailQuery.refetch();
			}
		} catch {
			// Error surfaced via #resolveMutation.error; invalidation only on success per api-pattern
		}
	};

	updateAlert = (alertId: string, action: "acknowledge" | "resolve") => {
		if (action === "acknowledge") {
			void this.acknowledgeAlert(alertId);
		} else {
			void this.resolveAlert(alertId);
		}
	};

	dispose() {
		this.#authDisposer?.();
		this.#authDisposer = null;
		this.#alertsQuery.dispose();
		this.#detailQuery.dispose();
		this.#hasLoaded = false;
	}
}

export const alertsViewModel = new AlertsViewModel();

export function useAlertsViewModel() {
	alertsViewModel.load();
	return alertsViewModel;
}
