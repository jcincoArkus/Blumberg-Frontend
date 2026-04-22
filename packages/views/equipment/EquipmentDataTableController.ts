import type { EquipmentResponse } from "~@/api";
import {
	deleteEquipmentV1ObservedMutation,
	type GetAllEquipmentV1Data,
	getAllEquipmentV1ObservedQuery,
} from "~@/api";
import type { ErrorInfo, IDataTableController, StandardQuery } from "~@/data-table";
import { makeAutoObservable } from "~@/mobx";
import { queryClient } from "~@/query-client";

function refetchSensorsAfterEquipmentDelete(): Promise<void> {
	return queryClient.refetchQueries({
		predicate: (query) => {
			const first = query.queryKey[0] as { _id?: string } | undefined;
			return first?._id === "getAllSensorsV1";
		},
	});
}

function refetchEquipmentAfterDelete(): Promise<void> {
	return queryClient.refetchQueries({
		predicate: (query) => {
			const first = query.queryKey[0] as { _id?: string } | undefined;
			return first?._id === "getAllEquipmentV1";
		},
	});
}

const LARGE_PAGE_SIZE = 500;

export class EquipmentDataTableController implements IDataTableController<EquipmentResponse> {
	readonly tableId = "equipment-table";

	#query = getAllEquipmentV1ObservedQuery();
	#deleteMutation = deleteEquipmentV1ObservedMutation();

	/** When set, filter results by this site (client-side). */
	siteId: string | null = null;

	constructor(siteId?: string | null) {
		makeAutoObservable(this);
		this.siteId = siteId ?? null;
	}

	get data(): EquipmentResponse[] {
		const raw = this.#query.data?.items ?? [];
		const list = Array.isArray(raw) ? raw : [];
		if (this.siteId) {
			return list.filter((e) => e.siteId === this.siteId);
		}
		return list;
	}

	get total(): number {
		const raw = this.#query.data?.items ?? [];
		const list = Array.isArray(raw) ? raw : [];
		if (this.siteId) {
			return list.filter((e) => e.siteId === this.siteId).length;
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
		// When scoped to site, load a large page and filter client-side (API has no site filter)
		const pageSize = this.siteId ? LARGE_PAGE_SIZE : limit;
		const pageNum = this.siteId ? 1 : page + 1;

		const params: Partial<GetAllEquipmentV1Data> = {
			query: {
				Page: pageNum,
				PageSize: pageSize,
				Search: search,
			},
		};
		await this.#query.loadAsync(params);
	}

	setSiteId(siteId: string | null): void {
		this.siteId = siteId;
	}

	async deleteEquipment(equipmentId: string): Promise<void> {
		await this.#deleteMutation.mutateAsync({ path: { id: equipmentId } });
		this.#query.invalidate();
		await refetchEquipmentAfterDelete();
		await refetchSensorsAfterEquipmentDelete();
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
