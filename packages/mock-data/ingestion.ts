// Ingestion types
export interface IngestionError {
	code: string;
	message: string;
	count: number;
}

export interface RejectedRow {
	rowNumber: number;
	raw: Record<string, string>;
	reasonCode: string;
	reasonMessage: string;
}

export interface IngestionRun {
	id: string;
	source: "api" | "csv";
	createdAt: string;
	totalRecords: number;
	acceptedCount: number;
	rejectedCount: number;
	status: "success" | "partial" | "fail";
	errors: IngestionError[];
	fileName?: string;
	requestId?: string;
	rejectedRowsSample?: RejectedRow[];
}

export interface SensorReading {
	sensorId: string;
	timestamp: string;
	value: number;
	unit?: string;
	readingType?: string;
}

// Mock ingestion runs data
export const ingestionRuns: IngestionRun[] = [
	{
		id: "run-001",
		source: "api",
		createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
		totalRecords: 150,
		acceptedCount: 148,
		rejectedCount: 2,
		status: "partial",
		errors: [{ code: "INVALID_SENSOR_ID", message: "Sensor ID not found", count: 2 }],
		requestId: "req-abc123",
	},
	{
		id: "run-002",
		source: "api",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
		totalRecords: 200,
		acceptedCount: 200,
		rejectedCount: 0,
		status: "success",
		errors: [],
		requestId: "req-def456",
	},
	{
		id: "run-003",
		source: "csv",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
		totalRecords: 500,
		acceptedCount: 485,
		rejectedCount: 15,
		status: "partial",
		errors: [
			{ code: "INVALID_TIMESTAMP", message: "Invalid timestamp format", count: 10 },
			{ code: "MISSING_VALUE", message: "Value field is required", count: 5 },
		],
		fileName: "sensor_readings_jan15.csv",
		rejectedRowsSample: [
			{
				rowNumber: 45,
				raw: { sensor_id: "s-999", timestamp: "invalid", value: "25.5", unit: "°C" },
				reasonCode: "INVALID_TIMESTAMP",
				reasonMessage: "Invalid timestamp format",
			},
			{
				rowNumber: 102,
				raw: { sensor_id: "s-1", timestamp: "2024-01-15T10:00:00Z", value: "", unit: "°C" },
				reasonCode: "MISSING_VALUE",
				reasonMessage: "Value field is required",
			},
		],
	},
	{
		id: "run-004",
		source: "api",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
		totalRecords: 100,
		acceptedCount: 100,
		rejectedCount: 0,
		status: "success",
		errors: [],
		requestId: "req-ghi789",
	},
	{
		id: "run-005",
		source: "csv",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
		totalRecords: 1000,
		acceptedCount: 950,
		rejectedCount: 50,
		status: "partial",
		errors: [
			{ code: "INVALID_SENSOR_ID", message: "Sensor ID not found", count: 30 },
			{ code: "OUT_OF_RANGE", message: "Value out of acceptable range", count: 20 },
		],
		fileName: "batch_upload_jan14.csv",
	},
	{
		id: "run-006",
		source: "api",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
		totalRecords: 50,
		acceptedCount: 0,
		rejectedCount: 50,
		status: "fail",
		errors: [{ code: "INVALID_AUTH", message: "Authentication failed", count: 50 }],
		requestId: "req-jkl012",
	},
];

// Helper functions
export function getAllIngestionRuns(): IngestionRun[] {
	return ingestionRuns;
}

export function getIngestionRunsLast24h(): IngestionRun[] {
	const oneDayAgo = Date.now() - 1000 * 60 * 60 * 24;
	return ingestionRuns.filter((run) => new Date(run.createdAt).getTime() > oneDayAgo);
}

export function getIngestionRunById(id: string): IngestionRun | undefined {
	return ingestionRuns.find((run) => run.id === id);
}

// Validation helper for sensor readings
export function validateSensorReading(
	reading: Partial<SensorReading>,
	validSensorIds: string[],
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!reading.sensorId) {
		errors.push("Missing sensor ID");
	} else if (!validSensorIds.includes(reading.sensorId)) {
		errors.push("Invalid sensor ID");
	}

	if (!reading.timestamp) {
		errors.push("Missing timestamp");
	} else if (isNaN(Date.parse(reading.timestamp))) {
		errors.push("Invalid timestamp format");
	}

	if (reading.value === undefined || reading.value === null || isNaN(reading.value)) {
		errors.push("Missing or invalid value");
	}

	return { valid: errors.length === 0, errors };
}
