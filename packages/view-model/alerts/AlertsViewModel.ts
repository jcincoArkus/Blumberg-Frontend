import type { AlertResponse, AlertResponsePagedResponse } from "~@/api";
import {
	acknowledgeAlertV1ObservedMutation,
	getAllAlertsV1ObservedQuery,
	resolveAlertV1ObservedMutation,
} from "~@/api";
import { makeAutoObservable } from "~@/mobx";
import type { Alert, AlertStatus } from "~@/models";
import { getAlertDuration } from "~@/models";

import type { Disposable } from "../types";
import { mapAlertResponseToAlert } from "./mapAlertResponseToAlert";

const DEFAULT_PAGE_SIZE = 500;

/**
 * ViewModel for the Alerts & Events page.
 * Uses ObservedQuery for list data and ObservedMutation for acknowledge/resolve (per .llm/skills viewmodel-pattern and api-pattern).
 */
class AlertsViewModel implements Disposable {
	activeTab: AlertStatus | "all" = "all";

	#alertsQuery = getAllAlertsV1ObservedQuery({
		query: { Page: 1, PageSize: DEFAULT_PAGE_SIZE },
	});
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

	// Computed: filtered alerts based on active tab
	get filteredAlerts(): Alert[] {
		if (this.activeTab === "all") return this.alerts;
		return this.alerts.filter((alert) => alert.status === this.activeTab);
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
		} catch {
			// Error surfaced via #ackMutation.error; invalidation only on success per api-pattern
		}
	};

	resolveAlert = async (alertId: string) => {
		try {
			await this.#resolveMutation.mutateAsync({ path: { id: alertId } });
			this.#alertsQuery.invalidate();
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
	}
}

export const alertsViewModel = new AlertsViewModel();

export function useAlertsViewModel() {
	return alertsViewModel;
}
