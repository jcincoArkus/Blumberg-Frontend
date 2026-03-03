export function formatTimestamp(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatTimeOnly(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function calculateDuration(createdAt: string, resolvedAt?: string): string {
	const start = new Date(createdAt);
	const end = resolvedAt ? new Date(resolvedAt) : new Date();
	const diffMs = end.getTime() - start.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
	if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
	return `${diffMins}m`;
}
