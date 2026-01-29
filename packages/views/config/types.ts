// Re-export types from mock data
export type {
	AlertRule,
	AlertRuleNotification,
	AlertRuleScope,
	AlertRuleScopeType,
	AlertRuleSeverity,
	AlertRuleThresholds,
	NotificationChannel,
	SensorType,
} from "../../../apps/app/src/mock-data/alerting";
// Sensor types
export type {
	DataMapping,
	DataMappingTransform,
	DataMappingTransformType,
	Equipment,
	Sensor,
	SensorStatus,
	Site,
} from "../../../apps/app/src/mock-data/sensors";
export {
	getEquipmentBySite,
	getUnitForSensorType,
	sensorTypeOptions,
	transformTypeOptions,
} from "../../../apps/app/src/mock-data/sensors";
