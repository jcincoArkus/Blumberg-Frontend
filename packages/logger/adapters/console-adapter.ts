import { config } from "~@/config";

import { LOGGER_LEVEL_MAP } from "../constants/logger-level-map";
import type { LogEntry } from "../types/log-entry.type";
import type { LogAdapter } from "./adapter.interface";

const STORAGE_KEY = "app_logger_console";

/**
 * Console adapter for browser console output
 * Respects config.logger.console.enabled and localStorage override
 */
export class ConsoleAdapter implements LogAdapter {
	readonly name = "console";

	constructor() {
		// No MobX needed - just reads config
	}

	get isEnabled(): boolean {
		// 1. localStorage ALWAYS has priority (for debugging)
		// Developers can always enable/disable via browser console
		const storageValue = localStorage.getItem(STORAGE_KEY);
		if (storageValue !== null) {
			return storageValue === "true";
		}

		// 2. Use environment variable as default
		const configEnabled = config.logger?.console?.enabled;
		if (configEnabled !== undefined) {
			return configEnabled;
		}

		// 3. If no config, always disable in production
		return false;
	}

	initialize(): void {
		// No initialization needed for console adapter
	}

	log(entry: LogEntry): void {
		if (!this.isEnabled) {
			return;
		}

		const consoleMethod = LOGGER_LEVEL_MAP[entry.level];
		const timestamp = entry.timestamp.toISOString();
		const level = entry.level.toUpperCase();

		// Format: [timestamp] [LEVEL] message
		const prefix = `[${timestamp}] [${level}]`;

		// Build log arguments
		const args: unknown[] = [prefix, entry.message];

		// Add error object if present
		if (entry.errorObject) {
			args.push("\nError:", entry.errorObject);
		}

		// Add additional info if present
		if (entry.additionalInfo && Object.keys(entry.additionalInfo).length > 0) {
			args.push("\nAdditional Info:", entry.additionalInfo);
		}

		// Add context if present
		if (entry.context && Object.keys(entry.context).length > 0) {
			args.push("\nContext:", entry.context);
		}

		// Add time since init
		args.push(`\nTime since init: ${entry.timeSinceInit}ms`);

		// Output to console
		// eslint-disable-next-line no-console
		console[consoleMethod](...args);
	}
}

export const consoleAdapter = new ConsoleAdapter();
