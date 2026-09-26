import { getSensorReadingsV1, type SensorReadingResponse } from "~@/api";

export interface SeriesPoint {
	time: string;
	value: number;
}

export type SeriesRange = "24h" | "7d";

const HOUR_MS = 60 * 60 * 1000;
/** API page size is clamped to 100 server-side. */
const PAGE_SIZE = 100;

export const SERIES_RANGE_CONFIG: Record<SeriesRange, { buckets: number; bucketMs: number }> = {
	"24h": { buckets: 24, bucketMs: HOUR_MS },
	"7d": { buckets: 14, bucketMs: 12 * HOUR_MS },
};

/** Max pages fetched for the 24h view (newest first): 4 × 100 covers 24h at a 5-minute cadence. */
const MAX_PAGES_24H = 4;

async function fetchWindow(
	sensorId: string,
	from: Date,
	to: Date,
	pageSize: number,
	page = 1,
): Promise<SensorReadingResponse[]> {
	try {
		const res = await getSensorReadingsV1({
			path: { id: sensorId },
			query: { From: from, To: to, Page: page, PageSize: pageSize },
		});
		return res.data?.items ?? [];
	} catch {
		return [];
	}
}

/**
 * Raw readings for a sensor over the range ending at `now`.
 * 24h: newest readings in the window (up to 4 pages of 100). 7d: a small sample per half-day window,
 * so a week of data costs 14 small requests instead of paging through thousands of rows.
 */
export async function fetchSensorReadings(
	sensorId: string,
	range: SeriesRange,
	now = Date.now(),
): Promise<SensorReadingResponse[]> {
	const { buckets, bucketMs } = SERIES_RANGE_CONFIG[range];
	const start = now - buckets * bucketMs;
	if (range === "24h") {
		const out: SensorReadingResponse[] = [];
		for (let page = 1; page <= MAX_PAGES_24H; page++) {
			const items = await fetchWindow(sensorId, new Date(start), new Date(now), PAGE_SIZE, page);
			out.push(...items);
			if (items.length < PAGE_SIZE) break;
		}
		return out;
	}
	const windows = Array.from({ length: buckets }, (_, i) => start + i * bucketMs);
	const chunks = await Promise.all(
		windows.map((from) => fetchWindow(sensorId, new Date(from), new Date(from + bucketMs), 20)),
	);
	return chunks.flat();
}

/** Average readings into fixed time buckets; empty buckets are skipped. */
export function bucketizeReadings(
	readings: SensorReadingResponse[],
	range: SeriesRange,
	now = Date.now(),
): SeriesPoint[] {
	const { buckets, bucketMs } = SERIES_RANGE_CONFIG[range];
	const start = now - buckets * bucketMs;
	const sums = new Array<number>(buckets).fill(0);
	const counts = new Array<number>(buckets).fill(0);
	for (const r of readings) {
		if (typeof r.value !== "number" || !Number.isFinite(r.value) || !r.timestampUtc) continue;
		const ts = new Date(r.timestampUtc).getTime();
		const idx = Math.floor((ts - start) / bucketMs);
		if (idx < 0 || idx >= buckets) continue;
		sums[idx] += r.value;
		counts[idx] += 1;
	}
	const points: SeriesPoint[] = [];
	for (let i = 0; i < buckets; i++) {
		if (counts[i] === 0) continue;
		points.push({
			time: new Date(start + (i + 1) * bucketMs).toISOString(),
			value: sums[i] / counts[i],
		});
	}
	return points;
}
