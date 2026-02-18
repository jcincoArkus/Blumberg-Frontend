import { makeAutoObservable } from "mobx";

import type { GetSensorHealthListV1Data, SensorHealthListItemResponse } from "~@/api";
import { getSensorHealthListV1ObservedQuery } from "~@/api";
import type { ErrorInfo, IDataTableController, StandardQuery } from "~@/data-table";

export class SensorHealthController implements IDataTableController<SensorHealthListItemResponse> {
	readonly tableId = "sensor-health";

	#query = getSensorHealthListV1ObservedQuery();

	constructor() {
		makeAutoObservable(this);
	}

	get data(): SensorHealthListItemResponse[] {
		return this.#query.data?.items ?? [];
	}

	get total(): number {
		return this.#query.data?.totalCount ?? 0;
	}

	get isLoading(): boolean {
		return this.#query.isLoading;
	}

	get isFetching(): boolean {
		return this.#query.isFetching;
	}

	get isError(): boolean {
		return this.#query.hasError;
	}

	get error(): ErrorInfo | null {
		const err = this.#query.error;
		if (!err) return null;
		return { message: err instanceof Error ? err.message : String(err) };
	}

	async load(query: StandardQuery): Promise<void> {
		const page = query.page ?? 0;
		const limit = query.limit ?? 20;
		const search = query.search?.trim() || undefined;

		const params: Partial<GetSensorHealthListV1Data> = {
			query: {
				Page: page + 1,
				PageSize: limit,
				Search: search,
			},
		};
		await this.#query.loadAsync(params);
	}

	dispose(): void {
		this.#query.dispose();
	}
}
