// Re-export types from mock data
// Sensor types
export type {
	AlertingSensorType as SensorType,
	AlertRule,
	AlertRuleNotification,
	AlertRuleScope,
	AlertRuleScopeType,
	AlertRuleSeverity,
	AlertRuleThresholds,
	DataMapping,
	DataMappingTransform,
	DataMappingTransformType,
	Equipment,
	NotificationChannel,
	Sensor,
	SensorStatus,
	Site,
} from "~@/mock-data";
export {
	getEquipmentBySite,
	getUnitForSensorType,
	sensorTypeOptions,
	transformTypeOptions,
} from "~@/mock-data";
