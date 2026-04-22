export function getStatusColor(status: string) {
	switch (status) {
		case "operational":
			return "bg-emerald-500";
		case "warning":
			return "bg-amber-500";
		case "critical":
			return "bg-red-500";
		default:
			return "bg-slate-400";
	}
}
