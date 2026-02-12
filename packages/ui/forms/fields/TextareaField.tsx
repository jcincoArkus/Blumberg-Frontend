import { Controller, useFormContext } from "react-hook-form";

import type { FieldProps, TextareaFieldSchema } from "~@/forms";

import { Label } from "../../Label";
import { Textarea } from "../../Textarea";

export function TextareaField({ name, field }: FieldProps) {
	const { control } = useFormContext();
	const schema = field as TextareaFieldSchema;
	const label = schema.label;
	const placeholder = schema.placeholder;
	const disabled = schema.isDisabled ?? schema.isReadOnly;
	const rows = schema.rows;
	const maxLength = schema.maxLength;

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
						<Textarea
							ref={ref}
							id={name}
							placeholder={placeholder}
							value={value == null ? "" : String(value)}
							onChange={(e) => onChange(e.target.value)}
							onBlur={onBlur}
							disabled={disabled}
							rows={rows}
							maxLength={maxLength}
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
