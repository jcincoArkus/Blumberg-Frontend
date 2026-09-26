import { AlertTriangle, Server } from "lucide-react";
import { Link } from "react-router";

import { plural, t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Card, CardContent, Skeleton } from "~@/ui";
import { useEquipmentOverviewViewModel } from "~@/view-model";

function getStatusConfig(status: string) {
	switch (status) {
		case "warning":
			return {
				label: t`Warning`,
				dotColor: "bg-warning",
				badgeClass:
					"bg-warning-subtle text-warning-foreground border-amber-300 dark:border-warning-border",
			};
		case "offline":
			return {
				label: t`Offline`,
				dotColor: "bg-slate-400",
				badgeClass: "bg-muted text-muted-foreground border-input",
			};
		case "maintenance":
			return {
				label: t`Maintenance`,
				dotColor: "bg-blue-500 dark:bg-info",
				badgeClass: "bg-info-subtle text-info-foreground border-blue-300 dark:border-info-border",
			};
		default:
			return {
				label: t`Online`,
				dotColor: "bg-success",
				badgeClass:
					"bg-emerald-50 dark:bg-success-subtle text-emerald-700 dark:text-success-foreground border-emerald-300 dark:border-success-border",
			};
	}
}

function EquipmentOverviewPage() {
	const vm = useEquipmentOverviewViewModel();
	const equipment = vm.equipment;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-foreground">{t`Equipment Overview`}</h1>
				<p className="text-sm text-muted-foreground">
					{t`Select an equipment to view its core dashboard`}
				</p>
			</div>

			{vm.isLoading && equipment.length === 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} className="h-40 w-full rounded-xl" />
					))}
				</div>
			)}
			{!vm.isLoading && equipment.length === 0 && (
				<p className="py-12 text-center text-sm text-muted-foreground">
					{vm.hasError
						? t`Couldn't load equipment. Please refresh the page to try again.`
						: t`No equipment registered yet.`}
				</p>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{equipment.map((eq) => {
					const statusConfig = getStatusConfig(eq.status);

					return (
						<Link key={eq.id} to={`/equipment/${eq.id}/overview`}>
							<Card className="hover:shadow-md transition-all cursor-pointer h-full">
								<CardContent className="p-6">
									<div className="space-y-3">
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-3">
												<div className="p-2 rounded-lg bg-primary/10" aria-hidden="true">
													<Server className="size-5 text-primary" />
												</div>
												<div>
													<h2 className="font-semibold text-foreground">{eq.name}</h2>
													<p className="text-xs text-muted-foreground">{eq.type}</p>
												</div>
											</div>
											<span
												className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${statusConfig.badgeClass}`}
											>
												<span
													className={`size-1.5 rounded-full ${statusConfig.dotColor}`}
													aria-hidden="true"
												/>
												{statusConfig.label}
											</span>
										</div>

										<div className="space-y-2 text-sm">
											{eq.siteName && (
												<div className="flex items-center gap-2 text-muted-foreground">
													<span className="text-xs">
														{eq.siteName}
														{eq.siteLocation ? ` · ${eq.siteLocation}` : ""}
													</span>
												</div>
											)}
											<div className="flex items-center justify-between">
												<span className="text-xs text-muted-foreground">{t`Sensors`}</span>
												<span className="font-medium">{eq.sensorCount}</span>
											</div>
											{eq.activeAlerts > 0 && (
												<div className="flex items-center gap-2 text-amber-600 dark:text-warning">
													<AlertTriangle className="size-4" aria-hidden="true" />
													<span className="text-xs font-medium">
														{plural(eq.activeAlerts, {
															one: "# active alert",
															other: "# active alerts",
														})}
													</span>
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

export default observer(EquipmentOverviewPage);
