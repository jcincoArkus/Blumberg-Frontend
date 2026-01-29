import { Link } from "react-router";

import { cn } from "~@/ui";

export interface Site {
	id: string;
	name: string;
	location: string;
	status: "operational" | "warning" | "critical" | "offline";
}

export interface ZonesOverviewPanelProps {
	sites: Site[];
}

function getStatusColor(status: string) {
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

export function ZonesOverviewPanel({ sites }: ZonesOverviewPanelProps) {
	const locationCount = sites.length;

	return (
		<div className="bg-card text-card-foreground rounded-xl border shadow-sm">
			<div className="px-3 pt-3 pb-0.5">
				<div className="flex items-center justify-between">
					<h3 className="text-base font-semibold leading-tight">Locations</h3>
					{locationCount > 6 && (
						<span className="text-xs text-muted-foreground font-normal">{locationCount} total</span>
					)}
				</div>
			</div>
			<div className="px-3 pb-3">
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
					{sites.map((site) => (
						<Link
							key={site.id}
							to={`/site/${site.id}`}
							className="flex items-center gap-1.5 p-1.5 rounded-lg border hover:bg-muted/50 transition-colors"
						>
							<div
								className={cn("size-2 rounded-full flex-shrink-0", getStatusColor(site.status))}
							/>
							<div className="flex-1 min-w-0">
								<p className="text-xs font-medium truncate">{site.name}</p>
								<p className="text-[11px] text-muted-foreground truncate">{site.location}</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
