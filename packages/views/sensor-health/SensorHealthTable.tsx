import { useMemo } from "react";

import type { DataItem } from "~@/data-table";
import { DataTable } from "~@/data-table";

import { getSensorHealthColumns } from "./columns";

export interface EnrichedSensor extends DataItem {
	id: string;
	name: string;
	type: string;
	status: string;
	equipmentId: string;
	equipmentName: string;
	siteName: string;
	siteId: string;
	value: number;
	unit: string;
	lastSeen: string;
	reliabilityScore?: number;
}

interface SensorHealthTableProps {
	sensors: EnrichedSensor[];
	isLoading?: boolean;
}

export function SensorHealthTable({ sensors, isLoading }: SensorHealthTableProps) {
	const controller = useMemo(() => {
		return {
			tableId: "sensor-health",
			data: sensors,
			total: sensors.length,
			isLoading: isLoading ?? false,
			isFetching: false,
			isError: false,
			error: null,
			async load() {
				return Promise.resolve();
			},
			dispose() {},
		};
	}, [sensors, isLoading]);

	const columns = useMemo(() => getSensorHealthColumns(), []);

	return <DataTable<EnrichedSensor> controller={controller} columns={columns} />;
}
