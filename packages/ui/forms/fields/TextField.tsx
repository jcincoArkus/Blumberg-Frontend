import { Controller, useFormContext } from "react-hook-form";

import type { FieldProps, TextFieldSchema } from "~@/forms";

import { Input } from "../../Input";
import { Label } from "../../Label";

export function TextField({ name, field }: FieldProps) {
	const { control } = useFormContext();
	const schema = field as TextFieldSchema;
	const label = schema.label;
	const placeholder = schema.placeholder;
	const inputType = schema.inputType ?? "text";
	const disabled = schema.isDisabled ?? schema.isReadOnly;
	const maxLength = schema.maxLength;
	const minLength = schema.minLength;
	const autoComplete = schema.autoComplete;

	return (
		<div className="grid gap-2">
			{label && (
				<Label htmlFor={name}>
					{label}
					{schema.isOptional && (
						<span className="text-muted-foreground ml-1 font-normal">(optional)</span>
					)}
				</Label>
			)}
			<Controller
				name={name}
				control={control}
				render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
					<>
						<Input
							ref={ref}
							id={name}
							type={inputType}
							placeholder={placeholder}
							value={value == null ? "" : String(value)}
							onChange={(e) => onChange(e.target.value)}
							onBlur={onBlur}
							disabled={disabled}
							maxLength={maxLength}
							minLength={minLength}
							autoComplete={autoComplete}
							aria-invalid={!!error}
						/>
						{error?.message && (
							<p className="text-destructive text-sm" role="alert">
								{error.message}
							</p>
						)}
					</>
				)}
			/>
		</div>
	);
}
