import { useMemo } from "react";
import { useWatch } from "react-hook-form";

import { evaluateCondition } from "./evaluateCondition";
import type { FormSchema, FormValues } from "./types";

/**
 * Form-level hook that tracks which fields are currently hidden
 * based on `shownIf` conditions across the entire schema.
 */
export function useHiddenFields(schema: FormSchema): Set<string> {
	const watchedValues = useWatch() as FormValues;

	return useMemo(() => {
		const hidden = new Set<string>();

		const checkFields = (fields: FormSchema) => {
			for (const [key, field] of Object.entries(fields)) {
				if (field.type === "group" && "fields" in field) {
					checkFields(field.fields);
				} else if ("shownIf" in field && field.shownIf) {
					const isVisible = evaluateCondition(field.shownIf, watchedValues);
					if (!isVisible) {
						hidden.add(key);
					}
				}
			}
		};

		checkFields(schema);
		return hidden;
	}, [schema, watchedValues]);
}
