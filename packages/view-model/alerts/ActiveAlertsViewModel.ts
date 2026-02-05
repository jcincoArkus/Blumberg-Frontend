import { makeAutoObservable } from "~@/mobx";
import type { Alert } from "~@/views";

import type { Disposable } from "../types";

interface ActiveAlertsViewModelOptions {
	alerts: Alert[];
	getEquipmentName?: (equipmentId?: string) => string;
	getSiteName?: (siteId?: string) => string;
}

export class ActiveAlertsViewModel implements Disposable {
	readonly alerts: Alert[];
	readonly getEquipmentName: (equipmentId?: string) => string;
	readonly getSiteName: (siteId?: string) => string;

	constructor({ alerts, getEquipmentName, getSiteName }: ActiveAlertsViewModelOptions) {
		makeAutoObservable(this);
		this.alerts = alerts;
		this.getEquipmentName = getEquipmentName ?? (() => "Unknown");
		this.getSiteName = getSiteName ?? (() => "Unknown");
	}

	get sortedAlerts(): Alert[] {
		const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 } as const;
		return [...this.alerts].sort((a, b) => {
			const aOrder = severityOrder[a.severity] ?? 3;
			const bOrder = severityOrder[b.severity] ?? 3;

			if (aOrder !== bOrder) return aOrder - bOrder;

			const aTime = new Date(a.createdAt).getTime();
			const bTime = new Date(b.createdAt).getTime();
			return aTime - bTime;
		});
	}

	getAlertZone(alert: Alert) {
		return this.getEquipmentName(alert.equipmentId) || this.getSiteName(alert.siteId);
	}

	dispose() {
		// No subscriptions to clean up currently.
	}
}
