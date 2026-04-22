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
