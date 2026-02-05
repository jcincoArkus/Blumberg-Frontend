import { useMemo } from "react";

import type { DataItem } from "~@/data-table";
import { DataTable } from "~@/data-table";

import { getSensorHealthColumns } from "./columns";

// Temporary inline type until controller file is created
export interface EnrichedSensor extends DataItem {
	id: string;
	name: string;
	type: string;
	status: "active" | "warning" | "stale" | "offline" | "error" | "inactive";
	equipmentId: string;
	equipmentName: string;
	siteName: string;
	siteId: string;
	value: number;
	unit: string;
	batteryLevel?: number;
	lastSeen: string;
}

interface SensorHealthTableProps {
	sensors: EnrichedSensor[];
}

export function SensorHealthTable({ sensors }: SensorHealthTableProps) {
	const controller = useMemo(() => {
		// Inline controller implementation
		return {
			tableId: "sensor-health",
			data: sensors,
			total: sensors.length,
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			async load() {
				return Promise.resolve();
			},
			dispose() {},
		};
	}, [sensors]);

	const columns = useMemo(() => getSensorHealthColumns(), []);

	return <DataTable<EnrichedSensor> controller={controller} columns={columns} />;
}
