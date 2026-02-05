export interface Site {
	id: string;
	name: string;
	location: string;
	status: "operational" | "warning" | "critical" | "offline";
}

export interface ZonesOverviewPanelProps {
	sites: Site[];
}
