import {
	acknowledgeAlertV1ObservedMutation,
	getAlertByIdV1ObservedQuery,
	resolveAlertV1ObservedMutation,
} from "~@/api";
import { t } from "~@/i18n/macro";
import { makeAutoObservable } from "~@/mobx";
import { getSeverityOrder } from "~@/models";
import type { Alert } from "~@/views";

import { alertsViewModel } from "../alerts";
import { mapAlertResponseToAlert } from "../alerts/mapAlertResponseToAlert";

/** Max alerts shown in the dashboard overview (keeps card height stable; use Alerts page for full list). */
const DASHBOARD_ALERTS_OVERVIEW_LIMIT = 5;

/**
 * Singleton ViewModel for the ActiveAlertsPanel component.
 * Uses the same data source as the Alerts page (getAllAlerts) so the dashboard list matches /alerts.
 * Provides sorted active+acknowledged alerts, full alert detail for the drawer, and ack/resolve.
 */
class ActiveAlertsPanelViewModel {
	#detailQuery = getAlertByIdV1ObservedQuery();
	#detailAlertId: string | null = null;
	#ackMutation = acknowledgeAlertV1ObservedMutation();
	#resolveMutation = resolveAlertV1ObservedMutation();

	constructor() {
		makeAutoObservable(this);
	}

	/** Active + acknowledged alerts from the same source as the Alerts page (GET /alerts). */
	get alerts(): Alert[] {
		return [...alertsViewModel.activeAlerts, ...alertsViewModel.acknowledgedAlerts];
	}

	/** Load full alert by ID (events, recommended actions, notifications) for the details drawer. */
	loadAlertDetail = (alertId: string) => {
		this.#detailAlertId = alertId;
		this.#detailQuery.load({ path: { id: alertId } });
	};

	clearAlertDetail = () => {
		this.#detailAlertId = null;
	};

	/** Full alert for the given id when loaded (for drawer). */
	getDetailFor(alertId: string | null): Alert | null {
		if (!alertId || !this.#detailQuery.data) return null;
		const d = this.#detailQuery.data as { id?: string; Id?: string };
		const responseId = d.id ?? d.Id ?? "";
		if (String(responseId) !== String(alertId)) return null;
		return mapAlertResponseToAlert(
			this.#detailQuery.data as Parameters<typeof mapAlertResponseToAlert>[0],
		);
	}

	get isDetailLoading(): boolean {
		return this.#detailQuery.isLoading;
	}

	/** Acknowledge or resolve from dashboard drawer; refreshes list (alertsViewModel) on success. */
	updateAlert = async (alertId: string, action: "acknowledge" | "resolve") => {
		try {
			if (action === "acknowledge") {
				await this.#ackMutation.mutateAsync({ path: { id: alertId } });
			} else {
				await this.#resolveMutation.mutateAsync({ path: { id: alertId } });
			}
			await alertsViewModel.refresh();
			if (this.#detailAlertId === alertId) {
				this.#detailQuery.invalidate();
				await this.#detailQuery.refetch();
			}
		} catch {
			// Error surfaced via mutation
		}
	};

	// Get alerts sorted by severity and time (newest first within same severity)
	get sortedAlerts(): Alert[] {
		return [...this.alerts].sort((a, b) => {
			const aOrder = getSeverityOrder(a.severity);
			const bOrder = getSeverityOrder(b.severity);

			if (aOrder !== bOrder) return aOrder - bOrder;

			const aTime = new Date(a.createdAt).getTime();
			const bTime = new Date(b.createdAt).getTime();
			return aTime - bTime;
		});
	}

	/** Alerts for dashboard overview only (capped so the card doesn’t resize); use Alerts page for full list. */
	get alertsForOverview(): Alert[] {
		return this.sortedAlerts.slice(0, DASHBOARD_ALERTS_OVERVIEW_LIMIT);
	}

	// Helper: Get equipment name (placeholder for now)
	getEquipmentName(_equipmentId?: string): string {
		// TODO: Implement equipment name lookup when equipment data is available
		return t`Unknown`;
	}

	// Helper: Get site name (placeholder for now)
	getSiteName(_siteId?: string): string {
		// TODO: Implement site name lookup when site data is available
		return t`Unknown`;
	}

	// Helper: Get alert zone (equipment or site name)
	getAlertZone(alert: Alert) {
		return this.getEquipmentName(alert.equipmentId) || this.getSiteName(alert.siteId);
	}

	dispose = () => {
		this.#detailQuery.dispose();
	};
}

// Export singleton instance
export const activeAlertsPanelViewModel = new ActiveAlertsPanelViewModel();

/**
 * Hook to access the ActiveAlertsPanelViewModel singleton.
 * @returns The singleton instance of ActiveAlertsPanelViewModel
 */
export function useActiveAlertsPanelViewModel() {
	return activeAlertsPanelViewModel;
}
