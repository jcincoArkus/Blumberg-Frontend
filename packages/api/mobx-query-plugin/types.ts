import type { DefinePlugin } from "@hey-api/openapi-ts";

/**
 * User-facing configuration for the mobx-query plugin.
 * These are the options users can specify in their config.
 */
export interface UserConfig {
	/**
	 * Plugin name. Must be unique.
	 */
	name: "mobx-query";

	/**
	 * Whether exports should be re-exported in the index file.
	 *
	 * @default true
	 */
	exportFromIndex?: boolean;
}

/**
 * Resolved configuration for the mobx-query plugin.
 * This is the normalized version of UserConfig with all defaults applied.
 */
export interface Config {
	/**
	 * Plugin name. Must be unique.
	 */
	name: "mobx-query";

	/**
	 * Whether exports should be re-exported in the index file.
	 */
	exportFromIndex: boolean;
}

export type MobxQueryPlugin = DefinePlugin<UserConfig, Config>;
