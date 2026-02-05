import { makeAutoObservable } from "mobx";

import type { DataItem, IDataTableController, StandardQuery } from "~@/data-table";

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

export class SensorHealthController implements IDataTableController<EnrichedSensor> {
	readonly tableId = "sensor-health";

	data: EnrichedSensor[] = [];
	total = 0;
	isLoading = false;
	isFetching = false;
	isError = false;
	error = null;

	constructor(initialData: EnrichedSensor[]) {
		makeAutoObservable(this);
		this.setData(initialData);
	}

	setData(data: EnrichedSensor[]) {
		this.data = data;
		this.total = data.length;
	}

	async load(_query: StandardQuery): Promise<void> {
		return Promise.resolve();
	}

	dispose(): void {}
}
