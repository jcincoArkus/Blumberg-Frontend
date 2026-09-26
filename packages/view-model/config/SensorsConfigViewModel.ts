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
import { makeAutoObservable } from "~@/mobx";
import type {
	Equipment,
	Sensor,
	SensorStatus,
	SensorThreshold,
	SensorType,
	SensorTypeOption,
	Site,
	TransformTypeOption,
} from "~@/models";
import { getSensorTypeOptions, getTransformTypeOptions, getUnitForSensor } from "~@/models";
import { unitSymbol } from "~@/ui";

import type { Disposable, FilterableViewModel } from "../types";

/** API page size is clamped to 100 server-side. */
const PAGE = { Page: 1, PageSize: 100 };

const HEALTH_TO_STATUS: Record<SensorHealthStatus, SensorStatus> = {
	[SensorHealthStatus._0]: "active",
	[SensorHealthStatus._1]: "warning",
	[SensorHealthStatus._2]: "error",
	[SensorHealthStatus._3]: "stale",
	[SensorHealthStatus._4]: "offline",
	[SensorHealthStatus._5]: "offline",
};

const KNOWN_TYPES: SensorType[] = ["temperature", "humidity", "co2", "o2", "pressure", "energy"];

function toSensorType(raw: string | null | undefined): SensorType {
	const v = (raw ?? "").toLowerCase() as SensorType;
	return KNOWN_TYPES.includes(v) ? v : "temperature";
}

function itemsOf<T>(data: unknown): T[] {
	return ((data as { items?: T[] | null } | null | undefined)?.items ?? []) as T[];
}

/**
 * ViewModel for the Sensors Configuration page.
 * Manages sensor CRUD operations, filtering, and UI state.
 */
class SensorsConfigViewModel implements Disposable, FilterableViewModel {
	// Real data from the API (sensors/health gives name, site, equipment, last value/seen)
	#healthQuery = getSensorHealthListV1ObservedQuery();
	#sensorsQuery = getAllSensorsV1ObservedQuery();
	#sitesQuery = getAllSitesV1ObservedQuery();
	#equipmentQuery = getAllEquipmentV1ObservedQuery();
	#thresholdsQuery = getAllThresholdsV1ObservedQuery();
	#loaded = false;

	/** Local edits (editor / status toggle) layered over API data until persisted. */
	localOverrides: Record<string, Sensor> = {};
	localAdded: Sensor[] = [];

	// Readonly reference data (static option lists)
	readonly sensorTypeOptions: SensorTypeOption[];
	readonly transformTypeOptions: TransformTypeOption[];

	// Observable state - selection/editing
	selectedSensor: Sensor | null = null;
	editingSensor: Sensor | null = null;
	isEditorOpen = false;
	isDetailsOpen = false;

	// Threshold editor state
	thresholdSensorId: string | null = null;
	editingThreshold: SensorThreshold | null = null;
	isThresholdEditorOpen = false;
	thresholds: SensorThreshold[] = [];

	// Observable state - filters
	searchQuery = "";
	statusFilter = "all";
	typeFilter = "all";
	siteFilter = "all";
	equipmentFilter = "all";

	constructor() {
		makeAutoObservable(this);
		this.sensorTypeOptions = getSensorTypeOptions();
		this.transformTypeOptions = getTransformTypeOptions();
	}

	/** Load (once) all data sources for the page. */
	load = () => {
		if (this.#loaded) return;
		this.#loaded = true;
		this.#healthQuery.load({ query: PAGE });
		this.#sensorsQuery.load({ query: PAGE });
		this.#sitesQuery.load({ query: PAGE });
		this.#equipmentQuery.load({ query: PAGE });
		this.#thresholdsQuery.load({ query: PAGE });
	};

	get isLoading(): boolean {
		return this.#healthQuery.isLoading && this.apiSensors.length === 0;
	}

	get hasError(): boolean {
		return this.#healthQuery.hasError;
	}

	get sites(): Site[] {
		return itemsOf<SiteResponse>(this.#sitesQuery.data).map((s) => ({
			id: s.id ?? "",
			name: s.name ?? "",
			location: [s.city, s.state].filter(Boolean).join(", "),
		}));
	}

	get equipment(): Equipment[] {
		return itemsOf<EquipmentResponse>(this.#equipmentQuery.data).map((e) => ({
			id: e.id ?? "",
			siteId: e.siteId ?? "",
			name: e.name ?? "",
			type: e.equipmentType ?? "",
		}));
	}

	get #thresholdById(): Map<string, ThresholdResponse> {
		return new Map(
			itemsOf<ThresholdResponse>(this.#thresholdsQuery.data).map((t) => [t.id ?? "", t]),
		);
	}

	get #sensorById(): Map<string, SensorResponse> {
		return new Map(itemsOf<SensorResponse>(this.#sensorsQuery.data).map((s) => [s.id ?? "", s]));
	}

	/** Sensors as returned by the API, mapped to the config page model. */
	get apiSensors(): Sensor[] {
		const thresholds = this.#thresholdById;
		const sensorsById = this.#sensorById;
		return itemsOf<SensorHealthListItemResponse>(this.#healthQuery.data).map((h) => {
			const raw = sensorsById.get(h.id ?? "");
			const threshold = raw?.thresholdId ? thresholds.get(raw.thresholdId) : undefined;
			return {
				id: h.id ?? "",
				name: h.name ?? raw?.serial ?? "",
				type: toSensorType(h.sensorType ?? raw?.sensorTypeName),
				siteId: h.siteId ?? "",
				siteName: h.siteName ?? undefined,
				equipmentId: h.equipmentId ?? raw?.equipmentId,
				equipmentName: h.equipmentName ?? raw?.equipmentName ?? undefined,
				value: h.lastValue ?? undefined,
				unit: unitSymbol(h.unit),
				status: h.healthStatus != null ? HEALTH_TO_STATUS[h.healthStatus] : "offline",
				lastSeen: h.lastSeenAt ? new Date(h.lastSeenAt).toISOString() : undefined,
				min: threshold?.min,
				max: threshold?.max,
			} satisfies Sensor;
		});
	}

	/** API sensors with local edits applied, plus locally registered ones. */
	get sensors(): Sensor[] {
		const merged = this.apiSensors.map((s) => this.localOverrides[s.id] ?? s);
		return [...merged, ...this.localAdded].sort(
			(a, b) => (a.siteName ?? "").localeCompare(b.siteName ?? "") || a.name.localeCompare(b.name),
		);
	}

	getEquipmentBySite = (siteId: string): Equipment[] =>
		this.equipment.filter((e) => e.siteId === siteId);

	getUnitForSensorType = (type: SensorType): string => getUnitForSensor(type);

	// Computed: filtered sensors based on all active filters
	get filteredSensors(): Sensor[] {
		return this.sensors.filter((sensor) => {
			// Search filter
			const matchesSearch =
				this.searchQuery === "" ||
				sensor.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				sensor.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				sensor.siteName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				sensor.equipmentName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				sensor.type.toLowerCase().includes(this.searchQuery.toLowerCase());

			// Status filter
			const matchesStatus = this.statusFilter === "all" || sensor.status === this.statusFilter;

			// Type filter
			const matchesType = this.typeFilter === "all" || sensor.type === this.typeFilter;

			// Site filter
			const matchesSite = this.siteFilter === "all" || sensor.siteId === this.siteFilter;

			// Equipment filter
			const matchesEquipment =
				this.equipmentFilter === "all" ||
				(this.equipmentFilter === "unassigned" && !sensor.equipmentId) ||
				sensor.equipmentId === this.equipmentFilter;

			return matchesSearch && matchesStatus && matchesType && matchesSite && matchesEquipment;
		});
	}

	// Computed: check if any filter is active (from FilterableViewModel)
	get hasActiveFilters(): boolean {
		return (
			this.searchQuery !== "" ||
			this.statusFilter !== "all" ||
			this.typeFilter !== "all" ||
			this.siteFilter !== "all" ||
			this.equipmentFilter !== "all"
		);
	}

	// Filter actions
	setSearchQuery = (query: string) => {
		this.searchQuery = query;
	};

	setStatusFilter = (status: string) => {
		this.statusFilter = status;
	};

	setTypeFilter = (type: string) => {
		this.typeFilter = type;
	};

	setSiteFilter = (site: string) => {
		this.siteFilter = site;
	};

	setEquipmentFilter = (equipment: string) => {
		this.equipmentFilter = equipment;
	};

	clearFilters = () => {
		this.searchQuery = "";
		this.statusFilter = "all";
		this.typeFilter = "all";
		this.siteFilter = "all";
		this.equipmentFilter = "all";
	};

	// CRUD actions
	openEditor = (sensor: Sensor | null) => {
		this.editingSensor = sensor;
		this.isEditorOpen = true;
	};

	closeEditor = () => {
		this.isEditorOpen = false;
		this.editingSensor = null;
	};

	viewDetails = (sensor: Sensor) => {
		this.selectedSensor = sensor;
		this.isDetailsOpen = true;
	};

	closeDetails = () => {
		this.isDetailsOpen = false;
	};

	saveSensor = (sensor: Sensor) => {
		const withNames: Sensor = {
			...sensor,
			siteName: sensor.siteName ?? this.sites.find((s) => s.id === sensor.siteId)?.name,
			equipmentName:
				sensor.equipmentName ?? this.equipment.find((e) => e.id === sensor.equipmentId)?.name,
		};
		if (this.editingSensor) {
			// Update existing sensor
			if (this.localAdded.some((s) => s.id === sensor.id)) {
				this.localAdded = this.localAdded.map((s) => (s.id === sensor.id ? withNames : s));
			} else {
				this.localOverrides = { ...this.localOverrides, [sensor.id]: withNames };
			}
		} else {
			// Create new sensor
			this.localAdded = [...this.localAdded, withNames];
		}
		this.closeEditor();
	};

	// Threshold actions — always opens in create mode (backend creates a new record each time)
	openThresholdEditor = (sensor: Sensor) => {
		this.thresholdSensorId = sensor.id;
		this.editingThreshold = null;
		this.isThresholdEditorOpen = true;
	};

	closeThresholdEditor = () => {
		this.isThresholdEditorOpen = false;
		this.thresholdSensorId = null;
		this.editingThreshold = null;
	};

	saveThreshold = (threshold: SensorThreshold) => {
		this.thresholds = [...this.thresholds, threshold];
		this.closeThresholdEditor();
	};

	toggleSensorStatus = (id: string, status: string) => {
		const current = this.sensors.find((s) => s.id === id);
		if (current) {
			const updated = { ...current, status: status as SensorStatus };
			if (this.localAdded.some((s) => s.id === id)) {
				this.localAdded = this.localAdded.map((s) => (s.id === id ? updated : s));
			} else {
				this.localOverrides = { ...this.localOverrides, [id]: updated };
			}
		}
		// Also update selected sensor if viewing details
		if (this.selectedSensor?.id === id) {
			this.selectedSensor = { ...this.selectedSensor, status: status as SensorStatus };
		}
	};

	dispose() {
		// No subscriptions to clean up currently
	}
}

export const sensorsConfigViewModel = new SensorsConfigViewModel();

export function useSensorsConfigViewModel() {
	sensorsConfigViewModel.load();
	return sensorsConfigViewModel;
}
