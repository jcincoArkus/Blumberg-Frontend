// Types for monitoring components

export type HealthStatus = "healthy" | "stale" | "silent" | "offline" | "warning" | "critical";
export type DataQualityStatus = "good" | "missing" | "inconsistent";
export type IngestionSource = "api" | "csv";
export type IngestionStatus = "ok" | "api_error" | "csv_error";
export type QualityWindow = "1h" | "24h" | "7d";
export type ErrorSeverity = "warning" | "alert";

export interface SensorInfo {
	id: string;
	name: string;
	type: string;
	siteId: string;
	siteName?: string;
	equipmentId?: string;
	equipmentName?: string;
}

export interface SensorHealthRecordInfo {
	lastReportedAt?: string;
	expectedIntervalSeconds: number;
	warningThresholdSeconds: number;
	criticalThresholdSeconds: number;
	healthStatus: HealthStatus;
	reliabilityScore?: number;
}

export interface DataQualityInfo {
	window: QualityWindow;
	expectedPoints: number;
	receivedPoints: number;
	missingPoints: number;
	inconsistentPoints: number;
	completenessPct: number;
	consistencyPct: number;
	freshnessPct: number;
	qualityStatus: DataQualityStatus;
	notes?: string;
}

export interface IngestionErrorInfo {
	id: string;
	timestamp: string;
	source: IngestionSource;
	errorCode: string;
	message: string;
	severity: ErrorSeverity;
}

/** Last ingestion source that produced a reading for this sensor (api, csv, simulated). */
export type IngestionSourceLabel = "api" | "csv";

export interface SensorHealthData {
	sensor: SensorInfo;
	health?: SensorHealthRecordInfo;
	quality?: DataQualityInfo;
	ingestionErrors: IngestionErrorInfo[];
	ingestionStatus: IngestionStatus;
	/** Source of last ingestion that produced a reading (api/csv/simulated). Undefined when no readings. */
	ingestionSource?: IngestionSourceLabel;
	issueSummary: string;
}

export interface Site {
	id: string;
	name: string;
	location?: string;
}

export interface Equipment {
	id: string;
	siteId: string;
	name: string;
	type?: string;
}
