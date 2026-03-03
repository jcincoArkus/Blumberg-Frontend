import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pathOfSpecification = "./../../api/pkg/authorization/internal/rbac_policy.csv";
const actionsFile = "./../packages/authorization/actions.ts";

function toPascalCase(str: string): string {
	return str
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("");
}

function parseCSV(content: string): Map<string, string[]> {
	const lines = content.split("\n").filter((line) => line.trim() && !line.startsWith("#"));

	const actionsBySubject = new Map<string, string[]>();

	for (const line of lines) {
		const [subject, action] = line.split(",").map((s) => s.trim());

		if (!subject || !action) continue;

		if (!actionsBySubject.has(subject)) {
			actionsBySubject.set(subject, []);
		}

		actionsBySubject.get(subject)!.push(action);
	}

	return actionsBySubject;
}

function generateClasses(actionsBySubject: Map<string, string[]>): string {
	let output = "// This file is auto-generated. Do not edit manually.\n\n";

	for (const [subject, actions] of actionsBySubject) {
		const className = `${toPascalCase(subject)}Actions`;

		output += `export class ${className} {\n`;

		for (const action of actions) {
			const propertyName = toPascalCase(action);
			output += `\tstatic readonly ${propertyName} = "${action}";\n`;
		}

		output += "}\n\n";
	}

	return output;
}

function main() {
	try {
		const csvPath = resolve(__dirname, pathOfSpecification);
		const outputPath = resolve(__dirname, actionsFile);

		console.log(`Reading CSV from: ${csvPath}`);
		const csvContent = readFileSync(csvPath, "utf-8");

		console.log("Parsing CSV...");
		const actionsBySubject = parseCSV(csvContent);

		console.log("Generating classes...");
		const classesContent = generateClasses(actionsBySubject);

		console.log(`Writing to: ${outputPath}`);
		writeFileSync(outputPath, classesContent, "utf-8");

		console.log("✅ Actions file generated successfully!");
		console.log(`Generated ${actionsBySubject.size} class(es)`);
	} catch (error) {
		console.error("❌ Error generating actions file:", error);
		process.exit(1);
	}
}

main();
