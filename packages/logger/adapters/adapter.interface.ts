import type { LogEntry } from "../types/log-entry.type";

/**
 * Interface that all log adapters must implement
 * Adapters handle the actual output of log entries (console, DataDog, Sentry, etc.)
 */
export interface LogAdapter {
	/** Unique name for the adapter */
	readonly name: string;

	/** Whether the adapter is currently enabled */
	readonly isEnabled: boolean;

	/**
	 * Initialize the adapter
	 * Called once when the logger is initialized
	 */
	initialize(): void;

	/**
	 * Process a log entry
	 * @param entry - The complete log entry to process
	 */
	log(entry: LogEntry): void;

	/**
	 * Update global context data (optional)
	 * Called when context is updated via logger.updateContext()
	 * @param context - The updated context data
	 */
	updateContext?(context: Record<string, unknown>): void;
}
