import { useFormContext, useWatch } from "react-hook-form";

import { evaluateCondition } from "./evaluateCondition";
import type { ConditionalShowConfig } from "./types";

/**
 * Per-field hook that returns whether the field should be visible.
 * Uses `useWatch` to subscribe only to the dependent field.
 */
export function useCheckFieldVisibility(condition?: ConditionalShowConfig): boolean {
	const { control } = useFormContext();

	const dependentValue = useWatch({
		control,
		name: condition?.fieldName ?? "",
		disabled: !condition,
	});

	if (!condition) return true;

	return evaluateCondition(condition, { [condition.fieldName]: dependentValue });
}
