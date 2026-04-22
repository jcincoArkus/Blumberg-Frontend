import { makeAutoObservable } from "~@/mobx";
import { dashboardSensors } from "~@/mock-data";
import type { Domain, Sensor } from "~@/views";

// Type for sensors with domain filtering capability
interface DashboardSensor extends Sensor {
	type: string;
}

// Domain to sensor type mapping
const DOMAIN_TYPES: Record<string, string[]> = {
	Energy: ["energy"],
	Climate: ["temperature", "humidity", "co2"],
	Refrigeration: ["temperature", "pressure"],
	Equipment: ["temperature", "humidity", "co2", "pressure", "energy"],
};

/**
 * Singleton ViewModel for Sensors data.
 * Will use hey-api ObservedQuery when endpoints are ready.
 * Currently uses mock data.
 */
class SensorsViewModel {
	// TODO: Replace with ObservedQuery when hey-api endpoint is ready
	// sensorsQuery = new ObservedQuery(getSensorsQuery, {});
	private readonly _sensors: DashboardSensor[];

	// Observable state for domain filtering
	activeDomain: Domain = "All";

	constructor() {
		makeAutoObservable(this);
		this._sensors = dashboardSensors as DashboardSensor[];
	}

	/**
	 * Set active domain filter
	 */
	setActiveDomain = (domain: Domain) => {
		this.activeDomain = domain;
	};

	/**
	 * Get all sensors (unfiltered)
	 */
	get allSensors(): DashboardSensor[] {
		// return this.sensorsQuery.data ?? [];
		return this._sensors;
	}

	/**
	 * Get sensors filtered by active domain
	 */
	get sensors(): DashboardSensor[] {
		if (this.activeDomain === "All") return this.allSensors;
		const types = DOMAIN_TYPES[this.activeDomain] ?? [];
		return this.allSensors.filter((s) => types.includes(s.type));
	}

	/**
	 * Get online sensors count
	 */
	get sensorsOnline(): number {
		return this.sensors.filter((s) => s.status === "active").length;
	}

	/**
	 * Get offline sensors
	 */
	get offlineSensors(): DashboardSensor[] {
		return this.sensors.filter((s) => s.status === "offline");
	}

	/**
	 * Get stale sensors
	 */
	get staleSensors(): DashboardSensor[] {
		return this.sensors.filter((s) => s.status === "stale");
	}

	/**
	 * Get flapping sensors (warning status)
	 */
	get flappingSensors(): DashboardSensor[] {
		return this.sensors.filter((s) => s.status === "warning");
	}

	/**
	 * Get sensor reliability metrics
	 */
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

	/**
	 * Load sensors from API
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// load = () => {
	// 	this.sensorsQuery.load();
	// };

	/**
	 * Dispose of resources
	 * TODO: Uncomment when hey-api endpoint is ready
	 */
	// dispose = () => {
	// 	this.sensorsQuery.dispose();
	// };
}

// Export singleton instance
export const sensorsViewModel = new SensorsViewModel();

export function useSensorsViewModel() {
	return sensorsViewModel;
}
