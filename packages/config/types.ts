/**
 * Configuration interface for the application
 * Define all configuration properties here with their types
 */
export interface AppConfig {
	/** Environment name */
	env: string;

	/** Default locale */
	defaultLocale: string;

	/** API configuration */
	api: {
		/** Base URL for the API */
		url: string;
		/** WebSocket URL */
		wsUrl: string;
	};

	/** Logger configuration */
	logger?: {
		/** Console adapter configuration */
		console?: {
			enabled?: boolean;
		};
	};
}

/**
 * Supported environment names
 */
export type Environment = "develop" | "staging" | "production";
