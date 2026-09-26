import type { WarehouseZone } from "./types";

/** Warehouse zones for interior map (SVG coordinates in 0–100 viewBox) */
export const WAREHOUSE_ZONES: WarehouseZone[] = [
	{ id: "cold-room-1", name: "Cold Room 1", svgX: 10, svgY: 10, svgWidth: 30, svgHeight: 25 },
	{ id: "cold-room-2", name: "Cold Room 2", svgX: 42, svgY: 10, svgWidth: 30, svgHeight: 25 },
	{ id: "cold-room-3", name: "Cold Room 3", svgX: 72, svgY: 10, svgWidth: 25, svgHeight: 25 },
	{ id: "aisle-a", name: "Aisle A", svgX: 8, svgY: 38, svgWidth: 32, svgHeight: 18 },
	{ id: "aisle-b", name: "Aisle B", svgX: 42, svgY: 38, svgWidth: 32, svgHeight: 18 },
	{ id: "aisle-c", name: "Aisle C", svgX: 78, svgY: 38, svgWidth: 18, svgHeight: 18 },
	{ id: "loading-zone", name: "Loading Zone", svgX: 3, svgY: 58, svgWidth: 38, svgHeight: 35 },
	{ id: "storage-area", name: "Storage Area", svgX: 43, svgY: 63, svgWidth: 32, svgHeight: 30 },
	{ id: "office", name: "Office", svgX: 78, svgY: 68, svgWidth: 18, svgHeight: 25 },
];

type ZoneColors = { fill: string; stroke: string; textFill: string };

/** Zone fill and stroke colors by zone id (light theme) */
export const ZONE_COLORS: Record<string, ZoneColors> = {
	"cold-room-1": { fill: "#dbeafe", stroke: "#3b82f6", textFill: "#1e40af" },
	"cold-room-2": { fill: "#dbeafe", stroke: "#3b82f6", textFill: "#1e40af" },
	"cold-room-3": { fill: "#dbeafe", stroke: "#3b82f6", textFill: "#1e40af" },
	"aisle-a": { fill: "#f3f4f6", stroke: "#9ca3af", textFill: "#6b7280" },
	"aisle-b": { fill: "#f3f4f6", stroke: "#9ca3af", textFill: "#6b7280" },
	"aisle-c": { fill: "#f3f4f6", stroke: "#9ca3af", textFill: "#6b7280" },
	"loading-zone": { fill: "#fef3c7", stroke: "#f59e0b", textFill: "#92400e" },
	"storage-area": { fill: "#e0e7ff", stroke: "#6366f1", textFill: "#4338ca" },
	office: { fill: "#fce7f3", stroke: "#ec4899", textFill: "#9f1239" },
};

export const DEFAULT_ZONE_COLORS: ZoneColors = {
	fill: "#f3f4f6",
	stroke: "#9ca3af",
	textFill: "#6b7280",
};

/* Dark theme: low-opacity tinted fills so zones don't glow on the dark card; brighter strokes/labels for contrast. */
const COLD_ROOM_DARK: ZoneColors = {
	fill: "rgb(59 130 246 / 0.16)",
	stroke: "#60a5fa",
	textFill: "#93c5fd",
};
const AISLE_DARK: ZoneColors = {
	fill: "var(--muted)",
	stroke: "var(--muted-foreground)",
	textFill: "var(--muted-foreground)",
};

export const DEFAULT_ZONE_COLORS_DARK: ZoneColors = AISLE_DARK;

export const ZONE_COLORS_DARK: Record<string, ZoneColors> = {
	"cold-room-1": COLD_ROOM_DARK,
	"cold-room-2": COLD_ROOM_DARK,
	"cold-room-3": COLD_ROOM_DARK,
	"aisle-a": AISLE_DARK,
	"aisle-b": AISLE_DARK,
	"aisle-c": AISLE_DARK,
	"loading-zone": {
		fill: "rgb(245 158 11 / 0.16)",
		stroke: "var(--warning)",
		textFill: "var(--warning-foreground)",
	},
	"storage-area": { fill: "rgb(99 102 241 / 0.18)", stroke: "#818cf8", textFill: "#a5b4fc" },
	office: { fill: "rgb(236 72 153 / 0.16)", stroke: "#f472b6", textFill: "#f9a8d4" },
};
