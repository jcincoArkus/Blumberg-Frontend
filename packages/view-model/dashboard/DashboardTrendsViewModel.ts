import type { SensorReadingResponse } from "~@/api";
import { makeAutoObservable, reaction, runInAction } from "~@/mobx";

import { dashboardSensorsViewModel } from "./DashboardSensorsViewModel";
import {
	bucketizeReadings,
	fetchSensorReadings,
	type SeriesPoint,
	type SeriesRange,
} from "./sensorSeries";

export type TrendPoint = SeriesPoint;
export type TrendMetric = "temperature" | "humidity" | "co2";
export type TrendRange = SeriesRange;

export type TrendData = Record<TrendMetric, TrendPoint[]>;

const METRICS: TrendMetric[] = ["temperature", "humidity", "co2"];

/** Max sensors averaged per metric (keeps the number of readings requests small). */
const MAX_SENSORS_PER_METRIC = 2;

/** Temperature sensors also include freezers (-20 °C); prefer ambient ones for the room trend. */
function isAmbientTemperature(value: number | undefined): boolean {
	return value !== undefined && value >= 15 && value <= 32;
}

function emptyData(): TrendData {
	return { temperature: [], humidity: [], co2: [] };
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
	/** Range of the data currently in `trendData` (differs from `range` while a range switch is loading). */
	loadedRange: TrendRange | null = null;

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
		const range = this.range;
		const now = Date.now();
		this.isLoading = true;

		const picks = METRICS.map((metric) => ({ metric, sensors: this.#pickSensors(metric) }));

		const results = await Promise.all(
			picks.map(async ({ metric, sensors }) => {
				const perSensor = await Promise.all(
					sensors.map((sensor) => fetchSensorReadings(sensor.id, range, now)),
				);
				const readings: SensorReadingResponse[] = perSensor.flat();
				return { metric, sensors, points: bucketizeReadings(readings, range, now) };
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
			this.loadedRange = range;
			this.isLoading = false;
			this.hasLoaded = true;
		});
	};
}

// Export singleton instance
export const dashboardTrendsViewModel = new DashboardTrendsViewModel();

export function useDashboardTrendsViewModel() {
	return dashboardTrendsViewModel;
}
