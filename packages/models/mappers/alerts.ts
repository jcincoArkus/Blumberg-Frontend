import {
	alertsData,
	calculateAlertDuration,
	getAlertsEquipmentName,
	getSensorName,
	getSensorType,
} from "~@/mock-data";

import type { Alert } from "../types/alerts";

export const getAlerts = (): Alert[] => alertsData;

export const getAlertDuration = calculateAlertDuration;
export const getEquipmentName = getAlertsEquipmentName;
export const getAlertSensorName = getSensorName;
export const getAlertSensorType = getSensorType;
