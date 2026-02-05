// Main logger API

// Adapter interface (for creating custom adapters)
export type { LogAdapter } from "./adapters/adapter.interface";
export { logger, useLogger } from "./logger";
export type { ContextData } from "./types/context-data.type";
export type { LogEntry, LogOptions } from "./types/log-entry.type";
// Types
export type { LoggerLevel } from "./types/logger-level.type";
