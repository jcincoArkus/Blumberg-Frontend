import type { ConditionalShowConfig, FormValues } from "./types";

export function evaluateCondition(
	condition: ConditionalShowConfig,
	formValues: FormValues,
): boolean {
	const fieldValue = formValues[condition.fieldName];

	switch (condition.operator) {
		case "equals":
			return fieldValue === condition.value;
		case "notEquals":
			return fieldValue !== condition.value;
		case "in":
			return Array.isArray(condition.value) && condition.value.includes(fieldValue);
		case "notIn":
			return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
		case "greaterThan":
			return Number(fieldValue) > Number(condition.value);
		case "lessThan":
			return Number(fieldValue) < Number(condition.value);
		default:
			return true;
	}
}
