import { makeAutoObservable } from "~@/mobx";

import type { ContextData } from "./types/context-data.type";

/**
 * Manages global context data that persists across log entries
 * Tracks information like userId, sessionId, and time since initialization
 */
export class LoggerContext {
	private _context: ContextData = {};
	private _initTime: number | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	/**
	 * Initialize the context with a timestamp
	 */
	initialize(): void {
		this._initTime = Date.now();
	}

	/**
	 * Get the current context data
	 */
	data(): ContextData {
		return { ...this._context };
	}

	/**
	 * Time elapsed since logger initialization in milliseconds
	 */
	get timeSinceLoggerInitInMS(): number {
		if (this._initTime === null) {
			return 0;
		}
		return Date.now() - this._initTime;
	}

	/**
	 * Update context with new data (merges with existing)
	 * @param context - Context data to add/update
	 */
	updateContext(context: Record<string, unknown>): void {
		this._context = {
			...this._context,
			...context,
		};
	}

	/**
	 * Clear all context data
	 */
	clearContext(): void {
		this._context = {};
	}
}

export const loggerContext = new LoggerContext();
