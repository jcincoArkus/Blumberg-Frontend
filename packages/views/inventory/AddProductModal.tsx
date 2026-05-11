import { useState } from "react";

import { t } from "~@/i18n/macro";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~@/ui";
import { useInventoryViewModel } from "~@/view-model";

interface AddProductModalProps {
	open: boolean;
	onClose: () => void;
}

export function AddProductModal({ open, onClose }: AddProductModalProps) {
	const vm = useInventoryViewModel();

	const [name, setName] = useState("");
	const [sku, setSku] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [unit, setUnit] = useState<"kg" | "unit" | "box">("kg");
	const [kgPerBox, setKgPerBox] = useState("");
	const [shelfLifeDays, setShelfLifeDays] = useState("");
	const [price, setPrice] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const reset = () => {
		setName("");
		setSku("");
		setCategoryId("");
		setUnit("kg");
		setKgPerBox("");
		setShelfLifeDays("");
		setPrice("");
		setError(null);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleSubmit = async () => {
		if (!name.trim() || !sku.trim() || !categoryId || !shelfLifeDays || !price) {
			setError(t`Please fill in all required fields.`);
			return;
		}
		if (unit === "box" && !kgPerBox) {
			setError(t`kg per box is required when unit is box.`);
			return;
		}
		setSaving(true);
		setError(null);
		try {
			await vm.createProductMutation.mutateAsync({
				body: {
					name: name.trim(),
					sku: sku.trim(),
					categoryId,
					unit,
					kgPerBox: unit === "box" ? Number(kgPerBox) : null,
					shelfLifeDays: Number(shelfLifeDays),
					price: Number(price),
				},
			});
			await vm.refreshProducts();
			handleClose();
		} catch {
			setError(t`Failed to save product. Please try again.`);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{t`Add Product`}</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ap-name">
							{t`Name`} <span className="text-red-600">*</span>
						</label>
						<input
							id="ap-name"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							placeholder={t`e.g. Mango Ataulfo`}
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ap-sku">
							{t`SKU`} <span className="text-red-600">*</span>
						</label>
						<input
							id="ap-sku"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							placeholder={t`e.g. MNG-001`}
							value={sku}
							onChange={(e) => setSku(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ap-category">
							{t`Category`} <span className="text-red-600">*</span>
						</label>
						<select
							id="ap-category"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							value={categoryId}
							onChange={(e) => setCategoryId(e.target.value)}
						>
							<option value="">{t`Select category…`}</option>
							{vm.categories.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ap-unit">
							{t`Unit`} <span className="text-red-600">*</span>
						</label>
						<select
							id="ap-unit"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							value={unit}
							onChange={(e) => setUnit(e.target.value as "kg" | "unit" | "box")}
						>
							<option value="kg">kg</option>
							<option value="unit">{t`unit`}</option>
							<option value="box">{t`box`}</option>
						</select>
					</div>
					{unit === "box" && (
						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1.5"
								htmlFor="ap-kgperbox"
							>
								{t`kg per box`} <span className="text-red-600">*</span>
							</label>
							<input
								id="ap-kgperbox"
								className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
								type="number"
								min="0.01"
								step="0.01"
								placeholder="18.00"
								value={kgPerBox}
								onChange={(e) => setKgPerBox(e.target.value)}
							/>
						</div>
					)}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ap-shelf">
							{t`Shelf life (days)`} <span className="text-red-600">*</span>
						</label>
						<input
							id="ap-shelf"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							type="number"
							min="1"
							step="1"
							placeholder="14"
							value={shelfLifeDays}
							onChange={(e) => setShelfLifeDays(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ap-price">
							{t`Price (MXN / unit)`} <span className="text-red-600">*</span>
						</label>
						<input
							id="ap-price"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							type="number"
							min="0"
							step="0.01"
							placeholder="0.00"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
						/>
					</div>
				</div>

				{error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

				<DialogFooter>
					<Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
						{t`Cancel`}
					</Button>
					<Button type="button" onClick={() => void handleSubmit()} disabled={saving}>
						{saving ? t`Saving…` : t`Save product`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
