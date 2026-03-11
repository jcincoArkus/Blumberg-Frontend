import { useState } from "react";
import { Link } from "react-router";

import { t } from "~@/i18n/macro";
import { getSeverityConfig } from "~@/models";
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~@/ui";

import { AlertDetailsDrawer } from "../AlertDetailsDrawer";
import type { Alert } from "../types";
import { AlertActionButtons } from "./AlertActionButtons";
import { getStatusConfig } from "./constants";
import { EmptyState } from "./EmptyState";
import { formatTimestamp } from "./helpers";
import { Pagination } from "./Pagination";
import type { AlertsWorkQueueTableProps } from "./types";

export type { AlertsWorkQueueTableProps } from "./types";

export function AlertsWorkQueueTable({
	alerts,
	onAlertUpdate,
	calculateDuration,
	getEquipmentName,
	getSensorType,
	getSensorName,
	selectedAlert,
	onSelectAlert,
	alertDetail,
	onDrawerClose,
	isDetailLoading = false,
}: AlertsWorkQueueTableProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const totalPages = Math.ceil(alerts.length / itemsPerPage);

	const paginatedAlerts = alerts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const handleRowClick = (alert: Alert) => {
		onSelectAlert(alert);
	};

	const severityConfig = getSeverityConfig();
	const statusConfig = getStatusConfig();

	if (alerts.length === 0) {
		return <EmptyState />;
	}

	return (
		<>
			<div className="space-y-4">
				<div className="rounded-lg border bg-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-30">{t`Severity`}</TableHead>
								<TableHead>{t`Alert Title`}</TableHead>
								<TableHead>{t`Origin`}</TableHead>
								<TableHead>{t`Sensor`}</TableHead>
								<TableHead className="w-25">{t`Duration`}</TableHead>
								<TableHead className="w-30">{t`Status`}</TableHead>
								<TableHead className="w-35">{t`Created`}</TableHead>
								<TableHead className="w-25 text-right">{t`Actions`}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedAlerts.map((alert) => {
								const severityInfo = severityConfig[alert.severity] ?? severityConfig.info;
								const SeverityIcon = severityInfo.icon;
								const statusInfo = statusConfig[alert.status];
								const duration = calculateDuration(alert);
								const equipmentName = alert.equipmentId
									? getEquipmentName(alert.equipmentId)
									: t`Unknown Equipment`;
								const sensorType = alert.sensorId ? getSensorType(alert.sensorId) : t`unknown`;
								const sensorName = alert.sensorId
									? getSensorName(alert.sensorId)
									: t`Unknown Sensor`;

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
												<span className="font-medium">{duration}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={`${statusInfo.className} border font-medium`}
											>
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

			{selectedAlert && (
				<AlertDetailsDrawer
					alert={
						alertDetail && selectedAlert && String(alertDetail.id) === String(selectedAlert.id)
							? alertDetail
							: (alerts.find((a) => a.id === selectedAlert.id) ?? selectedAlert)
					}
					open={!!selectedAlert}
					onOpenChange={(open) => {
						if (!open) onDrawerClose();
					}}
					onAlertUpdate={(alertId, action) => {
						if (onAlertUpdate) {
							onAlertUpdate(alertId, action);
						}
					}}
					equipmentName={
						selectedAlert.equipmentId ? getEquipmentName(selectedAlert.equipmentId) : undefined
					}
					sensorName={selectedAlert.sensorId ? getSensorName(selectedAlert.sensorId) : undefined}
					isDetailLoading={isDetailLoading}
				/>
			)}
		</>
	);
}
