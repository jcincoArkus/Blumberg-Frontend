import { definePluginConfig } from "@hey-api/openapi-ts";

import { handler } from "./plugin";
import type { MobxQueryPlugin } from "./types";

export const defaultConfig: MobxQueryPlugin["Config"] = {
	name: "mobx-query",
	dependencies: ["@hey-api/typescript", "@tanstack/react-query"],
	handler,
	config: {
		exportFromIndex: true,
	},
};

/**
 * Type helper for `mobx-query` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
