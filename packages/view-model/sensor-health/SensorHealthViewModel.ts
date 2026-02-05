import { makeAutoObservable } from "~@/mobx";
import {
	siteEquipment as equipment,
	getSiteDataById,
	siteSensors,
	siteData as sites,
} from "~@/mock-data";

export class SensorHealthViewModel {
	statusFilter = "all";
	siteFilter = "all";
	typeFilter = "all";

	constructor() {
		makeAutoObservable(this);
	}

	get enrichedSensors() {
		return siteSensors.map((sensor) => {
			const eq = equipment.find((entry) => entry.id === sensor.equipmentId);
			const site = getSiteDataById(sensor.siteId);

			const typeConfig: Record<string, { value: number; unit: string }> = {
				temperature: { value: Math.round((Math.random() * 30 - 10) * 10) / 10, unit: "°C" },
				humidity: { value: Math.round(Math.random() * 60 + 30), unit: "%" },
				energy: { value: Math.round(Math.random() * 15 * 10) / 10, unit: "kW" },
				pressure: { value: Math.round(Math.random() * 50 + 100), unit: "PSI" },
			};

			const config = typeConfig[sensor.type] || { value: 0, unit: "" };

			return {
				...sensor,
				equipmentName: eq?.name || "Unknown",
				siteName: site?.name || "Unknown",
				value: config.value,
				unit: config.unit,
				batteryLevel: Math.round(Math.random() * 60 + 40),
				lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
			};
		});
	}

	get filteredSensors() {
		return this.enrichedSensors.filter((sensor) => {
			if (this.statusFilter !== "all" && sensor.status !== this.statusFilter) return false;
			if (this.siteFilter !== "all" && sensor.siteId !== this.siteFilter) return false;
			if (this.typeFilter !== "all" && sensor.type !== this.typeFilter) return false;
			return true;
		});
	}

	get stats() {
		const total = this.enrichedSensors.length;
		const active = this.enrichedSensors.filter((sensor) => sensor.status === "active").length;
		const offline = this.enrichedSensors.filter(
			(sensor) => sensor.status === "offline" || sensor.status === "stale",
		).length;
		const warning = this.enrichedSensors.filter((sensor) => sensor.status === "warning").length;
		const error = this.enrichedSensors.filter((sensor) => sensor.status === "error").length;

		return {
			total,
			active,
			offline,
			warning,
			error,
			activePercent: total > 0 ? Math.round((active / total) * 100) : 0,
		};
	}

	get sensorTypes() {
		return [...new Set(this.enrichedSensors.map((sensor) => sensor.type))];
	}

	setStatusFilter = (value: string) => {
		this.statusFilter = value;
	};

	setSiteFilter = (value: string) => {
		this.siteFilter = value;
	};

	setTypeFilter = (value: string) => {
		this.typeFilter = value;
	};

	get sites() {
		return sites;
	}

	dispose() {
		// No subscriptions to clean up.
	}
}

export const sensorHealthViewModel = new SensorHealthViewModel();

export function useSensorHealthViewModel() {
	return sensorHealthViewModel;
}
