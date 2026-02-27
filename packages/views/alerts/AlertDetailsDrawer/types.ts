import type { Alert } from "../types";

export interface AlertDetailsDrawerProps {
	alert: Alert;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAlertUpdate?: (alertId: string, action: "acknowledge" | "resolve") => void;
	equipmentName?: string;
	sensorName?: string;
	siteName?: string;
	siteLocation?: string;
	/** True while full alert (with events) is being fetched */
	isDetailLoading?: boolean;
}
