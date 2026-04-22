import {
	getSensorHealthListV1ObservedQuery,
	type SensorHealthListItemResponse,
	SensorHealthStatus,
} from "~@/api";
import { makeAutoObservable, reaction, runInAction } from "~@/mobx";
import { authViewModel } from "~@/view-model/auth";
import type { Domain, Sensor } from "~@/views";

import { SENSORS_POLL_INTERVAL_MS } from "../constants";

// Dashboard sensor extends Sensor with type and reading fields for metrics panel
interface DashboardSensor extends Sensor {
	type: string;
	value?: number;
	unit: string;
	lastSeen?: string;
	min?: number;
	max?: number;
}

/** Map API SensorHealthStatus to dashboard Sensor status (active/offline/stale/warning/error). */
const healthStatusToSensorStatus: Record<SensorHealthStatus, Sensor["status"]> = {
	[SensorHealthStatus._0]: "active", // healthy
	[SensorHealthStatus._1]: "warning",
	[SensorHealthStatus._2]: "error", // critical
	[SensorHealthStatus._3]: "stale",
	[SensorHealthStatus._4]: "offline", // silent
	[SensorHealthStatus._5]: "offline",
};

// Domain to sensor type mapping (for future domain filter)
const DOMAIN_TYPES: Record<string, string[]> = {
	Energy: ["energy"],
	Climate: ["temperature", "humidity", "co2"],
	Refrigeration: ["temperature", "pressure"],
	Equipment: ["temperature", "humidity", "co2", "pressure", "energy"],
};

const DASHBOARD_PAGE_SIZE = 500;

function mapHealthItemToSensor(item: SensorHealthListItemResponse): DashboardSensor {
	const status =
		item.healthStatus != null
			? healthStatusToSensorStatus[item.healthStatus]
			: ("offline" as const);
	const type = (item.sensorType ?? "other").toLowerCase();
	return {
		id: item.id ?? "",
		name: item.name ?? "",
		type,
		status,
		value: item.lastValue ?? undefined,
		unit: item.unit ?? "",
		lastSeen: item.lastSeenAt?.toISOString(),
		min: undefined,
		max: undefined,
	};
}

type HealthQuery = ReturnType<typeof getSensorHealthListV1ObservedQuery>;

/**
 * Singleton ViewModel for Dashboard Sensors data.
 * Fetches from GET /api/v1/sensors/health (sensors with latest reading).
 * Query is created only on first load() so login page never triggers health requests.
 */
class DashboardSensorsViewModel {
	#healthQuery: HealthQuery | null = null;
	#syncDisposer: (() => void) | null = null;
	/** Cached list from API so observer() reliably re-renders when data arrives. */
	sensorsData: DashboardSensor[] = [];

	activeDomain: Domain = "All";

	#authDisposer: (() => void) | null = null;

	constructor() {
		makeAutoObservable(this);
		// Stop polling when user logs out so health requests don't keep firing on login page
		this.#authDisposer = reaction(
			() => authViewModel.isAuthenticated,
			(authenticated) => {
				if (!authenticated) this.dispose();
			},
			{ fireImmediately: false },
		);
	}

	#ensureQuery(): HealthQuery {
		if (this.#healthQuery) return this.#healthQuery;
		this.#healthQuery = getSensorHealthListV1ObservedQuery(undefined, {
			refetchInterval: SENSORS_POLL_INTERVAL_MS,
		});
		this.#syncDisposer = reaction(
			() => {
				const data = this.#healthQuery?.data as
					| { items?: SensorHealthListItemResponse[] }
					| undefined;
				return data?.items ?? null;
			},
			(items) => {
				runInAction(() => {
					this.sensorsData = (items ?? []).map(mapHealthItemToSensor);
				});
			},
			{ fireImmediately: true },
		);
		return this.#healthQuery;
	}

	#load() {
		this.#ensureQuery().load({
			query: {
				Page: 1,
				PageSize: DASHBOARD_PAGE_SIZE,
			},
		});
	}

	/** True while the sensor health list is fetching (initial or refetch). */
	get isSensorsLoading(): boolean {
		return this.#healthQuery?.isLoading ?? false;
	}

	/** True if the last sensor health list request failed. */
	get hasSensorsError(): boolean {
		return this.#healthQuery?.hasError ?? false;
	}

	/** All sensors from API (unfiltered). */
	get allSensors(): DashboardSensor[] {
		return this.sensorsData;
	}

	/** Sensors filtered by active domain. */
	get sensors(): DashboardSensor[] {
		if (this.activeDomain === "All") return this.allSensors;
		const types = DOMAIN_TYPES[this.activeDomain] ?? [];
		return this.allSensors.filter((s) => types.includes(s.type));
	}

	get sensorIds(): Set<string> {
		return new Set(this.sensors.map((s) => s.id));
	}

	get sensorsOnline(): number {
		return this.sensors.filter((s) => s.status === "active").length;
	}

	get offlineSensors(): DashboardSensor[] {
		return this.sensors.filter((s) => s.status === "offline");
	}

	get staleSensors(): DashboardSensor[] {
		return this.sensors.filter((s) => s.status === "stale");
	}

	get flappingSensors(): DashboardSensor[] {
		return this.sensors.filter((s) => s.status === "warning");
	}

	get sensorReliability() {
		return {
			offline: this.offlineSensors.length,
			stale: this.staleSensors.length,
			flapping: this.flappingSensors.length,
			offlineSensors: this.offlineSensors,
			staleSensors: this.staleSensors,
			flappingSensors: this.flappingSensors,
		};
	}

	setActiveDomain = (value: Domain) => {
		this.activeDomain = value;
	};

	/** Refetch sensor health list (only call from dashboard-mounted components; login page never mounts those). */
	load = () => {
		this.#load();
	};

	/** Clean up query and reaction (viewmodel-pattern). */
	dispose = () => {
		this.#authDisposer?.();
		this.#authDisposer = null;
		this.#syncDisposer?.();
		this.#syncDisposer = null;
		this.#healthQuery?.dispose();
		this.#healthQuery = null;
	};
}

export const dashboardSensorsViewModel = new DashboardSensorsViewModel();

export function useDashboardSensorsViewModel() {
	return dashboardSensorsViewModel;
}
