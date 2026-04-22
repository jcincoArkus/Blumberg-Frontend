import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { getAllSitesV1 } from "~@/api";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useEquipmentViewModel } from "~@/view-model";
import { EquipmentForm, equipmentFormValuesFromResponse } from "~@/views";

export default observer(function EditEquipmentPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const vm = useEquipmentViewModel();
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
			.catch(() => setSiteOptions([]));
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

	if (vm.isLoading && !vm.equipment) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<p className="text-muted-foreground">{t`Loading...`}</p>
			</div>
		);
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
					<EquipmentForm
						siteOptions={siteOptions}
						defaultValues={equipmentFormValuesFromResponse(vm.equipment)}
						onSubmit={handleSubmit}
						submitLabel={t`Update Equipment`}
						isSubmitting={vm.isSaving}
					/>
				</CardContent>
			</Card>
		</div>
	);
});
