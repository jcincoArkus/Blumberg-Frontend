import { Clock, Droplets, Gauge, Thermometer, Wind, Zap } from "lucide-react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	formatReading,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

export type SensorType = "temperature" | "humidity" | "co2" | "pressure" | "energy" | "o2";
export type SensorStatus = "active" | "warning" | "stale" | "offline" | "error" | "inactive";

export interface Sensor {
	id: string;
	equipmentId?: string;
	siteId: string;
	type: SensorType;
	name: string;
	value?: number;
	unit: string;
	status: SensorStatus;
	lastSeen?: string;
	min?: number;
	max?: number;
	threshold?: { warning: number; critical: number };
	description?: string;
}

interface SensorsTableProps {
	sensors: Sensor[];
}

const sensorIcons: Record<SensorType, React.ReactNode> = {
	temperature: <Thermometer className="size-4" aria-hidden="true" />,
	humidity: <Droplets className="size-4" aria-hidden="true" />,
	co2: <Wind className="size-4" aria-hidden="true" />,
	energy: <Zap className="size-4" aria-hidden="true" />,
	pressure: <Gauge className="size-4" aria-hidden="true" />,
	o2: <Wind className="size-4" aria-hidden="true" />,
};

function formatLastSeen(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getValueStatus(sensor: Sensor): "danger" | "warning" | "success" {
	if (!sensor.value || !sensor.threshold) return "success";
	if (sensor.value >= sensor.threshold.critical) return "danger";
	if (sensor.value >= sensor.threshold.warning) return "warning";
	return "success";
}

function getStatusBadgeConfig(status: SensorStatus) {
	switch (status) {
		case "active":
			return {
				label: t`Active`,
				className:
					"bg-emerald-100 dark:bg-success-subtle text-emerald-700 dark:text-success-foreground border-emerald-200 dark:border-success-border",
			};
		case "warning":
			return {
				label: t`Warning`,
				className:
					"bg-amber-100 dark:bg-warning-subtle text-warning-foreground border-warning-border",
			};
		case "stale":
			return {
				label: t`Stale`,
				className:
					"bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30",
			};
		case "offline":
			return {
				label: t`Offline`,
				className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
			};
		case "error":
			return {
				label: t`Error`,
				className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
			};
		case "inactive":
			return {
				label: t`Inactive`,
				className: "bg-muted text-slate-700 dark:text-foreground border-border",
			};
		default:
			return {
				label: status,
				className: "bg-muted text-slate-700 dark:text-foreground border-border",
			};
	}
}

export function SensorsTable({ sensors }: SensorsTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{t`Sensor`}</TableHead>
					<TableHead>{t`Type`}</TableHead>
					<TableHead className="text-right">{t`Current Value`}</TableHead>
					<TableHead className="text-center">{t`Status`}</TableHead>
					<TableHead>{t`Thresholds`}</TableHead>
					<TableHead>{t`Last Seen`}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sensors.map((sensor) => {
					const valueStatus = getValueStatus(sensor);
					const statusConfig = getStatusBadgeConfig(sensor.status);

					return (
						<TableRow key={sensor.id}>
							<TableCell className="font-medium">{sensor.name}</TableCell>
							<TableCell>
								<div className="flex items-center gap-2 text-muted-foreground">
									{sensorIcons[sensor.type]}
									<span className="capitalize">{sensor.type}</span>
								</div>
							</TableCell>
							<TableCell className="text-right">
								<span
									className={`font-mono font-medium ${
										valueStatus === "danger"
											? "text-danger"
											: valueStatus === "warning"
												? "text-amber-600 dark:text-warning"
												: "text-foreground"
									}`}
								>
									{formatReading(sensor.value, sensor.unit, { compact: true })}
								</span>
							</TableCell>
							<TableCell className="text-center">
								<Badge variant="outline" className={statusConfig.className}>
									{statusConfig.label}
								</Badge>
							</TableCell>
							<TableCell>
								{sensor.threshold ? (
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-warning-subtle text-warning-foreground">
											{t`W:`} {sensor.threshold.warning}
											{sensor.unit}
										</span>
										<span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-danger-subtle text-danger-foreground">
											{t`C:`} {sensor.threshold.critical}
											{sensor.unit}
										</span>
									</div>
								) : (
									<span className="text-muted-foreground">—</span>
								)}
							</TableCell>
							<TableCell>
								{sensor.lastSeen ? (
									<div className="flex items-center gap-1.5 text-muted-foreground text-sm">
										<Clock className="size-3.5" aria-hidden="true" />
										{formatLastSeen(sensor.lastSeen)}
									</div>
								) : (
									<span className="text-muted-foreground">—</span>
								)}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
