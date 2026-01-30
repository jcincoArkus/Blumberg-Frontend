import {
	Activity,
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
	Droplets,
	ExternalLink,
	Gauge,
	Thermometer,
	Wifi,
	WifiOff,
	Wind,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	Progress,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

interface EnrichedSensor {
	id: string;
	name: string;
	type: string;
	status: "active" | "warning" | "stale" | "offline" | "error" | "inactive";
	equipmentId: string;
	equipmentName: string;
	siteName: string;
	siteId: string;
	value: number;
	unit: string;
	batteryLevel?: number;
	lastSeen: string;
}

interface SensorHealthTableProps {
	sensors: EnrichedSensor[];
}

const statusConfig: Record<string, { icon: typeof Wifi; className: string }> = {
	active: { icon: Wifi, className: "bg-green-100 text-green-700" },
	offline: { icon: WifiOff, className: "bg-red-100 text-red-700" },
	stale: { icon: WifiOff, className: "bg-red-100 text-red-700" },
	warning: { icon: AlertTriangle, className: "bg-amber-100 text-amber-700" },
	error: { icon: AlertTriangle, className: "bg-red-100 text-red-700" },
	inactive: { icon: WifiOff, className: "bg-slate-100 text-slate-700" },
};

const typeIcons: Record<string, typeof Activity> = {
	temperature: Thermometer,
	humidity: Droplets,
	pressure: Gauge,
	energy: Activity,
	co2: Wind,
	o2: Wind,
};

export function SensorHealthTable({ sensors }: SensorHealthTableProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 15;
	const totalPages = Math.ceil(sensors.length / itemsPerPage);

	const paginatedSensors = sensors.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getBatteryColor = (level: number) => {
		if (level >= 50) return "bg-green-500";
		if (level >= 20) return "bg-amber-500";
		return "bg-red-500";
	};

	return (
		<div className="space-y-4">
			<div className="rounded-lg border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t`Sensor`}</TableHead>
							<TableHead>{t`Type`}</TableHead>
							<TableHead>{t`Site`}</TableHead>
							<TableHead>{t`Equipment`}</TableHead>
							<TableHead>{t`Status`}</TableHead>
							<TableHead>{t`Current Value`}</TableHead>
							<TableHead>{t`Battery`}</TableHead>
							<TableHead>{t`Last Reading`}</TableHead>
							<TableHead className="w-20">{t`Actions`}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedSensors.map((sensor) => {
							const config = statusConfig[sensor.status] || statusConfig.inactive;
							const StatusIcon = config.icon;
							const TypeIcon = typeIcons[sensor.type] || Activity;
							const batteryLevel = sensor.batteryLevel ?? 100;

							return (
								<TableRow key={sensor.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<div className="rounded bg-muted p-1.5" aria-hidden="true">
												<TypeIcon className="h-4 w-4 text-muted-foreground" />
											</div>
											<div>
												<p className="font-medium">{sensor.name}</p>
												<p className="text-xs text-muted-foreground font-mono">{sensor.id}</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline">
											{sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}
										</Badge>
									</TableCell>
									<TableCell>
										<Link to={`/sites/${sensor.siteId}`} className="text-primary hover:underline">
											{sensor.siteName}
										</Link>
									</TableCell>
									<TableCell>
										<Link
											to={`/equipment/${sensor.equipmentId}`}
											className="text-primary hover:underline"
										>
											{sensor.equipmentName}
										</Link>
									</TableCell>
									<TableCell>
										<Badge className={config.className}>
											<StatusIcon className="mr-1 h-3 w-3" aria-hidden="true" />
											{sensor.status}
										</Badge>
									</TableCell>
									<TableCell>
										<span className="font-mono">
											{sensor.value} {sensor.unit}
										</span>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2 w-24">
											<Progress
												value={batteryLevel}
												className="h-2"
												indicatorClassName={getBatteryColor(batteryLevel)}
											/>
											<span className="text-xs text-muted-foreground w-8">{batteryLevel}%</span>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{formatDate(sensor.lastSeen)}
									</TableCell>
									<TableCell>
										<Button variant="ghost" size="sm" asChild>
											<Link to={`/equipment/${sensor.equipmentId}`}>
												<ExternalLink className="h-4 w-4" aria-hidden="true" />
												<span className="sr-only">{t`View equipment`}</span>
											</Link>
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{t`Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, sensors.length)} of ${sensors.length} sensors`}
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
						disabled={currentPage === 1}
					>
						<ChevronLeft className="h-4 w-4" aria-hidden="true" />
						{t`Previous`}
					</Button>
					<div className="flex items-center gap-1">
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							let pageNum: number;
							if (totalPages <= 5) {
								pageNum = i + 1;
							} else if (currentPage <= 3) {
								pageNum = i + 1;
							} else if (currentPage >= totalPages - 2) {
								pageNum = totalPages - 4 + i;
							} else {
								pageNum = currentPage - 2 + i;
							}
							return (
								<Button
									key={pageNum}
									variant={currentPage === pageNum ? "default" : "outline"}
									size="sm"
									className="w-8"
									onClick={() => setCurrentPage(pageNum)}
								>
									{pageNum}
								</Button>
							);
						})}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages || totalPages === 0}
					>
						{t`Next`}
						<ChevronRight className="h-4 w-4" aria-hidden="true" />
					</Button>
				</div>
			</div>
		</div>
	);
}
