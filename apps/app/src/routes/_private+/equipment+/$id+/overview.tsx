import { ArrowLeft, XCircle } from "lucide-react";
import { Link, useParams } from "react-router";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Skeleton } from "~@/ui";
import { useEquipmentOverviewViewModel } from "~@/view-model";
import {
	EquipmentAlertsPanel,
	EquipmentOverviewHeader,
	type EquipmentSensor,
	HistoricalCharts,
	LimitsComparisonPanel,
	SensorReadingsGrid,
} from "~@/views";

// Map equipment status to Overview status
function getOverviewStatus(status: string, hasCritical: boolean): "OK" | "Warning" | "Alert" {
	if (hasCritical) return "Alert";
	if (status === "online") return "OK";
	if (status === "warning") return "Warning";
	return "Alert";
}

// HistoricalCharts reads async-loaded series through a callback; make it an observer so it
// re-renders when readings arrive.
const ObservedHistoricalCharts = observer(HistoricalCharts);

function EquipmentOverviewPage() {
	const { id } = useParams();
	const vm = useEquipmentOverviewViewModel();
	const equipment = vm.equipmentById(id);

	if (!equipment && vm.isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-24 w-full rounded-xl" />
				<Skeleton className="h-40 w-full rounded-xl" />
				<Skeleton className="h-72 w-full rounded-xl" />
			</div>
		);
	}

	if (!equipment) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
				<XCircle className="size-16 text-muted-foreground" aria-hidden="true" />
				<h1 className="text-xl font-semibold">{t`Equipment Not Found`}</h1>
				<p className="text-muted-foreground">{t`The equipment you're looking for doesn't exist.`}</p>
				<Button asChild>
					<Link to="/equipment-overview">{t`Back to Equipment Overview`}</Link>
				</Button>
			</div>
		);
	}

	const equipmentSensors: EquipmentSensor[] = vm.sensorsFor(equipment.id);
	const alerts = vm.alertsFor(equipment.id);

	// Split alerts into active and recent
	const activeAlerts = alerts.filter((a) => a.status === "active" || a.status === "acknowledged");
	const recentAlerts = alerts.slice(0, 10);

	return (
		<div className="space-y-6">
			{/* Header with Back Button */}
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="sm" asChild className="h-8 px-2">
					<Link to="/equipment-overview">
						<ArrowLeft className="size-4 mr-1" aria-hidden="true" />
						{t`Back to Equipment Overview`}
					</Link>
				</Button>
			</div>

			{/* Equipment Identification + Status */}
			<EquipmentOverviewHeader
				equipmentName={equipment.name}
				equipmentId={equipment.id}
				equipmentType={equipment.type}
				lastUpdate={equipment.lastUpdate}
				siteName={equipment.siteName}
				siteLocation={equipment.siteLocation}
				status={getOverviewStatus(
					equipment.status,
					activeAlerts.some((a) => a.severity === "critical"),
				)}
			/>

			{/* Current Sensor Readings */}
			<SensorReadingsGrid sensors={equipmentSensors} />

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Historical Charts - Takes 2 columns */}
				<div className="lg:col-span-2">
					<ObservedHistoricalCharts
						equipmentId={equipment.id}
						sensors={equipmentSensors}
						generateTimeSeriesData={(sensorId, hours) =>
							vm.getSeries(sensorId, hours > 24 ? "7d" : "24h").map((p) => ({
								timestamp: p.time,
								value: p.value,
							}))
						}
					/>
				</div>

				{/* Alerts Panel - Takes 1 column */}
				<div className="lg:col-span-1">
					<EquipmentAlertsPanel activeAlerts={activeAlerts} recentAlerts={recentAlerts} />
				</div>
			</div>

			{/* Limits Comparison Panel */}
			<LimitsComparisonPanel sensors={equipmentSensors} />
		</div>
	);
}

export default observer(EquipmentOverviewPage);
