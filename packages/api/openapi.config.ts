import path from "node:path";

import { defineConfig } from "@hey-api/openapi-ts";

const decimal = require("./transformers/decimal");

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
		format: "biome",
	},
	plugins: [
		{
			name: "@hey-api/typescript",
			enums: "typescript",
		},
		{
			name: "@hey-api/transformers",
			dates: true,
			transformers: [decimal.Expressions],
			typeTransformers: [decimal.TypeTransformers],
		},
		{
			name: "@hey-api/sdk",
			transformer: true,
			validator: true,
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
	],
});
