import type { SensorRequest, SensorResponse } from "~@/api";
import {
	createSensorV1ObservedMutation,
	getSensorByIdV1ObservedQuery,
	updateSensorV1ObservedMutation,
} from "~@/api";
import { makeAutoObservable } from "~@/mobx";
import { queryClient } from "~@/query-client";

const SENSORS_LIST_QUERY_ID = "getAllSensorsV1";
const SENSOR_DETAIL_QUERY_ID = "getSensorByIdV1";

const sensorQueryPredicate = (query: { queryKey: unknown[] }) => {
	const first = query.queryKey[0] as { _id?: string } | undefined;
	return first?._id === SENSORS_LIST_QUERY_ID || first?._id === SENSOR_DETAIL_QUERY_ID;
};

function invalidateSensorQueries(): void {
	queryClient.invalidateQueries({ predicate: sensorQueryPredicate });
}

function refetchSensorQueries(): Promise<void> {
	return queryClient.refetchQueries({ predicate: sensorQueryPredicate });
}

class SensorViewModel {
	#detailQuery = getSensorByIdV1ObservedQuery();
	#createMutation = createSensorV1ObservedMutation();
	#updateMutation = updateSensorV1ObservedMutation();

	constructor() {
		makeAutoObservable(this);
	}

	get sensor(): SensorResponse | null {
		return this.#detailQuery.data ?? null;
	}

	get isLoading(): boolean {
		return this.#detailQuery.isLoading;
	}

	get hasError(): boolean {
		return this.#detailQuery.hasError;
	}

	get error(): Error | null {
		return this.#detailQuery.error ?? null;
	}

	get isSaving(): boolean {
		return this.#createMutation.isPending || this.#updateMutation.isPending;
	}

	loadSensor = async (sensorId: string): Promise<void> => {
		await this.#detailQuery.loadAsync({ path: { id: sensorId } });
	};

	createSensor = async (body: SensorRequest): Promise<SensorResponse | null> => {
		const result = await this.#createMutation.mutateAsync({ body });
		if (result != null) {
			invalidateSensorQueries();
			await refetchSensorQueries();
		}
		return result ?? null;
	};

	updateSensor = async (sensorId: string, body: SensorRequest): Promise<SensorResponse | null> => {
		const result = await this.#updateMutation.mutateAsync({
			path: { id: sensorId },
			body,
		});
		if (result != null) {
			invalidateSensorQueries();
			await refetchSensorQueries();
		}
		return result ?? null;
	};

	dispose = (): void => {
		this.#detailQuery.dispose();
	};
}

export const sensorViewModel = new SensorViewModel();

export function useSensorViewModel() {
	return sensorViewModel;
}
