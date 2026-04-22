import { cn } from "./utils";

// Status types that can be displayed
type StatusType =
	// Alert Severity
	| "critical"
	| "high"
	| "medium"
	| "low"
	// Alert Status
	| "active"
	| "acknowledged"
	| "resolved"
	// Equipment Status
	| "online"
	| "warning"
	| "offline"
	| "maintenance"
	// Sensor Status
	| "stale"
	| "error"
	// Site Status
	| "operational"
	// Health Status
	| "healthy"
	| "silent";

interface StatusBadgeProps {
	status: StatusType;
	className?: string;
	showDot?: boolean;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
	// Alert Severity
	critical: {
		label: "Critical",
		className: "bg-danger/10 text-danger border-danger/20",
	},
	high: { label: "High", className: "bg-danger/10 text-danger border-danger/20" },
	medium: {
		label: "Medium",
		className: "bg-warning/10 text-warning border-warning/20",
	},
	low: {
		label: "Low",
		className: "bg-muted text-muted-foreground border-border",
	},

	// Alert Status
	active: {
		label: "Active",
		className: "bg-danger/10 text-danger border-danger/20",
	},
	acknowledged: {
		label: "Acknowledged",
		className: "bg-warning/10 text-warning border-warning/20",
	},
	resolved: {
		label: "Resolved",
		className: "bg-success/10 text-success border-success/20",
	},

	// Equipment Status
	online: {
		label: "Online",
		className: "bg-success/10 text-success border-success/20",
	},
	warning: {
		label: "Warning",
		className: "bg-warning/10 text-warning border-warning/20",
	},
	offline: {
		label: "Offline",
		className: "bg-muted text-muted-foreground border-border",
	},
	maintenance: {
		label: "Maintenance",
		className: "bg-info/10 text-info border-info/20",
	},

	// Sensor Status
	stale: {
		label: "Stale",
		className: "bg-warning/10 text-warning border-warning/20",
	},
	error: {
		label: "Error",
		className: "bg-danger/10 text-danger border-danger/20",
	},

	// Site Status
	operational: {
		label: "Operational",
		className: "bg-success/10 text-success border-success/20",
	},

	// Health Status
	healthy: {
		label: "Healthy",
		className: "bg-success/10 text-success border-success/20",
	},
	silent: {
		label: "Silent",
		className: "bg-danger/10 text-danger border-danger/20",
	},
};

const getDotColor = (status: StatusType): string => {
	if (
		status === "critical" ||
		status === "high" ||
		status === "active" ||
		status === "error" ||
		status === "silent"
	) {
		return "bg-danger";
	}
	if (
		status === "medium" ||
		status === "warning" ||
		status === "acknowledged" ||
		status === "stale"
	) {
		return "bg-warning";
	}
	if (
		status === "resolved" ||
		status === "online" ||
		status === "operational" ||
		status === "healthy"
	) {
		return "bg-success";
	}
	if (status === "maintenance") {
		return "bg-info";
	}
	return "bg-muted-foreground";
};

function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
	const config = statusConfig[status] || {
		label: status,
		className: "bg-muted text-muted-foreground border-border",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
				config.className,
				className,
			)}
		>
			{showDot && <span className={cn("size-1.5 rounded-full", getDotColor(status))} />}
			{config.label}
		</span>
	);
}

export { StatusBadge, type StatusBadgeProps, type StatusType };
