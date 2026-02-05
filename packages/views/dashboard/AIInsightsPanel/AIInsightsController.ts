import { makeAutoObservable } from "mobx";

import type { IDataTableController, StandardQuery } from "~@/data-table";

import type { AgentInsight } from "./types";

export interface InsightItem extends AgentInsight {
	[key: string]: unknown;
}

export class AIInsightsController implements IDataTableController<InsightItem> {
	readonly tableId = "ai-insights";

	data: InsightItem[] = [];
	total = 0;
	isLoading = false;
	isFetching = false;
	isError = false;
	error = null;

	constructor(initialData: InsightItem[]) {
		makeAutoObservable(this);
		this.setData(initialData);
	}

	setData(data: InsightItem[]) {
		this.data = data;
		this.total = data.length;
	}

	async load(_query: StandardQuery): Promise<void> {
		return Promise.resolve();
	}

	dispose(): void {}
}
