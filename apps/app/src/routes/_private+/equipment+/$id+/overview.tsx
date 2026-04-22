import { ArrowLeft, XCircle } from "lucide-react";
import { Link, useParams } from "react-router";

import { t } from "~@/i18n/macro";
import {
	getAlertsByEquipment,
	getSiteEquipmentById as getEquipmentById,
	getSensorsByEquipment,
	getSiteDataById as getSiteById,
	type SiteSensor,
} from "~@/mock-data";
import { Button } from "~@/ui";
import {
	EquipmentAlertsPanel,
	EquipmentOverviewHeader,
	type EquipmentSensor,
	HistoricalCharts,
	LimitsComparisonPanel,
	SensorReadingsGrid,
} from "~@/views";

// Convert SiteSensor to EquipmentSensor with mock values
function toEquipmentSensor(sensor: SiteSensor): EquipmentSensor {
	const sensorDefaults: Record<string, { value: number; unit: string; min: number; max: number }> =
		{
			temperature: { value: 4.2 + Math.random() * 2, unit: "°C", min: -5, max: 10 },
			humidity: { value: 45 + Math.random() * 15, unit: "%", min: 0, max: 100 },
			energy: { value: 120 + Math.random() * 50, unit: "kW", min: 0, max: 200 },
			pressure: { value: 2.1 + Math.random() * 0.5, unit: "bar", min: 0, max: 4 },
		};
	const defaults = sensorDefaults[sensor.type] || {
		value: 50,
		unit: "",
		min: 0,
		max: 100,
	};

	return {
		id: sensor.id,
		equipmentId: sensor.equipmentId,
		siteId: sensor.siteId,
		type: sensor.type,
		name: sensor.name,
		value: defaults.value,
		unit: defaults.unit,
		status: sensor.status,
		min: defaults.min,
		max: defaults.max,
		lastSeen: new Date().toISOString(),
		threshold: { warning: defaults.max * 0.8, critical: defaults.max * 0.95 },
	};
}

// Map equipment status to Overview status
function getOverviewStatus(status: string): "OK" | "Warning" | "Alert" {
	if (status === "online") return "OK";
	if (status === "warning") return "Warning";
	return "Alert";
}

export default function EquipmentOverviewPage() {
	const { id } = useParams();
	const equipment = id ? getEquipmentById(id) : undefined;

	if (!equipment) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
				<XCircle className="size-16 text-muted-foreground" aria-hidden="true" />
				<h1 className="text-xl font-semibold">{t`Equipment Not Found`}</h1>
				<p className="text-muted-foreground">{t`The equipment you're looking for doesn't exist.`}</p>
				<Button asChild>
					<Link to="/sites">{t`Back to Sites`}</Link>
				</Button>
			</div>
		);
	}

	const site = getSiteById(equipment.siteId);
	const sensors = getSensorsByEquipment(equipment.id);
	const alerts = getAlertsByEquipment(equipment.id);

	// Convert to EquipmentSensor format
	const equipmentSensors = sensors.map(toEquipmentSensor);

	// Split alerts into active and recent
	const activeAlerts = alerts.filter((a) => a.status === "active");
	const recentAlerts = alerts.slice(0, 10);

	return (
		<div className="space-y-6">
			{/* Header with Back Button */}
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="sm" asChild className="h-8 px-2">
					<Link to={`/equipment/${id}`}>
						<ArrowLeft className="size-4 mr-1" aria-hidden="true" />
						{t`Back to Equipment Details`}
					</Link>
				</Button>
			</div>

			{/* Equipment Identification + Status */}
			<EquipmentOverviewHeader
				equipmentName={equipment.name}
				equipmentId={equipment.id}
				equipmentType={equipment.type}
				lastUpdate={equipment.lastUpdate}
				siteName={site?.name}
				siteLocation={site?.location}
				status={getOverviewStatus(equipment.status)}
			/>

			{/* Current Sensor Readings */}
			<SensorReadingsGrid sensors={equipmentSensors} />

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Historical Charts - Takes 2 columns */}
				<div className="lg:col-span-2">
					<HistoricalCharts equipmentId={equipment.id} sensors={equipmentSensors} />
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
