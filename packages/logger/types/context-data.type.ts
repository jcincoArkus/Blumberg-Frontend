/**
 * Context data that persists across log entries
 * Used to track global information like userId, sessionId, etc.
 */
export interface ContextData {
	/** User identifier */
	userId?: string;
	/** Session identifier */
	sessionId?: string;
	/** Additional custom context fields */
	[key: string]: unknown;
}
