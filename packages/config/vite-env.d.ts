/// <reference types="vite/client" />
/** biome-ignore-all lint/correctness/noUnusedVariables:  Used for Vite environment variables */

/**
 * Vite environment variables interface
 */
interface ImportMetaEnv {
	readonly MODE?: string;
	readonly VITE_DEFAULT_LOCALE?: string;
	readonly VITE_API_URL?: string;
	readonly VITE_WSS_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
