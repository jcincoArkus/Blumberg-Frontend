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
import {
	getEquipment,
	getEquipmentBySiteId,
	getSensors,
	getSensorTypeOptions,
	getSites,
	getTransformTypeOptions,
	getUnitForSensor,
} from "~@/models";

import type { Disposable, FilterableViewModel } from "../types";

/**
 * ViewModel for the Sensors Configuration page.
 * Manages sensor CRUD operations, filtering, and UI state.
 */
class SensorsConfigViewModel implements Disposable, FilterableViewModel {
	// Observable state - data
	sensors: Sensor[];

	// Readonly reference data
	readonly sites: Site[];
	readonly equipment: Equipment[];
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
		this.sensors = getSensors();
		this.sites = getSites();
		this.equipment = getEquipment();
		this.sensorTypeOptions = getSensorTypeOptions();
		this.transformTypeOptions = getTransformTypeOptions();
	}

	getEquipmentBySite = (siteId: string): Equipment[] => getEquipmentBySiteId(siteId);

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
		if (this.editingSensor) {
			// Update existing sensor
			this.sensors = this.sensors.map((s) => (s.id === sensor.id ? sensor : s));
		} else {
			// Create new sensor
			this.sensors = [...this.sensors, sensor];
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
		this.sensors = this.sensors.map((s) =>
			s.id === id ? { ...s, status: status as SensorStatus } : s,
		);
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
	return sensorsConfigViewModel;
}
