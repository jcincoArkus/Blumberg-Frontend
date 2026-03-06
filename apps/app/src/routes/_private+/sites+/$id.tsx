import { ArrowLeft, Building2, MapPin, Pencil, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router";

import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, EmptyState, StatusBadge } from "~@/ui";
import { SiteDetailAlertsViewModel, useSitesViewModel } from "~@/view-model";
import { EquipmentAlertsPanel, EquipmentDataTableController, getEquipmentColumns } from "~@/views";

export default observer(function SiteDetailPage() {
	const { id: siteId } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const vm = useSitesViewModel();

	const alertsVm = useMemo(() => new SiteDetailAlertsViewModel(), []);

	useEffect(() => {
		if (siteId) alertsVm.loadForSite(siteId);
		return () => alertsVm.dispose();
	}, [siteId, alertsVm]);

	const equipmentController = useMemo(
		() => new EquipmentDataTableController(siteId ?? null),
		[siteId],
	);

	const equipmentColumns = useMemo(
		() =>
			getEquipmentColumns({
				siteId: siteId ?? null,
				onDelete: async (eq) => {
					if (!eq.id) return;
					// eslint-disable-next-line no-alert
					if (window.confirm(t`Delete "${eq.name ?? ""}"?`)) {
						await equipmentController.deleteEquipment(eq.id);
					}
				},
			}),
		[equipmentController, siteId],
	);

	useEffect(() => {
		if (siteId) vm.loadSite(siteId);
		return () => vm.dispose();
	}, [siteId, vm]);

	// Reload equipment list when returning to site detail from a child route (e.g. after creating equipment)
	const prevPathnameRef = useRef(location.pathname);
	useEffect(() => {
		const siteDetailPath = siteId ? `/sites/${siteId}` : "";
		const cameFromChild =
			siteDetailPath &&
			prevPathnameRef.current.startsWith(siteDetailPath + "/") &&
			location.pathname === siteDetailPath;
		prevPathnameRef.current = location.pathname;
		if (cameFromChild) {
			equipmentController.refresh();
		}
	}, [siteId, location.pathname, equipmentController]);

	if (vm.isLoading && !vm.site) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<p className="text-muted-foreground">{t`Loading...`}</p>
			</div>
		);
	}

	if (vm.hasError || !vm.site) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
				<h1 className="text-2xl font-bold text-foreground">{t`Site Not Found`}</h1>
				<p className="text-muted-foreground">{t`The site you're looking for doesn't exist.`}</p>
				<Button asChild>
					<Link to="/sites">
						<ArrowLeft className="size-4 mr-2" />
						{t`Back to Sites`}
					</Link>
				</Button>
			</div>
		);
	}

	const site = vm.site;
	const siteIdForLinks = site?.id ?? siteId;

	const equipmentEmptyState = () => (
		<EmptyState
			title={t`No equipment at this site`}
			message={t`Add equipment to get started.`}
			showActionButton
			actionButtonText={t`Add Equipment`}
			onAction={() => navigate(`/sites/${siteIdForLinks}/equipment/new`)}
		/>
	);

	const addressParts = [
		site.address,
		[site.city, site.state].filter(Boolean).join(", "),
		site.postalCode,
		site.country,
	].filter(Boolean);

	// When on a child route (e.g. equipment/new), show only the child — full page like equipment/sensors/new
	if (siteId && location.pathname !== `/sites/${siteId}`) {
		return <Outlet />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/sites">
							<ArrowLeft className="size-4 mr-2" />
							{t`Back`}
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold text-foreground">{site.name ?? t`Unnamed Site`}</h1>
							{!alertsVm.isLoading && (
								<StatusBadge
									status={
										alertsVm.siteHealth === "healthy"
											? "operational"
											: alertsVm.siteHealth === "degraded"
												? "warning"
												: "critical"
									}
								/>
							)}
							<Button variant="outline" size="sm" asChild>
								<Link to={`/sites/${site.id}/edit`}>
									<Pencil className="size-4 mr-1" />
									{t`Edit`}
								</Link>
							</Button>
						</div>
						{addressParts.length > 0 && (
							<div className="flex items-center gap-1 text-muted-foreground mt-1">
								<MapPin className="size-4" />
								{addressParts.join(" · ")}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<Building2 className="size-5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">{t`Address`}</p>
								<p className="font-medium">{site.address ?? "—"}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div>
							<p className="text-sm text-muted-foreground">{t`City / State`}</p>
							<p className="font-medium">
								{[site.city, site.state].filter(Boolean).join(", ") || "—"}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-3 gap-4">
				{(
					[
						{
							key: "high",
							label: t`High`,
							color: "text-red-600",
							bg: "bg-red-50 border-red-200",
						},
						{
							key: "medium",
							label: t`Medium`,
							color: "text-amber-600",
							bg: "bg-amber-50 border-amber-200",
						},
						{
							key: "low",
							label: t`Low`,
							color: "text-slate-600",
							bg: "bg-slate-50 border-slate-200",
						},
					] as const
				).map(({ key, label, color, bg }) => (
					<Card key={key} className={bg}>
						<CardContent className="p-4 flex items-center gap-3">
							<ShieldAlert className={`size-5 ${color}`} />
							<div>
								<p className="text-sm text-muted-foreground">{label}</p>
								<p className={`text-2xl font-bold ${color}`}>
									{alertsVm.alertCountBySeverity[key]}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{(alertsVm.activeAlerts.length > 0 || alertsVm.recentAlerts.length > 0) && (
				<EquipmentAlertsPanel
					activeAlerts={alertsVm.activeAlerts}
					recentAlerts={alertsVm.recentAlerts}
				/>
			)}

			<Card>
				<CardHeader className="pb-2">
					<p className="text-sm font-medium">{t`Equipment`}</p>
					<p className="text-xs text-muted-foreground">{t`View and manage equipment at this site`}</p>
				</CardHeader>
				<CardContent>
					<DataTable
						controller={equipmentController}
						columns={equipmentColumns}
						showSearch
						customEmptyState={equipmentEmptyState}
					/>
				</CardContent>
			</Card>

			<Outlet />
		</div>
	);
});
