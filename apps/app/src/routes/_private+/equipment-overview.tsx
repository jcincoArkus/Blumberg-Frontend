import { AlertTriangle, Server } from "lucide-react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { siteEquipment as equipment, getSiteDataById as getSiteById } from "~@/mock-data";
import { Card, CardContent } from "~@/ui";

function getStatusConfig(status: string) {
	switch (status) {
		case "warning":
			return {
				label: t`Warning`,
				dotColor: "bg-amber-500",
				badgeClass: "bg-amber-50 text-amber-700 border-amber-300",
			};
		case "offline":
			return {
				label: t`Offline`,
				dotColor: "bg-slate-400",
				badgeClass: "bg-slate-100 text-slate-600 border-slate-300",
			};
		case "maintenance":
			return {
				label: t`Maintenance`,
				dotColor: "bg-blue-500",
				badgeClass: "bg-blue-50 text-blue-700 border-blue-300",
			};
		default:
			return {
				label: t`Online`,
				dotColor: "bg-emerald-500",
				badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300",
			};
	}
}

export default function EquipmentOverviewPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-foreground">{t`Equipment Overview`}</h1>
				<p className="text-sm text-muted-foreground">
					{t`Select an equipment to view its core dashboard`}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{equipment.map((eq) => {
					const site = getSiteById(eq.siteId);
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
											{site && (
												<div className="flex items-center gap-2 text-muted-foreground">
													<span className="text-xs">{site.name}</span>
												</div>
											)}
											<div className="flex items-center justify-between">
												<span className="text-xs text-muted-foreground">{t`Sensors`}</span>
												<span className="font-medium">{eq.sensorCount}</span>
											</div>
											{eq.activeAlerts > 0 && (
												<div className="flex items-center gap-2 text-amber-600">
													<AlertTriangle className="size-4" aria-hidden="true" />
													<span className="text-xs font-medium">
														{t`${eq.activeAlerts} active alert${eq.activeAlerts !== 1 ? "s" : ""}`}
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
