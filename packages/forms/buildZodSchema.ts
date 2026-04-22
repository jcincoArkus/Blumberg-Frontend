import { z } from "zod";

import type { AnyFieldSchema, FormSchema } from "./types";

/**
 * Builds a Zod validation schema from the form schema definition.
 * Recurses into groups, flattening their fields to the top level.
 */
export function buildZodSchema(schema: FormSchema): z.ZodObject<Record<string, z.ZodTypeAny>> {
	const zodShape: Record<string, z.ZodTypeAny> = {};

	for (const [key, field] of Object.entries(schema)) {
		if (field.type === "group" && "fields" in field) {
			const groupSchema = buildZodSchema(field.fields);
			Object.assign(zodShape, groupSchema.shape);
		} else if ("validator" in field && field.validator) {
			zodShape[key] = field.isOptional ? field.validator.optional() : field.validator;
		} else {
			zodShape[key] = getDefaultValidator(field as AnyFieldSchema);
		}
	}

	return z.object(zodShape);
}

function getDefaultValidator(field: AnyFieldSchema): z.ZodTypeAny {
	switch (field.type) {
		case "text":
		case "textarea":
			return field.isOptional ? z.string().optional() : z.string().min(1, "Required");

		case "select":
		case "radioGroup":
			return field.isOptional ? z.string().optional() : z.string().min(1, "Required");

		case "checkbox":
		case "toggle":
			return z.boolean().optional();

		case "checkboxGroup":
			return field.isOptional
				? z.array(z.string()).optional()
				: z.array(z.string()).min(1, "Select at least one");

		case "custom":
			return z.unknown();

		default:
			return z.unknown();
	}
}

/**
 * Extracts default values from the schema.
 */
export function extractDefaultValues(schema: FormSchema): Record<string, unknown> {
	const defaults: Record<string, unknown> = {};

	for (const [key, field] of Object.entries(schema)) {
		if (field.type === "group" && "fields" in field) {
			Object.assign(defaults, extractDefaultValues(field.fields));
		} else if ("defaultValue" in field && field.defaultValue !== undefined) {
			defaults[key] = field.defaultValue;
		} else {
			defaults[key] = getFieldDefault(field as AnyFieldSchema);
		}
	}

	return defaults;
}

function getFieldDefault(field: AnyFieldSchema): unknown {
	switch (field.type) {
		case "text":
		case "textarea":
		case "select":
		case "radioGroup":
			return "";
		case "checkbox":
		case "toggle":
			return false;
		case "checkboxGroup":
			return [];
		default:
			return undefined;
	}
}
