import { makeAutoObservable } from "mobx";

import type { IDataTableController, StandardQuery } from "~@/data-table";

import type { Alert } from "../../alerts/types";

export interface AlertItem extends Alert {
	[key: string]: unknown;
}

export class ActiveAlertsController implements IDataTableController<AlertItem> {
	readonly tableId = "active-alerts";

	data: AlertItem[] = [];
	total = 0;
	isLoading = false;
	isFetching = false;
	isError = false;
	error = null;

	constructor(initialData: AlertItem[]) {
		makeAutoObservable(this);
		this.setData(initialData);
	}

	setData(data: AlertItem[]) {
		this.data = data;
		this.total = data.length;
	}

	async load(_query: StandardQuery): Promise<void> {
		return Promise.resolve();
	}

	dispose(): void {}
}
