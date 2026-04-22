export interface MapLocation {
	id: string;
	name: string;
	city: string;
	lat: number;
	lng: number;
	status: "ok" | "warning" | "alert";
}

export interface LocationPanelProps {
	selectedLocation?: string | null;
	onLocationSelect?: (locationId: string) => void;
}
