import {
	Activity,
	AlertTriangle,
	Droplets,
	ExternalLink,
	Gauge,
	Thermometer,
	Wifi,
	WifiOff,
	Wind,
} from "lucide-react";
import { Link } from "react-router";

import type { DataTableProps } from "~@/data-table";
import { t } from "~@/i18n/macro";
import { Badge, Button } from "~@/ui";

import type { EnrichedSensor } from "./SensorHealthTable";

const statusConfig: Record<string, { icon: typeof Wifi; className: string }> = {
	healthy: { icon: Wifi, className: "bg-green-100 text-green-700" },
	offline: { icon: WifiOff, className: "bg-red-100 text-red-700" },
	stale: { icon: WifiOff, className: "bg-amber-100 text-amber-700" },
	warning: { icon: AlertTriangle, className: "bg-amber-100 text-amber-700" },
	critical: { icon: AlertTriangle, className: "bg-red-100 text-red-700" },
};

const typeIcons: Record<string, typeof Activity> = {
	temperature: Thermometer,
	humidity: Droplets,
	pressure: Gauge,
	energy: Activity,
	co2: Wind,
	o2: Wind,
};

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const getSensorHealthColumns = (): DataTableProps<EnrichedSensor>["columns"] =>
	[
		{
			accessorKey: "name",
			header: t`Sensor`,
			cell: ({ row }) => {
				const sensor = row.original;
				const TypeIcon = typeIcons[sensor.type] || Activity;
				return (
					<div className="flex items-center gap-2">
						<div className="rounded bg-muted p-1.5" aria-hidden="true">
							<TypeIcon className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<p className="font-medium">{sensor.name}</p>
							<p className="text-xs text-muted-foreground font-mono">{sensor.id}</p>
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "type",
			header: t`Type`,
			cell: ({ row }) => {
				const type = row.original.type;
				return <Badge variant="outline">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
			},
		},
		{
			accessorKey: "siteName",
			header: t`Site`,
			cell: ({ row }) => {
				const sensor = row.original;
				return (
					<Link to={`/sites/${sensor.siteId}`} className="text-primary hover:underline">
						{sensor.siteName}
					</Link>
				);
			},
		},
		{
			accessorKey: "equipmentName",
			header: t`Equipment`,
			cell: ({ row }) => {
				const sensor = row.original;
				return (
					<Link to={`/equipment/${sensor.equipmentId}`} className="text-primary hover:underline">
						{sensor.equipmentName}
					</Link>
				);
			},
		},
		{
			accessorKey: "status",
			header: t`Status`,
			cell: ({ row }) => {
				const sensor = row.original;
				const config = statusConfig[sensor.status] || statusConfig.healthy;
				const StatusIcon = config.icon;
				return (
					<Badge className={config.className}>
						<StatusIcon className="mr-1 h-3 w-3" aria-hidden="true" />
						{sensor.status}
					</Badge>
				);
			},
		},
		{
			accessorKey: "value",
			header: t`Current Value`,
			cell: ({ row }) => {
				const sensor = row.original;
				if (sensor.value === 0 && !sensor.unit) {
					return <span className="text-muted-foreground">-</span>;
				}
				return (
					<span className="font-mono">
						{sensor.value} {sensor.unit}
					</span>
				);
			},
		},
		{
			accessorKey: "lastSeen",
			header: t`Last Reading`,
			cell: ({ row }) => {
				const sensor = row.original;
				return <span className="text-muted-foreground text-sm">{formatDate(sensor.lastSeen)}</span>;
			},
		},
		{
			id: "actions",
			header: t`Actions`,
			enableSorting: false,
			size: 80,
			cell: ({ row }) => {
				const sensor = row.original;
				return (
					<Button variant="ghost" size="sm" asChild>
						<Link to={`/equipment/${sensor.equipmentId}`}>
							<ExternalLink className="h-4 w-4" aria-hidden="true" />
							<span className="sr-only">{t`View equipment`}</span>
						</Link>
					</Button>
				);
			},
		},
	] satisfies DataTableProps<EnrichedSensor>["columns"];
