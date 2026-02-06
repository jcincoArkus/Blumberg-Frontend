import {
	askConfirmation,
	readLinguiCatalog,
	readMessagesJson,
	SOURCE_LOCALE,
	type TranslationMessages,
	writeMessagesJson,
} from "./common";

export async function cleanMessages(): Promise<void> {
	/**
	 * Goal:
	 * Remove only obsolete entries from `messages.json` (no longer present in source extraction).
	 *
	 * Detailed process:
	 * 1) Read the source-locale catalog freshly extracted by Lingui.
	 * 2) Build the set of currently active source messages.
	 * 3) Compare against existing keys in `messages.json`.
	 * 4) Detect and list obsolete keys, including existing translations.
	 * 5) Ask explicit confirmation to prevent accidental translation loss.
	 * 6) If confirmed, rewrite `messages.json` with active keys only.
	 * 7) Keep stable sort order for cleaner git review.
	 */
	console.log("Starting i18n message cleanup...");

	const catalog = readLinguiCatalog(SOURCE_LOCALE);
	const currentMessages = new Set(
		Object.values(catalog)
			.map((entry) => entry.message)
			.filter(Boolean),
	);

	const existingMessages = readMessagesJson();
	const existingKeys = Object.keys(existingMessages);
	const obsoleteMessages = existingKeys.filter((key) => key && !currentMessages.has(key));

	if (obsoleteMessages.length === 0) {
		console.log("No obsolete messages found. messages.json is clean!");
		return;
	}

	console.log(`\nFound ${obsoleteMessages.length} obsolete messages:`);
	console.log("-".repeat(50));

	for (const [index, msg] of obsoleteMessages.entries()) {
		console.log(`\n${index + 1}. "${msg}"`);
		const translations = existingMessages[msg];
		for (const [locale, translation] of Object.entries(translations)) {
			if (translation) {
				console.log(`   ${locale}: "${translation}"`);
			}
		}
	}

	console.log(`\n${"-".repeat(50)}`);

	const hasTranslations = obsoleteMessages.some((msg) =>
		Object.values(existingMessages[msg]).some((translation) => translation),
	);

	if (hasTranslations) {
		console.log("Warning: Some obsolete messages have translations that will be lost!");
	}

	const shouldClean = await askConfirmation(
		`\nDo you want to remove these ${obsoleteMessages.length} obsolete messages? (y/n): `,
	);

	if (!shouldClean) {
		console.log("Cleanup cancelled.");
		return;
	}

	const cleaned: TranslationMessages = {};
	for (const key of existingKeys) {
		if (currentMessages.has(key)) {
			cleaned[key] = existingMessages[key];
		}
	}

	writeMessagesJson(cleaned);

	console.log(`\nRemoved ${obsoleteMessages.length} obsolete messages`);
	console.log(`Remaining messages: ${Object.keys(cleaned).length}`);
}
