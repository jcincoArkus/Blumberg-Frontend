import type { LoggerLevel } from "../types/logger-level.type";

/**
 * Maps logger levels to console methods
 */
export const LOGGER_LEVEL_MAP: Record<LoggerLevel, "log" | "warn" | "error"> = {
	info: "log",
	warn: "warn",
	error: "error",
	critical: "error",
};
