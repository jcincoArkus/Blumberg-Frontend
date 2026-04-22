import type { Alert } from "../types";

export interface AlertsWorkQueueTableProps {
	alerts: Alert[];
	onAlertUpdate?: (alertId: string, action: "acknowledge" | "resolve") => void;
	calculateDuration: (alert: Alert) => string;
	getEquipmentName: (equipmentId: string) => string;
	getSensorType: (sensorId: string) => string;
	getSensorName: (sensorId: string) => string;
	selectedAlert: Alert | null;
	onSelectAlert: (alert: Alert) => void;
	alertDetail: Alert | null;
	onDrawerClose: () => void;
	isDetailLoading?: boolean;
}

export interface AlertActionButtonsProps {
	alert: Alert;
	onAlertUpdate?: (alertId: string, action: "acknowledge" | "resolve") => void;
	onViewDetails: () => void;
}

export interface PaginationProps {
	currentPage: number;
	totalPages: number;
	itemsPerPage: number;
	totalItems: number;
	onPageChange: (page: number) => void;
}
