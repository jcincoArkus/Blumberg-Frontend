import { AlertTriangle, Bell, CheckCircle2, Clock, X } from "lucide-react";

import {
	Badge,
	Button,
	Card,
	CardContent,
	cn,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	Separator,
} from "~@/ui";

import type { Equipment, HistoricalAlert } from "./types";

interface HistoricalAlertDetailsDrawerProps {
	alert: HistoricalAlert | null;
	equipment?: Equipment;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function HistoricalAlertDetailsDrawer({
	alert,
	equipment,
	open,
	onOpenChange,
}: HistoricalAlertDetailsDrawerProps) {
	if (!alert) return null;

	const formatTimestamp = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	const formatDuration = (seconds?: number) => {
		if (!seconds) return "N/A";
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes} minutes`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours} hours ${mins} minutes`;
	};

	const getSeverityBadge = (severity: string) => {
		const config = {
			critical: {
				label: "Critical",
				className: "bg-red-100 text-red-700 border-red-200",
				icon: AlertTriangle,
			},
			high: {
				label: "High",
				className: "bg-orange-100 text-orange-700 border-orange-200",
				icon: AlertTriangle,
			},
			medium: {
				label: "Medium",
				className: "bg-amber-100 text-amber-700 border-amber-200",
				icon: Bell,
			},
			low: { label: "Low", className: "bg-blue-100 text-blue-700 border-blue-200", icon: Bell },
		};
		const cfg = config[severity as keyof typeof config] || config.critical;
		const Icon = cfg.icon;
		return (
			<Badge variant="outline" className={cn("border font-semibold", cfg.className)}>
				<Icon className="mr-1 size-3" />
				{cfg.label}
			</Badge>
		);
	};

	const getStatusBadge = (status: string) => {
		const config = {
			active: {
				label: "Active",
				className: "bg-red-100 text-red-700 border-red-200",
				icon: AlertTriangle,
			},
			acknowledged: {
				label: "Acknowledged",
				className: "bg-amber-100 text-amber-700 border-amber-200",
				icon: Clock,
			},
			resolved: {
				label: "Resolved",
				className: "bg-emerald-100 text-emerald-700 border-emerald-200",
				icon: CheckCircle2,
			},
		};
		const cfg = config[status as keyof typeof config] || config.active;
		const Icon = cfg.icon;
		return (
			<Badge variant="outline" className={cn("border", cfg.className)}>
				<Icon className="mr-1 size-3" />
				{cfg.label}
			</Badge>
		);
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="h-full w-full sm:max-w-2xl">
				<DrawerHeader className="border-b">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<DrawerTitle className="mb-2 text-xl font-semibold">Alert Details</DrawerTitle>
							<DrawerDescription>{alert.title}</DrawerDescription>
						</div>
						<DrawerClose asChild>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<X className="h-4 w-4" />
							</Button>
						</DrawerClose>
					</div>
				</DrawerHeader>

				<div className="flex-1 space-y-6 overflow-y-auto p-6">
					{/* Summary */}
					<div className="flex items-center gap-3">
						{getSeverityBadge(alert.severity)}
						{getStatusBadge(alert.status)}
					</div>

					<Separator />

					{/* Lifecycle Timestamps */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground">Lifecycle</h3>
						<div className="space-y-3">
							<div>
								<p className="mb-1 text-xs text-muted-foreground">Created At</p>
								<p className="text-sm font-medium">{formatTimestamp(alert.createdAt)}</p>
							</div>
							{alert.acknowledgedAt && (
								<div>
									<p className="mb-1 text-xs text-muted-foreground">Acknowledged At</p>
									<p className="text-sm font-medium">{formatTimestamp(alert.acknowledgedAt)}</p>
								</div>
							)}
							{alert.resolvedAt && (
								<div>
									<p className="mb-1 text-xs text-muted-foreground">Resolved At</p>
									<p className="text-sm font-medium">{formatTimestamp(alert.resolvedAt)}</p>
								</div>
							)}
							{alert.durationSeconds && (
								<div>
									<p className="mb-1 text-xs text-muted-foreground">Duration</p>
									<p className="text-sm font-medium">{formatDuration(alert.durationSeconds)}</p>
								</div>
							)}
						</div>
					</div>

					<Separator />

					{/* Equipment Context */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold text-foreground">Context</h3>
						<div className="space-y-3">
							<div>
								<p className="mb-1 text-xs text-muted-foreground">Equipment</p>
								<p className="text-sm font-medium">{equipment?.name || alert.equipmentId}</p>
							</div>
							{alert.sensorId && (
								<div>
									<p className="mb-1 text-xs text-muted-foreground">Sensor ID</p>
									<p className="font-mono text-sm">{alert.sensorId}</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
