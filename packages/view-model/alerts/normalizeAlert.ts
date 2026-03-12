import type { Alert } from "~@/models";
import { normalizeSeverity as normalizeSeverityFromModel } from "~@/models";

/** Re-export for callers that import from view-model. Backend enum (e.g. "Critical") → frontend AlertSeverity. */
export const normalizeSeverity = normalizeSeverityFromModel;

/** Backend status: Active, Acknowledged, Resolved -> view: active, acknowledged, resolved */
export function normalizeStatus(status: string | null | undefined): Alert["status"] {
	const s = (status ?? "").toLowerCase();
	if (s === "active") return "active";
	if (s === "acknowledged") return "acknowledged";
	if (s === "resolved") return "resolved";
	return "active";
}
