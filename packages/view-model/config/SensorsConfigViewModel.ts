import { makeAutoObservable } from "~@/mobx";
import type { ConfigEquipment, ConfigSensor, ConfigSensorStatus, ConfigSite } from "~@/views";

import type { Disposable, FilterableViewModel } from "../types";

interface SensorsConfigViewModelData {
	sensors: ConfigSensor[];
	sites: ConfigSite[];
	equipment: ConfigEquipment[];
}

/**
 * ViewModel for the Sensors Configuration page.
 * Manages sensor CRUD operations, filtering, and UI state.
 */
export class SensorsConfigViewModel implements Disposable, FilterableViewModel {
	// Observable state - data
	sensors: ConfigSensor[];

	// Readonly reference data
	readonly sites: ConfigSite[];
	readonly equipment: ConfigEquipment[];

	// Observable state - selection/editing
	selectedSensor: ConfigSensor | null = null;
	editingSensor: ConfigSensor | null = null;
	isEditorOpen = false;
	isDetailsOpen = false;

	// Observable state - filters
	searchQuery = "";
	statusFilter = "all";
	typeFilter = "all";
	siteFilter = "all";
	equipmentFilter = "all";

	constructor(data: SensorsConfigViewModelData) {
		makeAutoObservable(this);
		this.sensors = data.sensors;
		this.sites = data.sites;
		this.equipment = data.equipment;
	}

	// Computed: filtered sensors based on all active filters
	get filteredSensors(): ConfigSensor[] {
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
	openEditor = (sensor: ConfigSensor | null) => {
		this.editingSensor = sensor;
		this.isEditorOpen = true;
	};

	closeEditor = () => {
		this.isEditorOpen = false;
		this.editingSensor = null;
	};

	viewDetails = (sensor: ConfigSensor) => {
		this.selectedSensor = sensor;
		this.isDetailsOpen = true;
	};

	closeDetails = () => {
		this.isDetailsOpen = false;
	};

	saveSensor = (sensor: ConfigSensor) => {
		if (this.editingSensor) {
			// Update existing sensor
			this.sensors = this.sensors.map((s) => (s.id === sensor.id ? sensor : s));
		} else {
			// Create new sensor
			this.sensors = [...this.sensors, sensor];
		}
		this.closeEditor();
	};

	toggleSensorStatus = (id: string, status: string) => {
		this.sensors = this.sensors.map((s) =>
			s.id === id ? { ...s, status: status as ConfigSensorStatus } : s,
		);
		// Also update selected sensor if viewing details
		if (this.selectedSensor?.id === id) {
			this.selectedSensor = { ...this.selectedSensor, status: status as ConfigSensorStatus };
		}
	};

	dispose() {
		// No subscriptions to clean up currently
	}
}
