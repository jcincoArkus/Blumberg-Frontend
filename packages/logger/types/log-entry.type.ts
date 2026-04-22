import type { ContextData } from "./context-data.type";
import type { LoggerLevel } from "./logger-level.type";

/**
 * Options for logging with additional metadata
 */
export interface LogOptions {
	/** The log message */
	message: string;
	/** Error object (for error and critical levels) */
	errorObject?: Error;
	/** Additional contextual information */
	additionalInfo?: Record<string, unknown>;
}

/**
 * Complete log entry structure passed to adapters
 */
export interface LogEntry {
	/** Log level */
	level: LoggerLevel;
	/** Log message */
	message: string;
	/** Timestamp when the log was created */
	timestamp: Date;
	/** Error object if present */
	errorObject?: Error;
	/** Additional contextual information */
	additionalInfo?: Record<string, unknown>;
	/** Global context data */
	context: ContextData;
	/** Time since logger initialization in milliseconds */
	timeSinceInit: number;
}
