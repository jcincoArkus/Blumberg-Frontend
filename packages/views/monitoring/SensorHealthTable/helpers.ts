import { t } from "~@/i18n/macro";

export function formatTimestamp(dateString?: string): string {
	if (!dateString) return t`Never`;
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
