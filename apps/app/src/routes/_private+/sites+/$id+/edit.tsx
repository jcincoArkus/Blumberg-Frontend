import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useSitesViewModel } from "~@/view-model";
import { SiteForm, siteFormValuesFromResponse } from "~@/views";

export default observer(function EditSitePage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const vm = useSitesViewModel();

	useEffect(() => {
		if (id) vm.loadSite(id);
	}, [id, vm]);

	const handleSubmit = async (data: Parameters<typeof vm.updateSite>[1]) => {
		if (!id) return;
		try {
			const site = await vm.updateSite(id, data);
			if (site?.id) {
				toast.success(t`Site updated successfully`);
				navigate(`/sites/${site.id}`, { replace: true });
			} else {
				toast.error(t`Failed to update site`);
			}
		} catch {
			toast.error(vm.error?.message ?? t`Failed to update site`);
		}
	};

	if (vm.isLoading && !vm.site) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<p className="text-muted-foreground">{t`Loading...`}</p>
			</div>
		);
	}

	if (vm.hasError || !vm.site) {
		return (
			<div className="space-y-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/sites">
						<ArrowLeft className="size-4 mr-2" />
						{t`Back to Sites`}
					</Link>
				</Button>
				<p className="text-destructive">{vm.error?.message ?? t`Site not found`}</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to={`/sites/${id}`}>
						<ArrowLeft className="size-4 mr-2" />
						{t`Back to Site`}
					</Link>
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>{t`Edit Site`}</CardTitle>
				</CardHeader>
				<CardContent>
					<SiteForm
						defaultValues={siteFormValuesFromResponse(vm.site)}
						onSubmit={handleSubmit}
						submitLabel={t`Update Site`}
						isSubmitting={vm.isSaving}
					/>
				</CardContent>
			</Card>
		</div>
	);
});
