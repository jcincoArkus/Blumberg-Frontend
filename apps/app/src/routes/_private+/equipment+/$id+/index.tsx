import {
	Activity,
	AlertTriangle,
	ArrowLeft,
	Building2,
	CheckCircle2,
	Clock,
	XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router";

import { t } from "~@/i18n/macro";
import {
	getAlertsByEquipment,
	getSiteEquipmentById as getEquipmentById,
	getSensorsByEquipment,
	getSiteDataById as getSiteById,
	type SiteSensor,
} from "~@/mock-data";
import {
	Badge,
	Button,
	Card,
	CardContent,
	DashboardPanel,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "~@/ui";
import {
	ClimateTab,
	EnergyTab,
	EquipmentDetailsTab,
	type EquipmentSensor,
	KPIGauge,
	RefrigerationTab,
} from "~@/views";

function getStatusConfig(status: string) {
	switch (status) {
		case "online":
			return {
				label: t`Online`,
				icon: CheckCircle2,
				color: "text-emerald-700",
				bg: "bg-emerald-50",
			};
		case "warning":
			return { label: t`Warning`, icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50" };
		case "offline":
			return { label: t`Offline`, icon: XCircle, color: "text-red-700", bg: "bg-red-50" };
		case "maintenance":
			return { label: t`Maintenance`, icon: Clock, color: "text-slate-700", bg: "bg-slate-50" };
		default:
			return { label: t`Unknown`, icon: Activity, color: "text-gray-700", bg: "bg-gray-50" };
	}
}

function formatLastUpdate(dateStr: string) {
	const date = new Date(dateStr);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// Convert SiteSensor to EquipmentSensor with mock values
function toEquipmentSensor(sensor: SiteSensor): EquipmentSensor {
	const sensorDefaults: Record<string, { value: number; unit: string; min: number; max: number }> =
		{
			temperature: { value: 4.2 + Math.random() * 2, unit: "°C", min: -5, max: 10 },
			humidity: { value: 45 + Math.random() * 15, unit: "%", min: 0, max: 100 },
			energy: { value: 120 + Math.random() * 50, unit: "kW", min: 0, max: 200 },
			pressure: { value: 2.1 + Math.random() * 0.5, unit: "bar", min: 0, max: 4 },
		};
	const defaults = sensorDefaults[sensor.type] || { value: 50, unit: "", min: 0, max: 100 };

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

export default function EquipmentDetailPage() {
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
	const statusConfig = getStatusConfig(equipment.status);
	const StatusIcon = statusConfig.icon;

	// Group sensors by type for KPI display
	const sensorsByType = sensors.reduce(
		(acc, sensor) => {
			if (!acc[sensor.type]) {
				acc[sensor.type] = [];
			}
			acc[sensor.type].push(sensor);
			return acc;
		},
		{} as Record<string, SiteSensor[]>,
	);

	// Get primary sensor of each type for KPI gauges
	const primarySensors = Object.entries(sensorsByType).map(([, typeSensors]) => typeSensors[0]);

	// Convert to EquipmentSensor format for tabs
	const equipmentSensors = sensors.map(toEquipmentSensor);

	const activeSensors = sensors.filter((s) => s.status === "active").length;
	const warningSensors = sensors.filter((s) => s.status === "warning").length;

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<Button variant="ghost" size="sm" asChild className="h-8 px-2">
							<Link to={`/sites/${equipment.siteId}`} aria-label={t`Back to site`}>
								<ArrowLeft className="size-4 mr-1" aria-hidden="true" />
								{t`Back to Site`}
							</Link>
						</Button>
					</div>
					<div className="flex items-center gap-3">
						<h1 className="text-xl font-semibold text-foreground">{equipment.name}</h1>
						<Badge variant="outline" className={`${statusConfig.bg} ${statusConfig.color}`}>
							<StatusIcon className="size-3 mr-1" aria-hidden="true" />
							{statusConfig.label}
						</Badge>
					</div>
					<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Building2 className="size-4" aria-hidden="true" />
							{site?.name ?? t`Unknown Site`}
						</span>
						<span className="flex items-center gap-1.5">
							<Clock className="size-4" aria-hidden="true" />
							{t`Last update: ${formatLastUpdate(equipment.lastUpdate)}`}
						</span>
					</div>
				</div>
				<div className="text-right">
					<p className="text-sm text-muted-foreground">{t`Equipment Type`}</p>
					<p className="font-medium text-foreground">{equipment.type}</p>
				</div>
			</div>

			{/* Sensor Summary */}
			<div className="grid grid-cols-3 gap-4">
				<Card className="bg-emerald-50 border-emerald-100">
					<CardContent className="p-4 text-center">
						<p className="text-2xl font-semibold text-emerald-700">{activeSensors}</p>
						<p className="text-xs text-emerald-600">{t`Active Sensors`}</p>
					</CardContent>
				</Card>
				<Card className="bg-amber-50 border-amber-100">
					<CardContent className="p-4 text-center">
						<p className="text-2xl font-semibold text-amber-700">{warningSensors}</p>
						<p className="text-xs text-amber-600">{t`Warning`}</p>
					</CardContent>
				</Card>
				<Card className="bg-red-50 border-red-100">
					<CardContent className="p-4 text-center">
						<p className="text-2xl font-semibold text-red-700">{alerts.length}</p>
						<p className="text-xs text-red-600">{t`Active Alerts`}</p>
					</CardContent>
				</Card>
			</div>

			{/* Sensor KPI Gauges */}
			{primarySensors.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
					{primarySensors.map((sensor) => {
						const eqSensor = toEquipmentSensor(sensor);
						return (
							<DashboardPanel
								key={sensor.id}
								title={sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}
								className="flex flex-col items-center justify-center py-4"
							>
								<KPIGauge
									label={sensor.name}
									value={eqSensor.value ?? 0}
									unit={eqSensor.unit}
									maxValue={eqSensor.max ?? 100}
									status={
										sensor.status === "warning"
											? "warning"
											: sensor.status === "offline"
												? "danger"
												: "success"
									}
									size="sm"
								/>
							</DashboardPanel>
						);
					})}
				</div>
			)}

			{/* Tabbed Content */}
			<Tabs defaultValue="energy" className="space-y-4">
				<TabsList className="bg-muted/50 p-1" aria-label={t`Equipment monitoring tabs`}>
					<TabsTrigger
						value="energy"
						className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						{t`Energy`}
					</TabsTrigger>
					<TabsTrigger
						value="climate"
						className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						{t`Climate`}
					</TabsTrigger>
					<TabsTrigger
						value="refrigeration"
						className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						{t`Refrigeration`}
					</TabsTrigger>
					<TabsTrigger
						value="equipment"
						className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						{t`Equipment`}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="energy">
					<EnergyTab sensors={equipmentSensors} />
				</TabsContent>

				<TabsContent value="climate">
					<ClimateTab sensors={equipmentSensors} />
				</TabsContent>

				<TabsContent value="refrigeration">
					<RefrigerationTab sensors={equipmentSensors} />
				</TabsContent>

				<TabsContent value="equipment">
					<EquipmentDetailsTab
						equipmentId={equipment.id}
						equipmentName={equipment.name}
						equipmentType={equipment.type}
						sensors={equipmentSensors}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
