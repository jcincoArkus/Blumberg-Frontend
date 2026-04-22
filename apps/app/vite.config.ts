import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, mergeConfig } from "vite";

import defaultConfig from "../../vite.config";

const config = defineConfig({
	plugins: [reactRouter()],
});

export default mergeConfig(defaultConfig, config);
