import { useState } from "react";

import { t } from "~@/i18n/macro";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~@/ui";
import { useInventoryViewModel } from "~@/view-model";

import "./inventory.css";

const PRESET_COLORS = [
	"#4a9296",
	"#e67e3e",
	"#7b5ea7",
	"#3a7ebf",
	"#5aab6d",
	"#d4824a",
	"#c45e8a",
	"#7a9e4e",
];

interface AddCategoryModalProps {
	open: boolean;
	onClose: () => void;
}

export function AddCategoryModal({ open, onClose }: AddCategoryModalProps) {
	const vm = useInventoryViewModel();

	const [name, setName] = useState("");
	const [color, setColor] = useState(PRESET_COLORS[0]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const reset = () => {
		setName("");
		setColor(PRESET_COLORS[0]);
		setError(null);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleSubmit = async () => {
		if (!name.trim()) {
			setError(t`Category name is required.`);
			return;
		}
		setSaving(true);
		setError(null);
		try {
			await vm.createCategoryMutation.mutateAsync({
				body: { name: name.trim(), color },
			});
			await vm.refreshCategories();
			handleClose();
		} catch {
			setError(t`Failed to save category. Please try again.`);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{t`Add Category`}</DialogTitle>
					<DialogDescription>{t`Categories group products in the catalog and inventory views.`}</DialogDescription>
				</DialogHeader>

				<div className="inventory-module">
					<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
						<div>
							<label className="label" htmlFor="ac-name">
								{t`Name`} <span style={{ color: "var(--inv-rose-fg)" }}>*</span>
							</label>
							<input
								id="ac-name"
								className="input"
								placeholder={t`e.g. Citrus`}
								value={name}
								onChange={(e) => setName(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
							/>
						</div>

						<div>
							<label className="label">{t`Color`}</label>
							<div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
								{PRESET_COLORS.map((c) => (
									<button
										key={c}
										type="button"
										onClick={() => setColor(c)}
										style={{
											width: 28,
											height: 28,
											borderRadius: "50%",
											background: c,
											border:
												color === c ? "3px solid var(--inv-ink-900)" : "2px solid transparent",
											cursor: "pointer",
											outline: color === c ? "2px solid #fff" : "none",
											outlineOffset: -4,
											boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)",
											transition: "transform 0.1s",
										}}
										aria-label={c}
									/>
								))}
								<input
									type="color"
									value={color}
									onChange={(e) => setColor(e.target.value)}
									style={{
										width: 28,
										height: 28,
										borderRadius: "50%",
										border: "1px solid var(--inv-line)",
										padding: 2,
										cursor: "pointer",
										background: "none",
									}}
									title={t`Custom color`}
								/>
							</div>
							<div
								style={{
									marginTop: 10,
									display: "flex",
									alignItems: "center",
									gap: 8,
									fontSize: 12,
									color: "var(--inv-ink-500)",
								}}
							>
								<span
									style={{
										width: 14,
										height: 14,
										borderRadius: "50%",
										background: color,
										display: "inline-block",
										boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)",
									}}
								/>
								<span>{color}</span>
							</div>
						</div>

						{error && (
							<div
								style={{
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
							{saving ? t`Saving…` : t`Save category`}
						</button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
