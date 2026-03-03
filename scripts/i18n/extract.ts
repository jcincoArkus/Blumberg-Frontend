import {
	LOCALES,
	readExistingMessages,
	readLinguiCatalog,
	SOURCE_LOCALE,
	type TranslationMessages,
	writeMessagesJson,
} from "./common";

export function extractMessages(): void {
	/**
	 * Goal:
	 * Create or refresh `messages.json` as the working matrix for manual/automatic translation.
	 *
	 * Detailed process:
	 * 1) Read the Lingui source-locale catalog (`en-US.json`).
	 * 2) Extract only `message` values (source text), skipping empty entries.
	 * 3) Load the previous `messages.json` to preserve existing translations.
	 * 4) Merge data: add new messages and keep existing ones.
	 * 5) Ensure all locale columns exist for every message.
	 * 6) Force source-locale column to default to source text.
	 * 7) Save the file sorted to minimize noisy diffs.
	 * 8) Report operational metrics (new, obsolete, pending translations).
	 */
	console.log("Starting i18n message extraction...");

	const catalog = readLinguiCatalog(SOURCE_LOCALE);
	const msgTexts = Object.values(catalog)
		.map((entry) => entry.message)
		.filter(Boolean);

	console.log(`Found ${msgTexts.length} messages`);

	const existingMessages = readExistingMessages();
	const messages: TranslationMessages = { ...existingMessages };

	for (const msg of msgTexts) {
		if (!messages[msg]) {
			messages[msg] = {};
		}
		for (const locale of LOCALES) {
			messages[msg][locale] ??= "";
		}
		messages[msg][SOURCE_LOCALE] ||= msg;
	}

	for (const msg of Object.keys(messages)) {
		for (const locale of LOCALES) {
			messages[msg][locale] ??= "";
		}
		messages[msg][SOURCE_LOCALE] ||= msg;
	}

	writeMessagesJson(messages);

	console.log("Messages saved to messages.json");
	console.log(`Total messages: ${Object.keys(messages).length}`);

	const newMessages = msgTexts.filter((msg) => !existingMessages[msg]).length;
	const obsoleteMessages = Object.keys(existingMessages).filter(
		(msg) => !msgTexts.includes(msg),
	).length;

	if (newMessages > 0) console.log(`${newMessages} new messages added`);
	if (obsoleteMessages > 0) {
		console.log(
			`${obsoleteMessages} obsolete messages preserved (use i18n:messages:clean to remove)`,
		);
	}

	let untranslated = 0;
	for (const translations of Object.values(messages)) {
		for (const locale of LOCALES) {
			if (locale !== SOURCE_LOCALE && !translations[locale]) untranslated++;
		}
	}
	if (untranslated > 0) console.log(`${untranslated} translations need to be filled`);
}
