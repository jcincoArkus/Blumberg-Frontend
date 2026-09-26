import {
	type EquipmentResponse,
	getAllEquipmentV1ObservedQuery,
	getAllSensorsV1ObservedQuery,
	getAllSitesV1ObservedQuery,
	getAllThresholdsV1ObservedQuery,
	getSensorHealthListV1ObservedQuery,
	type SensorHealthListItemResponse,
	SensorHealthStatus,
	type SensorResponse,
	type SiteResponse,
	type ThresholdResponse,
} from "~@/api";
import { makeAutoObservable, runInAction } from "~@/mobx";
import type { Alert } from "~@/models";
import { unitSymbol } from "~@/ui";

import { alertsViewModel } from "../alerts";
import {
	bucketizeReadings,
	fetchSensorReadings,
	type SeriesPoint,
	type SeriesRange,
} from "../dashboard/sensorSeries";

export type OverviewSensorType = "temperature" | "humidity" | "co2" | "pressure" | "energy" | "o2";
export type OverviewSensorStatus =
	| "active"
	| "warning"
	| "stale"
	| "offline"
	| "error"
	| "inactive";

export interface OverviewSensor {
	id: string;
	equipmentId?: string;
	siteId: string;
	type: OverviewSensorType;
	name: string;
	value?: number;
	unit: string;
	status: OverviewSensorStatus;
	lastSeen?: string;
	min?: number;
	max?: number;
	threshold?: { warning: number; critical: number };
}

export interface OverviewEquipment {
	id: string;
	name: string;
	type: string;
	siteId: string;
	siteName: string;
	siteLocation: string;
	sensorCount: number;
	activeAlerts: number;
	/** online | warning | offline */
	status: "online" | "warning" | "offline";
	lastUpdate: string;
}

const PAGE = { Page: 1, PageSize: 100 };

const HEALTH_TO_STATUS: Record<SensorHealthStatus, OverviewSensorStatus> = {
	[SensorHealthStatus._0]: "active",
	[SensorHealthStatus._1]: "warning",
	[SensorHealthStatus._2]: "error",
	[SensorHealthStatus._3]: "stale",
	[SensorHealthStatus._4]: "offline",
	[SensorHealthStatus._5]: "offline",
};

const TYPES: OverviewSensorType[] = ["temperature", "humidity", "co2", "pressure", "energy", "o2"];

function itemsOf<T>(data: unknown): T[] {
	return ((data as { items?: T[] | null } | null | undefined)?.items ?? []) as T[];
}

function toType(raw: string | null | undefined): OverviewSensorType {
	const v = (raw ?? "").toLowerCase() as OverviewSensorType;
	return TYPES.includes(v) ? v : "temperature";
}

/**
 * Equipment Overview (list + per-equipment dashboard) built from real API data:
 * /equipment, /sites, /sensors/health, /sensors, /thresholds, /alerts and
 * /sensors/{id}/readings for the historical charts.
 */
class EquipmentOverviewViewModel {
	#equipmentQuery = getAllEquipmentV1ObservedQuery();
	#sitesQuery = getAllSitesV1ObservedQuery();
	#healthQuery = getSensorHealthListV1ObservedQuery();
	#sensorsQuery = getAllSensorsV1ObservedQuery();
	#thresholdsQuery = getAllThresholdsV1ObservedQuery();
	#loaded = false;

	/** Bucketed readings keyed by `${sensorId}:${range}`. */
	series: Record<string, SeriesPoint[]> = {};
	#pendingSeries = new Set<string>();

	constructor() {
		makeAutoObservable(this);
	}

	load = () => {
		if (this.#loaded) return;
		this.#loaded = true;
		this.#equipmentQuery.load({ query: PAGE });
		this.#sitesQuery.load({ query: PAGE });
		this.#healthQuery.load({ query: PAGE });
		this.#sensorsQuery.load({ query: PAGE });
		this.#thresholdsQuery.load({ query: PAGE });
		alertsViewModel.load();
	};

	get isLoading(): boolean {
		return this.#equipmentQuery.isLoading || this.#healthQuery.isLoading;
	}

	get hasError(): boolean {
		return this.#equipmentQuery.hasError;
	}

	get #sitesById(): Map<string, SiteResponse> {
		return new Map(itemsOf<SiteResponse>(this.#sitesQuery.data).map((s) => [s.id ?? "", s]));
	}

	get sensors(): OverviewSensor[] {
		const thresholds = new Map(
			itemsOf<ThresholdResponse>(this.#thresholdsQuery.data).map((t) => [t.id ?? "", t]),
		);
		const raw = new Map(
			itemsOf<SensorResponse>(this.#sensorsQuery.data).map((s) => [s.id ?? "", s]),
		);
		return itemsOf<SensorHealthListItemResponse>(this.#healthQuery.data).map((h) => {
			const r = raw.get(h.id ?? "");
			const th = r?.thresholdId ? thresholds.get(r.thresholdId) : undefined;
			return {
				id: h.id ?? "",
				equipmentId: h.equipmentId,
				siteId: h.siteId ?? "",
				type: toType(h.sensorType),
				name: h.name ?? "",
				value: h.lastValue ?? undefined,
				unit: unitSymbol(h.unit),
				status: h.healthStatus != null ? HEALTH_TO_STATUS[h.healthStatus] : "offline",
				lastSeen: h.lastSeenAt ? new Date(h.lastSeenAt).toISOString() : undefined,
				min: th?.min,
				max: th?.max,
			};
		});
	}

	alertsFor(equipmentId: string): Alert[] {
		return alertsViewModel.alerts
			.filter((a) => a.equipmentId === equipmentId)
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}

	get equipment(): OverviewEquipment[] {
		const sites = this.#sitesById;
		const sensors = this.sensors;
		return itemsOf<EquipmentResponse>(this.#equipmentQuery.data)
			.map((e): OverviewEquipment => {
				const id = e.id ?? "";
				const site = sites.get(e.siteId ?? "");
				const own = sensors.filter((s) => s.equipmentId === id);
				const active = alertsViewModel.unresolvedAlerts.filter((a) => a.equipmentId === id);
				const lastSeen = own
					.map((s) => s.lastSeen)
					.filter((x): x is string => !!x)
					.sort()
					.pop();
				const allOffline = own.length > 0 && own.every((s) => s.status === "offline");
				const hasIssues =
					active.length > 0 || own.some((s) => s.status === "warning" || s.status === "error");
				const status: OverviewEquipment["status"] = hasIssues
					? "warning"
					: allOffline
						? "offline"
						: "online";
				return {
					id,
					name: e.name ?? "",
					type: e.equipmentType ?? "",
					siteId: e.siteId ?? "",
					siteName: e.siteName ?? site?.name ?? "",
					siteLocation: [site?.city, site?.state].filter(Boolean).join(", "),
					sensorCount: own.length,
					activeAlerts: active.length,
					status,
					lastUpdate: lastSeen ?? new Date(e.updatedAt ?? e.createdAt ?? Date.now()).toISOString(),
				};
			})
			.sort((a, b) => a.siteName.localeCompare(b.siteName) || a.name.localeCompare(b.name));
	}

	equipmentById(id: string | undefined): OverviewEquipment | undefined {
		if (!id) return undefined;
		return this.equipment.find((e) => e.id === id);
	}

	sensorsFor(equipmentId: string): OverviewSensor[] {
		return this.sensors.filter((s) => s.equipmentId === equipmentId);
	}

	/**
	 * Bucketed readings for charts. Returns what is cached and schedules a fetch
	 * (outside render) the first time a sensor/range pair is requested.
	 */
	getSeries = (sensorId: string, range: SeriesRange): SeriesPoint[] => {
		const key = `${sensorId}:${range}`;
		const cached = this.series[key];
		if (!cached && !this.#pendingSeries.has(key)) {
			this.#pendingSeries.add(key);
			queueMicrotask(() => void this.#loadSeries(sensorId, range, key));
		}
		return cached ?? [];
	};

	async #loadSeries(sensorId: string, range: SeriesRange, key: string) {
		const now = Date.now();
		const readings = await fetchSensorReadings(sensorId, range, now);
		runInAction(() => {
			this.series = { ...this.series, [key]: bucketizeReadings(readings, range, now) };
		});
	}
}

export const equipmentOverviewViewModel = new EquipmentOverviewViewModel();

export function useEquipmentOverviewViewModel() {
	equipmentOverviewViewModel.load();
	return equipmentOverviewViewModel;
}
