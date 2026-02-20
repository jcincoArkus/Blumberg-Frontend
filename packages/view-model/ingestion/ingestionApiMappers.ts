import type {
	IngestionRunDetailResponse,
	IngestionRunListResponse,
	IngestionSource,
	IngestionStatus,
} from "~@/api";
import type { IngestionError, IngestionRun, RejectedRow } from "~@/views";

const SOURCE_MAP: Record<number, IngestionRun["source"]> = {
	0: "api", // Api
	1: "csv", // Csv
	2: "api", // Simulated -> show as api
};

const STATUS_MAP: Record<number, IngestionRun["status"]> = {
	0: "fail", // Pending
	1: "partial", // InProgress
	2: "success", // Success
	3: "partial", // PartialSuccess
	4: "fail", // Failed
};

function mapSource(source?: IngestionSource): IngestionRun["source"] {
	return source !== undefined && typeof source === "number" ? (SOURCE_MAP[source] ?? "api") : "api";
}

function mapStatus(status?: IngestionStatus): IngestionRun["status"] {
	return status !== undefined && typeof status === "number"
		? (STATUS_MAP[status] ?? "partial")
		: "partial";
}

export function mapIngestionRunListToView(item: IngestionRunListResponse): IngestionRun {
	return {
		id: item.id ?? "",
		source: mapSource(item.source),
		createdAt:
			item.createdAt instanceof Date
				? item.createdAt.toISOString()
				: ((item.createdAt as string) ?? ""),
		totalRecords: item.totalRecords ?? 0,
		acceptedCount: item.acceptedRecords ?? 0,
		rejectedCount: item.rejectedRecords ?? 0,
		status: mapStatus(item.status),
		errors: [], // list endpoint does not include error breakdown
	};
}

export function mapIngestionRunDetailToView(detail: IngestionRunDetailResponse): IngestionRun {
	const rejectedReadings = detail.rejectedReadings ?? [];
	const errorsByReason = new Map<string, { count: number }>();
	for (const r of rejectedReadings) {
		const reason = r.rejectionReason ?? "Unknown";
		const prev = errorsByReason.get(reason);
		errorsByReason.set(reason, { count: (prev?.count ?? 0) + 1 });
	}
	const errors: IngestionError[] = Array.from(errorsByReason.entries()).map(
		([message, { count }]) => {
			const code = message.toUpperCase().replace(/\s+/g, "_").slice(0, 50);
			return { code, message, count };
		},
	);
	const rejectedRowsSample: RejectedRow[] = rejectedReadings.slice(0, 20).map((r) => ({
		rowNumber: r.rowIndex ?? 0,
		raw: {},
		reasonCode: (r.rejectionReason ?? "Unknown").toUpperCase().replace(/\s+/g, "_").slice(0, 30),
		reasonMessage: r.rejectionReason ?? "Unknown",
	}));

	return {
		id: detail.id ?? "",
		source: mapSource(detail.source),
		createdAt:
			detail.createdAt instanceof Date
				? detail.createdAt.toISOString()
				: ((detail.createdAt as string) ?? ""),
		totalRecords: detail.totalRecords ?? 0,
		acceptedCount: detail.acceptedRecords ?? 0,
		rejectedCount: detail.rejectedRecords ?? 0,
		status: mapStatus(detail.status),
		errors,
		rejectedRowsSample,
	};
}
