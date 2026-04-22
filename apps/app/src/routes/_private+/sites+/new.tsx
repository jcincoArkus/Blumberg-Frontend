import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useSitesViewModel } from "~@/view-model";
import { SiteForm } from "~@/views";

export default observer(function NewSitePage() {
	const navigate = useNavigate();
	const vm = useSitesViewModel();

	const handleSubmit = async (data: Parameters<typeof vm.createSite>[0]) => {
		try {
			const site = await vm.createSite(data);
			if (site?.id) {
				toast.success(t`Site created successfully`);
				navigate(`/sites/${site.id}`, { replace: true });
			} else {
				toast.error(t`Failed to create site`);
			}
		} catch {
			toast.error(vm.error?.message ?? t`Failed to create site`);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/sites">
						<ArrowLeft className="size-4 mr-2" />
						{t`Back to Sites`}
					</Link>
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>{t`New Site`}</CardTitle>
				</CardHeader>
				<CardContent>
					<SiteForm
						onSubmit={handleSubmit}
						submitLabel={t`Create Site`}
						isSubmitting={vm.isSaving}
					/>
				</CardContent>
			</Card>
		</div>
	);
});
