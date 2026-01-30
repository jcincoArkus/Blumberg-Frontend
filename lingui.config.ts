import { defineConfig } from "@lingui/cli";
import type { LinguiConfig } from "@lingui/conf";
import { formatter } from "@lingui/format-json";

import { Language } from "./packages/i18n";

const config: LinguiConfig = defineConfig({
	sourceLocale: Language.ENGLISH_US,
	locales: Object.values(Language),
	pseudoLocale: Language.PSEUDO,
	fallbackLocales: {
		pseudo: Language.ENGLISH_US,
		default: Language.ENGLISH_US,
	},
	compileNamespace: "ts",
	format: formatter(),
	catalogs: [
		{
			path: "<rootDir>/packages/i18n/messages/{locale}",
			include: ["<rootDir>/apps", "<rootDir>/packages"],
			exclude: ["**/node_modules/**", "**/*.d.ts", "**/dist/**", "**/build/**"],
		},
	],
	macro: {
		corePackage: ["~@/i18n/macro", "@lingui/core/macro"],
		jsxPackage: ["~@/i18n/macro", "@lingui/react/macro"],
	},
});

export default config;
