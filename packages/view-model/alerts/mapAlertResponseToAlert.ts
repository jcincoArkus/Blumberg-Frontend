import type { AlertResponse } from "~@/api";
import type { Alert, AlertEvent } from "~@/models";

/** Backend severity: Critical, Warning, Info -> view: critical, high, medium, low */
function normalizeSeverity(severity: string | null | undefined): Alert["severity"] {
	const s = (severity ?? "").toLowerCase();
	if (s === "critical") return "critical";
	if (s === "warning") return "high";
	if (s === "info") return "low";
	return "medium";
}

/** Backend status: Active, Acknowledged, Resolved -> view: active, acknowledged, resolved */
function normalizeStatus(status: string | null | undefined): Alert["status"] {
	const s = (status ?? "").toLowerCase();
	if (s === "active") return "active";
	if (s === "acknowledged") return "acknowledged";
	if (s === "resolved") return "resolved";
	return "active";
}

function buildTitle(triggeredValue: number, thresholdMin: number, thresholdMax: number): string {
	const above = triggeredValue > thresholdMax;
	const below = triggeredValue < thresholdMin;
	if (above) return "Value above threshold";
	if (below) return "Value below threshold";
	return "Value out of range";
}

function buildDescription(
	triggeredValue: number,
	thresholdMin: number,
	thresholdMax: number,
): string {
	const above = triggeredValue > thresholdMax;
	const below = triggeredValue < thresholdMin;
	if (above) return `Value ${triggeredValue} exceeded max ${thresholdMax}`;
	if (below) return `Value ${triggeredValue} below min ${thresholdMin}`;
	return `Value ${triggeredValue} (range ${thresholdMin}–${thresholdMax})`;
}

/** Build a minimal events timeline from the single alert (no backend events API yet). */
function deriveEventsFromAlert(
	alertId: string,
	createdAt: string,
	resolvedAt: string | undefined,
): AlertEvent[] {
	const events: AlertEvent[] = [
		{
			id: `${alertId}-triggered`,
			type: "triggered",
			timestamp: createdAt,
			description: "Alert triggered",
		},
	];
	if (resolvedAt) {
		events.push({
			id: `${alertId}-resolved`,
			type: "resolved",
			timestamp: resolvedAt,
			description: "Alert resolved",
		});
	}
	return events;
}

/**
 * Map backend AlertResponse to view Alert.
 * Uses triggeredAt as createdAt for duration; optional equipmentName/sensorName from response.
 * Events History is derived from the alert (triggered, resolved) until the backend has an events API.
 */
export function mapAlertResponseToAlert(r: AlertResponse): Alert {
	const triggeredAt = r.triggeredAt ?? r.createdAt;
	const createdAt =
		triggeredAt instanceof Date ? triggeredAt.toISOString() : String(triggeredAt ?? "");
	const resolvedAt = r.resolvedAt
		? r.resolvedAt instanceof Date
			? r.resolvedAt.toISOString()
			: String(r.resolvedAt)
		: undefined;
	const thresholdMin = r.thresholdMin ?? 0;
	const thresholdMax = r.thresholdMax ?? 0;
	const triggeredValue = r.triggeredValue ?? 0;
	const id = r.id ?? "";

	return {
		id,
		name: buildTitle(triggeredValue, thresholdMin, thresholdMax),
		description: buildDescription(triggeredValue, thresholdMin, thresholdMax),
		severity: normalizeSeverity(r.severity),
		status: normalizeStatus(r.status),
		createdAt,
		resolvedAt,
		equipmentId: r.equipmentId,
		sensorId: r.sensorId,
		siteId: r.siteId,
		events: deriveEventsFromAlert(id, createdAt, resolvedAt),
	};
}
