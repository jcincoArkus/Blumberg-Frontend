import type { AlertResponse, AlertResponsePagedResponse } from "~@/api";
import {
	acknowledgeAlertV1ObservedMutation,
	getAlertByIdV1ObservedQuery,
	getAllAlertsV1ObservedQuery,
	resolveAlertV1ObservedMutation,
} from "~@/api";
import { makeAutoObservable } from "~@/mobx";
import type { Alert, AlertStatus } from "~@/models";
import { getAlertDuration } from "~@/models";

import { ALERTS_POLL_INTERVAL_MS } from "../constants";
import type { Disposable } from "../types";
import { mapAlertResponseToAlert } from "./mapAlertResponseToAlert";

const DEFAULT_PAGE_SIZE = 500;

/**
 * ViewModel for the Alerts & Events page.
 * Auto-refreshes via refetchInterval (polling) so new alerts appear without reload.
 */
class AlertsViewModel implements Disposable {
	activeTab: AlertStatus | "all" = "all";

	#alertsQuery = getAllAlertsV1ObservedQuery(
		{ query: { Page: 1, PageSize: DEFAULT_PAGE_SIZE } },
		{ refetchInterval: ALERTS_POLL_INTERVAL_MS },
	);
	#detailQuery = getAlertByIdV1ObservedQuery();
	#detailAlertId: string | null = null;
	#ackMutation = acknowledgeAlertV1ObservedMutation();
	#resolveMutation = resolveAlertV1ObservedMutation();

	readonly calculateDuration = getAlertDuration;
	getEquipmentName = (id: string): string => this.equipmentNames[id] ?? "Unknown Equipment";
	getSensorName = (id: string): string => this.sensorNames[id] ?? "Unknown Sensor";
	getSensorType = (id: string): string => this.sensorTypes[id] ?? "unknown";

	constructor() {
		makeAutoObservable(this);
		this.#alertsQuery.load();
	}

	private get rawItems(): AlertResponse[] {
		const data = this.#alertsQuery.data as AlertResponsePagedResponse | null | undefined;
		return data?.items ?? [];
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
			if (id && serial) acc[id] = serial;
		}
		return acc;
	}

	get sensorTypes(): Record<string, string> {
		const acc: Record<string, string> = {};
		const raw = this.rawItems as Array<Record<string, unknown>>;
		for (const r of raw) {
			const id = r.sensorId as string | undefined;
			const name = (r.sensorTypeName ?? r.SensorTypeName) as string | undefined;
			if (id && name) acc[id] = name;
		}
		return acc;
	}

	get isLoading(): boolean {
		return this.#alertsQuery.isLoading;
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

	/** Sort order: status (active → acknowledged → resolved), then severity (critical → low), then newest first. */
	private static sortAlertsForDisplay(alerts: Alert[]): Alert[] {
		const statusOrder: Record<AlertStatus, number> = {
			active: 0,
			acknowledged: 1,
			resolved: 2,
		};
		const severityOrder: Record<string, number> = {
			critical: 0,
			high: 1,
			medium: 2,
			low: 3,
		};
		return [...alerts].sort((a, b) => {
			const statusA = statusOrder[a.status] ?? 2;
			const statusB = statusOrder[b.status] ?? 2;
			if (statusA !== statusB) return statusA - statusB;

			const sevA = severityOrder[a.severity] ?? 4;
			const sevB = severityOrder[b.severity] ?? 4;
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

	get highAlerts(): Alert[] {
		return this.alerts.filter((a) => a.severity === "high" && a.status === "active");
	}

	get acknowledgedAlerts(): Alert[] {
		return this.alerts.filter((a) => a.status === "acknowledged");
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
		await this.#alertsQuery.loadAsync({
			query: { Page: 1, PageSize: DEFAULT_PAGE_SIZE },
		});
	};

	acknowledgeAlert = async (alertId: string) => {
		try {
			await this.#ackMutation.mutateAsync({ path: { id: alertId } });
			this.#alertsQuery.invalidate();
			await this.#alertsQuery.refetch();
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
			this.#alertsQuery.invalidate();
			await this.#alertsQuery.refetch();
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
		this.#alertsQuery.dispose();
		this.#detailQuery.dispose();
	}
}

export const alertsViewModel = new AlertsViewModel();

export function useAlertsViewModel() {
	return alertsViewModel;
}
