import type { SensorResponse } from "~@/api";
import {
	deleteSensorV1ObservedMutation,
	type GetAllSensorsV1Data,
	getAllSensorsV1ObservedQuery,
} from "~@/api";
import type { ErrorInfo, IDataTableController, StandardQuery } from "~@/data-table";
import { makeAutoObservable } from "~@/mobx";
import { queryClient } from "~@/query-client";

function refetchSensorsAfterSensorDelete(): Promise<void> {
	return queryClient.refetchQueries({
		predicate: (query) => {
			const first = query.queryKey[0] as { _id?: string } | undefined;
			return first?._id === "getAllSensorsV1";
		},
	});
}

const LARGE_PAGE_SIZE = 500;

export class SensorsDataTableController implements IDataTableController<SensorResponse> {
	readonly tableId = "sensors-table";

	#query = getAllSensorsV1ObservedQuery();
	#deleteMutation = deleteSensorV1ObservedMutation();

	/** When set, filter results by this equipment (client-side). */
	equipmentId: string | null = null;

	constructor(equipmentId?: string | null) {
		makeAutoObservable(this);
		this.equipmentId = equipmentId ?? null;
	}

	get data(): SensorResponse[] {
		const raw = this.#query.data?.items ?? [];
		const list = Array.isArray(raw) ? raw : [];
		if (this.equipmentId) {
			return list.filter((s) => s.equipmentId === this.equipmentId);
		}
		return list;
	}

	get total(): number {
		const raw = this.#query.data?.items ?? [];
		const list = Array.isArray(raw) ? raw : [];
		if (this.equipmentId) {
			return list.filter((s) => s.equipmentId === this.equipmentId).length;
		}
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
		return {
			message: err instanceof Error ? err.message : String(err),
		};
	}

	get isDeleting(): boolean {
		return this.#deleteMutation.isPending;
	}

	async load(query: StandardQuery): Promise<void> {
		const page = query.page ?? 0;
		const limit = query.limit ?? 20;
		const search = query.search?.trim() || undefined;
		const pageSize = this.equipmentId ? LARGE_PAGE_SIZE : limit;
		const pageNum = this.equipmentId ? 1 : page + 1;

		const params: Partial<GetAllSensorsV1Data> = {
			query: {
				Page: pageNum,
				PageSize: pageSize,
				Search: search,
			},
		};
		await this.#query.loadAsync(params);
	}

	setEquipmentId(equipmentId: string | null): void {
		this.equipmentId = equipmentId;
	}

	async deleteSensor(sensorId: string): Promise<void> {
		await this.#deleteMutation.mutateAsync({ path: { id: sensorId } });
		this.#query.invalidate();
		await refetchSensorsAfterSensorDelete();
		// Force list to reload so UI updates (refetch alone may not trigger observer)
		await this.refresh();
	}

	refresh = async (): Promise<void> => {
		await this.#query.loadAsync();
	};

	dispose(): void {
		this.#query.dispose();
	}
}
