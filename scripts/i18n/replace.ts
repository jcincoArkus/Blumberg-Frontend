import fs from "node:fs";
import path from "node:path";

import {
	type LinguiCatalog,
	LOCALES,
	MESSAGES_DIR,
	readMessagesJson,
	type TranslationMessages,
} from "./common";

interface UpdateResult {
	locale: string;
	updated: number;
	skipped: number;
	notFound: number;
}

function updateLocaleFile(locale: string, messages: TranslationMessages): UpdateResult {
	/**
	 * Goal:
	 * Sync one Lingui catalog (`<locale>.json`) with values from `messages.json`.
	 *
	 * Detailed process:
	 * 1) Open the target-locale catalog file.
	 * 2) Iterate every entry by Lingui hash id.
	 * 3) Use `entry.message` as lookup key into `messages.json`.
	 * 4) If a non-empty translation exists, update `entry.translation`.
	 * 5) If translation is missing, keep entry unchanged.
	 * 6) Track diagnostics counters: updated, skipped, not found.
	 * 7) Write the updated catalog back to disk.
	 */
	const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

	if (!fs.existsSync(filePath)) {
		console.warn(`Locale file not found: ${filePath}`);
		return { locale, updated: 0, skipped: 0, notFound: 0 };
	}

	console.log(`Updating ${locale}.json...`);

	const catalog: LinguiCatalog = JSON.parse(fs.readFileSync(filePath, "utf8"));
	let updated = 0;
	let skipped = 0;
	let notFound = 0;

	for (const [hashId, entry] of Object.entries(catalog)) {
		const msg = entry.message;
		if (!msg) continue;

		if (messages[msg]?.[locale]) {
			const translation = messages[msg][locale];
			if (entry.translation !== translation) {
				catalog[hashId] = { ...entry, translation };
				updated++;
			} else {
				skipped++;
			}
		} else if (!messages[msg]) {
			notFound++;
		} else {
			skipped++;
		}
	}

	fs.writeFileSync(filePath, `${JSON.stringify(catalog, null, 2)}\n`);
	return { locale, updated, skipped, notFound };
}

export function replaceTranslations(): void {
	/**
	 * Goal:
	 * Batch-apply `messages.json` values into all active locale catalogs.
	 *
	 * Detailed process:
	 * 1) Load the central `messages.json` matrix.
	 * 2) Iterate each configured locale (excluding pseudo locale).
	 * 3) Call `updateLocaleFile` to sync catalog by catalog.
	 * 4) Print per-locale operational summary to validate coverage.
	 */
	console.log("Starting i18n translation replacement...");

	const messages = readMessagesJson();
	console.log(`Loaded ${Object.keys(messages).length} messages from messages.json`);

	const results: UpdateResult[] = [];
	for (const locale of LOCALES) {
		results.push(updateLocaleFile(locale, messages));
	}

	console.log("\nSummary:");
	for (const result of results) {
		console.log(`  ${result.locale}:`);
		console.log(`    Updated: ${result.updated}`);
		console.log(`    Skipped: ${result.skipped}`);
		if (result.notFound > 0) {
			console.log(`    Not in messages.json: ${result.notFound}`);
		}
	}
}
