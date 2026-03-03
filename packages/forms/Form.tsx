import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { buildZodSchema, extractDefaultValues } from "./buildZodSchema";
import { useFormConfig } from "./FormConfigProvider";
import { FormField } from "./FormField";
import { filterHiddenFields } from "./filterHiddenFields";
import { MultiStepForm } from "./MultiStepForm";
import type {
	AnyFieldSchema,
	FormComponentOverrides,
	FormLayoutProps,
	FormRefHandle,
	FormSchema,
	FormValues,
	GroupFieldSchema,
	GroupLayoutProps,
	InferFormValues,
	SubmitButtonProps,
} from "./types";
import { useHiddenFields } from "./useHiddenFields";

// ─── Default unstyled fallbacks ──────────────────────────────

function DefaultFormLayout({ children }: FormLayoutProps) {
	return <fieldset style={{ border: "none", padding: 0, margin: 0 }}>{children}</fieldset>;
}

function DefaultGroupLayout({ header, description, children }: GroupLayoutProps) {
	return (
		<div>
			{header && <h3>{header}</h3>}
			{description && <p>{description}</p>}
			{children}
		</div>
	);
}

function DefaultSubmitButton({ isSubmitting, isDisabled, label }: SubmitButtonProps) {
	return (
		<button type="submit" disabled={isSubmitting || isDisabled}>
			{isSubmitting ? "Submitting..." : (label ?? "Submit")}
		</button>
	);
}

// ─── Props ───────────────────────────────────────────────────

export interface FormProps<TSchema extends FormSchema = FormSchema> {
	formId: string;
	schema: TSchema | (() => TSchema);
	onSubmit: (values: InferFormValues<TSchema>) => void | Promise<void>;
	defaultValues?: Partial<InferFormValues<TSchema>>;
	mode?: "onBlur" | "onChange" | "onSubmit";
	isReadOnly?: boolean;
	isSubmitting?: boolean;
	submitLabel?: string;
	hideSubmitButton?: boolean;
	components?: FormComponentOverrides;
	formRef?: React.Ref<FormRefHandle>;
	children?: ReactNode;
}

// ─── Helper: detect multi-step ───────────────────────────────

function isMultiStep(schema: FormSchema): boolean {
	const entries = Object.values(schema);
	return entries.length > 0 && entries.every((field) => field.type === "group");
}

// ─── Form Component ──────────────────────────────────────────

function FormInner<TSchema extends FormSchema = FormSchema>(
	{
		formId,
		schema: schemaProp,
		onSubmit,
		defaultValues: providedDefaults,
		mode,
		isReadOnly = false,
		isSubmitting = false,
		submitLabel,
		hideSubmitButton = false,
		components: instanceComponents,
		children,
	}: FormProps<TSchema>,
	ref: React.ForwardedRef<FormRefHandle>,
) {
	// Resolve schema (may be a function for i18n)
	const schema = useMemo(
		() => (typeof schemaProp === "function" ? schemaProp() : schemaProp),
		[schemaProp],
	) as FormSchema;

	// Merge global + instance components
	const { components: globalComponents, config: globalConfig } = useFormConfig();
	const mergedComponents = useMemo<FormComponentOverrides>(
		() => ({ ...globalComponents, ...instanceComponents }),
		[globalComponents, instanceComponents],
	);

	const resolvedMode = mode ?? globalConfig?.mode ?? "onChange";

	// Build zod schema & defaults
	const zodSchema = useMemo(() => buildZodSchema(schema), [schema]);
	const defaultValues = useMemo(() => {
		const schemaDefaults = extractDefaultValues(schema);
		return providedDefaults
			? { ...schemaDefaults, ...(providedDefaults as FormValues) }
			: schemaDefaults;
	}, [schema, providedDefaults]);

	const form = useForm<FormValues>({
		resolver: zodResolver(zodSchema),
		defaultValues,
		mode: resolvedMode,
		disabled: isReadOnly,
	});

	// Pass control so useWatch works before FormProvider is rendered (avoids "control is null")
	const hiddenFields = useHiddenFields(schema, form.control);

	// Imperative handle
	useImperativeHandle(ref, () => ({
		submitForm: async () => {
			await form.handleSubmit((values) => {
				const filtered = filterHiddenFields(values, hiddenFields);
				(onSubmit as (v: FormValues) => void | Promise<void>)(filtered);
			})();
		},
		resetForm: (values?: FormValues) => {
			form.reset(values ?? defaultValues);
		},
		clearForm: () => {
			form.reset(extractDefaultValues(schema));
		},
		getFormValues: () => {
			return filterHiddenFields(form.getValues(), hiddenFields);
		},
		setFormValues: (values: Partial<FormValues>) => {
			for (const key of Object.keys(values)) {
				form.setValue(key, values[key]);
			}
		},
	}));

	// Auto-detect multi-step
	if (isMultiStep(schema)) {
		return (
			<FormProvider {...form}>
				<MultiStepForm
					schema={schema}
					form={form}
					components={mergedComponents}
					formId={formId}
					onSubmit={(values) => (onSubmit as (v: FormValues) => void | Promise<void>)(values)}
					submitLabel={submitLabel}
					isSubmitting={isSubmitting}
				>
					{children}
				</MultiStepForm>
			</FormProvider>
		);
	}

	// ─── Regular Form ────────────────────────────────────────

	const FormLayout = mergedComponents.FormLayout ?? DefaultFormLayout;
	const GroupLayout = mergedComponents.GroupLayout ?? DefaultGroupLayout;
	const SubmitButton = mergedComponents.SubmitButton ?? DefaultSubmitButton;

	const handleFormSubmit = form.handleSubmit((values) => {
		const filtered = filterHiddenFields(values, hiddenFields);
		(onSubmit as (v: FormValues) => void | Promise<void>)(filtered);
	});

	return (
		<FormProvider {...form}>
			<form id={formId} onSubmit={handleFormSubmit} noValidate>
				<FormLayout isReadOnly={isReadOnly}>
					{Object.entries(schema).map(([name, field]) => {
						if (field.type === "group") {
							const group = field as GroupFieldSchema;
							return (
								<GroupLayout key={name} header={group.header} description={group.description}>
									{Object.entries(group.fields).map(([fieldName, fieldSchema]) => (
										<FormField
											key={fieldName}
											name={fieldName}
											field={fieldSchema as AnyFieldSchema}
											components={mergedComponents}
											formId={formId}
										/>
									))}
								</GroupLayout>
							);
						}

						return (
							<FormField
								key={name}
								name={name}
								field={field as AnyFieldSchema}
								components={mergedComponents}
								formId={formId}
							/>
						);
					})}
				</FormLayout>

				{!hideSubmitButton && (
					<SubmitButton isSubmitting={isSubmitting} isDisabled={isReadOnly} label={submitLabel} />
				)}

				{children}
			</form>
		</FormProvider>
	);
}

// ─── Export with forwardRef ──────────────────────────────────

export const Form = forwardRef(FormInner) as <TSchema extends FormSchema = FormSchema>(
	props: FormProps<TSchema> & { ref?: React.ForwardedRef<FormRefHandle> },
) => React.ReactElement;
