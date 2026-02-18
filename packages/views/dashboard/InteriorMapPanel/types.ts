export interface WarehouseZone {
	id: string;
	name: string;
	svgX: number;
	svgY: number;
	svgWidth: number;
	svgHeight: number;
}

export type ZoneStatus = "alert" | "warning" | "ok";

export interface ZoneStatusStyle {
	borderColor: string;
	borderWidth: string;
	strokeWidth: number;
}
