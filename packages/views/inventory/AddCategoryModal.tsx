import { useState } from "react";

import { t } from "~@/i18n/macro";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~@/ui";
import { useInventoryViewModel } from "~@/view-model";

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

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ac-name">
							{t`Name`} <span className="text-red-600">*</span>
						</label>
						<input
							id="ac-name"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							placeholder={t`e.g. Citrus`}
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-3">{t`Color`}</label>
						<div className="flex items-center gap-2.5 flex-wrap">
							{PRESET_COLORS.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => setColor(c)}
									className="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110"
									style={{
										background: c,
										border: color === c ? "3px solid #1a1f2e" : "2px solid transparent",
										outline: color === c ? "2px solid #fff" : "none",
										outlineOffset: -4,
										boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)",
									}}
									aria-label={c}
								/>
							))}
							<input
								type="color"
								value={color}
								onChange={(e) => setColor(e.target.value)}
								className="w-7 h-7 rounded-full border border-gray-200 cursor-pointer"
								title={t`Custom color`}
							/>
						</div>
						<div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
							<span
								className="w-3.5 h-3.5 rounded-full flex-shrink-0"
								style={{
									background: color,
									boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)",
								}}
							/>
							<span>{color}</span>
						</div>
					</div>

					{error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
						{t`Cancel`}
					</Button>
					<Button type="button" onClick={() => void handleSubmit()} disabled={saving}>
						{saving ? t`Saving…` : t`Save category`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
