import {
	AlertCircle,
	AlertTriangle,
	Check,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	ExternalLink,
	Info,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import {
	Badge,
	Button,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import { AlertDetailsDrawer } from "./AlertDetailsDrawer";
import type { Alert } from "./types";

interface AlertsWorkQueueTableProps {
	alerts: Alert[];
	onAlertUpdate?: (alertId: string, action: "acknowledge" | "resolve") => void;
	calculateDuration: (alert: Alert) => string;
	getEquipmentName: (equipmentId: string) => string;
	getSensorType: (sensorId: string) => string;
	getSensorName: (sensorId: string) => string;
}

const severityConfig = {
	critical: {
		icon: AlertCircle,
		label: "Critical",
		className: "bg-red-100 text-red-700 border-red-300",
		dot: "bg-red-600",
	},
	high: {
		icon: AlertTriangle,
		label: "Alert",
		className: "bg-orange-100 text-orange-700 border-orange-300",
		dot: "bg-orange-600",
	},
	medium: {
		icon: AlertTriangle,
		label: "Warning",
		className: "bg-amber-100 text-amber-700 border-amber-300",
		dot: "bg-amber-600",
	},
	low: {
		icon: Info,
		label: "Warning",
		className: "bg-blue-100 text-blue-700 border-blue-300",
		dot: "bg-blue-600",
	},
};

const statusConfig = {
	active: {
		label: "Active",
		className: "bg-red-100 text-red-700 border-red-200",
	},
	acknowledged: {
		label: "Acknowledged",
		className: "bg-amber-100 text-amber-700 border-amber-200",
	},
	resolved: {
		label: "Resolved",
		className: "bg-emerald-100 text-emerald-700 border-emerald-200",
	},
};

export function AlertsWorkQueueTable({
	alerts,
	onAlertUpdate,
	calculateDuration,
	getEquipmentName,
	getSensorType,
	getSensorName,
}: AlertsWorkQueueTableProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
	const itemsPerPage = 10;
	const totalPages = Math.ceil(alerts.length / itemsPerPage);

	const paginatedAlerts = alerts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const formatTimestamp = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleRowClick = (alert: Alert) => {
		setSelectedAlert(alert);
	};

	if (alerts.length === 0) {
		return (
			<div className="py-12 text-center">
				<div className="flex justify-center mb-4">
					<div className="size-16 rounded-full bg-muted flex items-center justify-center">
						<CheckCircle2 className="size-8 text-muted-foreground" />
					</div>
				</div>
				<p className="text-sm font-medium text-foreground mb-1">No alerts found</p>
				<p className="text-xs text-muted-foreground">All systems operating normally</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4">
				<div className="rounded-lg border bg-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[120px]">Severity</TableHead>
								<TableHead>Alert Title</TableHead>
								<TableHead>Origin</TableHead>
								<TableHead>Sensor</TableHead>
								<TableHead className="w-[100px]">Duration</TableHead>
								<TableHead className="w-[120px]">Status</TableHead>
								<TableHead className="w-[140px]">Created</TableHead>
								<TableHead className="w-[100px] text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedAlerts.map((alert) => {
								const severityInfo = severityConfig[alert.severity];
								const SeverityIcon = severityInfo.icon;
								const statusInfo = statusConfig[alert.status];
								const duration = calculateDuration(alert);
								const equipmentName = alert.equipmentId
									? getEquipmentName(alert.equipmentId)
									: "Unknown Equipment";
								const sensorType = alert.sensorId ? getSensorType(alert.sensorId) : "unknown";
								const sensorName = alert.sensorId
									? getSensorName(alert.sensorId)
									: "Unknown Sensor";

								return (
									<TableRow
										key={alert.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => handleRowClick(alert)}
									>
										<TableCell>
											<Badge
												variant="outline"
												className={`${severityInfo.className} border-2 font-semibold`}
											>
												<span className={`size-2 rounded-full ${severityInfo.dot} mr-1.5`} />
												<SeverityIcon className="mr-1 h-3 w-3" />
												{severityInfo.label}
											</Badge>
										</TableCell>
										<TableCell>
											<div>
												<p className="font-medium text-foreground">{alert.name}</p>
												<p className="text-xs text-muted-foreground line-clamp-1">
													{alert.description}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<div>
												<Link
													to={`/equipment/${alert.equipmentId}`}
													className="font-medium text-primary hover:underline"
													onClick={(e) => e.stopPropagation()}
												>
													{equipmentName}
												</Link>
												<p className="text-xs text-muted-foreground font-mono">
													{alert.equipmentId}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<div>
												<p className="text-sm text-foreground capitalize">{sensorType}</p>
												<p className="text-xs text-muted-foreground">{sensorName}</p>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
												<Clock className="size-3.5" />
												<span className="font-medium">{duration}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={`${statusInfo.className} border font-medium`}
											>
												{alert.status === "resolved" && <CheckCircle2 className="mr-1 h-3 w-3" />}
												{statusInfo.label}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="text-xs text-muted-foreground">
												{formatTimestamp(alert.createdAt)}
											</div>
										</TableCell>
										<TableCell className="text-right">
											<AlertActionButtons
												alert={alert}
												onAlertUpdate={onAlertUpdate}
												onViewDetails={() => handleRowClick(alert)}
											/>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						itemsPerPage={itemsPerPage}
						totalItems={alerts.length}
						onPageChange={setCurrentPage}
					/>
				)}
			</div>

			{/* Alert Details Drawer */}
			{selectedAlert && (
				<AlertDetailsDrawer
					alert={alerts.find((a) => a.id === selectedAlert.id) || selectedAlert}
					open={!!selectedAlert}
					onOpenChange={(open) => !open && setSelectedAlert(null)}
					onAlertUpdate={(alertId, action) => {
						if (onAlertUpdate) {
							onAlertUpdate(alertId, action);
						}
					}}
				/>
			)}
		</>
	);
}

// Extracted component for action buttons
function AlertActionButtons({
	alert,
	onAlertUpdate,
	onViewDetails,
}: {
	alert: Alert;
	onAlertUpdate?: (alertId: string, action: "acknowledge" | "resolve") => void;
	onViewDetails: () => void;
}) {
	return (
		<div className="flex items-center justify-end gap-1">
			{alert.status === "active" && onAlertUpdate && (
				<>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={(e) => {
							e.stopPropagation();
							onAlertUpdate(alert.id, "acknowledge");
						}}
						title="Acknowledge alert"
					>
						<Check className="h-3.5 w-3.5 mr-1" />
						Ack
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={(e) => {
							e.stopPropagation();
							onAlertUpdate(alert.id, "resolve");
						}}
						title="Resolve alert"
					>
						<CheckCircle2 className="h-3.5 w-3.5 mr-1" />
						Resolve
					</Button>
				</>
			)}
			{alert.status === "acknowledged" && onAlertUpdate && (
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-2 text-xs"
					onClick={(e) => {
						e.stopPropagation();
						onAlertUpdate(alert.id, "resolve");
					}}
					title="Resolve alert"
				>
					<CheckCircle2 className="h-3.5 w-3.5 mr-1" />
					Resolve
				</Button>
			)}
			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0"
				onClick={(e) => {
					e.stopPropagation();
					onViewDetails();
				}}
				title="View details"
			>
				<ExternalLink className="h-4 w-4" />
			</Button>
		</div>
	);
}

// Extracted pagination component
function Pagination({
	currentPage,
	totalPages,
	itemsPerPage,
	totalItems,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	itemsPerPage: number;
	totalItems: number;
	onPageChange: (page: number) => void;
}) {
	return (
		<div className="flex items-center justify-between">
			<p className="text-sm text-muted-foreground">
				Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
				{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} alerts
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="h-4 w-4" />
					Previous
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
								onClick={() => onPageChange(pageNum)}
							>
								{pageNum}
							</Button>
						);
					})}
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					Next
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
