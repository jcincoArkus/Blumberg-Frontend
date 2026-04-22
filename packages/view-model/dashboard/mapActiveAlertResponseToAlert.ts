import type { ActiveAlertResponse } from "~@/api";
import type { Alert } from "~@/models";

import { normalizeSeverity, normalizeStatus } from "../alerts/normalizeAlert";

/**
 * Map backend ActiveAlertResponse to view Alert.
 * ActiveAlertResponse is a lighter shape returned by GET /api/v1/alerts/active —
 * it lacks thresholdMin/Max, triggeredValue, and events.
 */
export function mapActiveAlertResponseToAlert(r: ActiveAlertResponse): Alert {
	const createdAt =
		r.triggeredAt instanceof Date ? r.triggeredAt.toISOString() : String(r.triggeredAt ?? "");

	return {
		id: r.id ?? "",
		name: r.sensorTypeName ?? "Alert",
		description: r.equipmentName ?? "",
		severity: normalizeSeverity(r.severity),
		status: normalizeStatus(r.status),
		createdAt,
		sensorId: r.sensorSerial ?? undefined,
		events: [],
	};
}
