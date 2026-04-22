/**
 * Format a date string for table display (short date + time).
 */
export function formatTimestamp(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
