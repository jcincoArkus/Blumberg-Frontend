import { config } from "~@/config";
import { makeAutoObservable, when } from "~@/mobx";

import type { LogAdapter } from "./adapters/adapter.interface";
import { consoleAdapter } from "./adapters/console-adapter";
import { loggerContext } from "./logger-context";
import type { LogEntry, LogOptions } from "./types/log-entry.type";
import type { LoggerLevel } from "./types/logger-level.type";

/**
 * Main Logger class
 * Provides info, warn, error, and critical logging methods
 * Manages adapters and global context
 */
export class Logger {
	private _adapters: LogAdapter[] = [];
	private _isInitialized = false;

	constructor() {
		makeAutoObservable(this);

		// Auto-initialize when config is ready
		this._autoInitialize();
	}

	/**
	 * Auto-initialize when config is available
	 * Uses MobX when() to wait for config to be ready
	 */
	private _autoInitialize(): void {
		// Wait for config to be available (it's always available in this setup)
		when(
			() => config !== undefined,
			() => {
				this._initialize();
			},
		);
	}

	/**
	 * Initialize the logger and all adapters
	 */
	private _initialize(): void {
		if (this._isInitialized) {
			return;
		}

		try {
			// Initialize context
			loggerContext.initialize();

			// Console adapter is currently the only adapter
			// Additional adapters (DataDog, Sentry, etc.) can be added in the future
			this._adapters = [consoleAdapter];

			// Initialize all adapters
			for (const adapter of this._adapters) {
				try {
					adapter.initialize();
				} catch (error) {
					// Don't let adapter initialization failures crash the logger
					// eslint-disable-next-line no-console
					console.error(`Failed to initialize ${adapter.name} adapter:`, error);
				}
			}

			this._isInitialized = true;
		} catch (error) {
			// Don't let logger initialization failures crash the app
			// eslint-disable-next-line no-console
			console.error("Failed to initialize logger:", error);
		}
	}

	/**
	 * Create a log entry and send it to all enabled adapters
	 */
	private _log(level: LoggerLevel, input: string | LogOptions): void {
		// Ensure logger is initialized
		if (!this._isInitialized) {
			return;
		}

		try {
			// Parse input
			const message = typeof input === "string" ? input : input.message;
			const errorObject = typeof input === "string" ? undefined : input.errorObject;
			const additionalInfo = typeof input === "string" ? undefined : input.additionalInfo;

			// Create log entry
			const entry: LogEntry = {
				level,
				message,
				timestamp: new Date(),
				errorObject,
				additionalInfo,
				context: loggerContext.data(),
				timeSinceInit: loggerContext.timeSinceLoggerInitInMS,
			};

			// Send to all enabled adapters
			for (const adapter of this._adapters) {
				try {
					if (adapter.isEnabled) {
						adapter.log(entry);
					}
				} catch (error) {
					// Don't let adapter failures crash the app
					// eslint-disable-next-line no-console
					console.error(`Adapter ${adapter.name} failed to log:`, error);
				}
			}
		} catch (error) {
			// Don't let logging failures crash the app
			// eslint-disable-next-line no-console
			console.error("Failed to log:", error);
		}
	}

	/**
	 * Log an info-level message
	 * @param input - Message string or options object
	 */
	info(input: string | LogOptions): void {
		this._log("info", input);
	}

	/**
	 * Log a warning-level message
	 * @param input - Message string or options object
	 */
	warn(input: string | LogOptions): void {
		this._log("warn", input);
	}

	/**
	 * Log an error-level message
	 * @param input - Message string or options object
	 */
	error(input: string | LogOptions): void {
		this._log("error", input);
	}

	/**
	 * Log a critical-level message (severe errors)
	 * @param input - Message string or options object
	 */
	critical(input: string | LogOptions): void {
		this._log("critical", input);
	}

	/**
	 * Update global context data (merges with existing)
	 * @param context - Context data to add/update
	 */
	updateContext(context: Record<string, unknown>): void {
		try {
			loggerContext.updateContext(context);

			// Notify adapters of context update
			for (const adapter of this._adapters) {
				try {
					if (adapter.updateContext && adapter.isEnabled) {
						adapter.updateContext(context);
					}
				} catch (error) {
					// Don't let adapter failures crash the app
					// eslint-disable-next-line no-console
					console.error(`Adapter ${adapter.name} failed to update context:`, error);
				}
			}
		} catch (error) {
			// Don't let context update failures crash the app
			// eslint-disable-next-line no-console
			console.error("Failed to update context:", error);
		}
	}

	/**
	 * Clear all context data
	 * @param reason - Optional reason for clearing context (will be logged)
	 */
	clearContext(reason?: string): void {
		try {
			if (reason) {
				this.info(`Clearing context: ${reason}`);
			}
			loggerContext.clearContext();
		} catch (error) {
			// Don't let context clear failures crash the app
			// eslint-disable-next-line no-console
			console.error("Failed to clear context:", error);
		}
	}
}

// Singleton instance
export const logger = new Logger();

// Hook for use in React components (follows project pattern)
export const useLogger = () => logger;
