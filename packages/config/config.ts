import { Language } from "~@/i18n";

import type { AppConfig } from "./types";

export default {
	env: import.meta.env.MODE ?? "develop",

	defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE ?? Language.ENGLISH_US,

	api: {
		url: import.meta.env.VITE_API_URL,
		wsUrl: import.meta.env.VITE_WSS_URL,
	},

	logger: {
		console: {
			enabled: import.meta.env.VITE_LOGGER_CONSOLE_ENABLED !== "false",
		},
	},
} as AppConfig;
