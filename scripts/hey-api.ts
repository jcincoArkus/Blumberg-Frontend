import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Repo root: directory containing package.json, resolved from this script's location. */
const ROOT_DIR = join(__dirname, "..");
const DECIMAL_IMPORT = 'import { Decimal } from "decimal.js";';
const IMPORT_FROM_BASE = "../../api/generated/client";

const GENERATED_API_FILES = [
	"packages/api/generated/transformers.gen.ts",
	"packages/api/generated/types.gen.ts",
] as const;

function resolvePath(relativePath: string): string {
	return join(ROOT_DIR, relativePath);
}

function readText(relativePath: string): string {
	return readFileSync(resolvePath(relativePath), "utf8");
}

function writeText(relativePath: string, content: string): void {
	writeFileSync(resolvePath(relativePath), content, "utf8");
}

function removePath(relativePath: string): void {
	rmSync(resolvePath(relativePath), { recursive: true, force: true });
}

function replaceOrKeep(
	content: string,
	pattern: RegExp,
	replacement: string,
	label: string,
): string {
	if (content.includes(replacement)) {
		return content;
	}

	if (!pattern.test(content)) {
		throw new Error(`${label}: expected pattern not found and replacement is not present`);
	}

	return content.replace(pattern, replacement);
}

function addDecimalImport(relativePath: string): void {
	const content = readText(relativePath);
	if (content.includes(DECIMAL_IMPORT)) {
		console.log(`✓ ${relativePath}: import already exists`);
		return;
	}

	const lines = content.split("\n");
	let insertIndex = 0;

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith("// This file is auto-generated")) {
			insertIndex = i + 1;
			while (insertIndex < lines.length && lines[insertIndex].trim() === "") {
				insertIndex++;
			}
			break;
		}
	}

	lines.splice(insertIndex, 0, DECIMAL_IMPORT);
	writeText(relativePath, lines.join("\n"));
	console.log(`✓ ${relativePath}: added Decimal import`);
}

function updateLegacySdk(): void {
	const sdkGenPath = "packages/api-legacy/generated/sdk.gen.ts";
	if (!existsSync(resolvePath(sdkGenPath))) {
		console.log("⊘ packages/api-legacy not present, skipping legacy SDK update");
		return;
	}

	removePath("packages/api-legacy/generated/client");
	removePath("packages/api-legacy/generated/client.gen.ts");

	const sdkUpdated = replaceOrKeep(
		replaceOrKeep(
			readText(sdkGenPath),
			/from '\.\/client';/g,
			`from "${IMPORT_FROM_BASE}";`,
			"sdk.gen.ts: replace ./client import",
		),
		/from '\.\/client\.gen';/g,
		`from "${IMPORT_FROM_BASE}.gen";`,
		"sdk.gen.ts: replace ./client.gen import",
	);
	writeText(sdkGenPath, sdkUpdated);
	console.log("✓ sdk.gen.ts updated");

	const reactQueryPath = "packages/api-legacy/generated/@tanstack/react-query.gen.ts";
	const reactQueryUpdated = replaceOrKeep(
		readText(reactQueryPath),
		/from '\.\.\/client\.gen';/g,
		`from "../${IMPORT_FROM_BASE}.gen";`,
		"@tanstack/react-query.gen.ts: replace ../client.gen import",
	);
	writeText(reactQueryPath, reactQueryUpdated);
	console.log("✓ @tanstack/react-query.gen.ts updated");

	const indexPath = "packages/api-legacy/generated/index.ts";
	const indexUpdated = replaceOrKeep(
		readText(indexPath),
		/export \{ (?:type CreateClientConfig, client|client, type CreateClientConfig) \} from ['"]\.\/client\.gen['"];/,
		`export { type CreateClientConfig, client } from "${IMPORT_FROM_BASE}.gen";`,
		"index.ts: re-export client from api package",
	);
	writeText(indexPath, indexUpdated);
	console.log("✓ index.ts updated");
}

function main(): void {
	console.log("Running HeyAPI post-processing...");
	for (const filePath of GENERATED_API_FILES) {
		addDecimalImport(filePath);
	}
	updateLegacySdk();
	console.log("✓ Complete");
}

try {
	main();
} catch (error) {
	console.error("✗ HeyAPI post-processing failed:", error);
	process.exit(1);
}
