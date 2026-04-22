import readline from "node:readline";

import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

import { Language } from "../../packages/i18n";
import {
	askConfirmation,
	readMessagesJson,
	SOURCE_LOCALE,
	TRANSLATABLE_LOCALES,
	writeMessagesJson,
} from "./common";

const translateClient = new TranslateClient({
	region: process.env.AWS_REGION || "us-east-1",
});

const AWS_LANGUAGE_BY_LOCALE: Partial<Record<Language, string>> = {
	[Language.ENGLISH_US]: "en",
	[Language.SPANISH_LA]: "es",
};

function preprocessText(text: string): { processed: string; placeholders: Map<string, string> } {
	/**
	 * Goal:
	 * Prevent the translation engine from altering critical i18n syntax.
	 *
	 * Detailed process:
	 * 1) Detect XML/JSX-like tags (`<0/>`, `<0>...</0>`, etc.).
	 * 2) Detect ICU/variable placeholders (`{name}`, `{0}`, etc.).
	 * 3) Replace each fragment with a stable temporary token.
	 * 4) Return "safe-to-translate" text + token->original map.
	 * 5) Reuse that map later to restore the exact original syntax.
	 */
	const placeholders = new Map<string, string>();
	let processed = text;
	let index = 0;

	processed = processed.replace(/<[^>]+>/g, (match) => {
		const placeholder = `__TAG_${index++}__`;
		placeholders.set(placeholder, match);
		return placeholder;
	});

	processed = processed.replace(/\{[^}]+\}/g, (match) => {
		const placeholder = `__VAR_${index++}__`;
		placeholders.set(placeholder, match);
		return placeholder;
	});

	return { processed, placeholders };
}

function postprocessText(text: string, placeholders: Map<string, string>): string {
	/**
	 * Goal:
	 * Restore protected fragments after receiving translated text.
	 *
	 * Detailed process:
	 * 1) Take translator output (which still contains temporary tokens).
	 * 2) Replace all tokens with their preserved original values.
	 * 3) Return final translation with intact placeholders/tags.
	 */
	let fixed = text;
	for (const [placeholder, original] of placeholders) {
		fixed = fixed.replace(new RegExp(placeholder, "g"), original);
	}
	return fixed;
}

function fixICUKeywords(text: string): string {
	/**
	 * Goal:
	 * Fix ICU keywords when the translator incorrectly localizes them.
	 *
	 * Detailed process:
	 * 1) Search common patterns that break ICU syntax (`uno {`, `otro {`, etc.).
	 * 2) Normalize to valid ICU keywords (`one {`, `other {`, ...).
	 * 3) Return a safer string for later Lingui compilation.
	 */
	const fixes: [RegExp, string][] = [
		[/\bcero\s*\{/gi, "zero {"],
		[/\buno\s*\{/gi, "one {"],
		[/\bdos\s*\{/gi, "two {"],
		[/\bpocos\s*\{/gi, "few {"],
		[/\bmuchos\s*\{/gi, "many {"],
		[/\botro\s*\{/gi, "other {"],
		[/\botros\s*\{/gi, "other {"],
		[/\bmasculino\s*\{/gi, "male {"],
		[/\bfemenino\s*\{/gi, "female {"],
		[/\bneutral\s*\{/gi, "neutral {"],
	];

	let fixed = text;
	for (const [pattern, replacement] of fixes) {
		fixed = fixed.replace(pattern, replacement);
	}
	return fixed;
}

async function translateText(
	text: string,
	sourceLanguage: string,
	targetLanguage: string,
): Promise<string> {
	/**
	 * Goal:
	 * Translate one message safely for i18n use.
	 *
	 * Detailed process:
	 * 1) Protect placeholders/tags (`preprocessText`).
	 * 2) Send protected text to Amazon Translate.
	 * 3) Restore placeholders/tags (`postprocessText`).
	 * 4) Apply ICU fixes only when ICU structure is detected.
	 * 5) Return final translation ready to save in `messages.json`.
	 */
	const { processed, placeholders } = preprocessText(text);

	const command = new TranslateTextCommand({
		Text: processed,
		SourceLanguageCode: sourceLanguage,
		TargetLanguageCode: targetLanguage,
	});

	const response = await translateClient.send(command);
	let translated = response.TranslatedText || text;

	translated = postprocessText(translated, placeholders);

	if (
		text.includes("{") &&
		text.includes(",") &&
		(text.includes("plural") || text.includes("select"))
	) {
		translated = fixICUKeywords(translated);
	}

	return translated;
}

async function selectTargetLocales(): Promise<Language[]> {
	/**
	 * Goal:
	 * Allow interactive selection of one or many target locales.
	 *
	 * Detailed process:
	 * 1) List only translatable locales (excluding source and pseudo).
	 * 2) Show numbered options + "All locales" option.
	 * 3) Parse answer (comma-separated numbers or "all").
	 * 4) Validate indexes and resolve selected locales.
	 * 5) If input is invalid, fallback to "all" to avoid blocking.
	 */
	const availableLocales = [...TRANSLATABLE_LOCALES];

	console.log("\nAvailable target locales:");
	for (const [index, locale] of availableLocales.entries()) {
		console.log(`   ${index + 1}. ${locale}`);
	}
	console.log(`   ${availableLocales.length + 1}. All locales`);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question("\nSelect target locale(s) (comma-separated numbers or 'all'): ", (answer) => {
			rl.close();
			if (answer.toLowerCase() === "all" || answer === String(availableLocales.length + 1)) {
				resolve(availableLocales);
				return;
			}

			const indices = answer.split(",").map((value) => Number.parseInt(value.trim(), 10) - 1);
			const selected = indices
				.filter((index) => index >= 0 && index < availableLocales.length)
				.map((index) => availableLocales[index]);

			if (selected.length === 0) {
				console.log("No valid locales selected. Using all locales.");
				resolve(availableLocales);
				return;
			}

			resolve(selected);
		});
	});
}

export async function translateMessages(): Promise<void> {
	/**
	 * Goal:
	 * Automatically fill missing translations in `messages.json` using AWS Translate.
	 *
	 * Detailed process:
	 * 1) Validate/warn about AWS credentials.
	 * 2) Load `messages.json` and detect only empty cells per locale.
	 * 3) Ask for target locales and confirmation (includes cost estimate).
	 * 4) Translate message by message with placeholder protection.
	 * 5) Record success/failure stats per locale.
	 * 6) Save sorted results back into `messages.json`.
	 * 7) Indicate next step: run `i18n:messages:replace`.
	 */
	console.log("Starting automatic translation with Amazon Translate...");
	console.log("Note: Automatic translations should be reviewed by native speakers!");

	if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_PROFILE) {
		console.log("\nAWS credentials not found in environment variables.");
		console.log("   Please ensure you have configured AWS credentials:");
		console.log("   - Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables");
		console.log("   - Or configure AWS CLI with 'aws configure'");
		console.log("   - Or set AWS_PROFILE environment variable");

		const proceed = await askConfirmation("\nDo you want to continue anyway? (y/n): ");
		if (!proceed) {
			console.log("Translation cancelled.");
			return;
		}
	}

	const messages = readMessagesJson();
	console.log(`\nLoaded ${Object.keys(messages).length} messages from messages.json`);

	const untranslatedByLocale: Partial<Record<Language, string[]>> = {};
	for (const locale of TRANSLATABLE_LOCALES) {
		const untranslated: string[] = [];
		for (const [msg, translations] of Object.entries(messages)) {
			if (!msg) continue;
			if (!translations[locale]) untranslated.push(msg);
		}
		if (untranslated.length > 0) untranslatedByLocale[locale] = untranslated;
	}

	console.log("\nUntranslated messages:");
	for (const [locale, msgs] of Object.entries(untranslatedByLocale)) {
		console.log(`   ${locale}: ${msgs.length} messages`);
	}

	if (Object.keys(untranslatedByLocale).length === 0) {
		console.log("\nAll messages are already translated!");
		return;
	}

	const targetLocales = await selectTargetLocales();
	const sourceLanguage = AWS_LANGUAGE_BY_LOCALE[SOURCE_LOCALE];
	if (!sourceLanguage) {
		console.error(`Missing AWS language code mapping for source locale ${SOURCE_LOCALE}`);
		process.exit(1);
	}

	let totalToTranslate = 0;
	let totalChars = 0;
	for (const locale of targetLocales) {
		const untranslated = untranslatedByLocale[locale];
		if (!untranslated) continue;
		totalToTranslate += untranslated.length;
		for (const msg of untranslated) totalChars += msg.length;
	}

	console.log(`\nWill translate ${totalToTranslate} messages`);
	const estimatedCost = (totalChars / 1000000) * 15;
	console.log(`Estimated cost: ~$${estimatedCost.toFixed(4)} (${totalChars} characters)`);

	const shouldTranslate = await askConfirmation(
		`\nDo you want to translate ${totalToTranslate} messages? (y/n): `,
	);
	if (!shouldTranslate) {
		console.log("Translation cancelled.");
		return;
	}

	console.log("\nStarting translation...");
	const stats: Partial<Record<Language, { success: number; failed: number }>> = {};

	for (const targetLocale of targetLocales) {
		const untranslated = untranslatedByLocale[targetLocale];
		if (!untranslated?.length) continue;

		const targetLanguage = AWS_LANGUAGE_BY_LOCALE[targetLocale];
		if (!targetLanguage) {
			console.warn(`Skipping ${targetLocale}: missing AWS language code mapping`);
			continue;
		}

		console.log(`\nTranslating to ${targetLocale}...`);

		let success = 0;
		let failed = 0;

		for (const [index, msg] of untranslated.entries()) {
			if ((index + 1) % 10 === 0 || index + 1 === untranslated.length) {
				process.stdout.write(`   Progress: ${index + 1}/${untranslated.length}\r`);
			}

			try {
				const translated = await translateText(msg, sourceLanguage, targetLanguage);
				messages[msg][targetLocale] = translated;
				success++;
				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (error) {
				console.error(`\n   Failed to translate: "${msg}"`, error);
				failed++;
			}
		}

		console.log(`\n   Translated: ${success}`);
		if (failed > 0) console.log(`   Failed: ${failed}`);
		stats[targetLocale] = { success, failed };
	}

	writeMessagesJson(messages);

	console.log(`\n${"=".repeat(50)}`);
	console.log("Translation Summary:");
	console.log("-".repeat(50));

	for (const [locale, stat] of Object.entries(stats)) {
		console.log(`\n${locale}:`);
		console.log(`  Translated: ${stat.success}`);
		if (stat.failed > 0) console.log(`  Failed: ${stat.failed}`);
	}

	console.log(`\n${"=".repeat(50)}`);
	console.log("Updated messages saved to: messages.json");
	console.log("\nRemember to review the automatic translations!");
	console.log('Run "bun run i18n:messages:replace" to apply translations to locale files');
}
