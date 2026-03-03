import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

import { Language } from "../../packages/i18n";

export const MESSAGES_DIR = path.join(import.meta.dir, "..", "..", "packages", "i18n", "messages");
export const MESSAGES_FILE = path.join(MESSAGES_DIR, "messages.json");
export const SOURCE_LOCALE = Language.ENGLISH_US;
export const LOCALES = Object.values(Language).filter((locale) => locale !== Language.PSEUDO);
export const TRANSLATABLE_LOCALES = LOCALES.filter((locale) => locale !== SOURCE_LOCALE);

export interface LinguiEntry {
	message: string;
	placeholders: Record<string, unknown>;
	comments: string[];
	origin: [string, number][];
	translation: string;
}

export interface LinguiCatalog {
	[hashId: string]: LinguiEntry;
}

export interface TranslationMessages {
	[message: string]: {
		[locale: string]: string;
	};
}

export function readLinguiCatalog(locale: string): LinguiCatalog {
	const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
	if (!fs.existsSync(filePath)) {
		console.error(`Source locale file not found: ${filePath}`);
		console.log('Run "bun run i18n:extract" first to generate the JSON files');
		process.exit(1);
	}
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function readMessagesJson(): TranslationMessages {
	if (!fs.existsSync(MESSAGES_FILE)) {
		console.error(`messages.json not found: ${MESSAGES_FILE}`);
		console.log('Run "bun run i18n:messages:extract" first');
		process.exit(1);
	}
	return JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
}

export function readExistingMessages(): TranslationMessages {
	try {
		if (fs.existsSync(MESSAGES_FILE)) {
			return JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
		}
	} catch {
		console.warn("Warning: Could not read existing messages.json, starting fresh");
	}
	return {};
}

export function writeMessagesJson(messages: TranslationMessages): void {
	const sorted = sortMessages(messages);
	fs.writeFileSync(MESSAGES_FILE, `${JSON.stringify(sorted, null, 2)}\n`);
}

export function sortMessages(messages: TranslationMessages): TranslationMessages {
	const sorted: TranslationMessages = {};
	for (const key of Object.keys(messages).sort((a, b) =>
		a.toLowerCase().localeCompare(b.toLowerCase()),
	)) {
		sorted[key] = messages[key];
	}
	return sorted;
}

export function askConfirmation(question: string): Promise<boolean> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
		});
	});
}
