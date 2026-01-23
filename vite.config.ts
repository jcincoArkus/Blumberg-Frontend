import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import macrosPlugin from "vite-plugin-babel-macros";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		devtoolsJson(),
		macrosPlugin(),
		lingui({
			failOnCompileError: true,
			failOnMissing: false,
			configPath: "lingui.config.ts",
		}),
		tailwindcss(),
	],
});
