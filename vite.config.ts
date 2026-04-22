import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

// @ts-ignore (babelConfig is a module)
import babelConfig from "./babel.config.mjs";
import { envDir } from "./packages/config/vite-env-dir";

export default defineConfig({
	envDir: envDir,
	plugins: [
		tsconfigPaths(),
		devtoolsJson(),
		babel(babelConfig),
		lingui({
			failOnCompileError: true,
			failOnMissing: false,
			configPath: "lingui.config.ts",
		}),
		tailwindcss(),
	],
});
