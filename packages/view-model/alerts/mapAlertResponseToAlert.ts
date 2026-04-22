import type { AlertResponse } from "~@/api";
import type { Alert, AlertEvent, RecommendedAction } from "~@/models";

import { normalizeSeverity, normalizeStatus } from "./normalizeAlert";

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

/** Backend event type string (e.g. Triggered, Acknowledged) -> view AlertEvent type */
const EVENT_TYPE_MAP: Record<string, AlertEvent["type"]> = {
	triggered: "triggered",
	acknowledged: "acknowledged",
	resolved: "resolved",
	escalated: "escalated",
	note: "note",
	systemupdate: "system_update",
};

/** API event shape (from GetById / Acknowledge / Resolve when backend includes events). */
type ApiEvent = {
	id?: string;
	eventType?: string;
	occurredAt?: Date | string;
	description?: string;
};

function mapApiEventsToAlertEvents(apiEvents: ApiEvent[]): AlertEvent[] {
	return apiEvents.map((e) => {
		const occurredAt = e.occurredAt ?? (e as Record<string, unknown>).occurred_at;
		const ts =
			typeof occurredAt === "string"
				? occurredAt
				: occurredAt instanceof Date
					? occurredAt.toISOString()
					: "";
		const eventType = e.eventType ?? (e as Record<string, unknown>).event_type ?? "";
		const typeKey = String(eventType).toLowerCase().replace(/_/g, "");
		const description = e.description ?? (e as Record<string, unknown>).description ?? "";
		return {
			id: e.id ?? crypto.randomUUID(),
			type: EVENT_TYPE_MAP[typeKey] ?? "system_update",
			timestamp: ts,
			description: String(description),
		};
	});
}

/**
 * Map backend AlertResponse to view Alert.
 * Uses triggeredAt as createdAt; when the API returns events (e.g. GetById), uses them for Events History.
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
	const rawR = r as AlertResponse & { Id?: string };
	const id = rawR.id ?? rawR.Id ?? "";

	const raw = r as AlertResponse & { events?: ApiEvent[] | null; Events?: ApiEvent[] | null };
	const apiEvents = raw.events ?? raw.Events ?? null;
	const events = apiEvents && apiEvents.length > 0 ? mapApiEventsToAlertEvents(apiEvents) : [];

	const rawRec = r as AlertResponse & {
		recommendedActions?: ApiRecommendedAction[] | null;
		RecommendedActions?: ApiRecommendedAction[] | null;
	};
	const apiRec = rawRec.recommendedActions ?? rawRec.RecommendedActions ?? null;
	const recommendedActions: RecommendedAction[] =
		apiRec && apiRec.length > 0
			? apiRec
					.map((a) => {
						const row = a as Record<string, unknown>;
						return {
							id: String(row.id ?? row.Id ?? ""),
							title: String(row.title ?? row.Title ?? ""),
							description: String(row.description ?? row.Description ?? ""),
							displayOrder: Number(row.displayOrder ?? row.DisplayOrder ?? 0),
						};
					})
					.sort((a, b) => a.displayOrder - b.displayOrder)
			: [];

	return {
		id,
		name: buildTitle(triggeredValue, thresholdMin, thresholdMax),
		description: buildDescription(triggeredValue, thresholdMin, thresholdMax),
		severity: normalizeSeverity(r.severity),
		status: normalizeStatus(r.status),
		createdAt,
		resolvedAt,
		equipmentId: r.equipmentId,
		// Use serial for matching to health list sensors (sensor.name = serial)
		sensorId: r.sensorSerial ?? r.sensorId,
		siteId: r.siteId,
		events,
		recommendedActions: recommendedActions.length > 0 ? recommendedActions : undefined,
	};
}

/** API recommended action shape (camelCase or PascalCase from backend). */
type ApiRecommendedAction = {
	id?: string;
	title?: string;
	description?: string;
	displayOrder?: number;
};
