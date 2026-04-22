import {
	alertingEquipment,
	alertingSensorTypeOptions,
	alertingSites,
	alertRules,
	formatDuration,
	getScopeLabel,
	getThresholdsSummary,
	timeOptions,
} from "~@/mock-data";

import type {
	AlertingEquipment,
	AlertingSite,
	AlertRule,
	SensorTypeOption,
	TimeOption,
} from "../types/config";

export const getAlertRules = (): AlertRule[] => alertRules;
export const getAlertingSites = (): AlertingSite[] => alertingSites;
export const getAlertingEquipment = (): AlertingEquipment[] => alertingEquipment;
export const getAlertingSensorTypeOptions = (): SensorTypeOption[] => alertingSensorTypeOptions;
export const getAlertingTimeOptions = (): TimeOption[] => timeOptions;

export const formatAlertDuration = formatDuration;
export const getAlertScopeLabel = getScopeLabel;
export const getAlertThresholdsSummary = getThresholdsSummary;
