import type { SiteRequest, SiteResponse } from "~@/api";
import {
	createSiteV1ObservedMutation,
	getSiteByIdV1ObservedQuery,
	updateSiteV1ObservedMutation,
} from "~@/api";
import { makeAutoObservable } from "~@/mobx";
import { queryClient } from "~@/query-client";

const SITES_LIST_QUERY_ID = "getAllSitesV1";
const SITE_DETAIL_QUERY_ID = "getSiteByIdV1";

const sitesQueryPredicate = (query: { queryKey: unknown[] }) => {
	const first = query.queryKey[0] as { _id?: string } | undefined;
	return first?._id === SITES_LIST_QUERY_ID || first?._id === SITE_DETAIL_QUERY_ID;
};

function invalidateSitesQueries(): void {
	queryClient.invalidateQueries({ predicate: sitesQueryPredicate });
}

function refetchSitesQueries(): Promise<void> {
	return queryClient.refetchQueries({ predicate: sitesQueryPredicate });
}

/**
 * ViewModel for Site detail and create/edit form.
 * List is owned by SitesDataTableController.
 */
class SitesViewModel {
	#detailQuery = getSiteByIdV1ObservedQuery();
	#createMutation = createSiteV1ObservedMutation();
	#updateMutation = updateSiteV1ObservedMutation();

	constructor() {
		makeAutoObservable(this);
	}

	get site(): SiteResponse | null {
		return this.#detailQuery.data ?? null;
	}

	get isLoading(): boolean {
		return this.#detailQuery.isLoading;
	}

	get hasError(): boolean {
		return this.#detailQuery.hasError;
	}

	get error(): Error | null {
		return this.#detailQuery.error ?? null;
	}

	get isSaving(): boolean {
		return this.#createMutation.isPending || this.#updateMutation.isPending;
	}

	loadSite = async (siteId: string): Promise<void> => {
		await this.#detailQuery.loadAsync({ path: { id: siteId } });
	};

	createSite = async (body: SiteRequest): Promise<SiteResponse | null> => {
		const result = await this.#createMutation.mutateAsync({ body });
		if (result != null) {
			invalidateSitesQueries();
			await refetchSitesQueries();
		}
		return result ?? null;
	};

	updateSite = async (siteId: string, body: SiteRequest): Promise<SiteResponse | null> => {
		const result = await this.#updateMutation.mutateAsync({
			path: { id: siteId },
			body,
		});
		if (result != null) {
			invalidateSitesQueries();
			await refetchSitesQueries();
		}
		return result ?? null;
	};

	dispose = (): void => {
		this.#detailQuery.dispose();
	};
}

export const sitesViewModel = new SitesViewModel();

export function useSitesViewModel() {
	return sitesViewModel;
}
