import { useEffect, useState } from "react";

import { t } from "~@/i18n/macro";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~@/ui";
import type { InvSupplier } from "~@/view-model";
import { useInventoryViewModel } from "~@/view-model";

interface SupplierModalProps {
	open: boolean;
	onClose: () => void;
	supplier?: InvSupplier;
}

export function SupplierModal({ open, onClose, supplier }: SupplierModalProps) {
	const vm = useInventoryViewModel();
	const isEdit = supplier != null;

	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setName(supplier?.name ?? "");
			setError(null);
		}
	}, [open, supplier]);

	const handleClose = () => {
		setName("");
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
			if (isEdit) {
				await vm.updateSupplierMutation.mutateAsync({
					path: { id: supplier.id },
					body: { name: name.trim() },
				});
			} else {
				await vm.createSupplierMutation.mutateAsync({
					body: { name: name.trim() },
				});
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
				<DialogHeader>
					<DialogTitle>{isEdit ? t`Edit Supplier` : t`Add Supplier`}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="supm-name">
							{t`Name`} <span className="text-red-600">*</span>
						</label>
						<input
							id="supm-name"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							placeholder={t`e.g. Frutas del Campo S.A.`}
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
						/>
					</div>

					{error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
						{t`Cancel`}
					</Button>
					<Button type="button" onClick={() => void handleSubmit()} disabled={saving}>
						{saving ? t`Saving…` : isEdit ? t`Save changes` : t`Add supplier`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
