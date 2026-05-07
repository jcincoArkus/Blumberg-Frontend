import { useState } from "react";

import { t } from "~@/i18n/macro";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~@/ui";
import { useInventoryViewModel } from "~@/view-model";

import "./inventory.css";

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

				<div className="inventory-module">
					<div className="field-grid" style={{ gap: 14 }}>
						<div>
							<label className="label" htmlFor="ap-name">
								{t`Name`} <span style={{ color: "var(--inv-rose-fg)" }}>*</span>
							</label>
							<input
								id="ap-name"
								className="input"
								placeholder={t`e.g. Mango Ataulfo`}
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div>
							<label className="label" htmlFor="ap-sku">
								{t`SKU`} <span style={{ color: "var(--inv-rose-fg)" }}>*</span>
							</label>
							<input
								id="ap-sku"
								className="input"
								placeholder={t`e.g. MNG-001`}
								value={sku}
								onChange={(e) => setSku(e.target.value)}
							/>
						</div>
						<div>
							<label className="label" htmlFor="ap-category">
								{t`Category`} <span style={{ color: "var(--inv-rose-fg)" }}>*</span>
							</label>
							<select
								id="ap-category"
								className="input"
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
							<label className="label" htmlFor="ap-unit">
								{t`Unit`} <span style={{ color: "var(--inv-rose-fg)" }}>*</span>
							</label>
							<select
								id="ap-unit"
								className="input"
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
								<label className="label" htmlFor="ap-kgperbox">
									{t`kg per box`} <span style={{ color: "var(--inv-rose-fg)" }}>*</span>
								</label>
								<input
									id="ap-kgperbox"
									className="input"
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
							<label className="label" htmlFor="ap-shelf">
								{t`Shelf life (days)`} <span style={{ color: "var(--inv-rose-fg)" }}>*</span>
							</label>
							<input
								id="ap-shelf"
								className="input"
								type="number"
								min="1"
								step="1"
								placeholder="14"
								value={shelfLifeDays}
								onChange={(e) => setShelfLifeDays(e.target.value)}
							/>
						</div>
						<div>
							<label className="label" htmlFor="ap-price">
								{t`Price (MXN / unit)`} <span style={{ color: "var(--inv-rose-fg)" }}>*</span>
							</label>
							<input
								id="ap-price"
								className="input"
								type="number"
								min="0"
								step="0.01"
								placeholder="0.00"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
							/>
						</div>
					</div>

					{error && (
						<div
							style={{
								marginTop: 12,
								padding: "8px 12px",
								borderRadius: 7,
								background: "var(--inv-rose-bg)",
								color: "var(--inv-rose-fg)",
								fontSize: 12,
							}}
						>
							{error}
						</div>
					)}
				</div>

				<DialogFooter>
					<div
						className="inventory-module"
						style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}
					>
						<button type="button" className="btn" onClick={handleClose} disabled={saving}>
							{t`Cancel`}
						</button>
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => void handleSubmit()}
							disabled={saving}
						>
							{saving ? t`Saving…` : t`Save product`}
						</button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
