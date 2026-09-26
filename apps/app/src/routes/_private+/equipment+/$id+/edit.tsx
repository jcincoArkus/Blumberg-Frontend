import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { getAllSitesV1 } from "~@/api";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingState } from "~@/ui";
import { useEquipmentViewModel } from "~@/view-model";
import { EquipmentForm, equipmentFormValuesFromResponse } from "~@/views";

export default observer(function EditEquipmentPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const vm = useEquipmentViewModel();
	// Dropdown options come from the API; show the form only once they have arrived.
	const [optionsLoading, setOptionsLoading] = useState(true);
	const [siteOptions, setSiteOptions] = useState<Array<{ label: string; value: string }>>([]);

	useEffect(() => {
		if (id) vm.loadEquipment(id);
	}, [id, vm]);

	useEffect(() => {
		getAllSitesV1({ query: { Page: 1, PageSize: 500 } })
			.then(({ data }) => {
				const items = data?.items ?? [];
				setSiteOptions(
					items
						.map((s) => ({ label: s.name ?? s.id ?? "", value: s.id ?? "" }))
						.filter((o) => o.value),
				);
			})
			.catch(() => setSiteOptions([]))
			.finally(() => setOptionsLoading(false));
	}, []);

	const handleSubmit = async (data: Parameters<typeof vm.updateEquipment>[1]) => {
		if (!id) return;
		try {
			const equipment = await vm.updateEquipment(id, data);
			if (equipment?.id) {
				toast.success(t`Equipment updated successfully`);
				navigate(`/equipment/${id}`, { replace: true });
			} else {
				toast.error(t`Failed to update equipment`);
			}
		} catch {
			toast.error(vm.error?.message ?? t`Failed to update equipment`);
		}
	};

	// The view-model is shared across pages: ignore equipment left over from a previous id.
	const isStale = !!(vm.equipment?.id && id && vm.equipment.id.toLowerCase() !== id.toLowerCase());
	// No (current) entity yet and no error means the first fetch is pending (or not started yet).
	if ((!vm.equipment || isStale) && !vm.hasError) {
		return <LoadingState variant="page" />;
	}

	if (vm.hasError || !vm.equipment) {
		return (
			<div className="space-y-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/equipment">
						<ArrowLeft className="size-4 mr-2" />
						{t`Back to Equipment`}
					</Link>
				</Button>
				<p className="text-destructive">{vm.error?.message ?? t`Equipment not found`}</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to={`/equipment/${id}`}>
						<ArrowLeft className="size-4 mr-2" />
						{t`Back to Equipment`}
					</Link>
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>{t`Edit Equipment`}</CardTitle>
				</CardHeader>
				<CardContent>
					{optionsLoading ? (
						<LoadingState variant="section" />
					) : (
						<EquipmentForm
							siteOptions={siteOptions}
							defaultValues={equipmentFormValuesFromResponse(vm.equipment)}
							onSubmit={handleSubmit}
							submitLabel={t`Update Equipment`}
							isSubmitting={vm.isSaving}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
});
