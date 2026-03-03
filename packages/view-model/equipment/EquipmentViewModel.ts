import type { EquipmentRequest, EquipmentResponse } from "~@/api";
import {
	createEquipmentV1ObservedMutation,
	getEquipmentByIdV1ObservedQuery,
	updateEquipmentV1ObservedMutation,
} from "~@/api";
import { makeAutoObservable } from "~@/mobx";
import { queryClient } from "~@/query-client";

const EQUIPMENT_LIST_QUERY_ID = "getAllEquipmentV1";
const EQUIPMENT_DETAIL_QUERY_ID = "getEquipmentByIdV1";

const equipmentQueryPredicate = (query: { queryKey: unknown[] }) => {
	const first = query.queryKey[0] as { _id?: string } | undefined;
	return first?._id === EQUIPMENT_LIST_QUERY_ID || first?._id === EQUIPMENT_DETAIL_QUERY_ID;
};

function invalidateEquipmentQueries(): void {
	queryClient.invalidateQueries({ predicate: equipmentQueryPredicate });
}

function refetchEquipmentQueries(): Promise<void> {
	return queryClient.refetchQueries({ predicate: equipmentQueryPredicate });
}

class EquipmentViewModel {
	#detailQuery = getEquipmentByIdV1ObservedQuery();
	#createMutation = createEquipmentV1ObservedMutation();
	#updateMutation = updateEquipmentV1ObservedMutation();

	constructor() {
		makeAutoObservable(this);
	}

	get equipment(): EquipmentResponse | null {
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

	loadEquipment = async (equipmentId: string): Promise<void> => {
		await this.#detailQuery.loadAsync({ path: { id: equipmentId } });
	};

	createEquipment = async (body: EquipmentRequest): Promise<EquipmentResponse | null> => {
		const result = await this.#createMutation.mutateAsync({ body });
		if (result != null) {
			invalidateEquipmentQueries();
			await refetchEquipmentQueries();
		}
		return result ?? null;
	};

	updateEquipment = async (
		equipmentId: string,
		body: EquipmentRequest,
	): Promise<EquipmentResponse | null> => {
		const result = await this.#updateMutation.mutateAsync({
			path: { id: equipmentId },
			body,
		});
		if (result != null) {
			invalidateEquipmentQueries();
			await refetchEquipmentQueries();
		}
		return result ?? null;
	};

	dispose = (): void => {
		this.#detailQuery.dispose();
	};
}

export const equipmentViewModel = new EquipmentViewModel();

export function useEquipmentViewModel() {
	return equipmentViewModel;
}
