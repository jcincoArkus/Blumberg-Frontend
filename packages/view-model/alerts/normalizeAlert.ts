import type { Alert } from "~@/models";

/** Backend severity: Critical, Warning, Info -> view: critical, high, medium, low */
export function normalizeSeverity(severity: string | null | undefined): Alert["severity"] {
	const s = (severity ?? "").toLowerCase();
	if (s === "critical") return "critical";
	if (s === "warning") return "high";
	if (s === "info") return "low";
	return "medium";
}

/** Backend status: Active, Acknowledged, Resolved -> view: active, acknowledged, resolved */
export function normalizeStatus(status: string | null | undefined): Alert["status"] {
	const s = (status ?? "").toLowerCase();
	if (s === "active") return "active";
	if (s === "acknowledged") return "acknowledged";
	if (s === "resolved") return "resolved";
	return "active";
}
