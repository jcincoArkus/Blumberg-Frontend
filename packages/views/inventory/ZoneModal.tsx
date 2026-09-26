import { useEffect, useState } from "react";

import { t } from "~@/i18n/macro";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~@/ui";
import type { InvSiteZone } from "~@/view-model";
import { useInventoryViewModel } from "~@/view-model";

interface ZoneModalProps {
	open: boolean;
	onClose: () => void;
	siteId: string;
	siteName: string;
	zone?: InvSiteZone;
}

export function ZoneModal({ open, onClose, siteId, siteName, zone }: ZoneModalProps) {
	const vm = useInventoryViewModel();
	const isEdit = zone != null;

	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setName(zone?.name ?? "");
			setError(null);
		}
	}, [open, zone]);

	const handleClose = () => {
		setName("");
		setError(null);
		onClose();
	};

	const handleSubmit = async () => {
		if (!name.trim()) {
			setError(t`Zone name is required.`);
			return;
		}
		setSaving(true);
		setError(null);
		try {
			if (isEdit) {
				await vm.updateZoneMutation.mutateAsync({
					path: { id: zone.id },
					body: { siteId, name: name.trim() },
				});
			} else {
				await vm.createZoneMutation.mutateAsync({
					body: { siteId, name: name.trim() },
				});
			}
			await vm.refreshSites();
			handleClose();
		} catch {
			setError(t`Failed to save zone. Please try again.`);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{isEdit ? t`Edit Zone` : t`Add Zone`}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<p className="text-sm text-gray-500 mb-3">
							{t`Site`}: <span className="font-medium text-gray-800">{siteName}</span>
						</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="zm-name">
							{t`Zone name`} <span className="text-red-600">*</span>
						</label>
						<input
							id="zm-name"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							placeholder={t`e.g. Cold Room A`}
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
						{saving ? t`Saving…` : isEdit ? t`Save changes` : t`Add zone`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
