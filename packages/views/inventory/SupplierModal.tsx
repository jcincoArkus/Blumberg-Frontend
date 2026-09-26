import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { t } from "~@/i18n/macro";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~@/ui";
import type { InvSupplier } from "~@/view-model";
import { useInventoryViewModel } from "~@/view-model";

import type { SiteCoords } from "./SiteMap";

interface SupplierModalProps {
	open: boolean;
	onClose: () => void;
	supplier?: InvSupplier;
	/** Pre-filled from a map click when adding a new supplier. */
	initialCoords?: SiteCoords;
	/** City, State resolved via reverse geocoding. */
	suggestedName?: string;
}

export function SupplierModal({
	open,
	onClose,
	supplier,
	initialCoords,
	suggestedName,
}: SupplierModalProps) {
	const vm = useInventoryViewModel();
	const isEdit = supplier != null;

	const [name, setName] = useState("");
	const [coords, setCoords] = useState<SiteCoords | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setName(supplier?.name ?? suggestedName ?? "");
			setCoords(
				initialCoords ??
					(supplier?.lat != null && supplier?.lng != null
						? { lat: supplier.lat, lng: supplier.lng }
						: null),
			);
			setError(null);
		}
	}, [open, supplier, initialCoords, suggestedName]);

	const handleClose = () => {
		setName("");
		setCoords(null);
		setError(null);
		onClose();
	};

	const handleSubmit = async () => {
		if (!name.trim()) {
			setError(t`Supplier name is required.`);
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const body = {
				name: name.trim(),
				latitude: coords?.lat ?? null,
				longitude: coords?.lng ?? null,
			};
			if (isEdit) {
				await vm.updateSupplierMutation.mutateAsync({
					path: { id: supplier.id },
					body,
				});
			} else {
				await vm.createSupplierMutation.mutateAsync({ body });
			}
			await vm.refreshSuppliers();
			handleClose();
		} catch {
			setError(t`Failed to save supplier. Please try again.`);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-sm">
				<div className="inventory-module">
					<DialogHeader>
						<DialogTitle>{isEdit ? t`Edit Supplier` : t`Add Supplier`}</DialogTitle>
					</DialogHeader>

					<div className="space-y-4 mt-4">
						<div>
							<label
								className="block text-sm font-medium text-foreground/85 mb-1.5"
								htmlFor="supm-name"
							>
								{t`Name`} <span className="text-danger">*</span>
							</label>
							<input
								id="supm-name"
								className="h-8 px-3 rounded border border-input bg-card text-foreground text-sm w-full outline-none focus:border-ring"
								placeholder={t`e.g. Frutas del Campo S.A.`}
								value={name}
								onChange={(e) => setName(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
								// biome-ignore lint/a11y/noAutofocus: dialog should focus name immediately
								autoFocus
							/>
						</div>

						{coords && (
							<div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-warning-subtle border border-warning-border">
								<MapPin size={13} className="text-warning-foreground flex-shrink-0" />
								<span className="text-xs text-warning-foreground">
									<span className="font-mono">
										{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
									</span>
								</span>
								<button
									type="button"
									className="ml-auto text-xs text-muted-foreground hover:text-foreground"
									onClick={() => setCoords(null)}
								>
									{t`Clear`}
								</button>
							</div>
						)}

						{error && (
							<div className="p-3 rounded bg-danger-subtle text-danger-foreground text-sm">
								{error}
							</div>
						)}
					</div>

					<DialogFooter className="mt-4">
						<Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
							{t`Cancel`}
						</Button>
						<Button type="button" onClick={() => void handleSubmit()} disabled={saving}>
							{saving ? t`Saving…` : isEdit ? t`Save changes` : t`Add supplier`}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
