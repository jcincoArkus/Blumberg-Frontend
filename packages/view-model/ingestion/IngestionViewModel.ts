import {
	getAllSensorsV1ObservedQuery,
	getIngestionRunByIdV1ObservedQuery,
	getIngestionRunsV1ObservedQuery,
	getIngestionStatsV1ObservedQuery,
	ingestReadingsV1ObservedMutation,
} from "~@/api";
import type { DataTablePaginationInfo } from "~@/data-table";
import { makeAutoObservable } from "~@/mobx";
import type { IngestionRun } from "~@/views";

import { mapIngestionRunDetailToView, mapIngestionRunListToView } from "./ingestionApiMappers";

const RECENT_24H_PAGE_SIZE = 20;
const HISTORY_PAGE_SIZE = 25;

function from24hIso(): string {
	return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

function toNowIso(): string {
	return new Date().toISOString();
}

type PagedData = { items?: unknown[]; totalCount?: number; page?: number; pageSize?: number };

class IngestionViewModel {
	activeTab: "api" | "csv" = "api";
	refreshKey = 0;

	/** 1-based page for history (all runs) */
	historyPage = 1;
	/** 1-based page for recent 24h API runs */
	recent24hPage = 1;

	#runsListQuery = getIngestionRunsV1ObservedQuery();
	#runs24hQuery = getIngestionRunsV1ObservedQuery();
	#stats24hQuery = getIngestionStatsV1ObservedQuery();
	#sensorsQuery = getAllSensorsV1ObservedQuery();
	#runDetailQuery = getIngestionRunByIdV1ObservedQuery();
	#ingestMutation = ingestReadingsV1ObservedMutation();

	constructor() {
		makeAutoObservable(this);
		this.loadHistoryPage();
		this.loadRecent24hPage();
		this.loadStats24h();
		this.#sensorsQuery.load();
	}

	get allRuns(): IngestionRun[] {
		const data = this.#runsListQuery.data as PagedData | undefined;
		const items = data?.items ?? [];
		return items.map((item) =>
			mapIngestionRunListToView(item as Parameters<typeof mapIngestionRunListToView>[0]),
		);
	}

	get apiRuns24h(): IngestionRun[] {
		const data = this.#runs24hQuery.data as PagedData | undefined;
		const items = data?.items ?? [];
		return items.map((item) =>
			mapIngestionRunListToView(item as Parameters<typeof mapIngestionRunListToView>[0]),
		);
	}

	get historyTotalCount(): number {
		return (this.#runsListQuery.data as PagedData | undefined)?.totalCount ?? 0;
	}

	get recent24hTotalCount(): number {
		return (this.#runs24hQuery.data as PagedData | undefined)?.totalCount ?? 0;
	}

	/** Aggregated stats for last 24h API runs (all runs in range, not just current page). Null until loaded. */
	get last24hStats(): {
		totalRecords: number;
		acceptedRecords: number;
		rejectedRecords: number;
		uniqueErrorTypes: number;
	} | null {
		const data = this.#stats24hQuery.data as
			| {
					totalRecords?: number;
					acceptedRecords?: number;
					rejectedRecords?: number;
					uniqueErrorTypes?: number;
			  }
			| undefined;
		if (data == null) return null;
		return {
			totalRecords: data.totalRecords ?? 0,
			acceptedRecords: data.acceptedRecords ?? 0,
			rejectedRecords: data.rejectedRecords ?? 0,
			uniqueErrorTypes: data.uniqueErrorTypes ?? 0,
		};
	}

	get historyPagination(): DataTablePaginationInfo {
		const total = this.historyTotalCount;
		const pageSize = HISTORY_PAGE_SIZE;
		const totalPages = Math.max(1, Math.ceil(total / pageSize));
		const currentPage0 = Math.max(0, Math.min(this.historyPage - 1, totalPages - 1));
		const startItem = total === 0 ? 0 : currentPage0 * pageSize + 1;
		const endItem = total === 0 ? 0 : Math.min((currentPage0 + 1) * pageSize, total);
		return {
			currentPage: currentPage0,
			pageSize,
			totalItems: total,
			totalPages,
			hasNextPage: this.historyPage < totalPages,
			hasPreviousPage: this.historyPage > 1,
			startItem,
			endItem,
		};
	}

	get recent24hPagination(): DataTablePaginationInfo {
		const total = this.recent24hTotalCount;
		const pageSize = RECENT_24H_PAGE_SIZE;
		const totalPages = Math.max(1, Math.ceil(total / pageSize));
		const currentPage0 = Math.max(0, Math.min(this.recent24hPage - 1, totalPages - 1));
		const startItem = total === 0 ? 0 : currentPage0 * pageSize + 1;
		const endItem = total === 0 ? 0 : Math.min((currentPage0 + 1) * pageSize, total);
		return {
			currentPage: currentPage0,
			pageSize,
			totalItems: total,
			totalPages,
			hasNextPage: this.recent24hPage < totalPages,
			hasPreviousPage: this.recent24hPage > 1,
			startItem,
			endItem,
		};
	}

	get validSensorIds(): string[] {
		const items =
			(this.#sensorsQuery.data as { items?: { id?: string }[] } | undefined)?.items ?? [];
		return items.map((s) => s.id ?? "").filter(Boolean);
	}

	get loadingRuns(): boolean {
		return (
			this.#runsListQuery.isLoading || this.#runs24hQuery.isLoading || this.#stats24hQuery.isLoading
		);
	}

	get loadingSensors(): boolean {
		return this.#sensorsQuery.isLoading;
	}

	get loadingDetail(): boolean {
		return this.#runDetailQuery.isLoading;
	}

	get runsError(): string | null {
		const err = this.#runsListQuery.error ?? this.#runs24hQuery.error;
		return err ? (err as Error).message : null;
	}

	get sensorsError(): string | null {
		const err = this.#sensorsQuery.error;
		return err ? (err as Error).message : null;
	}

	loadHistoryPage = () => {
		this.#runsListQuery.load({
			query: { Page: this.historyPage, PageSize: HISTORY_PAGE_SIZE },
		});
	};

	loadRecent24hPage = () => {
		this.#runs24hQuery.load({
			query: {
				Page: this.recent24hPage,
				PageSize: RECENT_24H_PAGE_SIZE,
				Source: 0,
				From: from24hIso() as unknown as Date,
				To: toNowIso() as unknown as Date,
			},
		});
	};

	loadStats24h = () => {
		this.#stats24hQuery.load({
			query: {
				Source: 0,
				From: from24hIso() as unknown as Date,
				To: toNowIso() as unknown as Date,
			},
		});
	};

	setHistoryPageByIndex = (pageIndex: number) => {
		this.historyPage = pageIndex + 1;
		this.loadHistoryPage();
	};

	setRecent24hPageByIndex = (pageIndex: number) => {
		this.recent24hPage = pageIndex + 1;
		this.loadRecent24hPage();
	};

	loadAll = () => {
		this.historyPage = 1;
		this.recent24hPage = 1;
		this.loadHistoryPage();
		this.loadRecent24hPage();
		this.loadStats24h();
		this.#sensorsQuery.load();
	};

	fetchRunDetail = async (id: string): Promise<IngestionRun | null> => {
		await this.#runDetailQuery.loadAsync({ path: { id } });
		const data = this.#runDetailQuery.data as
			| Parameters<typeof mapIngestionRunDetailToView>[0]
			| undefined;
		return data ? mapIngestionRunDetailToView(data) : null;
	};

	setActiveTab = (tab: "api" | "csv") => {
		this.activeTab = tab;
	};

	handleIngestionComplete = (_run: IngestionRun) => {
		this.refreshKey += 1;
		this.#runsListQuery.invalidate();
		this.#runs24hQuery.invalidate();
		this.#stats24hQuery.invalidate();
	};

	/** Call after successful API ingestion to refresh runs. */
	refreshAfterIngestion = () => {
		this.#runsListQuery.invalidate();
		this.#runs24hQuery.invalidate();
		this.#stats24hQuery.invalidate();
	};

	/** Submit readings via API (Send Test). Returns response data or throws. */
	submitReadings = async (
		body: Array<{ sensorId: string; value: number; timestampUtc: string; unit: number }>,
	) => {
		// API types expect Date for timestampUtc; client sends ISO string (accepted by backend)
		const result = await this.#ingestMutation.mutateAsync({ body: body as never });
		this.#runsListQuery.invalidate();
		this.#runs24hQuery.invalidate();
		this.#stats24hQuery.invalidate();
		return result;
	};

	get isSubmittingReadings(): boolean {
		return this.#ingestMutation.isPending;
	}

	dispose = () => {
		this.#runsListQuery.dispose();
		this.#runs24hQuery.dispose();
		this.#stats24hQuery.dispose();
		this.#sensorsQuery.dispose();
		this.#runDetailQuery.dispose();
	};
}

export const ingestionViewModel = new IngestionViewModel();

export function useIngestionViewModel() {
	return ingestionViewModel;
}
