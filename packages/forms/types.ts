/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType, ReactNode } from "react";
import type { z } from "zod";

// ─── Base Types ──────────────────────────────────────────────

export type FormValues = Record<string, unknown>;

export interface SelectOption {
	label: string;
	value: string | number;
}

// ─── Conditional Visibility ──────────────────────────────────

export type ConditionalOperator =
	| "equals"
	| "notEquals"
	| "in"
	| "notIn"
	| "greaterThan"
	| "lessThan";

export interface ConditionalShowConfig {
	fieldName: string;
	operator: ConditionalOperator;
	value: unknown;
}

// ─── Field Schemas ───────────────────────────────────────────

export interface BaseFieldSchema {
	type: string;
	label?: string;
	placeholder?: string;
	helperText?: string;
	isOptional?: boolean;
	isReadOnly?: boolean;
	isDisabled?: boolean;
	shownIf?: ConditionalShowConfig;
	validator?: z.ZodTypeAny;
	defaultValue?: unknown;
}

/**
 * Map from field type string → its schema config.
 * Add new field types here — everything else is derived.
 */
export interface FieldTypeConfig {
	text: {
		inputType?: "text" | "email" | "password" | "url" | "number";
		maxLength?: number;
		minLength?: number;
		autoComplete?: string;
	};
	textarea: {
		rows?: number;
		maxLength?: number;
	};
	select: {
		options: SelectOption[];
	};
	checkbox: Record<string, never>;
	checkboxGroup: {
		options: SelectOption[];
	};
	radioGroup: {
		options: SelectOption[];
	};
	toggle: {
		onLabel?: string;
		offLabel?: string;
	};
}

/**
 * Build a field schema for a given type key.
 */
export type FieldSchemaFor<T extends keyof FieldTypeConfig> = BaseFieldSchema & {
	type: T;
} & FieldTypeConfig[T];

// Named aliases
export type TextFieldSchema = FieldSchemaFor<"text">;
export type TextareaFieldSchema = FieldSchemaFor<"textarea">;
export type SelectFieldSchema = FieldSchemaFor<"select">;
export type CheckboxFieldSchema = FieldSchemaFor<"checkbox">;
export type CheckboxGroupFieldSchema = FieldSchemaFor<"checkboxGroup">;
export type RadioGroupFieldSchema = FieldSchemaFor<"radioGroup">;
export type ToggleFieldSchema = FieldSchemaFor<"toggle">;

/**
 * Union of all standard field schemas (derived from FieldTypeConfig).
 */
export type StandardFieldSchema = {
	[K in keyof FieldTypeConfig]: FieldSchemaFor<K>;
}[keyof FieldTypeConfig];

// ─── Custom Fields ───────────────────────────────────────────

export interface CustomFieldProps {
	name: string;
	value: unknown;
	onChange: (value: unknown) => void;
	onBlur: () => void;
	error?: string;
	isReadOnly?: boolean;
	isDisabled?: boolean;
	formId?: string;
}

export interface CustomFieldSchema extends BaseFieldSchema {
	type: "custom";
	render: ComponentType<CustomFieldProps>;
}

// ─── Group Fields ────────────────────────────────────────────

export interface GroupFieldSchema extends Omit<BaseFieldSchema, "type" | "validator"> {
	type: "group";
	header?: string;
	description?: string;
	fields: FormSchema;
}

// ─── Combined Field Schema ───────────────────────────────────

export type AnyFieldSchema = StandardFieldSchema | CustomFieldSchema;
export type FieldSchema = AnyFieldSchema | GroupFieldSchema;

export interface FormSchema {
	[key: string]: FieldSchema;
}

// ─── Type Inference ──────────────────────────────────────────

/**
 * Map from field type → its TypeScript value type.
 * Used by InferFormValues to derive the output type.
 */
export interface FieldTypeMap {
	text: string;
	textarea: string;
	select: string;
	checkbox: boolean | undefined;
	checkboxGroup: string[];
	radioGroup: string;
	toggle: boolean | undefined;
	custom: unknown;
}

type InferFieldType<T extends FieldSchema> = T extends { validator: z.ZodTypeAny }
	? z.infer<T["validator"]>
	: T extends GroupFieldSchema
		? T["fields"] extends FormSchema
			? InferFormValues<T["fields"]>
			: never
		: T extends { type: keyof FieldTypeMap; isOptional?: boolean }
			? T["isOptional"] extends true
				? FieldTypeMap[T["type"]] | undefined
				: FieldTypeMap[T["type"]]
			: unknown;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
	? I
	: never;

type FlattenGroupFields<T extends FormSchema> = UnionToIntersection<
	{
		[K in keyof T]: T[K] extends GroupFieldSchema
			? T[K]["fields"] extends FormSchema
				? InferFormValues<T[K]["fields"]>
				: never
			: { [P in K]: InferFieldType<T[K]> };
	}[keyof T]
>;

export type InferFormValues<T extends FormSchema> = FlattenGroupFields<T>;

// ─── Component Props ─────────────────────────────────────────

export interface FieldProps {
	name: string;
	field: AnyFieldSchema;
	formId?: string;
}

// Field component overrides — keyed by the `type` discriminator
export type FormFieldComponentOverrides = {
	[K in keyof FieldTypeConfig]?: ComponentType<FieldProps>;
};

// Layout component props
export interface FormLayoutProps {
	children: ReactNode;
	isReadOnly?: boolean;
}

export interface GroupLayoutProps {
	header?: string;
	description?: string;
	children: ReactNode;
}

export interface SubmitButtonProps {
	isSubmitting?: boolean;
	isDisabled?: boolean;
	label?: string;
}

// ─── Multi-Step Props ────────────────────────────────────────

export interface StepInfo {
	key: string;
	index: number;
	header?: string;
	description?: string;
	isActive: boolean;
	isCompleted: boolean;
}

export interface StepIndicatorProps {
	steps: StepInfo[];
	currentStep: number;
}

export interface StepNavigationProps {
	isFirstStep: boolean;
	isLastStep: boolean;
	isSubmitting?: boolean;
	onBack: () => void;
	onNext: () => void;
	submitLabel?: string;
}

export interface StepContentProps {
	step: StepInfo;
	children: ReactNode;
}

// ─── Layout Component Overrides ──────────────────────────────

export interface FormLayoutComponentOverrides {
	FormLayout?: ComponentType<FormLayoutProps>;
	GroupLayout?: ComponentType<GroupLayoutProps>;
	SubmitButton?: ComponentType<SubmitButtonProps>;
	StepIndicator?: ComponentType<StepIndicatorProps>;
	StepNavigation?: ComponentType<StepNavigationProps>;
	StepContent?: ComponentType<StepContentProps>;
}

// ─── Combined Component Overrides ────────────────────────────

export type FormComponentOverrides = FormFieldComponentOverrides & FormLayoutComponentOverrides;

// ─── Form Ref Handle ─────────────────────────────────────────

export interface FormRefHandle {
	submitForm: () => Promise<void>;
	resetForm: (values?: FormValues) => void;
	clearForm: () => void;
	getFormValues: () => FormValues;
	setFormValues: (values: Partial<FormValues>) => void;
}
