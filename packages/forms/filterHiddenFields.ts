import type { FormValues } from "./types";

/**
 * Removes hidden field values before submission.
 */
export function filterHiddenFields(values: FormValues, hiddenFields: Set<string>): FormValues {
	const filtered: FormValues = {};

	for (const key of Object.keys(values)) {
		if (!hiddenFields.has(key)) {
			filtered[key] = values[key];
		}
	}

	return filtered;
}
