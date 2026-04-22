import {
	equipment,
	getAllSensorsEnriched,
	getEquipmentBySite,
	getUnitForSensorType,
	sensorTypeOptions,
	sites,
	transformTypeOptions,
} from "~@/mock-data";

import type {
	Equipment,
	Sensor,
	SensorType,
	SensorTypeOption,
	Site,
	TransformTypeOption,
} from "../types/sensors";

export const getSensors = (): Sensor[] => getAllSensorsEnriched();
export const getSites = (): Site[] => sites;
export const getEquipment = (): Equipment[] => equipment;

export const getEquipmentBySiteId = (siteId: string): Equipment[] => getEquipmentBySite(siteId);
export const getUnitForSensor = (type: SensorType): string => getUnitForSensorType(type);

export const getSensorTypeOptions = (): SensorTypeOption[] => sensorTypeOptions;
export const getTransformTypeOptions = (): TransformTypeOption[] => transformTypeOptions;
