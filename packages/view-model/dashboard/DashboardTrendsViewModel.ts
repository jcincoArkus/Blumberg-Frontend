import { getSensorReadingsV1, type SensorReadingResponse } from "~@/api";
import { makeAutoObservable, reaction, runInAction } from "~@/mobx";

import { dashboardSensorsViewModel } from "./DashboardSensorsViewModel";

export interface TrendPoint {
	time: string;
	value: number;
}

export type TrendMetric = "temperature" | "humidity" | "co2";
export type TrendRange = "24h" | "7d";

export type TrendData = Record<TrendMetric, TrendPoint[]>;

const METRICS: TrendMetric[] = ["temperature", "humidity", "co2"];

/** Max sensors averaged per metric (keeps the number of readings requests small). */
const MAX_SENSORS_PER_METRIC = 2;
/** API page size is clamped to 100 server-side. */
const PAGE_SIZE = 100;
const HOUR_MS = 60 * 60 * 1000;

const RANGE_CONFIG: Record<TrendRange, { buckets: number; bucketMs: number }> = {
	"24h": { buckets: 24, bucketMs: HOUR_MS },
	"7d": { buckets: 14, bucketMs: 12 * HOUR_MS },
};

/** Temperature sensors also include freezers (-20 °C); prefer ambient ones for the room trend. */
function isAmbientTemperature(value: number | undefined): boolean {
	return value !== undefined && value >= 5 && value <= 40;
}

function emptyData(): TrendData {
	return { temperature: [], humidity: [], co2: [] };
}

async function fetchWindow(
	sensorId: string,
	from: Date,
	to: Date,
	pageSize: number,
): Promise<SensorReadingResponse[]> {
	try {
		const res = await getSensorReadingsV1({
			path: { id: sensorId },
			query: { From: from, To: to, Page: 1, PageSize: pageSize },
		});
		return res.data?.items ?? [];
	} catch {
		return [];
	}
}

/**
 * Singleton ViewModel for dashboard trend sparklines.
 * Builds hourly (24h) / half-day (7d) averages from real sensor readings
 * (GET /api/v1/sensors/{id}/readings) for the ambient temperature, humidity and CO₂ sensors.
 */
class DashboardTrendsViewModel {
	range: TrendRange = "24h";
	trendData: TrendData = emptyData();
	/** Sensor names averaged into each metric (for tooltips). */
	sources: Record<TrendMetric, string[]> = { temperature: [], humidity: [], co2: [] };
	isLoading = false;
	hasLoaded = false;

	#requestId = 0;
	#sensorsDisposer: (() => void) | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	setRange = (range: TrendRange) => {
		if (this.range === range) return;
		this.range = range;
		void this.refresh();
	};

	/** Start loading; re-runs automatically once the sensor list arrives. */
	load = () => {
		if (!this.#sensorsDisposer) {
			this.#sensorsDisposer = reaction(
				() => dashboardSensorsViewModel.allSensors.map((s) => s.id).join(","),
				() => void this.refresh(),
				{ fireImmediately: true },
			);
		}
	};

	dispose = () => {
		this.#sensorsDisposer?.();
		this.#sensorsDisposer = null;
	};

	#pickSensors(metric: TrendMetric) {
		const ofType = dashboardSensorsViewModel.allSensors.filter((s) => s.type === metric);
		const candidates =
			metric === "temperature"
				? ofType.filter((s) => isAmbientTemperature(s.value)).concat(ofType)
				: ofType;
		const online = candidates.filter((s) => s.status !== "offline");
		const pool = online.length > 0 ? online : candidates;
		const unique = [...new Map(pool.map((s) => [s.id, s])).values()];
		return unique.slice(0, MAX_SENSORS_PER_METRIC);
	}

	refresh = async () => {
		const sensorsAvailable = dashboardSensorsViewModel.allSensors.length > 0;
		if (!sensorsAvailable) return;

		const requestId = ++this.#requestId;
		const { buckets, bucketMs } = RANGE_CONFIG[this.range];
		const range = this.range;
		const now = Date.now();
		const start = now - buckets * bucketMs;
		this.isLoading = true;

		const picks = METRICS.map((metric) => ({ metric, sensors: this.#pickSensors(metric) }));

		const results = await Promise.all(
			picks.map(async ({ metric, sensors }) => {
				const readings: SensorReadingResponse[] = [];
				await Promise.all(
					sensors.map(async (sensor) => {
						if (range === "24h") {
							// Newest-first pages; a few pages cover the last 24h at typical cadences.
							const items = await fetchWindow(sensor.id, new Date(start), new Date(now), PAGE_SIZE);
							readings.push(...items);
						} else {
							// One small sample per half-day window keeps the 7-day view cheap.
							const windows = Array.from({ length: buckets }, (_, i) => start + i * bucketMs);
							const chunks = await Promise.all(
								windows.map((from) =>
									fetchWindow(sensor.id, new Date(from), new Date(from + bucketMs), 20),
								),
							);
							for (const c of chunks) readings.push(...c);
						}
					}),
				);
				return { metric, sensors, points: bucketize(readings, start, bucketMs, buckets) };
			}),
		);

		if (requestId !== this.#requestId) return; // a newer request superseded this one
		runInAction(() => {
			const data = emptyData();
			for (const r of results) {
				data[r.metric] = r.points;
				this.sources[r.metric] = r.sensors.map((s) => s.name);
			}
			this.trendData = data;
			this.isLoading = false;
			this.hasLoaded = true;
		});
	};
}

function bucketize(
	readings: SensorReadingResponse[],
	start: number,
	bucketMs: number,
	buckets: number,
): TrendPoint[] {
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
	const points: TrendPoint[] = [];
	for (let i = 0; i < buckets; i++) {
		if (counts[i] === 0) continue;
		points.push({
			time: new Date(start + (i + 1) * bucketMs).toISOString(),
			value: sums[i] / counts[i],
		});
	}
	return points;
}

// Export singleton instance
export const dashboardTrendsViewModel = new DashboardTrendsViewModel();

export function useDashboardTrendsViewModel() {
	return dashboardTrendsViewModel;
}
