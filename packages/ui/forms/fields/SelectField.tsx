import { Controller, useFormContext } from "react-hook-form";

import type { FieldProps, SelectFieldSchema } from "~@/forms";
import { t } from "~@/i18n/macro";

import { Label } from "../../Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Select";

/** Radix Select reserves empty string for "no selection"; SelectItem must not have value="". */
const EMPTY_SELECT_VALUE = "__empty__" as const;

export function SelectField({ name, field }: FieldProps) {
	const { control } = useFormContext();
	const schema = field as SelectFieldSchema;
	const label = schema.label;
	const rawOptions = schema.options ?? [];
	// Filter out options with empty value so we never pass value="" to SelectItem
	const options = rawOptions.filter((opt) => String(opt.value ?? "") !== "");
	const disabled = schema.isDisabled ?? schema.isReadOnly;

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
				render={({ field: { onChange, value }, fieldState: { error } }) => {
					const rawValue = value == null || value === "" ? undefined : String(value);
					// Radix uses empty string to clear selection; never pass "" as SelectItem value
					const selectValue = rawValue === undefined || rawValue === "" ? undefined : rawValue;
					return (
						<>
							<Select
								value={selectValue}
								onValueChange={(v) => onChange(v === EMPTY_SELECT_VALUE ? "" : v)}
								disabled={disabled}
							>
								<SelectTrigger id={name} className="w-full" aria-invalid={!!error}>
									<SelectValue placeholder={schema.placeholder} />
								</SelectTrigger>
								<SelectContent>
									{schema.isOptional && (
										<SelectItem value={EMPTY_SELECT_VALUE}>{t`None`}</SelectItem>
									)}
									{options.map((opt) => (
										<SelectItem key={String(opt.value)} value={String(opt.value)}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{error?.message && (
								<p className="text-destructive text-sm" role="alert">
									{error.message}
								</p>
							)}
						</>
					);
				}}
			/>
		</div>
	);
}
