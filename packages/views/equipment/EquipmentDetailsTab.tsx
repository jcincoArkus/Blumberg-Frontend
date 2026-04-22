import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	Clock,
	Cpu,
	Droplets,
	FileText,
	Gauge,
	HardDrive,
	Settings,
	Shield,
	Thermometer,
	Wind,
	Wrench,
	XCircle,
	Zap,
} from "lucide-react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import type { Sensor } from "./SensorsTable";

interface EquipmentDetailsTabProps {
	equipmentId: string;
	equipmentName: string;
	equipmentType: string;
	sensors: Sensor[];
}

function getSensorIcon(type: string) {
	switch (type) {
		case "temperature":
			return Thermometer;
		case "humidity":
			return Droplets;
		case "co2":
			return Wind;
		case "pressure":
			return Gauge;
		case "energy":
			return Zap;
		default:
			return Cpu;
	}
}

function getSensorColor(type: string) {
	switch (type) {
		case "temperature":
			return "text-blue-500";
		case "humidity":
			return "text-cyan-500";
		case "co2":
			return "text-purple-500";
		case "pressure":
			return "text-indigo-500";
		case "energy":
			return "text-amber-500";
		default:
			return "text-gray-500";
	}
}

function getSensorStatusColor(status: string) {
	switch (status) {
		case "active":
			return "bg-green-100 text-green-700";
		case "warning":
			return "bg-amber-100 text-amber-700";
		case "error":
			return "bg-red-100 text-red-700";
		case "offline":
		case "stale":
			return "bg-gray-100 text-gray-700";
		default:
			return "bg-gray-100 text-gray-700";
	}
}

export function EquipmentDetailsTab({
	equipmentId,
	equipmentName,
	equipmentType,
	sensors,
}: EquipmentDetailsTabProps) {
	// Group sensors by type
	const sensorsByType = sensors.reduce(
		(acc, sensor) => {
			if (!acc[sensor.type]) {
				acc[sensor.type] = [];
			}
			acc[sensor.type].push(sensor);
			return acc;
		},
		{} as Record<string, Sensor[]>,
	);

	const activeSensors = sensors.filter((s) => s.status === "active").length;
	const warningSensors = sensors.filter((s) => s.status === "warning").length;
	const offlineSensors = sensors.filter(
		(s) => s.status === "offline" || s.status === "error",
	).length;

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-100 p-4">
				<div className="rounded-lg bg-slate-600 p-2">
					<Settings className="size-6 text-white" aria-hidden="true" />
				</div>
				<div>
					<h2 className="text-lg font-semibold text-slate-900">{t`Equipment Details`}</h2>
					<p className="text-sm text-slate-700">
						{t`${equipmentName} - ${equipmentType} | ${sensors.length} sensor${sensors.length !== 1 ? "s" : ""} installed`}
					</p>
				</div>
			</div>

			{/* Sensors Overview */}
			<SensorsOverview
				sensors={sensors}
				sensorsByType={sensorsByType}
				activeSensors={activeSensors}
				warningSensors={warningSensors}
				offlineSensors={offlineSensors}
			/>

			{/* Equipment Specifications */}
			<TechnicalSpecifications
				equipmentId={equipmentId}
				equipmentName={equipmentName}
				equipmentType={equipmentType}
			/>

			{/* Maintenance History */}
			<MaintenanceHistory />

			{/* Documents & Spare Parts */}
			<DocumentsAndParts />

			{/* Warranty Info */}
			<WarrantyInfo />
		</div>
	);
}

// Helper Components
function SensorsOverview({
	sensors,
	sensorsByType,
	activeSensors,
	warningSensors,
	offlineSensors,
}: {
	sensors: Sensor[];
	sensorsByType: Record<string, Sensor[]>;
	activeSensors: number;
	warningSensors: number;
	offlineSensors: number;
}) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium">
					<Cpu className="size-5 text-primary" aria-hidden="true" />
					{t`All Sensors on this Equipment (${sensors.length})`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{/* Sensor Summary */}
				<div className="mb-4 grid grid-cols-3 gap-4">
					<div className="rounded-lg border border-green-100 bg-green-50 p-3 text-center">
						<p className="text-2xl font-semibold text-green-700">{activeSensors}</p>
						<p className="text-xs text-green-600">{t`Active`}</p>
					</div>
					<div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-center">
						<p className="text-2xl font-semibold text-amber-700">{warningSensors}</p>
						<p className="text-xs text-amber-600">{t`Warning`}</p>
					</div>
					<div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
						<p className="text-2xl font-semibold text-gray-700">{offlineSensors}</p>
						<p className="text-xs text-gray-600">{t`Offline`}</p>
					</div>
				</div>

				{/* Sensors by Type */}
				<div className="space-y-4">
					{Object.entries(sensorsByType).map(([type, typeSensors]) => {
						const Icon = getSensorIcon(type);
						const iconColor = getSensorColor(type);

						return (
							<div key={type} className="overflow-hidden rounded-lg border">
								<div className="flex items-center gap-2 bg-muted/50 px-4 py-2">
									<Icon className={`size-4 ${iconColor}`} aria-hidden="true" />
									<span className="text-sm font-medium capitalize">{t`${type} Sensors`}</span>
									<Badge variant="secondary" className="ml-auto">
										{typeSensors.length}
									</Badge>
								</div>
								<div className="divide-y">
									{typeSensors.map((sensor) => (
										<div key={sensor.id} className="flex items-center gap-4 px-4 py-3">
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium">{sensor.name}</p>
												<p className="text-xs text-muted-foreground">{t`ID: ${sensor.id}`}</p>
											</div>
											<div className="text-right">
												<p className="font-semibold">
													{sensor.value} {sensor.unit}
												</p>
												<p className="text-xs text-muted-foreground">
													{t`Range: ${sensor.min} - ${sensor.max}`}
												</p>
											</div>
											<Badge variant="secondary" className={getSensorStatusColor(sensor.status)}>
												{sensor.status}
											</Badge>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

function TechnicalSpecifications({
	equipmentId,
	equipmentName,
	equipmentType,
}: {
	equipmentId: string;
	equipmentName: string;
	equipmentType: string;
}) {
	const specifications = {
		model: "Carrier 06TT-265",
		serialNumber: `CT-2024-${equipmentId.replace("eq-", "").padStart(5, "0")}`,
		manufacturer: "Carrier Corporation",
		installedDate: "2022-03-15",
		warrantyExpires: "2027-03-15",
		capacity: "265 kW",
		refrigerant: "R-410A",
		voltage: "480V / 3-Phase",
		dimensions: "4.2m x 2.1m x 2.8m",
		weight: "2,850 kg",
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium">
					<Settings className="size-5 text-muted-foreground" aria-hidden="true" />
					{t`Technical Specifications`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-3">
						<SpecRow label={t`Equipment Name`} value={equipmentName} />
						<SpecRow label={t`Type`} value={equipmentType} />
						<SpecRow label={t`Model`} value={specifications.model} />
						<SpecRow label={t`Serial Number`} value={specifications.serialNumber} mono />
						<SpecRow label={t`Manufacturer`} value={specifications.manufacturer} />
					</div>
					<div className="space-y-3">
						<SpecRow label={t`Capacity`} value={specifications.capacity} />
						<SpecRow label={t`Refrigerant`} value={specifications.refrigerant} />
						<SpecRow label={t`Voltage`} value={specifications.voltage} />
						<SpecRow label={t`Dimensions`} value={specifications.dimensions} />
						<SpecRow label={t`Weight`} value={specifications.weight} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function SpecRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
	return (
		<div className="flex justify-between border-b py-2">
			<span className="text-muted-foreground">{label}</span>
			<span className={`font-medium ${mono ? "font-mono text-sm" : ""}`}>{value}</span>
		</div>
	);
}

function getStatusBadge(status: string) {
	switch (status) {
		case "completed":
			return (
				<Badge variant="secondary" className="bg-green-100 text-green-700">
					<CheckCircle2 className="mr-1 size-3" aria-hidden="true" /> {t`Completed`}
				</Badge>
			);
		case "scheduled":
			return (
				<Badge variant="secondary" className="bg-blue-100 text-blue-700">
					<Clock className="mr-1 size-3" aria-hidden="true" /> {t`Scheduled`}
				</Badge>
			);
		case "overdue":
			return (
				<Badge variant="secondary" className="bg-red-100 text-red-700">
					<XCircle className="mr-1 size-3" aria-hidden="true" /> {t`Overdue`}
				</Badge>
			);
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
}

function MaintenanceHistory() {
	const maintenanceHistory = [
		{
			id: "maint-1",
			date: "2026-01-15",
			type: "Preventive",
			description: t`Quarterly filter replacement and coil cleaning`,
			technician: "John Smith",
			status: "completed",
			cost: 450,
		},
		{
			id: "maint-2",
			date: "2025-12-08",
			type: "Corrective",
			description: t`Compressor bearing replacement`,
			technician: "Mike Johnson",
			status: "completed",
			cost: 1250,
		},
		{
			id: "maint-3",
			date: "2025-10-22",
			type: "Preventive",
			description: t`Annual refrigerant check and top-up`,
			technician: "Sarah Wilson",
			status: "completed",
			cost: 680,
		},
		{
			id: "maint-4",
			date: "2026-02-15",
			type: "Scheduled",
			description: t`Quarterly preventive maintenance`,
			technician: "TBD",
			status: "scheduled",
			cost: 450,
		},
	];

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium">
					<Wrench className="size-5 text-muted-foreground" aria-hidden="true" />
					{t`Maintenance History`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t`Date`}</TableHead>
							<TableHead>{t`Type`}</TableHead>
							<TableHead>{t`Description`}</TableHead>
							<TableHead>{t`Technician`}</TableHead>
							<TableHead>{t`Cost`}</TableHead>
							<TableHead>{t`Status`}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{maintenanceHistory.map((item) => (
							<TableRow key={item.id}>
								<TableCell className="font-medium">{item.date}</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={
											item.type === "Corrective"
												? "border-red-200 text-red-700"
												: item.type === "Preventive"
													? "border-green-200 text-green-700"
													: "border-blue-200 text-blue-700"
										}
									>
										{item.type}
									</Badge>
								</TableCell>
								<TableCell className="max-w-50 truncate">{item.description}</TableCell>
								<TableCell>{item.technician}</TableCell>
								<TableCell>${item.cost.toLocaleString()}</TableCell>
								<TableCell>{getStatusBadge(item.status)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

function DocumentsAndParts() {
	const documents = [
		{ name: t`Installation Manual`, type: "PDF", size: "4.2 MB", lastUpdated: "2022-03-15" },
		{ name: t`Service Guide`, type: "PDF", size: "2.8 MB", lastUpdated: "2024-06-10" },
		{ name: t`Wiring Diagram`, type: "PDF", size: "1.1 MB", lastUpdated: "2022-03-15" },
		{ name: t`Parts Catalog`, type: "PDF", size: "8.5 MB", lastUpdated: "2025-01-20" },
	];

	const spareParts = [
		{ name: t`Air Filter (Primary)`, stock: 8, minStock: 4, lastOrdered: "2025-12-01" },
		{ name: t`Belt Drive`, stock: 2, minStock: 2, lastOrdered: "2025-10-15" },
		{ name: t`Compressor Oil (Gallon)`, stock: 5, minStock: 3, lastOrdered: "2025-11-20" },
		{ name: t`Temperature Sensor`, stock: 6, minStock: 4, lastOrdered: "2025-11-01" },
	];

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{/* Documents */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base font-medium">
						<FileText className="size-5 text-muted-foreground" aria-hidden="true" />
						{t`Documents`}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{documents.map((doc, idx) => (
							<div
								key={idx}
								className="flex cursor-pointer items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
							>
								<div className="flex items-center gap-3">
									<FileText className="size-5 text-red-500" aria-hidden="true" />
									<div>
										<p className="text-sm font-medium">{doc.name}</p>
										<p className="text-xs text-muted-foreground">{doc.size}</p>
									</div>
								</div>
								<span className="text-xs text-muted-foreground">{doc.lastUpdated}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Spare Parts */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base font-medium">
						<HardDrive className="size-5 text-muted-foreground" aria-hidden="true" />
						{t`Spare Parts Inventory`}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{spareParts.map((part, idx) => (
							<div key={idx} className="space-y-1">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">{part.name}</span>
									<span
										className={`text-sm font-semibold ${part.stock <= part.minStock ? "text-amber-600" : "text-green-600"}`}
									>
										{t`${part.stock} in stock`}
									</span>
								</div>
								<div className="h-1.5 overflow-hidden rounded-full bg-muted">
									<div
										className={`h-full transition-all ${part.stock <= part.minStock ? "bg-amber-500" : "bg-green-500"}`}
										style={{ width: `${Math.min(100, (part.stock / (part.minStock * 3)) * 100)}%` }}
									/>
								</div>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>{t`Min: ${part.minStock}`}</span>
									<span>{t`Last ordered: ${part.lastOrdered}`}</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function WarrantyInfo() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-medium">
					<Shield className="size-5 text-muted-foreground" aria-hidden="true" />
					{t`Warranty Information`}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-lg border border-green-100 bg-green-50 p-4">
						<div className="mb-2 flex items-center gap-2">
							<CheckCircle2 className="size-5 text-green-600" aria-hidden="true" />
							<span className="font-medium text-green-700">{t`Active Warranty`}</span>
						</div>
						<p className="text-sm text-green-600">{t`Full parts and labor coverage`}</p>
					</div>
					<div className="rounded-lg border bg-muted/50 p-4">
						<div className="mb-2 flex items-center gap-2">
							<Calendar className="size-5 text-muted-foreground" aria-hidden="true" />
							<span className="font-medium">{t`Installed`}</span>
						</div>
						<p className="text-sm text-muted-foreground">2022-03-15</p>
					</div>
					<div className="rounded-lg border bg-muted/50 p-4">
						<div className="mb-2 flex items-center gap-2">
							<AlertCircle className="size-5 text-muted-foreground" aria-hidden="true" />
							<span className="font-medium">{t`Expires`}</span>
						</div>
						<p className="text-sm text-muted-foreground">2027-03-15</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
