export function getStatusColor(status: string) {
	switch (status) {
		case "operational":
			return "bg-success";
		case "warning":
			return "bg-warning";
		case "critical":
			return "bg-red-500 dark:bg-danger";
		default:
			return "bg-slate-400";
	}
}
