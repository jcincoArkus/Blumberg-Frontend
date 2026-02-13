import type { SiteResponse } from "~@/api";
import {
	deleteSiteV1ObservedMutation,
	type GetAllSitesV1Data,
	getAllSitesV1ObservedQuery,
} from "~@/api";
import type { ErrorInfo, IDataTableController, StandardQuery } from "~@/data-table";
import { makeAutoObservable } from "~@/mobx";
import { queryClient } from "~@/query-client";

function refetchSitesAfterSiteDelete(): Promise<void> {
	return queryClient.refetchQueries({
		predicate: (query) => {
			const first = query.queryKey[0] as { _id?: string } | undefined;
			return first?._id === "getAllSitesV1";
		},
	});
}

function refetchEquipmentAndSensorsAfterSiteDelete(): Promise<void> {
	return queryClient.refetchQueries({
		predicate: (query) => {
			const first = query.queryKey[0] as { _id?: string } | undefined;
			const id = first?._id ?? "";
			return id === "getAllEquipmentV1" || id === "getAllSensorsV1";
		},
	});
}

export class SitesDataTableController implements IDataTableController<SiteResponse> {
	readonly tableId = "sites-table";

	#query = getAllSitesV1ObservedQuery();
	#deleteMutation = deleteSiteV1ObservedMutation();

	constructor() {
		makeAutoObservable(this);
	}

	get data(): SiteResponse[] {
		const raw = this.#query.data?.items ?? [];
		return Array.isArray(raw) ? raw : [];
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
		return {
			message: err instanceof Error ? err.message : String(err),
		};
	}

	get isDeleting(): boolean {
		return this.#deleteMutation.isPending;
	}

	async load(query: StandardQuery): Promise<void> {
		const params: Partial<GetAllSitesV1Data> = {
			query: {
				Page: (query.page ?? 0) + 1,
				PageSize: query.limit ?? 20,
				Search: query.search?.trim() || undefined,
			},
		};
		await this.#query.loadAsync(params);
	}

	async deleteSite(siteId: string): Promise<void> {
		await this.#deleteMutation.mutateAsync({ path: { id: siteId } });
		this.#query.invalidate();
		await refetchSitesAfterSiteDelete();
		await refetchEquipmentAndSensorsAfterSiteDelete();
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
