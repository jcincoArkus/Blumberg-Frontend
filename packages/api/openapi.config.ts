import path from "node:path";

import { defineConfig } from "@hey-api/openapi-ts";

import { defineConfig as pluginMobxQuery } from "./mobx-query-plugin";

function folderPath(p: string) {
	return path.relative(process.cwd(), path.resolve(__dirname, p));
}

const inputPath = "./../backend/Adapters/OpenApi/openapi.yaml";

export default defineConfig({
	input: {
		path: inputPath,
	},
	output: {
		path: folderPath("./generated"),
		case: "camelCase",
		clean: true,
	},
	postProcess: ["biome:format"],
	plugins: [
		{
			name: "@hey-api/typescript",
			enums: "typescript",
		},
		{
			name: "@hey-api/transformers",
			dates: true,
			transformers: [],
			typeTransformers: [],
		},
		{
			name: "@hey-api/sdk",
			transformer: true,
			validator: false,
		},
		{
			name: "zod",
			responses: false,
			dates: {
				offset: true,
				local: true,
			},
		},
		{
			name: "@hey-api/client-axios",
			runtimeConfigPath: "../client",
			baseUrl: false,
			exportFromIndex: true,
		},
		{
			name: "@tanstack/react-query",
			queryKeys: true,
			queryOptions: true,
			exportFromIndex: true,
			infiniteQueryKeys: false,
			infiniteQueryOptions: false,
		},
		pluginMobxQuery(),
	],
});
