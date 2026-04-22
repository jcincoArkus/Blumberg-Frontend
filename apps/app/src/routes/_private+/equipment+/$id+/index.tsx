import { ArrowLeft, Building2, Pencil } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import { DataTable } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, EmptyState } from "~@/ui";
import { useEquipmentViewModel } from "~@/view-model";
import { getSensorColumns, SensorsDataTableController } from "~@/views";

export default observer(function EquipmentDetailPage() {
	const { id: equipmentId } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const vm = useEquipmentViewModel();

	const sensorsController = useMemo(
		() => new SensorsDataTableController(equipmentId ?? null),
		[equipmentId],
	);

	const sensorColumns = useMemo(
		() =>
			getSensorColumns({
				equipmentId: equipmentId ?? null,
				onDelete: async (sensor) => {
					if (!sensor.id) return;
					if (window.confirm(t`Delete sensor "${sensor.serial ?? ""}"?`)) {
						// eslint-disable-line no-alert
						await sensorsController.deleteSensor(sensor.id);
					}
				},
			}),
		[sensorsController, equipmentId],
	);

	useEffect(() => {
		if (equipmentId) vm.loadEquipment(equipmentId);
		return () => vm.dispose();
	}, [equipmentId, vm]);

	// Reload sensors list when returning to equipment detail from a child route (e.g. after creating/editing sensor)
	const prevPathnameRef = useRef(location.pathname);
	useEffect(() => {
		const detailPath = equipmentId ? `/equipment/${equipmentId}` : "";
		const cameFromChild =
			detailPath &&
			prevPathnameRef.current.startsWith(detailPath + "/") &&
			location.pathname === detailPath;
		prevPathnameRef.current = location.pathname;
		if (cameFromChild) {
			sensorsController.refresh();
		}
	}, [equipmentId, location.pathname, sensorsController]);

	if (vm.isLoading && !vm.equipment) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<p className="text-muted-foreground">{t`Loading...`}</p>
			</div>
		);
	}

	if (vm.hasError || !vm.equipment) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
				<h1 className="text-xl font-semibold">{t`Equipment Not Found`}</h1>
				<p className="text-muted-foreground">{t`The equipment you're looking for doesn't exist.`}</p>
				<Button asChild>
					<Link to="/equipment">{t`Back to Equipment`}</Link>
				</Button>
			</div>
		);
	}

	const equipment = vm.equipment;
	const equipmentIdForLinks = equipment?.id ?? equipmentId;

	const sensorsEmptyState = () => (
		<EmptyState
			title={t`No sensors on this equipment`}
			message={t`Add a sensor to get started.`}
			showActionButton
			actionButtonText={t`Add Sensor`}
			onAction={() => navigate(`/equipment/${equipmentIdForLinks}/sensors/new`)}
		/>
	);

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to={equipment.siteId ? `/sites/${equipment.siteId}` : "/equipment"}>
							<ArrowLeft className="size-4 mr-2" />
							{equipment.siteId ? t`Back to Site` : t`Back to Equipment`}
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold text-foreground">
								{equipment.name ?? t`Unnamed Equipment`}
							</h1>
							<Button variant="outline" size="sm" asChild>
								<Link to={`/equipment/${equipment.id}/edit`}>
									<Pencil className="size-4 mr-1" />
									{t`Edit`}
								</Link>
							</Button>
						</div>
						<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
							{equipment.siteId && (
								<span className="flex items-center gap-1.5">
									<Building2 className="size-4" />
									<Link to={`/sites/${equipment.siteId}`} className="text-primary hover:underline">
										{equipment.siteName ?? equipment.siteId}
									</Link>
								</span>
							)}
						</div>
					</div>
				</div>
				<div className="text-right">
					<p className="text-sm text-muted-foreground">{t`Type`}</p>
					<p className="font-medium text-foreground">{equipment.equipmentType ?? "—"}</p>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<p className="text-sm font-medium">{t`Sensors`}</p>
					<p className="text-xs text-muted-foreground">{t`View and manage sensors on this equipment`}</p>
				</CardHeader>
				<CardContent>
					<DataTable
						controller={sensorsController}
						columns={sensorColumns}
						showSearch
						customEmptyState={sensorsEmptyState}
					/>
				</CardContent>
			</Card>
		</div>
	);
});
