import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { getAllSitesV1 } from "~@/api";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useEquipmentViewModel } from "~@/view-model";
import { EquipmentForm } from "~@/views";

export default observer(function NewSiteEquipmentPage() {
	const { id: siteId } = useParams();
	const navigate = useNavigate();
	const vm = useEquipmentViewModel();
	const [siteOptions, setSiteOptions] = useState<Array<{ label: string; value: string }>>([]);

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

	const handleSubmit = async (data: Parameters<typeof vm.createEquipment>[0]) => {
		try {
			const payload = siteId ? { ...data, siteId } : data;
			const equipment = await vm.createEquipment(payload);
			if (equipment?.id) {
				toast.success(t`Equipment created successfully`);
				navigate(`/equipment/${equipment.id}`, { replace: true });
			} else {
				toast.error(t`Failed to create equipment`);
			}
		} catch {
			toast.error(vm.error?.message ?? t`Failed to create equipment`);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to={siteId ? `/sites/${siteId}` : "/equipment"}>
						<ArrowLeft className="size-4 mr-2" />
						{t`Back`}
					</Link>
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>{t`New Equipment`}</CardTitle>
				</CardHeader>
				<CardContent>
					<EquipmentForm
						siteOptions={siteOptions}
						defaultValues={siteId ? { siteId, name: "", equipmentType: "" } : undefined}
						onSubmit={handleSubmit}
						submitLabel={t`Create Equipment`}
						isSubmitting={vm.isSaving}
					/>
				</CardContent>
			</Card>
		</div>
	);
});
