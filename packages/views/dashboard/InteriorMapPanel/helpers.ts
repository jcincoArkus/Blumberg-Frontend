import type { ZoneStatus, ZoneStatusStyle } from "./types";

export function getZoneStatusStyle(status: ZoneStatus): ZoneStatusStyle {
	switch (status) {
		case "alert":
			return {
				borderColor: "#dc2626",
				borderWidth: "2px",
				strokeWidth: 0.6,
			};
		case "warning":
			return {
				borderColor: "#f59e0b",
				borderWidth: "2px",
				strokeWidth: 0.4,
			};
		default:
			return {
				borderColor: "transparent",
				borderWidth: "0px",
				strokeWidth: 0.3,
			};
	}
}

export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}
