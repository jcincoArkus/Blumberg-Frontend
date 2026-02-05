import { makeAutoObservable } from "~@/mobx";
import {
	getAllIngestionRuns,
	getIngestionRunsLast24h,
	ingestionRuns,
	siteSensors,
} from "~@/mock-data";
import type { IngestionRun } from "~@/views";

export class IngestionViewModel {
	activeTab: "api" | "csv" = "api";
	refreshKey = 0;

	constructor() {
		makeAutoObservable(this);
	}

	get validSensorIds(): string[] {
		return siteSensors.map((sensor) => sensor.id);
	}

	get allRuns(): IngestionRun[] {
		return getAllIngestionRuns();
	}

	get apiRuns24h(): IngestionRun[] {
		return getIngestionRunsLast24h().filter((run) => run.source === "api");
	}

	setActiveTab = (tab: "api" | "csv") => {
		this.activeTab = tab;
	};

	handleIngestionComplete = (run: IngestionRun) => {
		ingestionRuns.unshift(run);
		this.refreshKey += 1;
	};

	dispose() {
		// No subscriptions to clean up.
	}
}

export const ingestionViewModel = new IngestionViewModel();

export function useIngestionViewModel() {
	return ingestionViewModel;
}
