import { getSensorReadingsV1, type SensorReadingResponse } from "~@/api";
import { makeAutoObservable, reaction, runInAction } from "~@/mobx";
import type { DateRangePreset, HistoricalAlert, HistoricalReading } from "~@/views";

import { alertsViewModel } from "../alerts";
import {
	equipmentOverviewViewModel,
	type OverviewSensor,
} from "../equipment/EquipmentOverviewViewModel";

/**
 * Readings are sampled: the period is split into windows and the newest readings of each
 * window are fetched (API page size is clamped to 100), so any range is covered evenly
 * with a bounded number of requests.
 */
const WINDOWS_PER_PERIOD = 8;
const READINGS_PER_WINDOW = 25;

type ReportSite = {
	id: string;
	name: string;
	location: string;
	status: "operational" | "warning" | "critical";
};

async function fetchWindow(
	sensorId: string,
	from: Date,
	to: Date,
): Promise<SensorReadingResponse[]> {
	try {
		const res = await getSensorReadingsV1({
			path: { id: sensorId },
			query: { From: from, To: to, Page: 1, PageSize: READINGS_PER_WINDOW },
		});
		return res.data?.items ?? [];
	} catch {
		return [];
	}
}

async function fetchReadings(
	sensorId: string,
	from: Date,
	to: Date,
): Promise<SensorReadingResponse[]> {
	const span = (to.getTime() - from.getTime()) / WINDOWS_PER_PERIOD;
	const chunks = await Promise.all(
		Array.from({ length: WINDOWS_PER_PERIOD }, (_, i) =>
			fetchWindow(
				sensorId,
				new Date(from.getTime() + i * span),
				new Date(from.getTime() + (i + 1) * span),
			),
		),
	);
	return chunks.flat();
}

class HistoricalReportsViewModel {
	activeTab: "readings" | "alerts" = "readings";
	datePreset: DateRangePreset = "7d";
	startDate: Date | null = null;
	endDate: Date | null = null;
	siteFilter = "all";
	equipmentFilter = "all";
	// Default to one sensor type so averages/min/max are in a single unit
	sensorTypeFilter = "temperature";
	severityFilter = "all";
	comparePrevious = false;

	readings: HistoricalReading[] = [];
	previousReadings: HistoricalReading[] = [];
	isLoadingReadings = false;

	#requestId = 0;
	#disposer: (() => void) | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	/** Start loading reference data and keep readings in sync with the filters. */
	load = () => {
		equipmentOverviewViewModel.load();
		alertsViewModel.load();
		if (this.#disposer) return;
		this.#disposer = reaction(
			() => ({
				start: this.dateRange.start.getTime(),
				end: this.dateRange.end.getTime(),
				site: this.siteFilter,
				equipment: this.equipmentFilter,
				type: this.sensorTypeFilter,
				compare: this.comparePrevious,
				sensors: equipmentOverviewViewModel.sensors.map((s) => s.id).join(","),
			}),
			() => void this.#loadReadings(),
			{ fireImmediately: true, delay: 150 },
		);
	};

	/** Sites for the filter, derived from real equipment/site data. */
	get sites(): ReportSite[] {
		const map = new Map<string, ReportSite>();
		for (const e of equipmentOverviewViewModel.equipment) {
			if (!e.siteId || map.has(e.siteId)) continue;
			map.set(e.siteId, {
				id: e.siteId,
				name: e.siteName,
				location: e.siteLocation,
				status: "operational",
			});
		}
		return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
	}

	get equipment() {
		const list = equipmentOverviewViewModel.equipment;
		return this.siteFilter === "all" ? list : list.filter((e) => e.siteId === this.siteFilter);
	}

	get #filteredSensors(): OverviewSensor[] {
		const equipmentIds = new Set(this.equipment.map((e) => e.id));
		return equipmentOverviewViewModel.sensors.filter(
			(s) =>
				(this.siteFilter === "all" || s.siteId === this.siteFilter) &&
				(this.equipmentFilter === "all" || s.equipmentId === this.equipmentFilter) &&
				(this.sensorTypeFilter === "all" || s.type === this.sensorTypeFilter) &&
				(!s.equipmentId || equipmentIds.has(s.equipmentId)),
		);
	}

	async #loadReadings() {
		const sensors = this.#filteredSensors;
		if (sensors.length === 0) {
			this.readings = [];
			this.previousReadings = [];
			return;
		}
		const requestId = ++this.#requestId;
		const { start, end } = this.dateRange;
		const previous = this.previousPeriod;
		this.isLoadingReadings = true;

		const equipmentById = new Map(equipmentOverviewViewModel.equipment.map((e) => [e.id, e]));
		const toRows = (s: OverviewSensor, items: SensorReadingResponse[]): HistoricalReading[] => {
			const eq = s.equipmentId ? equipmentById.get(s.equipmentId) : undefined;
			return items
				.filter((r) => typeof r.value === "number" && r.timestampUtc)
				.map((r) => ({
					sensorId: s.id,
					sensorName: s.name,
					sensorType: s.type as HistoricalReading["sensorType"],
					timestamp: new Date(r.timestampUtc as Date).toISOString(),
					value: r.value as number,
					unit: s.unit,
					siteId: s.siteId,
					siteName: eq?.siteName ?? "",
					equipmentId: s.equipmentId ?? "",
					equipmentName: eq?.name ?? "",
				}));
		};

		const [current, prev] = await Promise.all([
			Promise.all(sensors.map(async (s) => toRows(s, await fetchReadings(s.id, start, end)))),
			previous
				? Promise.all(
						sensors.map(async (s) =>
							toRows(s, await fetchReadings(s.id, previous.start, previous.end)),
						),
					)
				: Promise.resolve([] as HistoricalReading[][]),
		]);

		if (requestId !== this.#requestId) return;
		const byTimeDesc = (a: HistoricalReading, b: HistoricalReading) =>
			b.timestamp.localeCompare(a.timestamp);
		runInAction(() => {
			this.readings = current.flat().sort(byTimeDesc);
			this.previousReadings = prev.flat().sort(byTimeDesc);
			this.isLoadingReadings = false;
		});
	}

	get dateRange() {
		const end = this.endDate || new Date();
		let start: Date;

		if (this.datePreset === "24h") {
			start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
		} else if (this.datePreset === "7d") {
			start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
		} else if (this.datePreset === "30d") {
			start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
		} else {
			start = this.startDate || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
		}

		return { start, end };
	}

	get previousPeriod() {
		if (!this.comparePrevious) return null;
		const periodLength = this.dateRange.end.getTime() - this.dateRange.start.getTime();
		return {
			start: new Date(this.dateRange.start.getTime() - periodLength),
			end: this.dateRange.start,
		};
	}

	#alertsBetween(start: Date, end: Date): HistoricalAlert[] {
		const equipmentIds = new Set(this.equipment.map((e) => e.id));
		return alertsViewModel.alerts
			.filter((a) => {
				const created = new Date(a.createdAt).getTime();
				if (created < start.getTime() || created > end.getTime()) return false;
				if (this.siteFilter !== "all" && a.equipmentId && !equipmentIds.has(a.equipmentId))
					return false;
				if (this.equipmentFilter !== "all" && a.equipmentId !== this.equipmentFilter) return false;
				if (this.severityFilter !== "all" && a.severity !== this.severityFilter) return false;
				return true;
			})
			.map((a) => ({
				id: a.id,
				title: a.name,
				severity: a.severity,
				status: a.status,
				equipmentId: a.equipmentId ?? "",
				sensorId: a.sensorId,
				createdAt: a.createdAt,
				acknowledgedAt: a.acknowledgedAt,
				resolvedAt: a.resolvedAt,
				durationSeconds: a.resolvedAt
					? Math.max(0, (new Date(a.resolvedAt).getTime() - new Date(a.createdAt).getTime()) / 1000)
					: undefined,
			}))
			.sort((x, y) => y.createdAt.localeCompare(x.createdAt));
	}

	get alerts(): HistoricalAlert[] {
		const { start, end } = this.dateRange;
		return this.#alertsBetween(start, end);
	}

	get previousAlerts(): HistoricalAlert[] {
		if (!this.previousPeriod) return [];
		return this.#alertsBetween(this.previousPeriod.start, this.previousPeriod.end);
	}

	setActiveTab = (tab: "readings" | "alerts") => {
		this.activeTab = tab;
	};

	setDatePreset = (preset: DateRangePreset) => {
		this.datePreset = preset;
	};

	setStartDate = (date: Date | null) => {
		this.startDate = date;
	};

	setEndDate = (date: Date | null) => {
		this.endDate = date;
	};

	setSiteFilter = (value: string) => {
		this.siteFilter = value;
		this.equipmentFilter = "all";
	};

	setEquipmentFilter = (value: string) => {
		this.equipmentFilter = value;
	};

	setSensorTypeFilter = (value: string) => {
		this.sensorTypeFilter = value;
	};

	setSeverityFilter = (value: string) => {
		this.severityFilter = value;
	};

	setComparePrevious = (value: boolean) => {
		this.comparePrevious = value;
	};

	dispose() {
		this.#disposer?.();
		this.#disposer = null;
	}
}

export const historicalReportsViewModel = new HistoricalReportsViewModel();

export function useHistoricalReportsViewModel() {
	historicalReportsViewModel.load();
	return historicalReportsViewModel;
}
