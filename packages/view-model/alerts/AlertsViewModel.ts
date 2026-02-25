import { makeAutoObservable } from "~@/mobx";
import type { Alert, AlertStatus } from "~@/models";
import {
	getAlertDuration,
	getAlertSensorName,
	getAlertSensorType,
	getAlerts,
	getEquipmentName,
} from "~@/models";

import type { Disposable } from "../types";

/**
 * ViewModel for the Alerts & Events page.
 * Manages alert state, filtering, and actions (acknowledge/resolve).
 */
class AlertsViewModel implements Disposable {
	// Observable state
	alerts: Alert[] = [];
	activeTab: AlertStatus | "all" = "all";
	readonly calculateDuration = getAlertDuration;
	readonly getEquipmentName = getEquipmentName;
	readonly getSensorName = getAlertSensorName;
	readonly getSensorType = getAlertSensorType;

	constructor() {
		makeAutoObservable(this);
		this.alerts = getAlerts();
	}

	// Computed: filtered alerts based on active tab
	get filteredAlerts(): Alert[] {
		if (this.activeTab === "all") {
			return this.alerts;
		}
		return this.alerts.filter((alert) => alert.status === this.activeTab);
	}

	// Computed: status counts for tabs
	get statusCounts(): Record<AlertStatus | "all", number> {
		return {
			all: this.alerts.length,
			active: this.alerts.filter((a) => a.status === "active").length,
			acknowledged: this.alerts.filter((a) => a.status === "acknowledged").length,
			resolved: this.alerts.filter((a) => a.status === "resolved").length,
		};
	}

	// Computed: active alerts (not resolved)
	get activeAlerts(): Alert[] {
		return this.alerts.filter((a) => a.status === "active");
	}

	// Computed: critical alerts that are active
	get criticalAlerts(): Alert[] {
		return this.alerts.filter((a) => a.severity === "critical" && a.status === "active");
	}

	// Computed: high priority alerts that are active
	get highAlerts(): Alert[] {
		return this.alerts.filter((a) => a.severity === "high" && a.status === "active");
	}

	// Computed: acknowledged alerts
	get acknowledgedAlerts(): Alert[] {
		return this.alerts.filter((a) => a.status === "acknowledged");
	}

	// Computed: alerts resolved today
	get resolvedToday(): Alert[] {
		const today = new Date();
		return this.alerts.filter((a) => {
			if (a.status !== "resolved" || !a.resolvedAt) return false;
			const resolved = new Date(a.resolvedAt);
			return resolved.toDateString() === today.toDateString();
		});
	}

	// Action: set active tab
	setActiveTab = (tab: AlertStatus | "all") => {
		this.activeTab = tab;
	};

	// Action: acknowledge an alert
	acknowledgeAlert = (alertId: string) => {
		const alert = this.alerts.find((a) => a.id === alertId);
		if (alert && alert.status === "active") {
			alert.status = "acknowledged";
			alert.acknowledgedAt = new Date().toISOString();
		}
	};

	// Action: resolve an alert
	resolveAlert = (alertId: string) => {
		const alert = this.alerts.find((a) => a.id === alertId);
		if (alert && alert.status !== "resolved") {
			alert.status = "resolved";
			alert.resolvedAt = new Date().toISOString();
		}
	};

	// Action: update alert (acknowledge or resolve)
	updateAlert = (alertId: string, action: "acknowledge" | "resolve") => {
		if (action === "acknowledge") {
			this.acknowledgeAlert(alertId);
		} else {
			this.resolveAlert(alertId);
		}
	};

	// Cleanup method
	dispose() {
		// No subscriptions to clean up currently
		// Future: cancel API requests, clear timers, etc.
	}
}

export const alertsViewModel = new AlertsViewModel();

export function useAlertsViewModel() {
	return alertsViewModel;
}
