// Alerting mock data

export type {
	AlertRule,
	AlertRuleNotification,
	AlertRuleScope,
	AlertRuleScopeType,
	AlertRuleSeverity,
	AlertRuleThresholds,
	NotificationChannel,
	SensorType as AlertingSensorType,
} from "./alerting";
export {
	alertRules,
	equipment as alertingEquipment,
	formatDuration,
	getEquipmentById as getAlertingEquipmentById,
	getEquipmentName,
	getScopeLabel,
	getSiteById as getAlertingSiteById,
	getThresholdsSummary,
	sensorTypeOptions as alertingSensorTypeOptions,
	sites as alertingSites,
	timeOptions,
} from "./alerting";
// Alerts mock data
export {
	alertsData,
	calculateAlertDuration,
	getEquipmentName as getAlertsEquipmentName,
	getSensorName,
	getSensorType,
} from "./alerts";
export type { MapLocation, ZoneStatus } from "./dashboard";
// Dashboard mock data
export {
	agentInsights,
	alerts as dashboardAlerts,
	locationZoneStatus,
	mapLocations as dashboardMapLocations,
	sensors as dashboardSensors,
	sites as dashboardSites,
} from "./dashboard";
export type {
	IngestionError as IngestionRunError,
	IngestionRun,
	RejectedRow,
	SensorReading,
} from "./ingestion";
// Ingestion mock data
export {
	getAllIngestionRuns,
	getIngestionRunById,
	getIngestionRunsLast24h,
	ingestionRuns,
	validateSensorReading,
} from "./ingestion";
export type {
	AlertSeverity as ReportAlertSeverity,
	AlertStatus as ReportAlertStatus,
	DateRangePreset,
	HistoricalAlert,
	HistoricalReading,
	SensorType as ReportSensorType,
} from "./reports";
// Reports mock data
export {
	comparePeriods,
	getHistoricalAlerts,
	getHistoricalReadings,
	historicalAlerts,
	historicalReadings,
} from "./reports";
export type {
	DataQualityRecord,
	DataQualityStatus,
	ErrorSeverity,
	HealthStatus,
	IngestionError,
	IngestionSource,
	IngestionStatus,
	QualityWindow,
	SensorHealthRecord,
} from "./sensor-health";
// Sensor health mock data
export {
	dataQualityRecords,
	formatAge,
	getAgeInMinutes,
	getAllIngestionErrorsLast24h,
	getDataQualityRecord,
	getIngestionErrorsForSensor,
	getSensorHealthRecord,
	ingestionErrors,
	sensorHealthRecords,
} from "./sensor-health";
// Sensor thresholds mock data
export {
	sensorThresholdSeverityOptions,
	sensorThresholds,
	timeOptions as sensorThresholdTimeOptions,
} from "./sensor-thresholds";
export type {
	DataMapping,
	DataMappingTransform,
	DataMappingTransformType,
	Equipment,
	Sensor,
	SensorStatus,
	SensorType,
	Site,
} from "./sensors";
// Sensors mock data
export {
	equipment,
	getAllSensorsEnriched,
	getEquipmentById,
	getEquipmentBySite,
	getSiteById,
	getUnitForSensorType,
	sensors,
	sensorTypeOptions,
	sites,
	transformTypeOptions,
} from "./sensors";
export type {
	Equipment as SiteEquipmentType,
	SiteSensor,
	SiteWithStats,
} from "./sites";
// Sites mock data
export {
	equipment as siteEquipment,
	getAlertsByEquipment,
	getAlertsBySite,
	getAllSitesWithStats,
	getEquipmentById as getSiteEquipmentById,
	getEquipmentBySite as getSiteEquipmentBySite,
	getSensorsByEquipment,
	getSensorsBySite,
	getSiteById as getSiteDataById,
	getSiteWithStats,
	siteAlerts,
	siteSensors,
	sites as siteData,
} from "./sites";
// Users mock data
export {
	countUsersByRole,
	currentUser,
	getActiveUsers,
	getPermissionsForRoleId,
	getRoleById,
	getUserById,
	getUserRoles,
	getUsersByRoleId,
	permissionCategories,
	rolePermissions,
	roles,
	users,
} from "./users";
