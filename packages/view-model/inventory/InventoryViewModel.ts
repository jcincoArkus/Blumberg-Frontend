import type {
	InventoryCategoryResponse,
	InventoryLotResponse,
	InventoryMovementResponse,
	InventoryProductResponse,
	InventorySiteResponse,
	InventorySiteZoneResponse,
} from "~@/api";
import {
	createIntakeShipmentV1ObservedMutation,
	createInventoryCategoryV1ObservedMutation,
	createInventoryProductV1ObservedMutation,
	createShipmentLineV1ObservedMutation,
	getInventoryCategoriesV1ObservedQuery,
	getInventoryLotsV1ObservedQuery,
	getInventoryMovementsV1ObservedQuery,
	getInventoryProductsV1ObservedQuery,
	getInventorySitesV1ObservedQuery,
	getInventorySiteZonesV1ObservedQuery,
} from "~@/api";
import { makeAutoObservable } from "~@/mobx";

import type { Disposable } from "../types";

const PAGE_SIZE = 500;

// Domain types that mirror packages/views/inventory/data.ts shapes
export type InvCategory = { id: string; name: string; color: string };
export type InvProduct = {
	id: string;
	sku: string;
	name: string;
	cat: string;
	unit: "kg" | "unit" | "box";
	kgPerBox: number | null;
	shelfLife: number;
	price: number;
};
export type InvSite = { id: string; name: string; zones: string[] };
export type InvLot = {
	id: string;
	productId: string;
	qty: number;
	unit: "kg" | "unit";
	entry: Date;
	exp: Date;
	siteId: string;
	zone: string;
	supplier: string;
	costPerUnit: number;
};
export type InvMovementType = "intake" | "output" | "waste" | "adjustment" | "transfer";
export type InvMovement = {
	id: string;
	type: InvMovementType;
	at: Date;
	productId: string;
	qty: number;
	unit: "kg" | "unit";
	lotId: string;
	siteId: string;
	by: string;
	note: string;
};

function mapCategory(r: InventoryCategoryResponse): InvCategory {
	return {
		id: r.id ?? "",
		name: r.name ?? "",
		color: r.color ?? "#e8eef3",
	};
}

function mapProduct(r: InventoryProductResponse): InvProduct {
	const unit = (r.unit ?? "kg") as "kg" | "unit" | "box";
	return {
		id: r.id ?? "",
		sku: r.sku ?? "",
		name: r.name ?? "",
		cat: r.categoryId ?? "",
		unit,
		kgPerBox: r.kgPerBox ?? null,
		shelfLife: r.shelfLifeDays ?? 7,
		price: r.price ?? 0,
	};
}

function mapSite(r: InventorySiteResponse, zones: InventorySiteZoneResponse[]): InvSite {
	const siteZones = zones.filter((z) => z.siteId === r.id).map((z) => z.name ?? "");
	return {
		id: r.id ?? "",
		name: r.name ?? "",
		zones: siteZones,
	};
}

function mapLot(r: InventoryLotResponse): InvLot {
	const unit = ((r.unit ?? "kg") === "kg" ? "kg" : "unit") as "kg" | "unit";
	return {
		id: r.lotCode ?? "",
		productId: r.productId ?? "",
		qty: r.qty ?? 0,
		unit,
		entry: r.entryAt ?? new Date(),
		exp: r.expiresAt ?? new Date(),
		siteId: r.siteId ?? "",
		zone: r.zone ?? "",
		supplier: r.supplierName ?? "",
		costPerUnit: r.costPerUnit ?? 0,
	};
}

function mapMovement(r: InventoryMovementResponse): InvMovement {
	const validTypes = new Set<string>(["intake", "output", "waste", "adjustment", "transfer"]);
	const type = validTypes.has(r.type ?? "") ? (r.type as InvMovementType) : "adjustment";
	const unit = ((r.unit ?? "kg") === "kg" ? "kg" : "unit") as "kg" | "unit";
	return {
		id: r.id ?? "",
		type,
		at: r.occurredAt ?? new Date(),
		productId: r.productId ?? "",
		qty: r.qty ?? 0,
		unit,
		lotId: r.lotCode ?? "",
		siteId: r.siteId ?? "",
		by: r.performedBy ?? "",
		note: r.note ?? "",
	};
}

class InventoryViewModel implements Disposable {
	#hasLoaded = false;
	#categoriesQuery = getInventoryCategoriesV1ObservedQuery({
		query: { Page: 1, PageSize: PAGE_SIZE },
	});
	#productsQuery = getInventoryProductsV1ObservedQuery({
		query: { Page: 1, PageSize: PAGE_SIZE },
	});
	#sitesQuery = getInventorySitesV1ObservedQuery({
		query: { Page: 1, PageSize: PAGE_SIZE },
	});
	#zonesQuery = getInventorySiteZonesV1ObservedQuery({
		query: { Page: 1, PageSize: PAGE_SIZE },
	});
	#lotsQuery = getInventoryLotsV1ObservedQuery({
		query: { Page: 1, PageSize: PAGE_SIZE },
	});
	#movementsQuery = getInventoryMovementsV1ObservedQuery({
		query: { Page: 1, PageSize: PAGE_SIZE },
	});

	createShipmentMutation = createIntakeShipmentV1ObservedMutation();
	createLineMutation = createShipmentLineV1ObservedMutation();
	createProductMutation = createInventoryProductV1ObservedMutation();
	createCategoryMutation = createInventoryCategoryV1ObservedMutation();

	constructor() {
		makeAutoObservable(this);
	}

	load = () => {
		if (this.#hasLoaded) return;
		this.#hasLoaded = true;
		this.#categoriesQuery.load();
		this.#productsQuery.load();
		this.#sitesQuery.load();
		this.#zonesQuery.load();
		this.#lotsQuery.load();
		this.#movementsQuery.load();
	};

	get isLoading(): boolean {
		return (
			this.#categoriesQuery.isLoading ||
			this.#productsQuery.isLoading ||
			this.#sitesQuery.isLoading ||
			this.#lotsQuery.isLoading ||
			this.#movementsQuery.isLoading
		);
	}

	get categories(): InvCategory[] {
		return (this.#categoriesQuery.data?.items ?? []).map(mapCategory);
	}

	get products(): InvProduct[] {
		return (this.#productsQuery.data?.items ?? []).map(mapProduct);
	}

	get sites(): InvSite[] {
		const zones = this.#zonesQuery.data?.items ?? [];
		return (this.#sitesQuery.data?.items ?? []).map((s) => mapSite(s, zones));
	}

	get lots(): InvLot[] {
		return (this.#lotsQuery.data?.items ?? []).map(mapLot);
	}

	get movements(): InvMovement[] {
		return (this.#movementsQuery.data?.items ?? []).map(mapMovement);
	}

	get categoryMap(): Map<string, InvCategory> {
		return new Map(this.categories.map((c) => [c.id, c]));
	}

	get productMap(): Map<string, InvProduct> {
		return new Map(this.products.map((p) => [p.id, p]));
	}

	get siteMap(): Map<string, InvSite> {
		return new Map(this.sites.map((s) => [s.id, s]));
	}

	categoryById = (id: string): InvCategory => {
		return this.categoryMap.get(id) ?? { id, name: "—", color: "#e8eef3" };
	};

	productById = (id: string): InvProduct => {
		return (
			this.productMap.get(id) ?? {
				id,
				sku: "—",
				name: "—",
				cat: "",
				unit: "kg",
				kgPerBox: null,
				shelfLife: 7,
				price: 0,
			}
		);
	};

	siteById = (id: string): InvSite => {
		return this.siteMap.get(id) ?? { id, name: "—", zones: [] };
	};

	refresh = async () => {
		this.#lotsQuery.invalidate();
		this.#movementsQuery.invalidate();
		await Promise.all([this.#lotsQuery.refetch(), this.#movementsQuery.refetch()]);
	};

	refreshProducts = async () => {
		this.#productsQuery.invalidate();
		await this.#productsQuery.refetch();
	};

	refreshCategories = async () => {
		this.#categoriesQuery.invalidate();
		await this.#categoriesQuery.refetch();
	};

	dispose() {
		this.#categoriesQuery.dispose();
		this.#productsQuery.dispose();
		this.#sitesQuery.dispose();
		this.#zonesQuery.dispose();
		this.#lotsQuery.dispose();
		this.#movementsQuery.dispose();
		this.#hasLoaded = false;
	}
}

export const inventoryViewModel = new InventoryViewModel();

export function useInventoryViewModel() {
	inventoryViewModel.load();
	return inventoryViewModel;
}
