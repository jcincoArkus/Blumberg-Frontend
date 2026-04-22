import { Controller, useFormContext } from "react-hook-form";

import type { AnyFieldSchema, CustomFieldSchema, FormComponentOverrides } from "./types";
import { useCheckFieldVisibility } from "./useCheckFieldVisibility";

interface FormFieldProps {
	name: string;
	field: AnyFieldSchema;
	components: FormComponentOverrides;
	formId?: string;
}

/**
 * Dynamic field renderer — resolves the component from `components[field.type]`.
 * No switch/case: purely data-driven.
 */
export function FormField({ name, field, components, formId }: FormFieldProps) {
	const { control } = useFormContext();
	const isVisible = useCheckFieldVisibility(field.shownIf);

	if (!isVisible) return null;

	// Custom fields use their own render component
	if (field.type === "custom") {
		const customField = field as CustomFieldSchema;
		return (
			<Controller
				name={name}
				control={control}
				render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
					const CustomComponent = customField.render;
					return (
						<CustomComponent
							name={name}
							value={value}
							onChange={onChange}
							onBlur={onBlur}
							error={error?.message}
							isReadOnly={customField.isReadOnly}
							isDisabled={customField.isDisabled}
							formId={formId}
						/>
					);
				}}
			/>
		);
	}

	// Standard fields: resolve from the component map
	const FieldComponent = components[field.type as keyof typeof components] as
		| React.ComponentType<{
				name: string;
				field: AnyFieldSchema;
				formId?: string;
		  }>
		| undefined;

	if (!FieldComponent) {
		return (
			<div>
				<p>Unsupported field type: {field.type}</p>
			</div>
		);
	}

	return <FieldComponent name={name} field={field} formId={formId} />;
}
