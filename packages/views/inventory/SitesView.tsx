import { MapPin, Pencil, Plus, Trash2, Truck } from "lucide-react";
import { useCallback, useState } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, cn } from "~@/ui";
import type { InvSite, InvSiteZone, InvSupplier } from "~@/view-model";
import { useInventoryViewModel } from "~@/view-model";

import { type SiteCoords, SiteMap } from "./SiteMap";
import { SiteModal } from "./SiteModal";
import { SupplierModal } from "./SupplierModal";
import { ZoneModal } from "./ZoneModal";

type MapPickMode = "site" | "supplier";

type SiteModalState =
	| { mode: "add"; coords?: SiteCoords; suggestedName?: string }
	| { mode: "edit"; site: InvSite };
type ZoneModalState = { mode: "add" } | { mode: "edit"; zone: InvSiteZone };
type SupplierModalState =
	| { mode: "add"; coords?: SiteCoords; suggestedName?: string }
	| { mode: "edit"; supplier: InvSupplier };

export const SitesView = observer(function SitesView() {
	const vm = useInventoryViewModel();

	// Sites / Zones state
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
	const [siteModal, setSiteModal] = useState<SiteModalState | null>(null);
	const [zoneModal, setZoneModal] = useState<ZoneModalState | null>(null);
	const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
	const [deletingZoneId, setDeletingZoneId] = useState<string | null>(null);
	const [sitesError, setSitesError] = useState<string | null>(null);
	const [pendingMapCoords, setPendingMapCoords] = useState<SiteCoords | null>(null);
	const [mapPickMode, setMapPickMode] = useState<MapPickMode>("site");

	const handleLocationPick = useCallback(
		(coords: SiteCoords, suggestedName?: string) => {
			setPendingMapCoords(coords);
			if (mapPickMode === "supplier") {
				setSupplierModal({ mode: "add", coords, suggestedName });
			} else {
				setSiteModal({ mode: "add", coords, suggestedName });
			}
		},
		[mapPickMode],
	);

	// Suppliers state
	const [supplierModal, setSupplierModal] = useState<SupplierModalState | null>(null);
	const [deletingSupplierId, setDeletingSupplierId] = useState<string | null>(null);
	const [suppliersError, setSuppliersError] = useState<string | null>(null);

	const supplierMarkers = vm.suppliers
		.filter((s) => s.lat != null && s.lng != null)
		.map((s) => ({ id: s.id, name: s.name, coords: { lat: s.lat!, lng: s.lng! } }));

	const selectedSite = vm.sites.find((s) => s.id === selectedSiteId) ?? null;
	const selectedZones = selectedSiteId
		? vm.siteZones.filter((z) => z.siteId === selectedSiteId)
		: [];

	const handleDeleteSite = async (site: InvSite) => {
		setSitesError(null);
		try {
			await vm.deleteSiteMutation.mutateAsync({ path: { id: site.id } });
			await vm.refreshSites();
			if (selectedSiteId === site.id) setSelectedSiteId(null);
		} catch {
			setSitesError(t`Failed to delete site. It may have active lots.`);
		} finally {
			setDeletingSiteId(null);
		}
	};

	const handleDeleteZone = async (zone: InvSiteZone) => {
		setSitesError(null);
		try {
			await vm.deleteZoneMutation.mutateAsync({ path: { id: zone.id } });
			await vm.refreshSites();
		} catch {
			setSitesError(t`Failed to delete zone. It may be in use.`);
		} finally {
			setDeletingZoneId(null);
		}
	};

	const handleDeleteSupplier = async (supplier: InvSupplier) => {
		setSuppliersError(null);
		try {
			await vm.deleteSupplierMutation.mutateAsync({ path: { id: supplier.id } });
			await vm.refreshSuppliers();
		} catch {
			setSuppliersError(t`Failed to delete supplier. It may be linked to active lots.`);
		} finally {
			setDeletingSupplierId(null);
		}
	};

	return (
		<>
			<div className="space-y-8">
				{/* Page header */}
				<div>
					<h1 className="text-xl font-semibold tracking-tight text-gray-900">
						{t`Locations & Suppliers`}
					</h1>
					<p className="text-sm text-gray-600 mt-1">
						{t`Manage warehouse sites, storage zones, and product suppliers`}
					</p>
				</div>

				{/* ── Sites & Zones ── */}
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
							{t`Sites & Zones`}
						</h2>
						<div className="flex-1 h-px bg-gray-200" />
						<div className="flex items-center gap-2">
							<span className="text-xs text-gray-500">{t`Map places:`}</span>
							<button
								type="button"
								onClick={() => setMapPickMode("site")}
								className={cn(
									"flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors",
									mapPickMode === "site"
										? "bg-teal-600 text-white border-teal-600"
										: "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
								)}
							>
								<MapPin size={11} /> {t`Site`}
							</button>
							<button
								type="button"
								onClick={() => setMapPickMode("supplier")}
								className={cn(
									"flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors",
									mapPickMode === "supplier"
										? "bg-amber-500 text-white border-amber-500"
										: "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
								)}
							>
								<Truck size={11} /> {t`Supplier`}
							</button>
						</div>
						<Button size="sm" variant="outline" onClick={() => setSiteModal({ mode: "add" })}>
							<Plus size={14} /> {t`Add site`}
						</Button>
					</div>

					{sitesError && (
						<div className="p-3 rounded bg-red-50 text-red-700 text-sm border border-red-100">
							{sitesError}
						</div>
					)}

					<SiteMap
						onLocationPick={handleLocationPick}
						pendingMarker={siteModal === null && supplierModal === null ? null : pendingMapCoords}
						supplierMarkers={supplierMarkers}
						hint={
							mapPickMode === "supplier"
								? t`Click on the map to place a supplier`
								: t`Click on the map to place a new site`
						}
						className="h-64 border border-gray-200"
					/>

					<div className="flex gap-4 items-start">
						{/* Sites list */}
						<div className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden">
							<div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50">
								<span className="text-xs font-semibold tracking-wide uppercase text-gray-500">
									{t`Sites`}
								</span>
							</div>

							{vm.isLoading ? (
								<div className="p-8 text-center text-gray-400 text-sm">{t`Loading…`}</div>
							) : vm.sites.length === 0 ? (
								<div className="p-8 text-center text-gray-400 text-sm">{t`No sites yet.`}</div>
							) : (
								<ul className="divide-y divide-gray-100">
									{vm.sites.map((site) => {
										const isSelected = site.id === selectedSiteId;
										const isConfirmingDelete = deletingSiteId === site.id;

										return (
											<li key={site.id}>
												{isConfirmingDelete ? (
													<div className="px-3.5 py-3 flex items-center gap-2 bg-red-50">
														<span className="text-sm text-red-700 flex-1">
															{t`Delete`} <strong>{site.name}</strong>?
														</span>
														<button
															type="button"
															className="text-xs font-medium text-red-700 hover:text-red-900 underline"
															onClick={() => void handleDeleteSite(site)}
														>
															{t`Confirm`}
														</button>
														<button
															type="button"
															className="text-xs text-gray-500 hover:text-gray-700"
															onClick={() => setDeletingSiteId(null)}
														>
															{t`Cancel`}
														</button>
													</div>
												) : (
													<button
														type="button"
														onClick={() => setSelectedSiteId(isSelected ? null : site.id)}
														className={cn(
															"w-full text-left px-3.5 py-3 flex items-center gap-3 group transition-colors",
															isSelected
																? "bg-teal-50 border-l-2 border-teal-600"
																: "hover:bg-gray-50 border-l-2 border-transparent",
														)}
													>
														<MapPin
															size={14}
															className={cn(
																"flex-shrink-0",
																isSelected ? "text-teal-600" : "text-gray-400",
															)}
														/>
														<span
															className={cn(
																"flex-1 text-sm font-medium truncate",
																isSelected ? "text-teal-900" : "text-gray-800",
															)}
														>
															{site.name}
														</span>
														<span className="text-xs text-gray-400 font-mono tabular-nums">
															{site.zones.length}
														</span>
														<span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
															<span
																role="button"
																tabIndex={0}
																className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
																onClick={(e) => {
																	e.stopPropagation();
																	setSiteModal({ mode: "edit", site });
																}}
																onKeyDown={(e) => {
																	if (e.key === "Enter") {
																		e.stopPropagation();
																		setSiteModal({ mode: "edit", site });
																	}
																}}
																aria-label={t`Edit site`}
															>
																<Pencil size={12} />
															</span>
															<span
																role="button"
																tabIndex={0}
																className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
																onClick={(e) => {
																	e.stopPropagation();
																	setDeletingSiteId(site.id);
																}}
																onKeyDown={(e) => {
																	if (e.key === "Enter") {
																		e.stopPropagation();
																		setDeletingSiteId(site.id);
																	}
																}}
																aria-label={t`Delete site`}
															>
																<Trash2 size={12} />
															</span>
														</span>
													</button>
												)}
											</li>
										);
									})}
								</ul>
							)}
						</div>

						{/* Zones panel */}
						<div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
							<div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
								<span className="text-xs font-semibold tracking-wide uppercase text-gray-500">
									{selectedSite ? `${selectedSite.name} · ${t`Zones`}` : t`Zones`}
								</span>
								{selectedSite && (
									<Button
										size="sm"
										variant="outline"
										className="ml-auto h-6 text-xs px-2"
										onClick={() => setZoneModal({ mode: "add" })}
									>
										<Plus size={12} /> {t`Add zone`}
									</Button>
								)}
							</div>

							{!selectedSite ? (
								<div className="p-10 text-center text-gray-400 text-sm">
									{t`Select a site to manage its zones.`}
								</div>
							) : selectedZones.length === 0 ? (
								<div className="p-10 text-center text-gray-400 text-sm">
									{t`No zones yet for this site.`}
								</div>
							) : (
								<ul className="divide-y divide-gray-100">
									{selectedZones.map((zone) => {
										const isConfirmingDelete = deletingZoneId === zone.id;

										return (
											<li key={zone.id}>
												{isConfirmingDelete ? (
													<div className="px-3.5 py-3 flex items-center gap-2 bg-red-50">
														<span className="text-sm text-red-700 flex-1">
															{t`Delete`} <strong>{zone.name}</strong>?
														</span>
														<button
															type="button"
															className="text-xs font-medium text-red-700 hover:text-red-900 underline"
															onClick={() => void handleDeleteZone(zone)}
														>
															{t`Confirm`}
														</button>
														<button
															type="button"
															className="text-xs text-gray-500 hover:text-gray-700"
															onClick={() => setDeletingZoneId(null)}
														>
															{t`Cancel`}
														</button>
													</div>
												) : (
													<div className="px-3.5 py-3 flex items-center gap-3 group hover:bg-gray-50">
														<span className="flex-1 text-sm text-gray-800">{zone.name}</span>
														<span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
															<button
																type="button"
																className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
																onClick={() => setZoneModal({ mode: "edit", zone })}
																aria-label={t`Edit zone`}
															>
																<Pencil size={12} />
															</button>
															<button
																type="button"
																className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
																onClick={() => setDeletingZoneId(zone.id)}
																aria-label={t`Delete zone`}
															>
																<Trash2 size={12} />
															</button>
														</span>
													</div>
												)}
											</li>
										);
									})}
								</ul>
							)}
						</div>
					</div>
				</div>

				{/* ── Suppliers ── */}
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
							{t`Suppliers`}
						</h2>
						<div className="flex-1 h-px bg-gray-200" />
						<Button size="sm" variant="outline" onClick={() => setSupplierModal({ mode: "add" })}>
							<Plus size={14} /> {t`Add supplier`}
						</Button>
					</div>

					{suppliersError && (
						<div className="p-3 rounded bg-red-50 text-red-700 text-sm border border-red-100">
							{suppliersError}
						</div>
					)}

					<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
						{vm.isLoading ? (
							<div className="p-8 text-center text-gray-400 text-sm">{t`Loading…`}</div>
						) : vm.suppliers.length === 0 ? (
							<div className="p-8 text-center text-gray-400 text-sm">
								{t`No suppliers yet. Add one to get started.`}
							</div>
						) : (
							<ul className="divide-y divide-gray-100">
								{vm.suppliers.map((supplier) => {
									const isConfirmingDelete = deletingSupplierId === supplier.id;

									return (
										<li key={supplier.id}>
											{isConfirmingDelete ? (
												<div className="px-3.5 py-3 flex items-center gap-2 bg-red-50">
													<span className="text-sm text-red-700 flex-1">
														{t`Delete`} <strong>{supplier.name}</strong>?
													</span>
													<button
														type="button"
														className="text-xs font-medium text-red-700 hover:text-red-900 underline"
														onClick={() => void handleDeleteSupplier(supplier)}
													>
														{t`Confirm`}
													</button>
													<button
														type="button"
														className="text-xs text-gray-500 hover:text-gray-700"
														onClick={() => setDeletingSupplierId(null)}
													>
														{t`Cancel`}
													</button>
												</div>
											) : (
												<div className="px-3.5 py-3 flex items-center gap-3 group hover:bg-gray-50">
													<Truck size={14} className="text-gray-400 flex-shrink-0" />
													<span className="flex-1 text-sm text-gray-800">{supplier.name}</span>
													<span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
														<button
															type="button"
															className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
															onClick={() => setSupplierModal({ mode: "edit", supplier })}
															aria-label={t`Edit supplier`}
														>
															<Pencil size={12} />
														</button>
														<button
															type="button"
															className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
															onClick={() => setDeletingSupplierId(supplier.id)}
															aria-label={t`Delete supplier`}
														>
															<Trash2 size={12} />
														</button>
													</span>
												</div>
											)}
										</li>
									);
								})}
							</ul>
						)}
						<div className="px-3.5 py-2.5 border-t border-gray-100 text-xs text-gray-500 text-right">
							{vm.suppliers.length} {t`suppliers`}
						</div>
					</div>
				</div>
			</div>

			<SiteModal
				open={siteModal !== null}
				onClose={() => {
					setSiteModal(null);
					setPendingMapCoords(null);
				}}
				site={siteModal?.mode === "edit" ? siteModal.site : undefined}
				initialCoords={siteModal?.mode === "add" ? siteModal.coords : undefined}
				suggestedName={siteModal?.mode === "add" ? siteModal.suggestedName : undefined}
			/>

			<ZoneModal
				open={zoneModal !== null}
				onClose={() => setZoneModal(null)}
				siteId={selectedSiteId ?? ""}
				siteName={selectedSite?.name ?? ""}
				zone={zoneModal?.mode === "edit" ? zoneModal.zone : undefined}
			/>

			<SupplierModal
				open={supplierModal !== null}
				onClose={() => {
					setSupplierModal(null);
					setPendingMapCoords(null);
				}}
				supplier={supplierModal?.mode === "edit" ? supplierModal.supplier : undefined}
				initialCoords={supplierModal?.mode === "add" ? supplierModal.coords : undefined}
				suggestedName={supplierModal?.mode === "add" ? supplierModal.suggestedName : undefined}
			/>
		</>
	);
});
