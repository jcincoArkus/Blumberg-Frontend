import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { t } from "~@/i18n/macro";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~@/ui";
import type { InvSite } from "~@/view-model";
import { useInventoryViewModel } from "~@/view-model";

import type { SiteCoords } from "./SiteMap";

interface SiteModalProps {
	open: boolean;
	onClose: () => void;
	/** Present → edit mode, absent → add mode. */
	site?: InvSite;
	/** Pre-filled from a map click when adding a new site. */
	initialCoords?: SiteCoords;
	/** City, State resolved via reverse geocoding — pre-fills the name field. */
	suggestedName?: string;
}

export function SiteModal({ open, onClose, site, initialCoords, suggestedName }: SiteModalProps) {
	const vm = useInventoryViewModel();
	const isEdit = site != null;

	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setName(site?.name ?? suggestedName ?? "");
			setError(null);
		}
	}, [open, site, suggestedName]);

	const handleClose = () => {
		setName("");
		setError(null);
		onClose();
	};

	const handleSubmit = async () => {
		if (!name.trim()) {
			setError(t`Site name is required.`);
			return;
		}
		setSaving(true);
		setError(null);
		try {
			if (isEdit) {
				await vm.updateSiteMutation.mutateAsync({
					path: { id: site.id },
					body: { name: name.trim() },
				});
			} else {
				await vm.createSiteMutation.mutateAsync({
					body: { name: name.trim() },
				});
			}
			await vm.refreshSites();
			handleClose();
		} catch {
			setError(t`Failed to save site. Please try again.`);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{isEdit ? t`Edit Site` : t`Add Site`}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sm-name">
							{t`Name`} <span className="text-red-600">*</span>
						</label>
						<input
							id="sm-name"
							className="h-8 px-3 rounded border border-gray-200 bg-white text-sm w-full outline-none focus:border-teal-500"
							placeholder={t`e.g. CDMX Warehouse`}
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
							// biome-ignore lint/a11y/noAutofocus: dialog should focus name immediately
							autoFocus
						/>
					</div>

					{initialCoords && (
						<div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-teal-50 border border-teal-100">
							<MapPin size={13} className="text-teal-600 flex-shrink-0" />
							<span className="text-xs text-teal-700">
								{suggestedName ? (
									<>
										<span className="font-medium">{suggestedName}</span>
										<span className="text-teal-500 ml-1 font-mono">
											({initialCoords.lat.toFixed(4)}, {initialCoords.lng.toFixed(4)})
										</span>
									</>
								) : (
									<span className="font-mono">
										{initialCoords.lat.toFixed(5)}, {initialCoords.lng.toFixed(5)}
									</span>
								)}
							</span>
						</div>
					)}

					{error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
						{t`Cancel`}
					</Button>
					<Button type="button" onClick={() => void handleSubmit()} disabled={saving}>
						{saving ? t`Saving…` : isEdit ? t`Save changes` : t`Add site`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
